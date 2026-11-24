const API_BASE = (process.env.NEXT_PUBLIC_TRAILERFIX_API_URL || "http://localhost:3001/api").replace(/\/$/, "")

export type Genre = { id: number; name: string }
export type Actor = { id: number; fullName?: string; firstName: string; lastName: string; characterName?: string; creditOrder?: number }
export type Season = { id: number; seasonNumber: number; releaseYear: number; episodeCount: number }
export type Content = {
  id: number
  title: string
  description?: string
  releaseYear?: number
  endYear?: number
  type: "MOVIE" | "SERIES"
  durationMinutes?: number
  status?: string
  genres?: Genre[]
  actors?: Actor[]
  seasons?: Season[]
  userStatus?: "WATCHED" | "WATCHLIST" | null
  // Extended fields
  trailerUrl?: string
  posterUrl?: string
  backdropUrl?: string
  rating?: number
  voteCount?: number
  imdbId?: string
  tmdbId?: number
  originalLanguage?: string
  originCountry?: string[]
  // Movie specific
  budget?: number
  revenue?: number
  originalTitle?: string
  runtimeMinutes?: number
  // Series specific
  numberOfSeasons?: number
  numberOfEpisodes?: number
  firstAirDate?: string
  lastAirDate?: string
  networks?: string[]
  inProduction?: boolean
}
export type User = { id: number; username: string; name: string }
export type UserContent = { id: number; contentId: number; status: "WATCHED" | "WATCHLIST"; watchedAt?: string | null; content: Content }

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init?.headers },
  })
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.error || `Error ${response.status}`)
  }
  if (response.status === 204) return undefined as T
  return response.json()
}

function asList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[]
  if (payload && typeof payload === "object") {
    const value = Object.values(payload).find(Array.isArray)
    if (value) return value as T[]
  }
  return []
}

export const api = {
  async contents(params: Record<string, string>): Promise<Content[]> {
    const query = new URLSearchParams(params).toString()
    return asList<Content>(await request(`/contents${query ? `?${query}` : ""}`))
  },
  async content(id: number): Promise<Content> {
    const payload = await request<Content | { content: Content }>(`/contents/${id}`)
    return "content" in payload ? payload.content : payload
  },
  async genres(): Promise<Genre[]> { return asList<Genre>(await request("/genres")) },
  async actorContents(id: number): Promise<Content[]> { return asList<Content>(await request(`/actors/${id}/contents`)) },
  async seasons(id: number): Promise<Season[]> { return asList<Season>(await request(`/series/${id}/seasons`)) },
  async me(): Promise<User> {
    const payload = await request<{ user: User } | User>("/auth/me")
    return "user" in payload ? payload.user : payload
  },
  async login(username: string, password: string): Promise<User> {
    const payload = await request<{ user: User }>("/auth/login", { method: "POST", body: JSON.stringify({ username, password }) })
    return payload.user
  },
  async register(username: string, name: string, password: string): Promise<User> {
    const payload = await request<{ user: User }>("/auth/register", { method: "POST", body: JSON.stringify({ username, name, password }) })
    return payload.user
  },
  async logout(): Promise<void> { await request("/auth/logout", { method: "POST" }) },
  async myContent(status?: string): Promise<UserContent[]> {
    return asList<UserContent>(await request(`/me/content${status ? `?status=${status}` : ""}`))
  },
  async addToList(contentId: number, status: "WATCHED" | "WATCHLIST"): Promise<void> {
    await request("/me/content", { method: "POST", body: JSON.stringify({ contentId, status }) })
  },
  async updateList(contentId: number, status: "WATCHED" | "WATCHLIST"): Promise<void> {
    await request(`/me/content/${contentId}`, { method: "PATCH", body: JSON.stringify({ status }) })
  },
  async removeFromList(contentId: number): Promise<void> { await request(`/me/content/${contentId}`, { method: "DELETE" }) },
  async createContent(data: Partial<Content>): Promise<Content> {
    return request<Content>("/contents", { method: "POST", body: JSON.stringify(data) })
  },
}
