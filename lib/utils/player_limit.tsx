import { MaxPlayers } from "../../types/user";
export default function player_limit_reached(num: number) {
	return num >= MaxPlayers;
}