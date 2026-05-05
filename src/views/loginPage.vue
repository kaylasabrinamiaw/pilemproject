<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'

const router = useRouter()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  loading.value = true
  error.value = ''

  try {
    const res = await api.post('/login', {
      email: email.value,
      password: password.value
    })

    // simpan token (asumsi backend kirim token)
    localStorage.setItem('token', res.data.token)

    // redirect
    router.push('/')
  } catch (err) {
    error.value = err.response?.data?.message || 'Login gagal'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-container">
    <form @submit.prevent="handleLogin" class="login-card">
      <h2 class="login-kay">LOGINNN</h2>
      <p>Halo ini percobaan 2</p>

      <p v-if="error" class="error">{{ error }}</p>

      <input
        v-model="name"
        type="text"
        placeholder="Name"
        required
      />

      <input
        v-model="email"
        type="email"
        placeholder="Email"
        required
      />

      <input
        v-model="password"
        type="password"
        placeholder="Password"
        required
      />

      <button type="submit" :disabled="loading">
        {{ loading ? 'Loading...' : 'Login' }}
      </button>
    </form>
  </div>
</template>

<style scoped>

.login-kay{
    color: pink;
    font-size: 80px;
}
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #0f172a;
}

.login-card {
  background: #1e293b79;
  padding: 2rem;
  border-radius: 12px;
  width: 300px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  color: white;
}

input {
  padding: 0.6rem;
  border-radius: 6px;
  border: none;
}

button {
  padding: 0.6rem;
  border-radius: 6px;
  border: none;
  background: #3b82f6;
  color: white;
  cursor: pointer;
}

.error {
  color: #f87171;
  font-size: 0.9rem;
}
</style>