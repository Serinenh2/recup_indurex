import axios from 'axios'

function getToken(key) {
  return localStorage.getItem(key) || sessionStorage.getItem(key)
}

function setToken(key, value) {
  // Write to both storages to stay in sync
  localStorage.setItem(key, value)
  sessionStorage.setItem(key, value)
}

function clearTokens() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('session_expires_at')
  sessionStorage.removeItem('access_token')
  sessionStorage.removeItem('refresh_token')
  sessionStorage.removeItem('session_expires_at')
}

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use(cfg => {
  const t = getToken('access_token')
  if (t) cfg.headers.Authorization = `Bearer ${t}`
  return cfg
})

api.interceptors.response.use(r => r, async e => {
  if (e.response?.status === 401 && !e.config._retry) {
    const ref = getToken('refresh_token')
    if (ref) {
      try {
        e.config._retry = true
        const { data } = await axios.post('/api/auth/token/refresh/', { refresh: ref })
        setToken('access_token', data.access)
        e.config.headers.Authorization = `Bearer ${data.access}`
        return api(e.config)
      } catch {
        clearTokens()
        window.location.href = '/login'
      }
    } else {
      clearTokens()
      window.location.href = '/login'
    }
  }
  return Promise.reject(e)
})

export default api

export const recuperateursAPI = {
  stats:   ()  => api.get('/recuperateurs/stats/'),
  alerts:  ()  => api.get('/recuperateurs/alerts/'),
}
export const nomenclatureAPI = {
  getAll:  (p) => api.get('/nomenclature/', { params: p }),
}
export const traceabilityAPI = {
  getAll:  (p) => api.get('/traceability/', { params: p }),
  get:     (id)=> api.get(`/traceability/${id}/`),
  create:  (d) => api.post('/traceability/', d),
  update:  (id,d)=> api.patch(`/traceability/${id}/`, d),
  delete:  (id)=> api.delete(`/traceability/${id}/`),
  stats:   ()  => api.get('/traceability/stats/'),
}
export const inspectionsAPI = {
  getAll:  (p) => api.get('/inspections/', { params: p }),
  create:  (d) => api.post('/inspections/', d),
}
