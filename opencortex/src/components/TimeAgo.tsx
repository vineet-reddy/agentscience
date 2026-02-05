"use client";

import { formatDistanceToNow } from "date-fns";

export default function TimeAgo({ date }: { date: string | Date }) {
  return (
    <span className="text-xs text-[var(--muted)]">
      {formatDistanceToNow(new Date(date), { addSuffix: true })}
    </span>
  );
}
