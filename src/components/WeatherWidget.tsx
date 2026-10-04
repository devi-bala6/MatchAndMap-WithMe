import { useState, useEffect } from "react"
import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudLightning,
  Snowflake,
  CloudFog,
  Wind,
  Droplets,
  Eye,
  AlertTriangle,
  RefreshCw,
  MapPin,
  Thermometer,
  Search,
  Sparkles,
} from "lucide-react"
import {
  fetchLiveWeather,
  POPULAR_DESTINATIONS,
  WeatherInfo,
} from "../lib/weatherService"

interface WeatherWidgetProps {
  initialDestination?: string
  userDestinations?: string[]
  compact?: boolean
}

export default function WeatherWidget({
  initialDestination = "Spiti Valley",
  userDestinations = [],
  compact = false,
}: WeatherWidgetProps) {
  const [selectedDest, setSelectedDest] = useState(initialDestination)
  const [searchInput, setSearchInput] = useState("")
  const [weather, setWeather] = useState<WeatherInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Merge popular destinations with user trip destinations
  const popularList = Object.keys(POPULAR_DESTINATIONS)
  const allDestinations = Array.from(
    new Set([...userDestinations.filter(Boolean), ...popularList]),
  )

  const loadWeather = async (dest: string) => {
    if (!dest.trim()) return
    setLoading(true)
    try {
      const data = await fetchLiveWeather(dest)
      setWeather(data)
    } catch (err) {
      console.error("Failed to load weather:", err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadWeather(selectedDest)
  }, [selectedDest])

  const handleRefresh = () => {
    setRefreshing(true)
    loadWeather(selectedDest)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchInput.trim()) {
      setSelectedDest(searchInput.trim())
      setSearchInput("")
    }
  }

  const renderWeatherIcon = (iconName: string, className = "w-8 h-8") => {
    switch (iconName) {
      case "Sun":
        return <Sun className={`${className} text-amber-400`} />
      case "CloudSun":
        return <CloudSun className={`${className} text-amber-300`} />
      case "Cloud":
        return <Cloud className={`${className} text-slate-300`} />
      case "CloudRain":
        return <CloudRain className={`${className} text-sky-400`} />
      case "CloudLightning":
        return <CloudLightning className={`${className} text-purple-400`} />
      case "Snowflake":
        return <Snowflake className={`${className} text-blue-200`} />
      case "CloudFog":
        return <CloudFog className={`${className} text-slate-400`} />
      default:
        return <Sun className={`${className} text-amber-400`} />
    }
  }

  if (loading && !weather) {
    return (
      <div className="rounded-2xl p-6 bg-slate-900/80 border border-slate-800 animate-pulse">
        <div className="h-6 w-40 bg-slate-800 rounded mb-4"></div>
        <div className="flex justify-between items-center mb-6">
          <div className="space-y-2">
            <div className="h-10 w-24 bg-slate-800 rounded"></div>
            <div className="h-4 w-32 bg-slate-800 rounded"></div>
          </div>
          <div className="w-16 h-16 bg-slate-800 rounded-full"></div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="h-16 bg-slate-800 rounded-xl"></div>
          <div className="h-16 bg-slate-800 rounded-xl"></div>
          <div className="h-16 bg-slate-800 rounded-xl"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-900/95 to-slate-950 border border-cyan-500/20 shadow-xl overflow-hidden backdrop-blur-md">
      {/* Header & Search Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono tracking-wider text-slate-300 uppercase font-bold">
              Live Weather Radar
            </span>
          </div>
          <button
            onClick={handleRefresh}
            className="sm:hidden flex items-center gap-1 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
            title="Refresh weather data"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`}
            />
            <span>{weather?.lastUpdated || "Live"}</span>
          </button>
        </div>

        {/* Live Search Form */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex items-center gap-2 flex-1 sm:max-w-xs"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search any Indian city/place..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-950/80 border border-slate-700/80 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-display font-bold text-xs transition-all flex-shrink-0"
          >
            Search
          </button>
          <button
            type="button"
            onClick={handleRefresh}
            className="hidden sm:flex items-center gap-1 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors ml-1"
            title="Refresh weather data"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`}
            />
          </button>
        </form>
      </div>

      {/* Destination quick-select tabs */}
      <div className="px-4 py-2.5 bg-slate-950/40 border-b border-slate-800/60 overflow-x-auto flex gap-2 no-scrollbar">
        {allDestinations.slice(0, 10).map((dest) => {
          const isUserTrip = userDestinations.includes(dest)
          return (
            <button
              key={dest}
              onClick={() => setSelectedDest(dest)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1 ${
                selectedDest.toLowerCase() === dest.toLowerCase()
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                  : "bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800/60 hover:bg-slate-800/50"
              }`}
            >
              {isUserTrip && (
                <span className="text-[10px] text-amber-400">✈</span>
              )}
              <span>{dest.split(" (")[0]}</span>
            </button>
          )
        })}
      </div>

      {weather && (
        <div className="p-5 sm:p-6 space-y-6">
          {/* Main Weather Hero */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-black text-2xl sm:text-3xl text-slate-100 tracking-tight">
                  {weather.destination}
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-[11px] font-mono text-slate-300">
                  {weather.state}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-cyan-300 font-medium mt-1 flex items-center gap-1.5">
                <span>{weather.condition}</span>
                <span>·</span>
                <span>Feels like {weather.apparentTemperature}°C</span>
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="font-display font-black text-4xl sm:text-5xl text-white">
                  {weather.temperature}°
                </span>
                <span className="text-base text-slate-400 font-normal">C</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-800/50 border border-slate-700/50 shadow-inner">
                {renderWeatherIcon(weather.iconName, "w-10 h-10")}
              </div>
            </div>
          </div>

          {/* Travel Advisory Callout */}
          {weather.travelAdvisory && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-300">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
              <div>
                <span className="font-bold mr-1">Traveler Advisory:</span>
                <span>{weather.travelAdvisory}</span>
              </div>
            </div>
          )}

          {/* Atmospheric Telemetry Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs font-mono">
                <Wind className="w-3.5 h-3.5 text-cyan-400" />
                <span>WIND SPEED</span>
              </div>
              <p className="font-display font-bold text-base text-slate-200">
                {weather.windSpeed}{" "}
                <span className="text-xs font-mono text-slate-400">km/h</span>
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs font-mono">
                <Droplets className="w-3.5 h-3.5 text-sky-400" />
                <span>HUMIDITY</span>
              </div>
              <p className="font-display font-bold text-base text-slate-200">
                {weather.humidity}%
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs font-mono">
                <CloudRain className="w-3.5 h-3.5 text-blue-400" />
                <span>RAIN CHANCE</span>
              </div>
              <p className="font-display font-bold text-base text-slate-200">
                {weather.precipitationProb}%
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs font-mono">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>UV INDEX</span>
              </div>
              <p className="font-display font-bold text-base text-slate-200">
                {weather.uvIndex}{" "}
                <span className="text-xs font-mono text-emerald-400">
                  Moderate
                </span>
              </p>
            </div>
          </div>

          {/* 5-Day Forecast Strip */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
              5-Day Meteorological Outlook
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {weather.dailyForecast.map((day, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/60 text-center space-y-2 hover:border-cyan-500/30 transition-all"
                >
                  <div className="font-mono text-xs font-bold text-slate-300">
                    {day.day}
                  </div>
                  <div className="text-[10px] text-slate-500">{day.date}</div>
                  <div className="flex justify-center py-1">
                    {renderWeatherIcon(day.iconName, "w-6 h-6")}
                  </div>
                  <div className="text-xs font-bold text-slate-200">
                    {day.maxTemp}°{" "}
                    <span className="text-slate-500 font-normal">
                      {day.minTemp}°
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-sky-400 flex items-center justify-center gap-0.5">
                    <Droplets className="w-2.5 h-2.5" />
                    <span>{day.rainChance}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
