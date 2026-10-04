import React, { useState, useRef, useEffect } from "react"
import {
  Send,
  Paperclip,
  Smile,
  MapPin,
  Phone,
  Check,
  CheckCheck,
  Search,
  Radio,
  Users,
} from "lucide-react"
import type { ChatRoom, ChatMessage, User } from "../types"
import Avatar from "../components/Avatar"
import { apiRequest } from "../lib/api"

function mapMessage(value: any): ChatMessage {
  return {
    id:
      value.id ||
      value._id ||
      `m_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    roomId: value.roomId,
    senderId: value.senderId || value.sender?._id || value.sender || "",
    senderName: value.senderName || value.sender?.name || "Traveler",
    senderAvatar: value.senderAvatar || value.sender?.avatar || "",
    content: value.content || "",
    timestamp:
      value.timestamp ||
      (value.createdAt
        ? new Date(value.createdAt).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "Just now"),
  }
}

interface ChatProps {
  user?: User | null
}

export default function Chat({ user }: ChatProps) {
  const activeUser = user || { id: "", name: "Traveler" }
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [sharing, setSharing] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isTyping] = useState(false)
  const [liveLocation, setLiveLocation] = useState<{
    latitude: number
    longitude: number
  } | null>(null)
  const [locationError, setLocationError] = useState("")
  const [mobileChatActive, setMobileChatActive] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  function getCachedMessages(roomId: string): ChatMessage[] {
    try {
      const cached = localStorage.getItem(`travel_chat_${roomId}`)
      if (cached) {
        const parsed = JSON.parse(cached)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch {}
    return []
  }

  function saveCachedMessages(roomId: string, newMessages: ChatMessage[]) {
    try {
      localStorage.setItem(`travel_chat_${roomId}`, JSON.stringify(newMessages))
    } catch {}
  }

  // Load dynamic connected chat rooms (accepted only)
  useEffect(() => {
    async function loadConnections() {
      try {
        const [conns, buddies] = await Promise.all([
          apiRequest<any[]>("/connections").catch(() => []),
          apiRequest<any[]>("/buddies").catch(() => []),
        ])

        const currentUserId = (activeUser.id || (activeUser as any)._id || "").toString()

        if (Array.isArray(conns) && conns.length > 0) {
          const acceptedConns = conns.filter(
            (c: any) => c.status === "accepted",
          )
          const dynamicRooms: ChatRoom[] = acceptedConns.map(
            (c: any, index: number) => {
              const fromId =
                typeof c.from === "object" && c.from !== null
                  ? (c.from._id || c.from.id || "").toString()
                  : (c.from || "").toString()
              const partnerId =
                c.toUserId === currentUserId ? fromId : (c.toUserId || "").toString()
              const buddyMatch = Array.isArray(buddies)
                ? buddies.find((b: any) => (b.user?.id || b.user?._id || "").toString() === partnerId)
                : null
              const name =
                buddyMatch?.user?.name ||
                (typeof c.from === "object" && c.from?.name
                  ? c.from.name
                  : null) ||
                `Travel Buddy #${index + 1}`
              const avatar =
                buddyMatch?.user?.avatar ||
                (typeof c.from === "object" ? c.from?.avatar : "") ||
                ""
              const roomId = `dm_${[currentUserId, partnerId].sort().join("_")}`

              return {
                id: roomId,
                name,
                participants: [currentUserId, partnerId],
                lastMessage: "Connected! Start your real conversation here.",
                lastTime: "Active",
                unread: 0,
                avatar,
              }
            },
          )

          setRooms(dynamicRooms)
          setActiveRoom((current) => {
            if (!current) return dynamicRooms[0] || null
            return (
              dynamicRooms.find((r) => r.id === current.id) ||
              dynamicRooms[0] ||
              null
            )
          })
        } else {
          setRooms([])
          setActiveRoom(null)
        }
      } catch (e) {
        console.warn("Could not load dynamic chat rooms:", e)
      }
    }

    loadConnections()
    const interval = setInterval(loadConnections, 10000)
    return () => clearInterval(interval)
  }, [activeUser?.id, (activeUser as any)?._id])

  // Geolocation watch
  useEffect(() => {
    if (!sharing) return
    if (!navigator.geolocation) {
      setLocationError("Live location is not supported by this browser.")
      return
    }
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setLiveLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
        setLocationError("")
      },
      () => setLocationError("Location permission was denied or unavailable."),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 },
    )
    return () => navigator.geolocation.clearWatch(watchId)
  }, [sharing])

  // Load and poll real messages for active room
  useEffect(() => {
    if (!activeRoom) {
      setMessages([])
      return
    }
    let cancelled = false

    async function loadMessages() {
      if (!activeRoom || cancelled) return
      try {
        const savedMessages = await apiRequest<any[]>(
          `/chat/rooms/${activeRoom.id}/messages`,
        ).catch(() => [])
        if (!cancelled && Array.isArray(savedMessages)) {
          const mappedMessages = savedMessages.map(mapMessage)
          setMessages(mappedMessages)
          saveCachedMessages(activeRoom.id, mappedMessages)
        }
      } catch {}
    }

    // 1. Initial cached render
    const initialMsgs = getCachedMessages(activeRoom.id)
    if (initialMsgs.length > 0) setMessages(initialMsgs)

    // 2. Fetch latest real messages from server
    loadMessages()

    // 3. Poll for real incoming messages from the partner account
    const interval = setInterval(loadMessages, 3000)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [activeRoom?.id])

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function sendMessage() {
    if (!activeRoom) return
    const text = input.trim()
    if (!text || isSending) return

    const timeStr = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })

    const senderId = (activeUser.id || (activeUser as any)._id || "u1").toString()
    const senderName = activeUser.name || "You"

    const newMsg: ChatMessage = {
      id: `m_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      roomId: activeRoom.id,
      senderId,
      senderName,
      senderAvatar: activeUser.avatar ?? "",
      content: text,
      timestamp: timeStr,
    }

    setInput("")
    setMessages((prev) => {
      const updated = [...prev, newMsg]
      saveCachedMessages(activeRoom.id, updated)
      return updated
    })

    // Update room preview
    setRooms((prev) =>
      prev.map((r) =>
        r.id === activeRoom.id
          ? { ...r, lastMessage: text, lastTime: timeStr }
          : r,
      ),
    )

    setIsSending(true)
    try {
      const saved = await apiRequest<any>(
        `/chat/rooms/${activeRoom.id}/messages`,
        { method: "POST", body: JSON.stringify({ content: text }) },
      )
      if (saved) {
        const mapped = mapMessage(saved)
        setMessages((prev) => {
          const replaced = prev.map((m) => (m.id === newMsg.id ? mapped : m))
          saveCachedMessages(activeRoom.id, replaced)
          return replaced
        })
      }
    } catch {
      // Message remains persisted locally
    } finally {
      setIsSending(false)
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const filteredRooms = rooms.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.destination &&
        r.destination.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  return (
    <div className="flex flex-1 w-full h-full min-h-0 overflow-hidden bg-slate-950 text-slate-100">
      {/* Room list sidebar: hidden on mobile when viewing a chat */}
      <div
        className={`flex flex-col flex-shrink-0 w-full md:w-80 border-r border-slate-800/80 bg-slate-900/90 backdrop-blur-md ${
          mobileChatActive ? "hidden md:flex" : "flex"
        }`}
      >
        <div className="p-4 border-b border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
              Conversations
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              {rooms.length} Active
            </span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-2 divide-y divide-slate-800/40">
          {filteredRooms.length === 0 ? (
            <div className="text-center py-12 px-4">
              <p className="text-xs font-semibold text-slate-400 mb-1">
                No conversations yet
              </p>
              <p className="text-[11px] text-slate-600">
                Connect with travel buddies in the Buddies tab to start
                chatting.
              </p>
            </div>
          ) : (
            filteredRooms.map((room) => {
              const isActive = activeRoom?.id === room.id
              return (
                <button
                  key={room.id}
                  onClick={() => {
                    setActiveRoom(room)
                    setMobileChatActive(true)
                  }}
                  className={`flex items-center gap-3 w-full px-4 py-3.5 transition-all text-left ${
                    isActive
                      ? "bg-cyan-500/15 border-l-4 border-cyan-400 shadow-sm"
                      : "hover:bg-slate-800/40 border-l-4 border-transparent"
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <Avatar name={room.name} size={42} />
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p
                        className={`text-xs font-bold truncate ${
                          isActive ? "text-cyan-300" : "text-slate-200"
                        }`}
                      >
                        {room.name}
                      </p>
                      <span className="text-[10px] font-mono text-slate-500 flex-shrink-0 ml-1">
                        {room.lastTime}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">
                      {room.lastMessage}
                    </p>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Main Chat Area: hidden on mobile when not in a chat */}
      <div
        className={`flex-1 flex flex-col min-w-0 bg-slate-950/60 ${
          !mobileChatActive ? "hidden md:flex" : "flex"
        }`}
      >
        {!activeRoom ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-3xl mb-4">
              💬
            </div>
            <h3 className="font-display font-bold text-lg text-white mb-2">
              Your Travel Conversations
            </h3>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Connect with companions on the{" "}
              <span className="text-cyan-400 font-semibold">Buddies</span> tab
              to begin planning and chatting securely.
            </p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                {/* Mobile back button */}
                <button
                  onClick={() => setMobileChatActive(false)}
                  className="md:hidden p-1.5 -ml-1 rounded-lg text-cyan-400 hover:bg-slate-800 text-xs font-mono font-bold flex items-center gap-1"
                  aria-label="Back to conversations"
                >
                  ←
                </button>
                <div className="relative flex-shrink-0">
                  <Avatar name={activeRoom.name} size={38} />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-900 animate-pulse" />
                </div>
                <div className="min-w-0">
                  <p className="font-display font-bold text-xs sm:text-sm text-white truncate">
                    {activeRoom.name}
                  </p>
                  <p className="text-[10px] sm:text-[11px] font-mono text-emerald-400 flex items-center gap-1 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                    Active Now
                  </p>
                </div>
                {activeRoom.destination && (
                  <span className="ml-2 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/30">
                    📍 {activeRoom.destination}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSharing(!sharing)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all border ${
                    sharing
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  {sharing ? "Broadcasting GPS" : "Share Live GPS"}
                </button>
              </div>
            </div>

            {/* GPS Live Sharing Banner */}
            {sharing && (
              <div className="flex items-center gap-3 px-6 py-2.5 bg-emerald-950/40 border-b border-emerald-500/30 text-xs font-mono text-emerald-300">
                <Radio className="w-4 h-4 animate-spin text-emerald-400" />
                <span>
                  Live GPS Radar Active:{" "}
                  {liveLocation
                    ? `${liveLocation.latitude.toFixed(4)}°, ${liveLocation.longitude.toFixed(4)}°`
                    : "Broadcasting device coordinates"}
                </span>
                <button
                  onClick={() => setSharing(false)}
                  className="ml-auto text-rose-400 hover:text-rose-300 font-bold"
                >
                  Stop
                </button>
              </div>
            )}

            {/* Message Feed */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="flex items-center gap-3 my-2">
                <div className="flex-1 h-px bg-slate-800" />
                <span className="font-mono text-[10px] text-slate-500 uppercase px-2">
                  Encrypted Journey Chat
                </span>
                <div className="flex-1 h-px bg-slate-800" />
              </div>

              {messages
                .filter((msg) => msg.roomId === activeRoom.id)
                .map((msg) => {
                  const isMe =
                    Boolean(activeUser?.id && msg.senderId === activeUser.id) ||
                    Boolean((activeUser as any)?._id && msg.senderId === (activeUser as any)._id) ||
                    msg.senderName === activeUser?.name ||
                    msg.senderName === "You"

                  return (
                    <div
                      key={msg.id}
                      className={`flex items-end gap-3 ${
                        isMe ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      {!isMe && <Avatar name={msg.senderName} size={32} />}
                      <div
                        className={`max-w-[70%] rounded-2xl p-4 space-y-1 shadow-md transition-all ${
                          isMe
                            ? "bg-gradient-to-r from-cyan-600 to-sky-600 text-white rounded-br-none"
                            : "bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none"
                        }`}
                      >
                        {!isMe && (
                          <p className="text-[11px] font-bold text-cyan-400 mb-0.5">
                            {msg.senderName}
                          </p>
                        )}
                        <p className="text-xs leading-relaxed break-words">
                          {msg.content}
                        </p>
                        <div className="flex items-center justify-end gap-1 pt-1 text-[10px] font-mono opacity-80">
                          <span>{msg.timestamp}</span>
                          {isMe && (
                            <CheckCheck className="w-3.5 h-3.5 text-white/90" />
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400 pl-2">
                  <Avatar name={activeRoom.name} size={24} />
                  <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Box */}
            <div className="p-4 border-t border-slate-800/80 bg-slate-900/90 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 focus-within:border-cyan-500 transition-all">
                  <button
                    className="text-slate-400 hover:text-slate-200"
                    title="Attach image or waypoint"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder={`Message ${activeRoom.name}... (Enter to send)`}
                    rows={1}
                    className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none resize-none leading-relaxed"
                  />
                  <button
                    className="text-slate-400 hover:text-slate-200"
                    title="Insert emoji"
                  >
                    <Smile className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  className={`p-3 rounded-2xl transition-all flex items-center justify-center ${
                    input.trim()
                      ? "bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/30 scale-100"
                      : "bg-slate-800 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
