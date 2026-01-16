export function formatPostDate(date: Date | string): string {
  const now = new Date();
  const tweetDate = new Date(date);
  const diffInSeconds = Math.floor(
    (now.getTime() - tweetDate.getTime()) / 1000
  );

  // Less than 1 minute: "now"
  if (diffInSeconds < 60) {
    return "now";
  }

  // Less than 1 hour: "Xm"
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m`;
  }

  // Less than 24 hours: "Xh"
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h`;
  }

  // Less than 7 days: "Xd"
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d`;
  }

  // Same year: "MMM D" (e.g., "Jan 15")
  if (tweetDate.getFullYear() === now.getFullYear()) {
    return tweetDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }

  // Different year: "MMM D, YYYY" (e.g., "Jan 15, 2023")
  return tweetDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateDetailed(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;

  const parts = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).formatToParts(d);

  const map = Object.fromEntries(parts.map(p => [p.type, p.value]));

  return `${map.hour}:${map.minute} · ${map.month} ${map.day}, ${map.year}`;
}
