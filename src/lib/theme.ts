import { useState, useEffect } from "react"

export type Theme = "light" | "dark"

const THEME_STORAGE_KEY = "travel_companion_theme"

export function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light"
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY)
    if (saved === "light" || saved === "dark") {
      return saved
    }
    // Default to light theme so screenshots and papers have clear, visible pictures
    return "light"
  } catch {
    return "light"
  }
}

export function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return
  const root = document.documentElement
  root.setAttribute("data-theme", theme)
  if (theme === "light") {
    root.classList.add("light")
    root.classList.remove("dark")
  } else {
    root.classList.add("dark")
    root.classList.remove("light")
  }
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {}
  window.dispatchEvent(
    new CustomEvent("travel_theme_change", { detail: theme }),
  )
}

export function useTheme(): [Theme, (t: Theme) => void, () => void] {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  useEffect(() => {
    function handleThemeChange(e: Event) {
      const customEvent = e as CustomEvent<Theme>
      if (customEvent.detail && customEvent.detail !== theme) {
        setThemeState(customEvent.detail)
      }
    }
    window.addEventListener("travel_theme_change", handleThemeChange)
    return () =>
      window.removeEventListener("travel_theme_change", handleThemeChange)
  }, [theme])

  const toggleTheme = () => {
    const nextTheme: Theme = theme === "light" ? "dark" : "light"
    setThemeState(nextTheme)
    applyTheme(nextTheme)
  }

  const setTheme = (nextTheme: Theme) => {
    setThemeState(nextTheme)
    applyTheme(nextTheme)
  }

  return [theme, setTheme, toggleTheme]
}
