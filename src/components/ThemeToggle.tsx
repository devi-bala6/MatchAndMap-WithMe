import { Sun, Moon } from "lucide-react"
import { useTheme } from "../lib/theme"

interface ThemeToggleProps {
  compact?: boolean
  showLabel?: boolean
  className?: string
}

export default function ThemeToggle({
  compact = true,
  showLabel = false,
  className = "",
}: ThemeToggleProps) {
  const [theme, , toggleTheme] = useTheme()
  const isLight = theme === "light"

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={
        isLight
          ? "Switch to Dark Theme"
          : "Switch to Light Theme (Paper-Friendly)"
      }
      aria-label={isLight ? "Switch to Dark Theme" : "Switch to Light Theme"}
      className={`theme-toggle-btn group relative inline-flex items-center justify-center gap-2 rounded-xl transition-all duration-200 select-none ${
        compact
          ? "p-2 sm:px-2.5 sm:py-2 text-xs"
          : "px-3.5 py-2 text-xs font-semibold"
      } ${
        isLight
          ? "bg-amber-100/80 hover:bg-amber-200/90 text-amber-900 border border-amber-300/80 shadow-sm"
          : "bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800 shadow-sm"
      } ${className}`}
    >
      <div className="relative flex items-center justify-center">
        {isLight ? (
          <Sun className="w-4 h-4 text-amber-600 animate-in spin-in-180 duration-300" />
        ) : (
          <Moon className="w-4 h-4 text-amber-400 animate-in spin-in-180 duration-300" />
        )}
      </div>

      {showLabel && (
        <span className="font-display font-medium text-xs whitespace-nowrap">
          {isLight ? "Light Mode" : "Dark Mode"}
        </span>
      )}

      {/* Tooltip badge on hover for extra clarity */}
      <span className="sr-only">
        {isLight ? "Active: Light Theme" : "Active: Dark Theme"}
      </span>
    </button>
  )
}
