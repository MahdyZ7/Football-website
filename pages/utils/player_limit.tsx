const playerLimit = 18;

export default function player_limit_reached(num: number) {
	return num >= playerLimit;
}