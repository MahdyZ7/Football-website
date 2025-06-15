
export default function allowed_times() {
	const currentTime = new Date(Date.now()); //utc time
	let currentDay = currentTime.getDay();
	let currentHour = currentTime.getHours() + 4; //time utc+4
	
	// Sunday is 0 and Wednesday is 3 in getDay()
	const isAllowed = 
		(currentDay === 0 && currentHour >= 12) ||
		(currentDay === 1 && currentHour <= 21) ||
		(currentDay === 3 && currentHour >= 12) ||
		(currentDay === 4 && currentHour <= 21);
	return isAllowed;
}

export function getNextRegistration() {
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();
  
  let nextDate = new Date(now);
  
  if (day < 0 || (day === 0 && hour < 12)) {
    // Next is Sunday
    nextDate.setDate(nextDate.getDate() + ((0 - day + 7) % 7));
  } else if (day < 2 || (day === 2 && hour < 12)) {
    // Next is Wednesday
    nextDate.setDate(nextDate.getDate() + ((2 - day + 7) % 7));
  } else {
    // Next is Sunday
    nextDate.setDate(nextDate.getDate() + ((7 - day) % 7));
  }
  
  nextDate.setHours(12, 0, 0, 0); // Set to noon UTC
  return nextDate;
}
