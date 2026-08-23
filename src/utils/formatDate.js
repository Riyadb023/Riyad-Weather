export function formatDate(dateString) {
  if (!dateString) return "";

  const targetDate = new Date(dateString + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (targetDate.getTime() === today.getTime()) return "Today";
  if (targetDate.getTime() === tomorrow.getTime()) return "Tomorrow";

  return targetDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
