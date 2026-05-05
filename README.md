# vue-admin-starter

pilemmm starter yang kay pakai buat build dashboard / frontend client ke API (biasanya Laravel).

Fokusnya: **rapih, scalable, dan gampang dikembangin**, bukan sekadar template UI.

---

## stack

* vue 3 (composition api)
* pinia
* vue router
* axios
* tailwind css

---

## kenapa repo ini ada?

capek mulai dari nol terus tiap bikin project baru 😅
jadi gue bikin base yang udah ada:

* routing
* state management
* api layer (axios + interceptor)
* auth basic (token)

tinggal lanjut ke fitur utama aja.

---

## struktur

```bash
src/
  assets/
  components/
  views/
  router/
  stores/
  services/
  layouts/
```

gak ribet, tapi cukup buat scaling.

---

## jalanin

```bash
npm install
npm run dev
```

---

## auth flow (simple)

* login → hit API
* token disimpan di localStorage
* axios auto attach token
* route tertentu bisa diproteksi

belum fancy, tapi cukup buat base.

---

## api

semua request lewat:

```js
src/services/api.js
```

biar gak berantakan di component.

---

## styling

tailwind, karena:

* cepet
* fleksibel
* gak banyak mikir class 😄

---

## next (kalau sempet)

* auth store (pinia)
* better error handling (422 dll)
* dashboard layout (sidebar, navbar)
* reusable components

---

## catatan

ini bukan boilerplate sempurna.
lebih ke **starting point yang realistis** buat project beneran.

---

kalau kepake, ya syukur 👍
