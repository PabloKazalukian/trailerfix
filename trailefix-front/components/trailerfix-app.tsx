"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { api, type Actor, type Content, type Genre, type User, type UserContent } from "@/lib/trailerfix-api"
import { Bookmark, Check, ChevronDown, Clapperboard, Film, LoaderCircle, LogIn, Menu, Play, Search, SlidersHorizontal, Tv, UserRound, X, Image as ImageIcon, Plus, X as XIcon } from "lucide-react"

type Section = "Inicio" | "Series" | "Películas" | "Mis films"
type Modal = "login" | "register" | null

const navItems: { name: Section; icon: typeof Film }[] = [
  { name: "Inicio", icon: Clapperboard }, { name: "Series", icon: Tv }, { name: "Películas", icon: Film }, { name: "Mis films", icon: Bookmark },
]

function actorName(actor: Actor) { return actor.fullName || `${actor.firstName} ${actor.lastName}` }

// Extract YouTube video ID from various URL formats
function extractYouTubeId(url: string | undefined): string | null {
  if (!url) return null
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/,
    /^[\w-]{11}$/
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

// Get poster image URL with fallback
function getPosterUrl(item: Content): string | null {
  return item.posterUrl || item.backdropUrl || null
}

// Get backdrop/hero image URL with fallback
function getBackdropUrl(item: Content): string | null {
  return item.backdropUrl || item.posterUrl || null
}

function ContentCard({ item, onSelect, onActor, status, onStatus }: { item: Content; onSelect: (item: Content) => void; onActor: (actor: Actor) => void; status?: string | null; onStatus: (item: Content, status: "WATCHED" | "WATCHLIST") => void }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const posterUrl = getPosterUrl(item)
  const videoId = extractYouTubeId(item.trailerUrl)
  const hasTrailer = !!videoId
  
  return <article className="film-card">
    <button className="poster" onClick={() => onSelect(item)} aria-label={`Ver detalles de ${item.title}`}>
      {posterUrl ? (
        <div className="poster-art" style={{ backgroundImage: `url("${posterUrl}")` }}>
          {hasTrailer && <span className="poster-play-overlay"><Play fill="currentColor" /></span>}
        </div>
      ) : (
        <div className="poster-art">
          <span className="poster-mark">{item.type === "SERIES" ? <Tv /> : <Film />}</span>
          <span className="poster-empty">Añade una imagen<br />o tráiler</span>
        </div>
      )}
      {(hasTrailer || posterUrl) && <span className="poster-play"><Play fill="currentColor" /></span>}
      <span className="poster-type">{item.type === "SERIES" ? "SERIE" : "PELÍCULA"}</span>
    </button>
    <div className="card-meta"><div className="card-title-row"><button className="card-title" onClick={() => onSelect(item)}>{item.title}</button><div className="list-menu-wrap"><button className={`icon-button card-bookmark ${status ? "is-saved" : ""}`} aria-label="Añadir a Mis films" onClick={() => setMenuOpen(!menuOpen)}><Bookmark /></button>{menuOpen && <div className="status-menu"><button onClick={() => { onStatus(item, "WATCHLIST"); setMenuOpen(false) }}>Quiero ver</button><button onClick={() => { onStatus(item, "WATCHED"); setMenuOpen(false) }}>Ya la vi</button></div>}</div></div>
      <div className="card-subtitle">{item.releaseYear || "Año sin datos"}{item.type === "SERIES" && item.endYear ? ` — ${item.endYear}` : ""}{item.durationMinutes ? ` · ${item.durationMinutes} min` : ""}</div>
      <div className="genre-tags">{(item.genres || []).slice(0, 2).map(g => <span key={g.id}>{g.name}</span>)}</div>
      {item.actors?.length ? <div className="card-actors">{item.actors.slice(0, 2).map((actor, index) => <span key={actor.id}>{index > 0 && " · "}<button onClick={() => onActor(actor)}>{actorName(actor)}</button></span>)}</div> : <div className="card-actors muted">Reparto por descubrir</div>}
    </div>
  </article>
}

function AuthDialog({ mode, onClose, onSubmit, error, busy, setMode }: { mode: Exclude<Modal, null>; onClose: () => void; onSubmit: (data: { username: string; name: string; password: string }) => void; error: string; busy: boolean; setMode: (mode: Modal) => void }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}><section className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title"><button className="icon-button modal-close" onClick={onClose} aria-label="Cerrar"><X /></button><div className="brand-mark large"><Clapperboard /></div><p className="eyebrow">TU PRÓXIMA HISTORIA</p><h2 id="auth-title">{mode === "login" ? "Qué bueno verte." : "Empieza tu colección."}</h2><p className="modal-copy">{mode === "login" ? "Entra para continuar tu recorrido." : "Crea una cuenta y guarda cada historia."}</p><form onSubmit={e => { e.preventDefault(); const data = new FormData(e.currentTarget); onSubmit({ username: String(data.get("username")), name: String(data.get("name") || ""), password: String(data.get("password")) }) }}>
    {mode === "register" && <label>Nombre<input name="name" autoComplete="name" required placeholder="Tu nombre" /></label>}<label>Usuario<input name="username" autoComplete="username" required placeholder="Tu usuario" /></label><label>Contraseña<input name="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} required minLength={6} placeholder="Al menos 6 caracteres" /></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="primary-button auth-submit" disabled={busy}>{busy ? <LoaderCircle className="spin" /> : mode === "login" ? "Iniciar sesión" : "Crear cuenta"}</button></form><p className="switch-auth">{mode === "login" ? "¿Aún no tienes cuenta?" : "¿Ya tienes cuenta?"} <button onClick={() => setMode(mode === "login" ? "register" : "login")}>{mode === "login" ? "Regístrate" : "Inicia sesión"}</button></p></section></div>
}

