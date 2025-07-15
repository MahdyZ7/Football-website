
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
	return isAllowed;
}

export function getNextRegistration() {
  const now = new Date();
  const currentDay = now.getDay();
  const currentHour = now.getHours() + 4; // Convert to UTC+4 to match allowed_times logic
  
  const nextDate = new Date(now);
  
  // Check if we're currently in an allowed period
  const isCurrentlyAllowed = 
    (currentDay === 0 && currentHour >= 12) ||
    (currentDay === 1 && currentHour <= 21) ||
    (currentDay === 3 && currentHour >= 12) ||
    (currentDay === 4 && currentHour <= 21);
  
  if (isCurrentlyAllowed) {
    // If currently allowed, find when current period ends
    if (currentDay === 0 || (currentDay === 1 && currentHour <= 21)) {
      // Sunday period ends Monday 21:00 (9 PM)
      if (currentDay === 0) {
        nextDate.setDate(nextDate.getDate() + 1); // Move to Monday
      }
      nextDate.setHours(17, 0, 0, 0); // 21:00 UTC+4 = 17:00 UTC
      
      // If we're past Monday 21:00, move to next Wednesday
      if (currentDay === 1 && currentHour > 21) {
        nextDate.setDate(nextDate.getDate() + 2); // Move to Wednesday
        nextDate.setHours(8, 0, 0, 0); // 12:00 UTC+4 = 08:00 UTC
      }
    } else if (currentDay === 3 || (currentDay === 4 && currentHour <= 21)) {
      // Wednesday period ends Thursday 21:00 (9 PM)
      if (currentDay === 3) {
        nextDate.setDate(nextDate.getDate() + 1); // Move to Thursday
      }
      nextDate.setHours(17, 0, 0, 0); // 21:00 UTC+4 = 17:00 UTC
      
      // If we're past Thursday 21:00, move to next Sunday
      if (currentDay === 4 && currentHour > 21) {
        nextDate.setDate(nextDate.getDate() + 3); // Move to Sunday
        nextDate.setHours(8, 0, 0, 0); // 12:00 UTC+4 = 08:00 UTC
      }
    }
  } else {
    // Not currently allowed, find next opening
    if (currentDay < 0 || (currentDay === 0 && currentHour < 12)) {
      // Before Sunday 12:00, next is Sunday 12:00
      nextDate.setHours(8, 0, 0, 0); // 12:00 UTC+4 = 08:00 UTC
    } else if (currentDay === 1 && currentHour > 21) {
      // After Monday 21:00, next is Wednesday 12:00
      nextDate.setDate(nextDate.getDate() + 2);
      nextDate.setHours(8, 0, 0, 0);
    } else if (currentDay === 2 || (currentDay === 3 && currentHour < 12)) {
      // Tuesday or before Wednesday 12:00, next is Wednesday 12:00
      const daysUntilWednesday = currentDay === 2 ? 1 : 0;
      nextDate.setDate(nextDate.getDate() + daysUntilWednesday);
      nextDate.setHours(8, 0, 0, 0);
    } else if (currentDay === 4 && currentHour > 21) {
      // After Thursday 21:00, next is Sunday 12:00
      nextDate.setDate(nextDate.getDate() + 3);
      nextDate.setHours(8, 0, 0, 0);
    } else {
      // Friday or Saturday, next is Sunday 12:00
      const daysUntilSunday = currentDay === 5 ? 2 : 1;
      nextDate.setDate(nextDate.getDate() + daysUntilSunday);
      nextDate.setHours(8, 0, 0, 0);
    }
  }
  
  return nextDate;
}
