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

    <div className="flex items-center gap-2.5 flex-shrink-0 cursor-pointer select-none">
      <img
        src={logoImg}
        alt="Match&Map with me Logo"
        width={size}
        height={size}
        className="rounded-lg object-contain bg-[#f0ede6] shadow-sm flex-shrink-0"
        style={{
          width: size,
          height: size,
          minWidth: size,
          minHeight: size,
        }}
        loading="eager"
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
