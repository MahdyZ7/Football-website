
export default function allowed_times() {
	const currentTime = new Date(Date.now()); //utc time
  const currentDay = currentTime.getDay();
  const currentHour = currentTime.getHours() + 4; //time utc+4
	
	// Sunday is 0 and Wednesday is 3 in getDay()
	const isAllowed = 
		(currentDay === 0 && currentHour >= 12) ||
		(currentDay === 1 && currentHour <= 21) ||
		(currentDay === 3 && currentHour >= 12) ||
		(currentDay === 4 && currentHour <= 21);
	console.log(`Current time: ${currentTime.toISOString()}, Allowed: ${isAllowed}`);
	return isAllowed;
}

export function getNextRegistration() {
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();
  
  const nextDate = new Date(now);
  
  if (day < 0 || (day === 0 && hour < 12)) {
    // Next is Sunday
    nextDate.setDate(nextDate.getDate() + ((0 - day + 7) % 7));
  } else if (day < 3 || (day === 3 && hour < 12)) {
    // Next is Thursday
    nextDate.setDate(nextDate.getDate() + ((3 - day + 7) % 7));
  } else {
    // Next is Sunday
    nextDate.setDate(nextDate.getDate() + ((7 - day) % 7));
  }
  
  nextDate.setHours(12, 0, 0, 0); // Set to noon UTC
  return nextDate;
}
