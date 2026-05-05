<template>
  <div class="home" :class="{ 'scrolled': isScrolled }">

    <!-- Navbar -->
    <nav class="navbar" :class="{ 'navbar--solid': isScrolled }">
      <div class="navbar__left">
        <div class="navbar__logo">
          <span class="logo-icon">🎬</span>
          <span class="logo-text">CINEMAX</span>
        </div>
        <ul class="navbar__links">
          <li v-for="link in navLinks" :key="link" :class="{ active: activeNav === link }" @click="activeNav = link">{{ link }}</li>
        </ul>
      </div>
      <div class="navbar__right">
        <div class="search-bar" :class="{ 'search-bar--open': searchOpen }">
          <input ref="searchInput" v-model="searchQuery" placeholder="Cari film, serial, genre..." @blur="closeSearch" />
          <button class="icon-btn" @click="toggleSearch">
            <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </button>
        </div>
        <button class="icon-btn notif-btn" @click="showNotif = !showNotif">
          <svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          <span class="notif-dot"></span>
        </button>
        <div class="avatar" @click="showProfile = !showProfile">
          <img src="https://api.dicebear.com/7.x/adventurer/svg?seed=cinemauser" alt="User" />
          <div v-if="showProfile" class="profile-dropdown">
            <div class="profile-dropdown__header">
              <img src="https://api.dicebear.com/7.x/adventurer/svg?seed=cinemauser" alt="User" />
              <div>
                <div class="profile-name">CinemaLover</div>
                <div class="profile-plan">✨ Premium</div>
              </div>
            </div>
            <div class="profile-dropdown__items">
              <span>👤 Profil Saya</span>
              <span>❤️ Watchlist</span>
              <span>⚙️ Pengaturan</span>
              <span class="logout">🚪 Keluar</span>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero" v-if="featuredMovie">
      <div class="hero__bg">
        <img :src="featuredMovie.backdrop" :alt="featuredMovie.title" class="hero__img" />
        <div class="hero__overlay"></div>
        <div class="hero__vignette"></div>
      </div>
      <div class="hero__content animate__animated animate__fadeInUp">
        <div class="hero__badge">
          <span class="badge-fire">🔥 #{{ featuredMovie.rank }} Trending Hari Ini</span>
        </div>
        <h1 class="hero__title">{{ featuredMovie.title }}</h1>
        <div class="hero__meta">
          <span class="meta-score">⭐ {{ featuredMovie.rating }}</span>
          <span class="meta-year">{{ featuredMovie.year }}</span>
          <span class="meta-duration">{{ featuredMovie.duration }}</span>
          <span v-for="g in featuredMovie.genres.slice(0,2)" :key="g" class="meta-genre">{{ g }}</span>
        </div>
        <p class="hero__desc">{{ featuredMovie.overview }}</p>
        <div class="hero__actions">
          <button class="btn-play" @click="playMovie(featuredMovie)">
            <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            Putar
          </button>
          <button class="btn-info" @click="openModal(featuredMovie)">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Info Lebih
          </button>
          <button class="btn-watchlist" :class="{ added: isInWatchlist(featuredMovie.id) }" @click="toggleWatchlist(featuredMovie)">
            <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
        </div>
      </div>
      <!-- Hero indicator dots -->
      <div class="hero__dots">
        <span v-for="(m, i) in heroMovies" :key="i" :class="{ active: heroIndex === i }" @click="heroIndex = i; featuredMovie = heroMovies[i]"></span>
      </div>
    </section>

    <!-- Main Content -->
    <main class="main-content">

      <!-- Search Results -->
      <section v-if="searchQuery.length > 1" class="section">
        <h2 class="section__title">🔍 Hasil Pencarian: "{{ searchQuery }}"</h2>
        <div class="grid-layout">
          <MovieCard v-for="movie in searchResults" :key="movie.id" :movie="movie"
            @click="openModal(movie)"
            @watchlist="toggleWatchlist(movie)"
            :in-watchlist="isInWatchlist(movie.id)" />
        </div>
        <p v-if="searchResults.length === 0" class="no-result">Tidak ada film yang ditemukan 😕</p>
      </section>

      <template v-else>
        <!-- Genre Filter -->
        <div class="genre-filter">
          <button v-for="g in genres" :key="g" :class="{ active: activeGenre === g }" @click="activeGenre = g">{{ g }}</button>
        </div>

        <!-- Rows of Movies -->
        <section v-for="row in filteredRows" :key="row.label" class="section">
          <div class="section__header">
            <h2 class="section__title">{{ row.label }}</h2>
            <button class="see-all" @click="activeRow = row">Lihat Semua →</button>
          </div>
          <div class="slider-wrapper">
            <button class="slider-arrow left" @click="slideLeft(row.label)">‹</button>
            <div class="slider" :ref="el => sliderRefs[row.label] = el">
              <MovieCard v-for="movie in row.movies" :key="movie.id" :movie="movie"
                @click="openModal(movie)"
                @watchlist="toggleWatchlist(movie)"
                :in-watchlist="isInWatchlist(movie.id)" />
            </div>
            <button class="slider-arrow right" @click="slideRight(row.label)">›</button>
          </div>
        </section>

        <!-- Watchlist Section -->
        <section v-if="watchlist.length > 0" class="section">
          <div class="section__header">
            <h2 class="section__title">❤️ Watchlist Saya</h2>
            <span class="badge-count">{{ watchlist.length }}</span>
          </div>
          <div class="slider-wrapper">
            <div class="slider">
              <MovieCard v-for="movie in watchlist" :key="movie.id" :movie="movie"
                @click="openModal(movie)"
                @watchlist="toggleWatchlist(movie)"
                :in-watchlist="true" />
            </div>
          </div>
        </section>

        <!-- Top 10 -->
        <section class="section top10-section">
          <h2 class="section__title">🏆 Top 10 Minggu Ini</h2>
          <div class="top10-grid">
            <div v-for="(movie, i) in top10" :key="movie.id" class="top10-card" @click="openModal(movie)">
              <span class="top10-rank">{{ i + 1 }}</span>
              <img :src="movie.poster" :alt="movie.title" />
              <div class="top10-info">
                <div class="top10-title">{{ movie.title }}</div>
                <div class="top10-meta">⭐ {{ movie.rating }} · {{ movie.year }}</div>
              </div>
            </div>
          </div>
        </section>
      </template>
    </main>

    <!-- Movie Detail Modal -->
    <Transition name="modal">
      <div v-if="selectedMovie" class="modal-overlay" @click.self="selectedMovie = null">
        <div class="modal">
          <button class="modal__close" @click="selectedMovie = null">✕</button>
          <div class="modal__hero">
            <img :src="selectedMovie.backdrop" :alt="selectedMovie.title" />
            <div class="modal__hero-overlay"></div>
            <div class="modal__hero-actions">
              <button class="btn-play small" @click="playMovie(selectedMovie)">
                <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                Putar
              </button>
              <button class="btn-watchlist" :class="{ added: isInWatchlist(selectedMovie.id) }" @click="toggleWatchlist(selectedMovie)">
                <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
            </div>
          </div>
          <div class="modal__body">
            <div class="modal__left">
              <h2 class="modal__title">{{ selectedMovie.title }}</h2>
              <div class="modal__meta">
                <span class="meta-score">⭐ {{ selectedMovie.rating }}</span>
                <span>{{ selectedMovie.year }}</span>
                <span>{{ selectedMovie.duration }}</span>
                <span class="hd-badge">HD</span>
              </div>
              <p class="modal__overview">{{ selectedMovie.overview }}</p>
            </div>
            <div class="modal__right">
              <p><span class="label">Genre:</span> {{ selectedMovie.genres.join(', ') }}</p>
              <p><span class="label">Sutradara:</span> {{ selectedMovie.director }}</p>
              <p><span class="label">Pemain:</span> {{ selectedMovie.cast.join(', ') }}</p>
              <p><span class="label">Bahasa:</span> {{ selectedMovie.language }}</p>
            </div>
          </div>
          <!-- Similar movies -->
          <div class="modal__similar" v-if="similarMovies(selectedMovie).length">
            <h3>Film Serupa</h3>
            <div class="similar-grid">
              <div v-for="m in similarMovies(selectedMovie)" :key="m.id" class="similar-card" @click="selectedMovie = m">
                <img :src="m.poster" :alt="m.title" />
                <div class="similar-info">
                  <div class="similar-title">{{ m.title }}</div>
                  <div class="similar-meta">⭐ {{ m.rating }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Video Player Overlay -->
    <Transition name="player">
      <div v-if="playing" class="player-overlay" @click.self="playing = null">
        <div class="player">
          <button class="player__close" @click="playing = null">✕</button>
          <div class="player__screen">
            <div class="player__placeholder">
              <div class="player__spinner"></div>
              <div class="player__info">
                <h3>{{ playing.title }}</h3>
                <p>Sedang memuat stream...</p>
              </div>
            </div>
          </div>
          <div class="player__controls">
            <div class="player__progress">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: playerProgress + '%' }"></div>
              </div>
              <span>{{ formatTime(playerProgress) }} / {{ playing.duration }}</span>
            </div>
            <div class="player__btns">
              <button @click="playerProgress = Math.max(0, playerProgress - 10)">⏮</button>
              <button class="play-pause" @click="isPlaying = !isPlaying">{{ isPlaying ? '⏸' : '▶' }}</button>
              <button @click="playerProgress = Math.min(100, playerProgress + 10)">⏭</button>
              <div class="volume-control">🔊</div>
              <div class="player__title-bar">{{ playing.title }}</div>
              <button class="fullscreen-btn">⛶</button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Toast Notification -->
    <Transition name="toast">
      <div v-if="toast" class="toast">{{ toast }}</div>
    </Transition>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer__logo">🎬 CINEMAX</div>
      <div class="footer__links">
        <span>Tentang Kami</span>
        <span>Kontak</span>
        <span>Kebijakan Privasi</span>
        <span>Syarat Layanan</span>
      </div>
      <div class="footer__copy">© 2025 Cinemax. Semua hak dilindungi.</div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import 'animate.css'

