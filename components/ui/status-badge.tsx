type Status =
  | "scheduled"
  | "today"
  | "completed"
  | "cancelled";

type StatusBadgeProps = {
  status: Status;
};

const styles = {
  scheduled:
    "bg-blue-100 text-blue-700",

  today:
    "bg-yellow-100 text-yellow-700",

  completed:
    "bg-green-100 text-green-700",

  cancelled:
    "bg-red-100 text-red-700",
};

const labels = {
  scheduled: "Scheduled",
  today: "Today",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function StatusBadge({
  status,
}: StatusBadgeProps) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}