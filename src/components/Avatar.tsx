const PALETTE = [
  ["#7c3aed", "#ede9fe"],
  ["#0ea5e9", "#e0f2fe"],
  ["#22c55e", "#dcfce7"],
  ["#f59e0b", "#fef3c7"],
  ["#ec4899", "#fce7f3"],
  ["#ef4444", "#fee2e2"],
  ["#8b5cf6", "#ede9fe"],
  ["#14b8a6", "#ccfbf1"],
]

function colorFor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return PALETTE[Math.abs(hash) % PALETTE.length]
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "?"
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

interface AvatarProps {
  name: string
  size?: number
  radius?: number | string
  fontSize?: number
  style?: React.CSSProperties
  className?: string
}

export default function Avatar({
  name,
  size = 36,
  radius,
  fontSize,
  style,
  className,
}: AvatarProps) {
  const [bg, fg] = colorFor(name)
  const r = radius !== undefined ? radius : size / 2
  const fs = fontSize ?? Math.round(size * 0.38)
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: r,
        background: bg,
        color: fg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Outfit, sans-serif",
        fontWeight: 700,
        fontSize: fs,
        flexShrink: 0,
        userSelect: "none",
        ...style,
      }}
    >
      {initials(name)}
    </div>
  )
}