// ── Movie Card Component (inline) ──────────────────────────────────────────
const MovieCard = {
  name: 'MovieCard',
  props: ['movie', 'inWatchlist'],
  emits: ['click', 'watchlist'],
  template: `
    <div class="movie-card" @click="$emit('click')">
      <div class="movie-card__img-wrap">
        <img :src="movie.poster" :alt="movie.title" loading="lazy" />
        <div class="movie-card__hover">
          <button class="btn-play mini" @click.stop="$emit('click')">▶</button>
          <button class="btn-wl mini" :class="{ added: inWatchlist }" @click.stop="$emit('watchlist')">
            {{ inWatchlist ? '✓' : '+' }}
          </button>
          <div class="movie-card__meta">
            <span>⭐ {{ movie.rating }}</span>
            <span>{{ movie.year }}</span>
            <span v-for="g in movie.genres.slice(0,1)" :key="g" class="genre-chip">{{ g }}</span>
          </div>
        </div>
        <div class="movie-card__ribbon" v-if="movie.isNew">NEW</div>
      </div>
      <div class="movie-card__title">{{ movie.title }}</div>
    </div>
  `
}

// ── Data ───────────────────────────────────────────────────────────────────
const allMovies = ref([
  { id: 1, title: 'Dune: Part Two', year: 2024, duration: '2j 46m', rating: 8.6, rank: 1, genres: ['Sci-Fi', 'Petualangan'], director: 'Denis Villeneuve', cast: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson'], language: 'Inggris', isNew: true, overview: 'Paul Atreides bersatu dengan Chani dan kaum Fremen untuk mencari balas dendam terhadap mereka yang menghancurkan keluarganya.', poster: 'https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg', backdrop: 'https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg' },
  { id: 2, title: 'Oppenheimer', year: 2023, duration: '3j 0m', rating: 8.4, rank: 2, genres: ['Drama', 'Sejarah'], director: 'Christopher Nolan', cast: ['Cillian Murphy', 'Emily Blunt', 'Matt Damon'], language: 'Inggris', isNew: false, overview: 'Kisah J. Robert Oppenheimer, fisikawan teoretis yang memimpin Proyek Manhattan untuk mengembangkan bom atom pertama.', poster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', backdrop: 'https://image.tmdb.org/t/p/original/rLb2cwF3Pazuxaj0sRXQ037tGI1.jpg' },
  { id: 3, title: 'Poor Things', year: 2023, duration: '2j 21m', rating: 8.0, rank: 3, genres: ['Fantasi', 'Drama'], director: 'Yorgos Lanthimos', cast: ['Emma Stone', 'Mark Ruffalo', 'Willem Dafoe'], language: 'Inggris', isNew: false, overview: 'Kisah luar biasa tentang Bella Baxter, seorang wanita yang dihidupkan kembali oleh ilmuwan eksentrik Dr. Godwin Baxter.', poster: 'https://image.tmdb.org/t/p/w500/kCGlIMHnOm8JPXSmKFIBvMkLiMH.jpg', backdrop: 'https://image.tmdb.org/t/p/original/bQAMPNXJiIfS1DBDVR9OvKITWHK.jpg' },
  { id: 4, title: 'Killers of the Flower Moon', year: 2023, duration: '3j 26m', rating: 7.7, rank: 4, genres: ['Kriminal', 'Drama'], director: 'Martin Scorsese', cast: ['Leonardo DiCaprio', 'Lily Gladstone', 'Robert De Niro'], language: 'Inggris', isNew: false, overview: 'Mengisahkan pembunuhan anggota suku Osage dan investigasi yang kemudian membentuk FBI.', poster: 'https://image.tmdb.org/t/p/w500/dB6Krk806zeqd955d8scEx0eVR.jpg', backdrop: 'https://image.tmdb.org/t/p/original/1X7vow16X7CnCoexXh4H4F2yDJv.jpg' },
  { id: 5, title: 'The Zone of Interest', year: 2023, duration: '1j 45m', rating: 7.9, rank: 5, genres: ['Drama', 'Sejarah'], director: 'Jonathan Glazer', cast: ['Christian Friedel', 'Sandra Hüller'], language: 'Jerman', isNew: false, overview: 'Komandan Auschwitz Rudolf Höss dan istrinya berusaha membangun kehidupan impian di sebelah kamp.', poster: 'https://image.tmdb.org/t/p/w500/hUu9zyZmKuTNMFaOPPQsdP0N7Vk.jpg', backdrop: 'https://image.tmdb.org/t/p/original/mMmcSt7PrHiHCEjlnCobAXOGZoV.jpg' },
  { id: 6, title: 'Saltburn', year: 2023, duration: '2j 11m', rating: 7.1, rank: 6, genres: ['Thriller', 'Drama'], director: 'Emerald Fennell', cast: ['Barry Keoghan', 'Jacob Elordi', 'Rosamund Pike'], language: 'Inggris', isNew: false, overview: 'Seorang mahasiswa Oxford jatuh hati pada seorang teman misterius yang mengundangnya menghabiskan musim panas di estate keluarganya.', poster: 'https://image.tmdb.org/t/p/w500/qjhahNLSZ705B5JP92YMEYPocPz.jpg', backdrop: 'https://image.tmdb.org/t/p/original/qjhahNLSZ705B5JP92YMEYPocPz.jpg' },
  { id: 7, title: 'Godzilla x Kong', year: 2024, duration: '1j 55m', rating: 6.3, rank: 7, genres: ['Aksi', 'Sci-Fi'], director: 'Adam Wingard', cast: ['Rebecca Hall', 'Brian Tyree Henry', 'Dan Stevens'], language: 'Inggris', isNew: true, overview: 'Kong dan sekutunya baru menemukan bahwa Monster Kingdom menghadapi ancaman baru yang ada di kedalaman Bumi.', poster: 'https://image.tmdb.org/t/p/w500/tMefBSflR6PGQLv7WvFPpKLZkyk.jpg', backdrop: 'https://image.tmdb.org/t/p/original/1XDDXPXGiI8id7MrUxK36ke7gkX.jpg' },
  { id: 8, title: 'Cabrini', year: 2024, duration: '2j 23m', rating: 7.1, rank: 8, genres: ['Drama', 'Sejarah'], director: 'Alejandro Monteverde', cast: ['Cristiana Dell Anna', 'David Morse', 'John Lithgow'], language: 'Inggris', isNew: true, overview: 'Francesca Cabrini tiba di New York City dengan misi memenangkan hati para imigran Italia yang ditolak dan membangun kerajaan yang akan mengubah Amerika.', poster: 'https://image.tmdb.org/t/p/w500/2qmwBQRzNVwlCEBOAQa2cFJRtJp.jpg', backdrop: 'https://image.tmdb.org/t/p/original/rqbCbjB19amtOtFQbb3K2lgm2zv.jpg' },
  { id: 9, title: 'Civil War', year: 2024, duration: '1j 49m', rating: 7.2, rank: 9, genres: ['Aksi', 'Drama'], director: 'Alex Garland', cast: ['Kirsten Dunst', 'Wagner Moura', 'Cailee Spaeny'], language: 'Inggris', isNew: true, overview: 'Dalam perang saudara fiksi AS, tim jurnalis foto berjalan melintasi negara yang terpecah.', poster: 'https://image.tmdb.org/t/p/w500/fc9yGZkasYJiBaV1PdJRGnT7Cgy.jpg', backdrop: 'https://image.tmdb.org/t/p/original/ugS5FVfCI3RV0ZwZtBV3HAV75OX.jpg' },
  { id: 10, title: 'Arthur of the Britons', year: 2024, duration: '2j 8m', rating: 6.8, rank: 10, genres: ['Petualangan', 'Fantasi'], director: 'Guy Ritchie', cast: ['Henry Cavill', 'Charlie Hunnam', 'Astrid Bergès-Frisbey'], language: 'Inggris', isNew: true, overview: 'Seorang anak laki-laki yang kehilangan segalanya akhirnya menjadi legenda Inggris yang paling dicintai sepanjang masa.', poster: 'https://image.tmdb.org/t/p/w500/g6aBkbBwJzHYb3V0dpYMXPvVHV4.jpg', backdrop: 'https://image.tmdb.org/t/p/original/rDGqBMVgfGYTSBiRxnqLFSmLELR.jpg' },
  { id: 11, title: 'Wonka', year: 2023, duration: '1j 56m', rating: 7.2, rank: 11, genres: ['Fantasi', 'Keluarga'], director: 'Paul King', cast: ['Timothée Chalamet', 'Keegan-Michael Key', 'Sally Hawkins'], language: 'Inggris', isNew: false, overview: 'Asal-usul kisah Willy Wonka sebelum menjadi chocolatier paling terkenal di dunia.', poster: 'https://image.tmdb.org/t/p/w500/qhb1qOilapbapxWQn9jtRCMwXJF.jpg', backdrop: 'https://image.tmdb.org/t/p/original/7lwgEYjR8RCjKCMXKI6EoqIlkfs.jpg' },
  { id: 12, title: 'Society of the Snow', year: 2023, duration: '2j 24m', rating: 7.9, rank: 12, genres: ['Drama', 'Sejarah'], director: 'J.A. Bayona', cast: ['Enzo Vogrincic', 'Agustín Pardella', 'Matías Recalt'], language: 'Spanyol', isNew: false, overview: 'Kisah nyata kecelakaan pesawat 1972 di Andes, di mana para korban harus berjuang untuk bertahan hidup.', poster: 'https://image.tmdb.org/t/p/w500/2e858BpFCAnkZzG7UkXSADFKiVj.jpg', backdrop: 'https://image.tmdb.org/t/p/original/gfFniyTUFmkjNXmHCDGMeUqXe8H.jpg' },
])

// ── State ──────────────────────────────────────────────────────────────────
const isScrolled = ref(false)
const searchOpen = ref(false)
const searchQuery = ref('')
const showProfile = ref(false)
const showNotif = ref(false)
const activeNav = ref('Beranda')
const activeGenre = ref('Semua')
const watchlist = ref([])
const selectedMovie = ref(null)
const playing = ref(null)
const isPlaying = ref(false)
const playerProgress = ref(0)
const toast = ref('')
const heroIndex = ref(0)
const sliderRefs = ref({})
const activeRow = ref(null)
const searchInput = ref(null)

const navLinks = ['Beranda', 'Serial TV', 'Film', 'Terbaru', 'Favorit']
const genres = ['Semua', 'Aksi', 'Drama', 'Sci-Fi', 'Thriller', 'Fantasi', 'Kriminal', 'Petualangan', 'Keluarga', 'Sejarah']

const heroMovies = computed(() => allMovies.value.slice(0, 5))
const featuredMovie = ref(allMovies.value[0])
const top10 = computed(() => allMovies.value.slice(0, 10))

// ── Rows ───────────────────────────────────────────────────────────────────
const movieRows = computed(() => [
  { label: '🔥 Trending Sekarang', movies: [...allMovies.value].sort((a, b) => b.rating - a.rating) },
  { label: '🆕 Baru Ditambahkan', movies: allMovies.value.filter(m => m.isNew) },
  { label: '🎬 Drama Terbaik', movies: allMovies.value.filter(m => m.genres.includes('Drama')) },
  { label: '🚀 Aksi & Petualangan', movies: allMovies.value.filter(m => m.genres.includes('Aksi') || m.genres.includes('Petualangan')) },
  { label: '🏆 Pemenang Oscar', movies: allMovies.value.filter(m => [2, 3, 4, 5, 12].includes(m.id)) },
])

const filteredRows = computed(() => {
  if (activeGenre.value === 'Semua') return movieRows.value
  return movieRows.value.map(row => ({
    ...row,
    movies: row.movies.filter(m => m.genres.includes(activeGenre.value))
  })).filter(row => row.movies.length > 0)
})

const searchResults = computed(() => {
  if (!searchQuery.value || searchQuery.value.length < 2) return []
  const q = searchQuery.value.toLowerCase()
  return allMovies.value.filter(m =>
    m.title.toLowerCase().includes(q) ||
    m.genres.some(g => g.toLowerCase().includes(q)) ||
    m.director.toLowerCase().includes(q) ||
    m.cast.some(c => c.toLowerCase().includes(q))
  )
})

// ── Methods ────────────────────────────────────────────────────────────────
const toggleWatchlist = (movie) => {
  const idx = watchlist.value.findIndex(m => m.id === movie.id)
  if (idx === -1) {
    watchlist.value.push(movie)
    showToast(`✅ ${movie.title} ditambahkan ke Watchlist`)
  } else {
    watchlist.value.splice(idx, 1)
    showToast(`❌ ${movie.title} dihapus dari Watchlist`)
  }
}

const isInWatchlist = (id) => watchlist.value.some(m => m.id === id)

const openModal = (movie) => { selectedMovie.value = movie; showProfile.value = false }

const playMovie = (movie) => {
  playing.value = movie
  selectedMovie.value = null
  isPlaying.value = true
  playerProgress.value = 0
}

const similarMovies = (movie) =>
  allMovies.value.filter(m => m.id !== movie.id && m.genres.some(g => movie.genres.includes(g))).slice(0, 4)

const showToast = (msg) => {
  toast.value = msg
  setTimeout(() => { toast.value = '' }, 3000)
}

const toggleSearch = () => {
  searchOpen.value = !searchOpen.value
  if (searchOpen.value) setTimeout(() => searchInput.value?.focus(), 100)
  else searchQuery.value = ''
}
const closeSearch = () => {
  if (!searchQuery.value) searchOpen.value = false
}

const slideLeft = (label) => {
  const el = sliderRefs.value[label]
  if (el) el.scrollBy({ left: -600, behavior: 'smooth' })
}
const slideRight = (label) => {
  const el = sliderRefs.value[label]
  if (el) el.scrollBy({ left: 600, behavior: 'smooth' })
}

const formatTime = (pct) => {
  const min = Math.floor(pct * 1.6)
  return `${min}:${String(Math.floor(pct % 60)).padStart(2, '0')}`
}

// ── Hero Rotation ──────────────────────────────────────────────────────────
let heroTimer = null
const startHeroTimer = () => {
  heroTimer = setInterval(() => {
    heroIndex.value = (heroIndex.value + 1) % heroMovies.value.length
    featuredMovie.value = heroMovies.value[heroIndex.value]
  }, 6000)
}

// ── Player Progress ────────────────────────────────────────────────────────
let progressTimer = null
watch(isPlaying, (val) => {
  clearInterval(progressTimer)
  if (val) {
    progressTimer = setInterval(() => {
      if (playerProgress.value < 100) playerProgress.value += 0.5
      else { isPlaying.value = false; playerProgress.value = 0 }
    }, 200)
  }
})

// ── Scroll ─────────────────────────────────────────────────────────────────
const onScroll = () => { isScrolled.value = window.scrollY > 60 }

onMounted(() => {
  window.addEventListener('scroll', onScroll)
  startHeroTimer()
})
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  clearInterval(heroTimer)
  clearInterval(progressTimer)
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');

/* ── Reset & Variables ───────────────────────────────────────── */
* { box-sizing: border-box; margin: 0; padding: 0; }

.home {
  --c-bg: #0a0a0f;
  --c-bg2: #111118;
  --c-surface: #16161f;
  --c-border: rgba(255,255,255,0.06);
  --c-accent: #e50914;
  --c-accent2: #ff6b35;
  --c-gold: #f5c518;
  --c-text: #f0f0f0;
  --c-muted: #888;
  --c-white: #fff;
  --r: 10px;
  background: var(--c-bg);
  color: var(--c-text);
  font-family: 'DM Sans', sans-serif;
  min-height: 100vh;
  overflow-x: hidden;
}

/* ── Navbar ──────────────────────────────────────────────────── */
.navbar {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 48px;
  background: linear-gradient(to bottom, rgba(10,10,15,0.95) 0%, transparent 100%);
  transition: background 0.3s, padding 0.3s;
}
.navbar--solid {
  background: rgba(10,10,15,0.97);
  backdrop-filter: blur(12px);
  padding: 14px 48px;
  border-bottom: 1px solid var(--c-border);
}
.navbar__left { display: flex; align-items: center; gap: 40px; }
.navbar__logo { display: flex; align-items: center; gap: 10px; cursor: pointer; }
.logo-icon { font-size: 1.6rem; }
.logo-text {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.8rem; letter-spacing: 3px; color: var(--c-accent);
}
.navbar__links { display: flex; gap: 28px; list-style: none; }
.navbar__links li {
  font-size: 0.9rem; font-weight: 500; color: var(--c-muted);
  cursor: pointer; transition: color 0.2s; white-space: nowrap;
}
.navbar__links li:hover, .navbar__links li.active { color: var(--c-white); }
.navbar__right { display: flex; align-items: center; gap: 16px; }

.search-bar {
  display: flex; align-items: center; gap: 8px;
  background: transparent; border: 1px solid transparent;
  border-radius: 20px; padding: 4px 8px;
  transition: all 0.3s;
}
.search-bar--open { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.2); }
.search-bar input {
  background: none; border: none; outline: none; color: var(--c-white);
  font-size: 0.85rem; width: 0; transition: width 0.3s;
}
.search-bar--open input { width: 200px; }

.icon-btn {
  background: none; border: none; cursor: pointer;
  color: var(--c-text); padding: 6px;
  border-radius: 50%; transition: background 0.2s;
  display: flex; align-items: center; justify-content: center;
}
.icon-btn:hover { background: rgba(255,255,255,0.1); }
.icon-btn svg { width: 20px; height: 20px; stroke: currentColor; fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.notif-btn { position: relative; }
.notif-dot {
  position: absolute; top: 5px; right: 5px;
  width: 8px; height: 8px; background: var(--c-accent);
  border-radius: 50%; border: 2px solid var(--c-bg);
}

.avatar { position: relative; cursor: pointer; }
.avatar > img { width: 36px; height: 36px; border-radius: 50%; border: 2px solid var(--c-accent); }
.profile-dropdown {
  position: absolute; top: calc(100% + 12px); right: 0;
  background: var(--c-surface); border: 1px solid var(--c-border);
  border-radius: var(--r); overflow: hidden; min-width: 200px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.8);
}
.profile-dropdown__header {
  display: flex; align-items: center; gap: 12px;
  padding: 16px; border-bottom: 1px solid var(--c-border);
  background: rgba(255,255,255,0.03);
}
.profile-dropdown__header img { width: 40px; height: 40px; border-radius: 50%; }
.profile-name { font-weight: 600; font-size: 0.9rem; }
.profile-plan { font-size: 0.75rem; color: var(--c-gold); }
.profile-dropdown__items { padding: 8px; }
.profile-dropdown__items span {
  display: block; padding: 10px 12px; font-size: 0.85rem;
  border-radius: 6px; cursor: pointer; transition: background 0.15s;
}
.profile-dropdown__items span:hover { background: rgba(255,255,255,0.06); }
.profile-dropdown__items .logout { color: var(--c-accent); margin-top: 4px; }

/* ── Hero ────────────────────────────────────────────────────── */
.hero {
  position: relative; height: 100vh; min-height: 600px;
  display: flex; align-items: flex-end; padding-bottom: 100px;
}
.hero__bg { position: absolute; inset: 0; }
.hero__img { width: 100%; height: 100%; object-fit: cover; }
.hero__overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to right, rgba(10,10,15,0.92) 40%, transparent 100%);
}
.hero__vignette {
  position: absolute; bottom: 0; left: 0; right: 0; height: 40%;
  background: linear-gradient(to top, var(--c-bg) 0%, transparent 100%);
}
.hero__dots {
  position: absolute; bottom: 60px; left: 50%;
  transform: translateX(-50%);
  display: flex; gap: 8px;
}
.hero__dots span {
  width: 8px; height: 8px; border-radius: 50%;
  background: rgba(255,255,255,0.3); cursor: pointer; transition: all 0.3s;
}
.hero__dots span.active { background: var(--c-accent); width: 24px; border-radius: 4px; }

