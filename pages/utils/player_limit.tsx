const playerLimit = 40;

export default function player_limit_reached(num: number) {
	return num >= playerLimit;
}