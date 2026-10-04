import logoImg from "../imports/WhatsApp_Image_2026-09-11_at_12.10.49_PM.jpeg"

interface LogoProps {
  size?: number
  showText?: boolean
  textSize?: "sm" | "md" | "lg"
}

export default function Logo({
  size = 36,
  showText = true,
  textSize = "md",
}: LogoProps) {
  const textSizes = {
    sm: { main: 12, sub: 9 },
    md: { main: 15, sub: 10 },
    lg: { main: 22, sub: 13 },
  }
  const ts = textSizes[textSize]

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div
        style={{
          width: size,
          height: size,
          flexShrink: 0,
          borderRadius: 8,
          backgroundImage: `url(${logoImg})`,
          backgroundSize: "contain",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundColor: "#f0ede6",
        }}
      />
      {showText && (
        <div>
          <div style={{ lineHeight: 1.1 }}>
            <span
              style={{
                fontFamily: "Outfit, sans-serif",
                fontWeight: 900,
                fontSize: ts.main,
                color: "#e2e8f0",
                letterSpacing: "-0.02em",
              }}
            >
              MATCH<span style={{ color: "#22c55e" }}>&</span>MAP
            </span>
          </div>
          <div
            style={{
              fontFamily: "'Georgia', serif",
              fontStyle: "italic",
              fontSize: ts.sub,
              color: "#22c55e",
              letterSpacing: "0.02em",
              marginTop: 1,
            }}
          >
            with me
          </div>
        </div>
      )}
    </div>
  )
}
