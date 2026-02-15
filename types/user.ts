export const GuaranteedSpot = 21;
export const MaxPlayers = 40;

export type BannedUser = {
	intra: string;
	email: string;
	name: string;
	reason: string;
	banned_at: string;
	banned_until: string;
	user_id?: string;
}

export type User = {
	name:		string;
	email:		string;
	intra:		string;
	verified:	boolean;
	created_at:	string;
	user_id?:	string;
	is_banned?:	boolean;
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