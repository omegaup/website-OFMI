export function nextHalfHour(date: Date): Date {
  // Get the current minutes
  const minutes = date.getMinutes();

  // Calculate minutes to add to get to the next half-hour mark
  const minutesToAdd = minutes < 30 ? 30 - minutes : 60 - minutes;

  // Add the minutes to the current time
  const newDate = new Date(date);
  newDate.setMinutes(date.getMinutes() + minutesToAdd);
  newDate.setSeconds(0); // Set seconds to 0
  newDate.setMilliseconds(0); // Set milliseconds to 0

  return newDate;
}
