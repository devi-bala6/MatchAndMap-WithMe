const TREES = [
  { x: 2, h: 180, w: 70, dur: 3.8, delay: 0.0, amp: 1.8 },
  { x: 7, h: 230, w: 88, dur: 4.4, delay: 0.6, amp: 1.5 },
  { x: 13, h: 160, w: 62, dur: 3.5, delay: 1.2, amp: 2.0 },
  { x: 19, h: 260, w: 96, dur: 5.0, delay: 0.3, amp: 1.3 },
  { x: 26, h: 195, w: 76, dur: 4.1, delay: 1.8, amp: 1.7 },
  { x: 33, h: 290, w: 108, dur: 4.7, delay: 0.9, amp: 1.2 },
  { x: 41, h: 170, w: 66, dur: 3.6, delay: 2.1, amp: 1.9 },
  { x: 48, h: 245, w: 92, dur: 4.3, delay: 0.4, amp: 1.4 },
  { x: 55, h: 200, w: 78, dur: 4.0, delay: 1.5, amp: 1.6 },
  { x: 62, h: 270, w: 100, dur: 4.8, delay: 0.7, amp: 1.3 },
  { x: 69, h: 185, w: 72, dur: 3.9, delay: 2.4, amp: 1.8 },
  { x: 76, h: 240, w: 90, dur: 4.5, delay: 1.1, amp: 1.5 },
  { x: 83, h: 175, w: 68, dur: 3.7, delay: 0.5, amp: 2.0 },
  { x: 89, h: 255, w: 94, dur: 4.6, delay: 1.7, amp: 1.4 },
  { x: 95, h: 210, w: 80, dur: 4.2, delay: 0.2, amp: 1.6 },
]

const CLOUDS: Array<{ top: string scale: number dur: number delay: number }> =
  []

// SVG path for a layered pine/fir tree silhouette, trunk at origin bottom
function PineTree({ width, height }: { width: number height: number }) {
  const w = width
  const h = height
  const trunk = h * 0.22
  const crown = h - trunk
  // Three stacked triangular layers
  const l1y = -trunk
  const l2y = -trunk - crown * 0.28
  const l3y = -trunk - crown * 0.58
  const l1w = w * 0.5
  const l2w = w * 0.38
  const l3w = w * 0.24

  const d = [
    // layer 1 (bottom, widest)
    `M 0 0 L 0 ${-trunk}`,
    `M ${-l1w} ${l1y + crown * 0.42} L 0 ${l1y - crown * 0.05} L ${l1w} ${l1y + crown * 0.42} Z`,
    // layer 2
    `M ${-l2w} ${l2y + crown * 0.28} L 0 ${l2y - crown * 0.06} L ${l2w} ${l2y + crown * 0.28} Z`,
    // layer 3 (top)
    `M ${-l3w} ${l3y + crown * 0.18} L 0 ${l3y - crown * 0.08} L ${l3w} ${l3y + crown * 0.18} Z`,
  ].join(" ")

  return (
    <g>
      {/* trunk */}
      <rect
        x={-w * 0.045}
        y={-trunk}
        width={w * 0.09}
        height={trunk}
        rx="3"
        fill="url(#trunkGrad)"
      />
      {/* layer 1 shadow */}
      <polygon
        points={`${-l1w + 6},${l1y + crown * 0.42} 6,${l1y - crown * 0.05} ${l1w + 6},${l1y + crown * 0.42}`}
        fill="rgba(0,30,0,0.25)"
      />
      <polygon
        points={`${-l1w},${l1y + crown * 0.42} 0,${l1y - crown * 0.05} ${l1w},${l1y + crown * 0.42}`}
        fill="url(#leafGrad1)"
      />
      {/* layer 2 */}
      <polygon
        points={`${-l2w + 4},${l2y + crown * 0.28} 4,${l2y - crown * 0.06} ${l2w + 4},${l2y + crown * 0.28}`}
        fill="rgba(0,30,0,0.22)"
      />
      <polygon
        points={`${-l2w},${l2y + crown * 0.28} 0,${l2y - crown * 0.06} ${l2w},${l2y + crown * 0.28}`}
        fill="url(#leafGrad2)"
      />
      {/* layer 3 */}
      <polygon
        points={`${-l3w + 3},${l3y + crown * 0.18} 3,${l3y - crown * 0.08} ${l3w + 3},${l3y + crown * 0.18}`}
        fill="rgba(0,30,0,0.20)"
      />
      <polygon
        points={`${-l3w},${l3y + crown * 0.18} 0,${l3y - crown * 0.08} ${l3w},${l3y + crown * 0.18}`}
        fill="url(#leafGrad3)"
      />
    </g>
  )
}

