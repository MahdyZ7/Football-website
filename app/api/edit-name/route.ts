import { NextRequest, NextResponse } from "next/server";
import pool from "../../../lib/utils/db";
import { auth } from "../../../auth";
import { logAdminAction } from "../../../lib/utils/adminLogger";

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const json = await req.json();
    const { intra, newName } = json;

    // Validate inputs
    if (!intra || typeof intra !== 'string' || intra.trim().length === 0) {
      return NextResponse.json({ error: "User ID (intra) is required" }, { status: 400 });
    }

    if (!newName || typeof newName !== 'string' || newName.trim().length === 0) {
      return NextResponse.json({ error: "New name is required" }, { status: 400 });
    }

    // Sanitize inputs
    const sanitizedIntra = intra.trim();
    const sanitizedName = newName.trim();

    // Basic validation against SQL injection and XSS patterns
    const dangerousPattern = /('|--|;|\/\*|\*\/|<|>|script|select|insert|update|delete|drop|union|exec|xp_)/i;
    if (dangerousPattern.test(sanitizedIntra) || dangerousPattern.test(sanitizedName)) {
      return NextResponse.json({ error: "Invalid characters detected in input" }, { status: 400 });
    }

    const client = await pool.connect();

    try {
      // Check if the player exists and belongs to the current user
      const playerCheck = await client.query(
        "SELECT name, intra, user_id, created_at, verified FROM players WHERE intra = $1",
        [sanitizedIntra]
      );

      if (playerCheck.rows.length === 0) {
        return NextResponse.json({ error: "Registration not found" }, { status: 404 });
      }

      const player = playerCheck.rows[0];

      // Allow name editing only by the owner
      if (player.user_id !== session.user.id) {
        return NextResponse.json({ error: "You can only edit your own registration" }, { status: 403 });
      }

      // Check if within 15-minute grace period
      const registrationTime = new Date(player.created_at);
      const now = new Date();
      const minutesSinceRegistration = (now.getTime() - registrationTime.getTime()) / (1000 * 60);

      if (minutesSinceRegistration > 15) {
        return NextResponse.json({
          error: "Name editing is only allowed within 15 minutes of registration"
        }, { status: 403 });
      }

      // Don't allow editing name if user is verified (verified names come from 42 API)
      if (player.verified) {
        return NextResponse.json({
          error: "Cannot edit name for verified accounts (name is from 42 Intra)"
        }, { status: 403 });
      }

      // Update the name
      await client.query(
        "UPDATE players SET name = $1 WHERE intra = $2",
        [sanitizedName, sanitizedIntra]
      );

      // Log the action
      await logAdminAction(
        session.user.id,
        'name_edit',
        sanitizedIntra,
        sanitizedName,
        `Name changed from "${player.name}" to "${sanitizedName}" (within 15-minute grace period)`
      );

      return NextResponse.json({
        success: true,
        message: "Name updated successfully",
        newName: sanitizedName
      }, { status: 200 });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error editing name:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
