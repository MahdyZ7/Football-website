export const GuaranteedSpot = 21;
export const MaxPlayers = 40;

export type BannedUser = {
	intra: string;
	email: string;
	name: string;
	reason: string;
	banned_at: string;
	banned_until: string;
}

export type User = {
	name:		string;
	email:		string;
	intra:		string;
	verified:	boolean;
	created_at:	string;
}

export type Toast = {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
};