function Cloud({ scale }: { scale: number }) {
  const s = scale * 60
  return (
    <g>
      <ellipse cx="0" cy="0" rx={s * 1.6} ry={s * 0.7} fill="white" />
      <ellipse
        cx={-s * 0.9}
        cy={s * 0.2}
        rx={s * 1.1}
        ry={s * 0.6}
        fill="white"
      />
      <ellipse
        cx={s * 0.9}
        cy={s * 0.1}
        rx={s * 1.2}
        ry={s * 0.65}
        fill="white"
      />
      <ellipse
        cx={-s * 0.3}
        cy={-s * 0.45}
        rx={s * 0.9}
        ry={s * 0.55}
        fill="white"
      />
      <ellipse
        cx={s * 0.4}
        cy={-s * 0.4}
        rx={s * 0.8}
        ry={s * 0.5}
        fill="white"
      />
      <ellipse cx="0" cy={s * 0.5} rx={s * 1.8} ry={s * 0.4} fill="white" />
    </g>
  )
}

export default function EcoAnimation() {
  const rainDrops = Array.from({ length: 100 }, (_, i) => ({
    x: (i * 9.97) % 100,
    delay: -((i * 0.19) % 2.5),
    dur: 0.5 + (i % 7) * 0.13,
    len: 12 + (i % 5) * 5,
    opacity: 0.15 + (i % 6) * 0.05,
  }))

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes windSway {
          0%        { transform: rotate(0deg)    skewX(0deg); }
          10%       { transform: rotate(1.2deg)  skewX(0.4deg); }
          25%       { transform: rotate(-1.8deg) skewX(-0.5deg); }
          40%       { transform: rotate(0.8deg)  skewX(0.3deg); }
          55%       { transform: rotate(-1.5deg) skewX(-0.4deg); }
          70%       { transform: rotate(1.5deg)  skewX(0.5deg); }
          85%       { transform: rotate(-0.6deg) skewX(-0.2deg); }
          100%      { transform: rotate(0deg)    skewX(0deg); }
        }
        @keyframes cloudMove {
          from { transform: translateX(-450px); }
          to   { transform: translateX(110vw);  }
        }
        @keyframes rainDrop {
          0%   { transform: translateY(-30px) translateX(0px); opacity: 0; }
          8%   { opacity: 1; }
          90%  { opacity: 0.85; }
          100% { transform: translateY(102vh)  translateX(28px); opacity: 0; }
        }
        @keyframes mistDrift {
          0%,100% { opacity: 0.45; transform: scaleX(1);    }
          50%     { opacity: 0.30; transform: scaleX(1.04); }
        }
      `}</style>

      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMax slice"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
      >
        <defs>
          <linearGradient id="trunkGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#2c1a08" />
            <stop offset="40%" stopColor="#5a3010" />
            <stop offset="100%" stopColor="#2c1a08" />
          </linearGradient>
          <linearGradient id="leafGrad1" x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="#3aad22" />
            <stop offset="100%" stopColor="#155c08" />
          </linearGradient>
          <linearGradient id="leafGrad2" x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="#2e9618" />
            <stop offset="100%" stopColor="#0e4d05" />
          </linearGradient>
          <linearGradient id="leafGrad3" x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="#4dc430" />
            <stop offset="100%" stopColor="#1d7010" />
          </linearGradient>
          <linearGradient id="groundGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a5c08" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#0a3004" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="mistGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a6e08" stopOpacity="0" />
            <stop offset="60%" stopColor="#1a6e08" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#0d4004" stopOpacity="0.55" />
          </linearGradient>
          <filter id="treeShadow">
            <feDropShadow
              dx="4"
              dy="0"
              stdDeviation="4"
              floodColor="rgba(0,40,0,0.4)"
            />
          </filter>
          <filter id="cloudFilter">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Ground strip */}
        <rect x="0" y="840" width="1440" height="60" fill="url(#groundGrad)" />

        {/* Trees */}
        {TREES.map((t, i) => (
          <g
            key={i}
            transform={`translate(${t.x * 14.4}, 840)`}
            style={{
              transformOrigin: `${t.x * 14.4}px 840px`,
              animation: `windSway ${t.dur}s cubic-bezier(0.45,0.05,0.55,0.95) ${t.delay}s infinite`,
            }}
            filter="url(#treeShadow)"
          >
            <PineTree width={t.w} height={t.h} />
          </g>
        ))}

        {/* Ground mist */}
        <rect
          x="0"
          y="700"
          width="1440"
          height="200"
          fill="url(#mistGrad)"
          style={{ animation: "mistDrift 6s ease-in-out infinite" }}
        />

        {/* Clouds */}
        {CLOUDS.map((c, i) => (
          <g
            key={i}
            transform={`translate(-450, 0)`}
            style={{
              animation: `cloudMove ${c.dur}s linear ${c.delay}s infinite`,
            }}
          >
            <g
              transform={`translate(220, ${parseFloat(c.top) * 9}) scale(${c.scale})`}
              opacity={0.82}
              filter="url(#cloudFilter)"
            >
              <Cloud scale={1} />
            </g>
          </g>
        ))}

        {/* Rain */}
        {rainDrops.map((d, i) => (
          <line
            key={i}
            x1={d.x * 14.4}
            y1={-30}
            x2={d.x * 14.4 + d.len * 0.22}
            y2={d.len}
            stroke={`rgba(185,228,255,${d.opacity})`}
            strokeWidth="1.2"
            strokeLinecap="round"
            style={{
              animation: `rainDrop ${d.dur}s linear ${d.delay}s infinite`,
            }}
          />
        ))}
      </svg>
    </div>
  )
}