const MOVIE_FORM_STORAGE_KEY = "trailerfix-create-movie-form"

type MovieFormData = {
  type: "MOVIE"
  title: string
  durationMinutes: string
  description: string
  releaseYear: string
  trailerUrl: string
}

function CreateMovieDialog({ onClose, onSubmit, error, busy }: { onClose: () => void; onSubmit: (data: Partial<Content>) => void; error: string; busy: boolean }) {
  const [formData, setFormData] = useState<MovieFormData>(() => {
    // Load from localStorage on initial render
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(MOVIE_FORM_STORAGE_KEY)
        if (saved) {
          const parsed = JSON.parse(saved)
          // Validate it's the right shape
          if (parsed && typeof parsed === "object" && parsed.type === "MOVIE") {
            return parsed as MovieFormData
          }
        }
      } catch {
        // Ignore parsing errors, use defaults
      }
    }
    return {
      type: "MOVIE",
      title: "",
      durationMinutes: "",
      description: "",
      releaseYear: "",
      trailerUrl: "",
    }
  })

  // Save to localStorage whenever formData changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(MOVIE_FORM_STORAGE_KEY, JSON.stringify(formData))
      } catch {
        // Ignore storage errors (e.g., quota exceeded)
      }
    }
  }, [formData])

  const handleChange = (field: keyof MovieFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const submitData: Partial<Content> = {
      type: "MOVIE",
      title: formData.title?.trim(),
      durationMinutes: formData.durationMinutes ? parseInt(formData.durationMinutes) : undefined,
      description: formData.description?.trim() || undefined,
      releaseYear: formData.releaseYear ? parseInt(formData.releaseYear) : undefined,
      trailerUrl: formData.trailerUrl?.trim() || undefined,
    }
    onSubmit(submitData)
  }

  const isValid = formData.title?.trim() && formData.durationMinutes

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
      <section className="auth-modal create-movie-modal" role="dialog" aria-modal="true" aria-labelledby="create-movie-title">
        <button className="icon-button modal-close" onClick={onClose} aria-label="Cerrar"><XIcon /></button>
        <div className="brand-mark large"><Clapperboard /></div>
        <p className="eyebrow">NUEVA PELÍCULA</p>
        <h2 id="create-movie-title">Crear película</h2>
        <p className="modal-copy">Completa los campos obligatorios para añadir una película.</p>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <label className="full-width">
              Título <span className="required">*</span>
              <input name="title" autoComplete="off" required placeholder="Título de la película" value={formData.title} onChange={e => handleChange("title", e.target.value)} />
            </label>
            <label className="full-width">
              Duración (min) <span className="required">*</span>
              <input name="durationMinutes" type="number" min="1" max="65535" required placeholder="120" value={formData.durationMinutes} onChange={e => handleChange("durationMinutes", e.target.value)} />
            </label>
            <label className="full-width">
              Descripción
              <textarea name="description" placeholder="Sinopsis de la película" value={formData.description} onChange={e => handleChange("description", e.target.value)} rows={3} />
            </label>
            <label>
              Año de estreno
              <input name="releaseYear" type="number" min="1888" max="2100" placeholder="2024" value={formData.releaseYear} onChange={e => handleChange("releaseYear", e.target.value)} />
            </label>
            <label className="full-width">
              URL del tráiler (YouTube)
              <input name="trailerUrl" autoComplete="off" placeholder="https://youtu.be/VIDEO_ID o https://www.youtube.com/watch?v=VIDEO_ID" value={formData.trailerUrl} onChange={e => handleChange("trailerUrl", e.target.value)} />
            </label>
          </div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="dialog-actions">
            <button type="button" className="secondary-button" onClick={onClose} disabled={busy}>Cancelar</button>
            <button type="submit" className="primary-button" disabled={busy || !isValid}>
              {busy ? <LoaderCircle className="spin" /> : "Crear película"}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

