const MAP: Record<string, { tone: string; label?: string }> = {
  active: { tone: 'success' }, present: { tone: 'success' }, entry: { tone: 'success' }, online: { tone: 'success' },
  inactive: { tone: 'neutral' }, terminated: { tone: 'danger' }, expelled: { tone: 'danger' }, absent: { tone: 'danger' }, offline: { tone: 'danger' }, exit: { tone: 'info' },
  on_leave: { tone: 'warning' }, late: { tone: 'warning' }, left_early: { tone: 'warning' },
  graduated: { tone: 'info' }, transferred: { tone: 'info' }
}

export default function StatusBadge({ status }: { status: string }) {
  const entry = MAP[status] || { tone: 'neutral' }
  const label = status.replace(/_/g, ' ')
  return <span className={`badge badge-${entry.tone}`}>{label.charAt(0).toUpperCase() + label.slice(1)}</span>
}
