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

export function getLocalDateTimeWithOffset(target: Date): string {
  // Get the date in the format YYYY-MM-DD
  const date = target.toISOString().split("T")[0];

  // Get the time in the format HH:MM:SS
  const time = target.toTimeString().split(" ")[0];

  // Get the timezone offset in hours and minutes (e.g., -04:00)
  const timezoneOffset = target.getTimezoneOffset();
  const absOffset = Math.abs(timezoneOffset);
  const offsetHours = String(Math.floor(absOffset / 60)).padStart(2, "0");
  const offsetMinutes = String(absOffset % 60).padStart(2, "0");
  const offsetSign = timezoneOffset <= 0 ? "+" : "-";
  const offsetString = `${offsetSign}${offsetHours}:${offsetMinutes}`;

  return `${date}T${time}${offsetString}`;
}