function DetailDialog({ item, onClose, onActor, onStatus, status }: { item: Content; onClose: () => void; onActor: (actor: Actor) => void; onStatus: (item: Content, status: "WATCHED" | "WATCHLIST") => void; status?: string | null }) {
  const videoId = extractYouTubeId(item.trailerUrl)
  const backdropUrl = getBackdropUrl(item)
  
  return <div className="modal-backdrop detail-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}><section className="detail-modal" role="dialog" aria-modal="true" aria-labelledby="detail-title"><button className="icon-button modal-close" onClick={onClose} aria-label="Cerrar"><X /></button><div className="detail-visual">
      {videoId ? (
        <div className="detail-trailer">
          <iframe 
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&controls=1&fs=1&showinfo=0&color=white&enablejsapi=1&origin=https://192.168.1.36:3000`}
            title={`Tráiler de ${item.title}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="eager"
            tabIndex={0}
          />
        </div>
      ) : backdropUrl ? (
        <div className="detail-art" style={{ backgroundImage: `url("${backdropUrl}")` }}>
          <span className="visual-caption">IMAGEN DE FONDO · TRAILERFIX</span>
        </div>
      ) : (
        <div className="detail-art"><Play fill="currentColor" /><span>ESPACIO PARA TRÁILER O IMAGEN</span><span className="visual-caption">PREVIEW · TRAILERFIX</span></div>
      )}
    </div><div className="detail-content"><p className="eyebrow">{item.type === "SERIES" ? "SERIE" : "PELÍCULA"} · {item.releaseYear || "AÑO POR CONFIRMAR"}</p><h2 id="detail-title">{item.title}</h2><p className="detail-description">{item.description || "La sinopsis de este título aparecerá aquí cuando esté disponible."}</p><div className="detail-facts">{item.durationMinutes ? <span>{item.durationMinutes} min</span> : null}{item.endYear ? <span>{item.releaseYear} — {item.endYear}</span> : null}{item.status ? <span>{item.status === "COMPLETED" ? "Finalizada" : item.status === "ONGOING" ? "En emisión" : "Cancelada"}</span> : null}{(item.genres || []).map(g => <span key={g.id}>{g.name}</span>)}</div>
    <div className="detail-actions"><button className="primary-button" onClick={() => onStatus(item, "WATCHLIST")}><Bookmark /> {status === "WATCHLIST" ? "En mi lista" : "Quiero verla"}</button><button className="secondary-button" onClick={() => onStatus(item, "WATCHED")}><Check /> {status === "WATCHED" ? "Ya la vi" : "Marcar vista"}</button></div>
    <section className="cast-section"><div className="section-label"><span>ELENCO</span><span>{item.actors?.length || 0} créditos</span></div>{item.actors?.length ? <div className="cast-list">{item.actors.slice().sort((a,b) => (a.creditOrder || 999) - (b.creditOrder || 999)).map(actor => <button className="cast-person" key={actor.id} onClick={() => onActor(actor)}><span className="cast-avatar"><UserRound /></span><span><strong>{actorName(actor)}</strong><small>{actor.characterName || "Reparto"}</small></span><span className="cast-arrow">↗</span></button>)}</div> : <p className="muted">El elenco aparecerá aquí cuando esté disponible.</p>}</section>
    {item.type === "SERIES" && <section className="season-section"><div className="section-label"><span>TEMPORADAS</span><span>{item.seasons?.length || 0} temporadas</span></div>{item.seasons?.length ? item.seasons.map(season => <div className="season-row" key={season.id}><span className="season-number">{String(season.seasonNumber).padStart(2, "0")}</span><span><strong>Temporada {season.seasonNumber}</strong><small>{season.releaseYear} · {season.episodeCount} episodios</small></span><ChevronDown /></div>) : <p className="muted">Temporadas pendientes de cargar.</p>}</section>}</div></section></div>
}

export function TrailerfixApp() {
  const [section, setSection] = useState<Section>("Inicio")
  const [content, setContent] = useState<Content[]>([])
  const [genres, setGenres] = useState<Genre[]>([])
  const [myContent, setMyContent] = useState<UserContent[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [query, setQuery] = useState("")
  const [genreId, setGenreId] = useState("")
  const [activeStatus, setActiveStatus] = useState<"WATCHED" | "WATCHLIST">("WATCHLIST")
  const [selected, setSelected] = useState<Content | null>(null)
  const [actor, setActor] = useState<Actor | null>(null)
  const [actorContent, setActorContent] = useState<Content[]>([])
  const [modal, setModal] = useState<Modal>(null)
  const [authError, setAuthError] = useState("")
  const [busyAuth, setBusyAuth] = useState(false)
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState("")
  const [notice, setNotice] = useState("")
  const [mobileNav, setMobileNav] = useState(false)
  const [createMovieOpen, setCreateMovieOpen] = useState(false)
  const [createMovieBusy, setCreateMovieBusy] = useState(false)
  const [createMovieError, setCreateMovieError] = useState("")

  const loadContent = useCallback(async () => {
    setLoading(true); setApiError("")
    try {
      const params: Record<string, string> = {}
      if (section === "Series") params.type = "SERIES"
      if (section === "Películas") params.type = "MOVIE"
      if (query.trim()) params.title = query.trim()
      if (genreId) params.genreId = genreId
      const [items, allGenres] = await Promise.all([api.contents(params), api.genres()])
      setContent(items); setGenres(allGenres)
    } catch (error) { setApiError(error instanceof Error ? error.message : "No se pudo conectar con la API"); setContent([]) }
    finally { setLoading(false) }
  }, [section, query, genreId])

  useEffect(() => { void loadContent() }, [loadContent])
  useEffect(() => { void api.me().then(setUser).catch(() => setUser(null)) }, [])
  const loadMine = useCallback(async () => { if (!user) return; try { setMyContent(await api.myContent()) } catch { setMyContent([]) } }, [user])
  useEffect(() => { void loadMine() }, [loadMine])
  useEffect(() => {
    if (!selected) return
    const selectedId = selected.id
    const detailRequest = selected.type === "SERIES" ? api.seasons(selectedId) : Promise.resolve([])
    void Promise.all([api.content(selectedId), detailRequest]).then(([detail, seasons]) => {
      setSelected(current => current?.id === selectedId ? { ...detail, seasons: seasons.length ? seasons : detail.seasons } : current)
    }).catch(() => {})
  }, [selected?.id, selected?.type])
  useEffect(() => { if (actor) void api.actorContents(actor.id).then(setActorContent).catch(() => setActorContent([])) }, [actor])

  const visibleContent = useMemo(() => section === "Mis films" ? myContent.filter(entry => entry.status === activeStatus).map(entry => entry.content) : content, [section, myContent, activeStatus, content])
  const statusFor = (item: Content) => myContent.find(entry => entry.contentId === item.id)?.status || item.userStatus

  async function updateStatus(item: Content, status: "WATCHED" | "WATCHLIST") {
    if (!user) { setModal("login"); setNotice("Inicia sesión para guardar títulos en Mis films."); return }
    try {
      const current = myContent.find(entry => entry.contentId === item.id)
      if (current) await api.updateList(item.id, status)
      else await api.addToList(item.id, status)
      setNotice(status === "WATCHED" ? "Añadida a las que ya viste." : "Guardada en tu lista para ver.")
      await loadMine()
      void loadContent()
    } catch (error) { setNotice(error instanceof Error ? error.message : "No se pudo guardar el título.") }
  }
  async function submitAuth(data: { username: string; name: string; password: string }) {
    setBusyAuth(true); setAuthError("")
    try { const next = modal === "register" ? await api.register(data.username, data.name, data.password) : await api.login(data.username, data.password); setUser(next); setModal(null); setNotice(`Hola, ${next.name}.`); void loadContent() }
    catch (error) { setAuthError(error instanceof Error ? error.message : "No se pudo iniciar sesión.") }
    finally { setBusyAuth(false) }
  }
  async function logout() { try { await api.logout() } finally { setUser(null); setMyContent([]); setNotice("Has cerrado sesión."); void loadContent() } }
  function openActor(person: Actor) { setSelected(null); setActor(person); setActorContent([]) }

  async function createMovie(data: Partial<Content>) {
    if (!user) { setModal("login"); setNotice("Inicia sesión para crear películas."); return }
    setCreateMovieBusy(true)
    setCreateMovieError("")
    try {
      await api.createContent(data)
      setNotice("Película creada correctamente.")
      // Clear saved form data on success
      if (typeof window !== "undefined") {
        localStorage.removeItem(MOVIE_FORM_STORAGE_KEY)
      }
      setCreateMovieOpen(false)
      await loadContent()
    } catch (error) {
      setCreateMovieError(error instanceof Error ? error.message : "No se pudo crear la película.")
    } finally {
      setCreateMovieBusy(false)
    }
  }

  return <main className="app-shell"><aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}><button className="brand" onClick={() => { setSection("Inicio"); setMobileNav(false) }}><span className="brand-mark"><Clapperboard /></span><span>trailerfix<span className="brand-period">.</span><small>EL CINE A TU MANERA</small></span></button><div className="side-label">DESCUBRE</div><nav className="side-nav" aria-label="Navegación principal">{navItems.slice(0,3).map(item => <button key={item.name} onClick={() => { setSection(item.name); setMobileNav(false) }} className={`nav-link ${section === item.name ? "active" : ""}`}><item.icon /><span>{item.name}</span>{section === item.name && <i />}</button>)}</nav><div className="side-label library-label">TU ESPACIO</div><nav className="side-nav"><button onClick={() => { setSection("Mis films"); setMobileNav(false) }} className={`nav-link ${section === "Mis films" ? "active" : ""}`}><Bookmark /><span>Mis films</span><span className="nav-count">{myContent.length || "—"}</span></button></nav><div className="sidebar-bottom"><div className="sidebar-note"><div className="note-icon"><Play fill="currentColor" /></div><p>Una buena historia<br />siempre encuentra<br />su momento.</p><span>TRAILERFIX · 2026</span></div><div className="sidebar-footer">HECHO PARA QUIENES AMAN LAS HISTORIAS</div></div></aside>
    {mobileNav && <button className="mobile-scrim" aria-label="Cerrar menú" onClick={() => setMobileNav(false)} />}
    <section className="main-area"><header className="topbar"><button className="mobile-menu icon-button" aria-label="Abrir menú" onClick={() => setMobileNav(true)}><Menu /></button><div className="breadcrumbs">TRAILERFIX <span>/</span> <strong>{section.toUpperCase()}</strong></div><label className="top-search"><Search /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar títulos..." aria-label="Buscar películas y series" /><kbd>⌘ K</kbd></label><div className="top-actions">{user ? <><span className="user-greeting">Hola, {user.name}</span><button className="login-button" onClick={logout}>Salir <span>↗</span></button></> : <button className="login-button" onClick={() => { setAuthError(""); setModal("login") }}>Entrar <span>↗</span></button>}</div></header>
    <div className="page-content"><section className="hero"><div className="hero-copy"><div className="hero-kicker"><span className="kicker-line" /> TU UNIVERSO DE CINE <span>01 / 04</span></div><h1>Historias que<br />se quedan <em>contigo.</em></h1><p>Encuentra tu próxima película favorita, descubre nuevas series y lleva tu propio registro de historias.</p></div><div className="hero-art" aria-label="Imagen destacada del catálogo">
      {(() => {
        // Find first item with backdrop or poster for featured image
        const featured = content.find(item => getBackdropUrl(item) || getPosterUrl(item))
        const featuredUrl = featured ? getBackdropUrl(featured) : null
        const featuredTitle = featured?.title || "TRAILERFIX"
        const featuredTrailerId = featured ? extractYouTubeId(featured.trailerUrl) : null
        
        if (featuredTrailerId) {
          return (
            <div className="hero-trailer">
              <iframe 
                src={`https://www.youtube.com/embed/${featuredTrailerId}?autoplay=1&mute=1&loop=1&playlist=${featuredTrailerId}&controls=1&modestbranding=1&rel=0&playsinline=1&iv_load_policy=3&fs=1&showinfo=0&color=white&enablejsapi=1&origin=https://192.168.1.36:3000`}
                title={`Tráiler destacado: ${featuredTitle}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="eager"
                tabIndex={0}
              />
            </div>
          )
        }
        
        if (featuredUrl) {
          return (
            <div className="hero-image" style={{ backgroundImage: `url("${featuredUrl}")` }}>
              <div className="hero-overlay">
                <div className="hero-art-label"><span>TRAILERFIX ORIGINAL</span><span>01—∞</span></div>
              </div>
            </div>
          )
        }
        
        return (
          <>
            <div className="hero-art-lines"/>
            <div className="hero-film-mark"><Clapperboard /></div>
            <span className="hero-placeholder">IMAGEN DESTACADA<br /><small>El catálogo conectará tus historias</small></span>
            <div className="hero-art-label"><span>TRAILERFIX ORIGINAL</span><span>01—∞</span></div>
            <div className="hero-orbit" />
          </>
        )
      })()}
    </div><div className="hero-index">01<span> / 04</span></div></section>
    <section className="catalog-section"><div className="catalog-heading"><div><div className="eyebrow">TU PRÓXIMA HISTORIA EMPIEZA AQUÍ</div><h2>{section === "Inicio" ? "En cartelera" : section === "Mis films" ? "Tu colección" : section === "Series" ? "Series" : "Películas"}<span className="heading-period">.</span></h2></div><div className="catalog-tools">{section === "Mis films" ? <div className="filter-pills"><button className={activeStatus === "WATCHLIST" ? "selected" : ""} onClick={() => setActiveStatus("WATCHLIST")}>Por ver</button><button className={activeStatus === "WATCHED" ? "selected" : ""} onClick={() => setActiveStatus("WATCHED")}>Vistas</button></div> : section === "Películas" ? <> <label className="genre-filter"><SlidersHorizontal /><select value={genreId} onChange={e => setGenreId(e.target.value)} aria-label="Filtrar por género"><option value="">Todos los géneros</option>{genres.map(g => <option value={g.id} key={g.id}>{g.name}</option>)}</select><ChevronDown /></label> <button className="primary-button create-movie-btn" onClick={() => { setCreateMovieError(""); setCreateMovieOpen(true) }}><Plus /> Crear película</button> </> : <label className="genre-filter"><SlidersHorizontal /><select value={genreId} onChange={e => setGenreId(e.target.value)} aria-label="Filtrar por género"><option value="">Todos los géneros</option>{genres.map(g => <option value={g.id} key={g.id}>{g.name}</option>)}</select><ChevronDown /></label>}</div></div>
      {apiError ? <div className="state-panel"><div className="state-icon"><Clapperboard /></div><span className="eyebrow">CONEXIÓN PENDIENTE</span><h3>No podemos abrir la sala todavía.</h3><p>{apiError.includes("fetch") || apiError.includes("Failed") ? "Configura la URL de tu API en NEXT_PUBLIC_TRAILERFIX_API_URL y habilita CORS con credenciales para este frontend." : apiError}</p><button className="secondary-button" onClick={() => void loadContent()}>Reintentar <span>↻</span></button></div> : loading ? <div className="loading-state"><LoaderCircle className="spin" /> Cargando catálogo...</div> : section === "Mis films" && !user ? <div className="state-panel compact-state"><div className="state-icon"><Bookmark /></div><span className="eyebrow">TU COLECCIÓN PERSONAL</span><h3>Tu historia empieza con una cuenta.</h3><p>Inicia sesión para organizar lo que ya viste y descubrir qué sigue.</p><button className="primary-button" onClick={() => setModal("login")}>Iniciar sesión <LogIn /></button></div> : visibleContent.length ? <div className="film-grid">{visibleContent.map(item => <ContentCard key={item.id} item={item} onSelect={setSelected} onActor={openActor} status={statusFor(item)} onStatus={updateStatus} />)}</div> : <div className="state-panel compact-state"><div className="state-icon"><Film /></div><span className="eyebrow">{section === "Mis films" ? activeStatus === "WATCHED" ? "TUS HISTORIAS VISTAS" : "TU LISTA PERSONAL" : "NUEVOS TÍTULOS POR DESCUBRIR"}</span><h3>{section === "Mis films" ? activeStatus === "WATCHED" ? "Todavía no has marcado ninguna historia." : "Tu lista para ver está esperando." : query ? "No encontramos ese título." : "El catálogo aparecerá aquí."}</h3><p>{section === "Mis films" ? "Explora películas y series, luego guárdalas aquí." : "Prueba con otro título o cambia el filtro de género."}</p></div>}
    </section><footer className="page-footer"><span>TRAILERFIX © 2026</span><span>HECHO PARA CONTAR HISTORIAS</span></footer></div></section>
    {modal && <AuthDialog mode={modal} onClose={() => setModal(null)} onSubmit={submitAuth} error={authError} busy={busyAuth} setMode={value => { setAuthError(""); setModal(value) }} />}
    {selected && <DetailDialog item={selected} onClose={() => setSelected(null)} onActor={openActor} onStatus={updateStatus} status={statusFor(selected)} />}
    {createMovieOpen && <CreateMovieDialog onClose={() => setCreateMovieOpen(false)} onSubmit={createMovie} error={createMovieError} busy={createMovieBusy} />}
    {actor && <div className="actor-page"><header className="topbar"><button className="text-button" onClick={() => setActor(null)}>← Volver al catálogo</button><span className="breadcrumbs">TRAILERFIX <span>/</span> TALENTO</span></header><div className="actor-content"><div className="actor-intro"><span className="eyebrow">ENCUENTRA TODAS SUS HISTORIAS</span><div className="actor-portrait"><UserRound /></div><h1>{actorName(actor)}<span className="heading-period">.</span></h1><p>Una mirada a sus trabajos en películas y series.</p><span className="actor-note">PERFIL DE TALENTO · FILMOGRAFÍA</span></div><div className="actor-works"><div className="section-label"><span>EN SU FILMOGRAFÍA</span><span>{actorContent.length} títulos</span></div>{actorContent.length ? <div className="film-grid">{actorContent.map(item => <ContentCard key={item.id} item={item} onSelect={setSelected} onActor={openActor} status={statusFor(item)} onStatus={updateStatus} />)}</div> : <div className="state-panel compact-state"><div className="state-icon"><Film /></div><span className="eyebrow">FILMOGRAFÍA</span><h3>Estamos preparando sus créditos.</h3><p>Las películas y series en las que participa aparecerán aquí.</p></div>}</div></div></div>}
    {notice && <div className="toast-message" role="status">{notice}<button onClick={() => setNotice("")} aria-label="Cerrar aviso"><X /></button></div>}
  </main>
}