.hero__content { position: relative; z-index: 2; max-width: 600px; padding: 0 48px; }
.hero__badge { margin-bottom: 16px; }
.badge-fire {
  background: linear-gradient(135deg, var(--c-accent), var(--c-accent2));
  color: white; font-size: 0.75rem; font-weight: 600; letter-spacing: 1px;
  padding: 6px 14px; border-radius: 20px;
}
.hero__title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(3rem, 7vw, 5.5rem); line-height: 1; margin-bottom: 16px;
  text-shadow: 0 4px 30px rgba(0,0,0,0.5);
}
.hero__meta { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
.meta-score { color: var(--c-gold); font-weight: 600; }
.meta-year, .meta-duration { color: var(--c-muted); font-size: 0.9rem; }
.meta-genre {
  background: rgba(255,255,255,0.1); border: 1px solid var(--c-border);
  padding: 2px 10px; border-radius: 20px; font-size: 0.8rem;
}
.hero__desc {
  color: rgba(255,255,255,0.75); font-size: 0.95rem; line-height: 1.6;
  margin-bottom: 28px; max-width: 480px;
}
.hero__actions { display: flex; align-items: center; gap: 12px; }

.btn-play {
  display: flex; align-items: center; gap: 8px;
  background: var(--c-white); color: #000;
  border: none; padding: 14px 28px; border-radius: 8px;
  font-size: 1rem; font-weight: 700; cursor: pointer;
  transition: background 0.2s, transform 0.15s;
}
.btn-play:hover { background: rgba(255,255,255,0.85); transform: scale(1.02); }
.btn-play svg { width: 18px; height: 18px; fill: #000; stroke: #000; }
.btn-play.small { padding: 10px 20px; font-size: 0.9rem; }
.btn-play.mini { width: 40px; height: 40px; padding: 0; justify-content: center; border-radius: 50%; }

.btn-info {
  display: flex; align-items: center; gap: 8px;
  background: rgba(255,255,255,0.15); color: var(--c-white);
  border: none; padding: 14px 28px; border-radius: 8px;
  font-size: 1rem; font-weight: 600; cursor: pointer; backdrop-filter: blur(8px);
  transition: background 0.2s;
}
.btn-info:hover { background: rgba(255,255,255,0.25); }
.btn-info svg { width: 18px; height: 18px; stroke: currentColor; fill: none; stroke-width: 2; }

.btn-watchlist {
  width: 48px; height: 48px; border-radius: 50%;
  background: rgba(255,255,255,0.12); border: 2px solid rgba(255,255,255,0.4);
  color: var(--c-white); font-size: 1.4rem; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
}
.btn-watchlist:hover { border-color: var(--c-white); background: rgba(255,255,255,0.2); }
.btn-watchlist.added { background: var(--c-accent); border-color: var(--c-accent); }
.btn-watchlist svg { width: 20px; height: 20px; stroke: currentColor; fill: none; stroke-width: 2.5; }

.btn-wl {
  width: 32px; height: 32px; border-radius: 50%;
  background: rgba(255,255,255,0.15); border: 1.5px solid rgba(255,255,255,0.4);
  color: var(--c-white); font-size: 1rem; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}
.btn-wl.added { background: var(--c-accent); border-color: var(--c-accent); }

/* ── Main Content ────────────────────────────────────────────── */
.main-content { padding: 0 0 60px; background: var(--c-bg); }

.genre-filter {
  display: flex; gap: 10px; overflow-x: auto; padding: 24px 48px;
  scrollbar-width: none;
}
.genre-filter::-webkit-scrollbar { display: none; }
.genre-filter button {
  flex-shrink: 0; background: var(--c-surface); color: var(--c-muted);
  border: 1px solid var(--c-border); padding: 8px 18px; border-radius: 20px;
  font-size: 0.85rem; cursor: pointer; transition: all 0.2s; font-family: inherit;
}
.genre-filter button:hover { color: var(--c-white); border-color: rgba(255,255,255,0.2); }
.genre-filter button.active {
  background: var(--c-accent); color: var(--c-white); border-color: var(--c-accent);
}

/* ── Sections ─────────────────────────────────────────────────  */
.section { padding: 20px 0 10px; }
.section__header { display: flex; align-items: center; justify-content: space-between; padding: 0 48px 14px; }
.section__title { font-size: 1.2rem; font-weight: 700; }
.see-all { background: none; border: none; color: var(--c-muted); font-size: 0.85rem; cursor: pointer; font-family: inherit; }
.see-all:hover { color: var(--c-white); }
.badge-count {
  background: var(--c-accent); color: white; font-size: 0.75rem;
  font-weight: 700; width: 22px; height: 22px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}

.slider-wrapper { position: relative; }
.slider-arrow {
  position: absolute; top: 50%; transform: translateY(-50%); z-index: 10;
  width: 44px; height: 80px; background: rgba(10,10,15,0.8);
  color: white; border: none; font-size: 2rem; cursor: pointer;
  transition: background 0.2s, opacity 0.2s;
  display: flex; align-items: center; justify-content: center;
}
.slider-arrow.left { left: 0; border-radius: 0 8px 8px 0; }
.slider-arrow.right { right: 0; border-radius: 8px 0 0 8px; }
.slider-arrow:hover { background: rgba(229,9,20,0.7); }

.slider {
  display: flex; gap: 12px; overflow-x: auto; padding: 8px 48px;
  scrollbar-width: none; scroll-snap-type: x mandatory;
}
.slider::-webkit-scrollbar { display: none; }

/* ── Movie Card ───────────────────────────────────────────────── */
.movie-card {
  flex-shrink: 0; width: 180px; scroll-snap-align: start;
  cursor: pointer; transition: transform 0.3s;
}
.movie-card:hover { transform: scale(1.06); z-index: 5; }
.movie-card__img-wrap {
  position: relative; border-radius: var(--r); overflow: hidden;
  aspect-ratio: 2/3; background: var(--c-surface);
}
.movie-card__img-wrap img { width: 100%; height: 100%; object-fit: cover; display: block; }
.movie-card__hover {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.9) 40%, transparent);
  opacity: 0; transition: opacity 0.25s;
  display: flex; flex-direction: column; justify-content: flex-end;
  padding: 12px; gap: 8px;
}
.movie-card:hover .movie-card__hover { opacity: 1; }
.movie-card__hover .btn-play.mini { font-size: 0.8rem; }
.movie-card__meta { display: flex; gap: 6px; flex-wrap: wrap; }
.movie-card__meta span { font-size: 0.7rem; color: rgba(255,255,255,0.8); }
.genre-chip {
  background: rgba(229,9,20,0.3); border: 1px solid rgba(229,9,20,0.5);
  padding: 1px 6px; border-radius: 4px; font-size: 0.65rem !important;
}
.movie-card__ribbon {
  position: absolute; top: 8px; left: 8px;
  background: var(--c-accent); color: white; font-size: 0.6rem; font-weight: 700;
  padding: 2px 8px; border-radius: 4px; letter-spacing: 1px;
}
.movie-card__title {
  margin-top: 8px; font-size: 0.82rem; font-weight: 500;
  color: var(--c-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

/* ── Grid Layout ─────────────────────────────────────────────── */
.grid-layout {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px; padding: 0 48px 16px;
}
.no-result { padding: 24px 48px; color: var(--c-muted); font-size: 1rem; }

/* ── Top 10 ───────────────────────────────────────────────────── */
.top10-section { padding-top: 32px; }
.top10-grid {
  display: flex; gap: 16px; overflow-x: auto; padding: 8px 48px;
  scrollbar-width: none;
}
.top10-grid::-webkit-scrollbar { display: none; }
.top10-card {
  flex-shrink: 0; display: flex; align-items: center; gap: 12px;
  background: var(--c-surface); border: 1px solid var(--c-border);
  border-radius: var(--r); padding: 12px 16px; cursor: pointer; min-width: 280px;
  transition: border-color 0.2s, transform 0.2s;
}
.top10-card:hover { border-color: rgba(229,9,20,0.5); transform: translateY(-2px); }
.top10-rank {
  font-family: 'Bebas Neue', sans-serif; font-size: 2.5rem;
  color: rgba(255,255,255,0.08); line-height: 1; min-width: 40px; text-align: center;
}
.top10-card:hover .top10-rank { color: var(--c-accent); }
.top10-card img { width: 54px; height: 76px; object-fit: cover; border-radius: 6px; }
.top10-title { font-weight: 600; font-size: 0.9rem; margin-bottom: 4px; }
.top10-meta { font-size: 0.78rem; color: var(--c-muted); }

/* ── Modal ────────────────────────────────────────────────────── */
.modal-overlay {
  position: fixed; inset: 0; z-index: 200;
  background: rgba(0,0,0,0.85); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center; padding: 24px;
}
.modal {
  background: var(--c-surface); border-radius: 14px; overflow: hidden;
  width: 100%; max-width: 860px; max-height: 90vh; overflow-y: auto;
  box-shadow: 0 40px 100px rgba(0,0,0,0.8);
  scrollbar-width: none;
}
.modal::-webkit-scrollbar { display: none; }
.modal__close {
  position: absolute; top: 16px; right: 16px; z-index: 10;
  width: 36px; height: 36px; border-radius: 50%;
  background: rgba(0,0,0,0.6); border: none; color: white;
  font-size: 1rem; cursor: pointer; transition: background 0.2s;
}
.modal__close:hover { background: var(--c-accent); }
.modal__hero { position: relative; }
.modal__hero img { width: 100%; height: 380px; object-fit: cover; display: block; }
.modal__hero-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to top, var(--c-surface) 0%, transparent 60%);
}
.modal__hero-actions {
  position: absolute; bottom: 24px; left: 24px;
  display: flex; align-items: center; gap: 12px;
}
.modal__body { display: grid; grid-template-columns: 1.6fr 1fr; gap: 24px; padding: 24px 28px 20px; }
.modal__title { font-family: 'Bebas Neue', sans-serif; font-size: 2.2rem; margin-bottom: 12px; }
.modal__meta { display: flex; gap: 10px; align-items: center; margin-bottom: 16px; flex-wrap: wrap; }
.hd-badge {
  background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
  padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600;
}
.modal__overview { font-size: 0.9rem; line-height: 1.7; color: rgba(255,255,255,0.8); }
.modal__right { font-size: 0.85rem; line-height: 2; }
.modal__right .label { color: var(--c-muted); margin-right: 6px; }
.modal__similar { padding: 0 28px 28px; }
.modal__similar h3 { font-size: 1rem; font-weight: 700; margin-bottom: 16px; }
.similar-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.similar-card { cursor: pointer; border-radius: 8px; overflow: hidden; background: var(--c-bg); transition: transform 0.2s; }
.similar-card:hover { transform: scale(1.04); }
.similar-card img { width: 100%; aspect-ratio: 2/3; object-fit: cover; display: block; }
.similar-info { padding: 8px; }
.similar-title { font-size: 0.78rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.similar-meta { font-size: 0.72rem; color: var(--c-gold); }

/* ── Player ───────────────────────────────────────────────────── */
.player-overlay {
  position: fixed; inset: 0; z-index: 300;
  background: #000; display: flex; align-items: center; justify-content: center;
}
.player { width: 100%; max-width: 1200px; padding: 48px 24px 24px; position: relative; }
.player__close {
  position: absolute; top: 16px; right: 24px;
  background: rgba(255,255,255,0.1); border: none; color: white;
  width: 40px; height: 40px; border-radius: 50%; font-size: 1rem; cursor: pointer;
}
.player__screen {
  background: #0a0a0a; border-radius: 12px; aspect-ratio: 16/9;
  display: flex; align-items: center; justify-content: center;
}
.player__placeholder { text-align: center; }
.player__spinner {
  width: 48px; height: 48px; border: 3px solid rgba(255,255,255,0.1);
  border-top-color: var(--c-accent); border-radius: 50%;
  animation: spin 1s linear infinite; margin: 0 auto 16px;
}
@keyframes spin { to { transform: rotate(360deg); } }
.player__info h3 { font-size: 1.2rem; margin-bottom: 4px; }
.player__info p { font-size: 0.85rem; color: var(--c-muted); }
.player__controls { padding: 20px 0 0; }
.player__progress { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; font-size: 0.82rem; color: var(--c-muted); }
.progress-bar { flex: 1; height: 4px; background: rgba(255,255,255,0.15); border-radius: 2px; cursor: pointer; }
.progress-fill { height: 100%; background: var(--c-accent); border-radius: 2px; transition: width 0.2s; }
.player__btns { display: flex; align-items: center; gap: 16px; }
.player__btns button {
  background: none; border: none; color: white; font-size: 1.2rem; cursor: pointer; padding: 4px;
}
.play-pause { font-size: 1.6rem !important; }
.volume-control { font-size: 1.1rem; }
.player__title-bar { flex: 1; text-align: center; font-size: 0.9rem; font-weight: 500; }
.fullscreen-btn { font-size: 1.1rem !important; }

/* ── Toast ────────────────────────────────────────────────────── */
.toast {
  position: fixed; bottom: 32px; left: 50%; transform: translateX(-50%);
  background: var(--c-surface); border: 1px solid var(--c-border);
  color: var(--c-white); padding: 12px 24px; border-radius: 30px;
  font-size: 0.9rem; font-weight: 500; z-index: 400;
  box-shadow: 0 8px 40px rgba(0,0,0,0.6);
  white-space: nowrap;
}

/* ── Footer ───────────────────────────────────────────────────── */
.footer {
  background: var(--c-bg2); border-top: 1px solid var(--c-border);
  padding: 40px 48px; text-align: center;
}
.footer__logo { font-family: 'Bebas Neue', sans-serif; font-size: 1.6rem; color: var(--c-accent); margin-bottom: 16px; letter-spacing: 3px; }
.footer__links { display: flex; justify-content: center; gap: 24px; margin-bottom: 16px; flex-wrap: wrap; }
.footer__links span { font-size: 0.82rem; color: var(--c-muted); cursor: pointer; }
.footer__links span:hover { color: var(--c-white); }
.footer__copy { font-size: 0.78rem; color: rgba(255,255,255,0.2); }

/* ── Transitions ─────────────────────────────────────────────── */
.modal-enter-active, .modal-leave-active { transition: opacity 0.25s, transform 0.25s; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.95); }

.player-enter-active, .player-leave-active { transition: opacity 0.3s; }
.player-enter-from, .player-leave-to { opacity: 0; }

.toast-enter-active, .toast-leave-active { transition: opacity 0.3s, transform 0.3s; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translate(-50%, 20px); }

/* ── Scrollbar ───────────────────────────────────────────────── */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: var(--c-bg); }
::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }

/* ── Responsive ──────────────────────────────────────────────── */
@media (max-width: 768px) {
  .navbar { padding: 16px 20px; }
  .navbar__links { display: none; }
  .hero__content { padding: 0 20px; }
  .genre-filter { padding: 16px 20px; }
  .section__header, .slider { padding-left: 20px; padding-right: 20px; }
  .top10-grid { padding: 8px 20px; }
  .grid-layout { padding: 0 20px; }
  .modal__body { grid-template-columns: 1fr; }
  .similar-grid { grid-template-columns: repeat(2, 1fr); }
  .footer { padding: 32px 20px; }
}
</style>