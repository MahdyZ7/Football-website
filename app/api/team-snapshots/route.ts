import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../auth";
import pool from "../../../lib/utils/db";
import { isRegistrationAllowed } from "../../../lib/utils/allowed_times";

type SnapshotPlayer = {
  intra: string;
  name: string;
  rating?: number;
};

type SnapshotTeam = {
  name: string;
  players: SnapshotPlayer[];
};

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const registrationAllowed = await isRegistrationAllowed();
  if (!registrationAllowed) {
    return NextResponse.json(
      { error: "Team snapshots are only available during the registration window" },
      { status: 403 }
    );
  }

  const client = await pool.connect();

  try {
    const body = await req.json();
    const { teamMode, source, teams } = body as {
      teamMode: 2 | 3;
      source?: string;
      teams: SnapshotTeam[];
    };

    const MAX_TEAMS = 4;
    const MAX_PLAYERS_PER_TEAM = 15;

    if (![2, 3].includes(teamMode) || !Array.isArray(teams) || teams.length === 0 || teams.length > MAX_TEAMS) {
      return NextResponse.json({ error: "Invalid snapshot payload" }, { status: 400 });
    }

    for (const team of teams) {
      if (!Array.isArray(team.players) || team.players.length > MAX_PLAYERS_PER_TEAM) {
        return NextResponse.json({ error: "Invalid snapshot payload" }, { status: 400 });
      }
      if (typeof team.name !== 'string' || team.name.length > 100) {
        return NextResponse.json({ error: "Invalid team name in snapshot" }, { status: 400 });
      }
      for (const player of team.players) {
        if (!player.intra || typeof player.intra !== 'string' || player.intra.length > 50 ||
            !player.name || typeof player.name !== 'string' || player.name.length > 255) {
          return NextResponse.json({ error: "Invalid player data in snapshot" }, { status: 400 });
        }
      }
    }

    const VALID_SOURCES = ['auto_balance', 'manual', 'drag_and_drop'];
    const validatedSource = typeof source === 'string' && VALID_SOURCES.includes(source) ? source : 'auto_balance';

    await client.query("BEGIN");

    // Keep only the latest generated snapshot so the history tables do not become a write sink.
    await client.query("DELETE FROM team_generation_history");

    const generationResult = await client.query(
      `INSERT INTO team_generation_history (created_by_user_id, source, team_mode)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [session.user.id, validatedSource, teamMode]
    );
    const generationId = generationResult.rows[0].id;

    const players = teams.flatMap((team) =>
      team.players.map((player) => ({
        intra: player.intra,
        playerName: player.name,
        rating: Math.max(1, Math.min(5, Number(player.rating || 1))),
        assignedTeam: team.name,
      }))
    );

    const intraLogins = players.map((player) => player.intra);
    const linkedUsers = intraLogins.length > 0
      ? await client.query(
          `SELECT intra, user_id
           FROM players
           WHERE intra = ANY($1::text[])`,
          [intraLogins]
        )
      : { rows: [] };

    const userIdByIntra = new Map<string, string | null>(
      linkedUsers.rows.map((row) => [row.intra, row.user_id ?? null])
    );

    for (const player of players) {
      await client.query(
        `INSERT INTO player_rating_history
          (team_generation_id, user_id, intra, player_name, rating, assigned_team)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          generationId,
          userIdByIntra.get(player.intra) ?? null,
          player.intra,
          player.playerName,
          player.rating,
          player.assignedTeam,
        ]
      );
    }

    await client.query("COMMIT");

    return NextResponse.json({ success: true, generationId });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error saving team snapshot:", error);
    return NextResponse.json({ error: "Failed to save team snapshot" }, { status: 500 });
  } finally {
    client.release();
  }
}
