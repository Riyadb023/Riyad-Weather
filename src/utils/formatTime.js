export function formatTime(timeString) {
  // Input format: "2025-01-17 15:00:00"
  if (!timeString) return "";
  const date = new Date(timeString);
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
