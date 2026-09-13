export default function Avatar({ name, photoUrl, size = 36 }: { name: string; photoUrl?: string; size?: number }) {
  const initials = (name || '?').trim().split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase()
  if (photoUrl) {
    return <img src={photoUrl} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: 'var(--bg-muted)', color: 'var(--brand-primary)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: size * 0.38, flexShrink: 0
    }}>
      {initials}
    </div>
  )
}
