

export default function allowed_times() {
	const currentTime = new Date(Date.now()); //utc time
	let currentDay = currentTime.getDay();
	let currentHour = currentTime.getHours() + 4; //time utc+4

	// if (currentHour >= 24)
	// 	currentDay = currentDay + 1
	// 	currentHour = currentHour - 24
	
	// Sunday is 0 and Wednesday is 3 in getDay()
	// Check if the current day is Sunday or Wednesday after 12 PM (noon)
	// and before 8 PM the next day (20 hours)
	const isAllowed = 
		(currentDay === 0 && currentHour >= 12) ||
		(currentDay === 1 && currentHour < 21) ||
		(currentDay === 3 && currentHour >= 12) ||
		(currentDay === 4 && currentHour < 21);
	return isAllowed;
}