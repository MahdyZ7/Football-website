/** @deprecated Use config.guaranteedSpots from SiteConfigContext or getSiteConfig() instead */
export const GuaranteedSpot = 21;
/** @deprecated Use config.maxPlayers from SiteConfigContext or getSiteConfig() instead */
export const MaxPlayers = 40;

export type BannedUser = {
	intra: string;
	email?: string;
	name: string;
	reason: string;
	banned_at: string;
	banned_until: string;
	user_id?: string;
}

export type RegistrationStatus = 'confirmed' | 'waitlisted';

export type User = {
	name:		string;
	intra:		string;
	verified:	boolean;
	created_at:	string;
	is_banned?:	boolean;
	registration_status?: RegistrationStatus;
	waitlist_position?: number | null;
	promoted_at?: string | null;
	owned_by_current_user?: boolean;
}

export type MoneyRecord = {
  date: string;
  name: string;
  intra: string;
  amount: number;
  paid: boolean;
};

export type AdminLog = {
  id: number;
  admin_user: string;
  action: string;
  target_user?: string;
  target_name?: string;
  details?: string;
  timestamp: string;
};

export type PlayerReliabilityEvent = {
  id: number;
  event_type: string;
  reason?: string | null;
  related_ban_until?: string | null;
  created_at: string;
};

export type PlayerHistoryResponse = {
  currentRegistration: {
    intra: string;
    name: string;
    registration_status: RegistrationStatus;
    waitlist_position: number | null;
    created_at: string;
    promoted_at: string | null;
  } | null;
  activeBan: {
    reason: string;
    banned_until: string;
  } | null;
  reliabilityEvents: PlayerReliabilityEvent[];
};
