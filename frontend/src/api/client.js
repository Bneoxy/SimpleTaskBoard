const API_BASE = import.meta.env.VITE_API_URL || '/api'

async function request(path, options = {}) {
  const headers = { ...options.headers }

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `Request failed: ${response.status}`)
  }

  if (response.status === 204) return null
  return response.json()
}

function buildCardFormData(data) {
  const formData = new FormData()
  formData.append('title', data.title)

  if (data.description) formData.append('description', data.description)
  if (data.dueDate) formData.append('dueDate', data.dueDate)
  if (data.image) formData.append('image', data.image)
  if (data.removeImage) formData.append('removeImage', 'true')

  return formData
}

export const api = {
  getGroups: () => request('/groups'),
  getGroup: (id) => request(`/groups/${id}`),
  createGroup: (data) => request('/groups', { method: 'POST', body: JSON.stringify(data) }),
  updateGroup: (id, data) => request(`/groups/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteGroup: (id) => request(`/groups/${id}`, { method: 'DELETE' }),

  getTables: (groupId) => request(`/groups/${groupId}/tables`),
  createTable: (groupId, data) =>
    request(`/groups/${groupId}/tables`, { method: 'POST', body: JSON.stringify(data) }),
  updateTable: (groupId, id, data) =>
    request(`/groups/${groupId}/tables/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTable: (groupId, id) =>
    request(`/groups/${groupId}/tables/${id}`, { method: 'DELETE' }),

  getCards: (tableId) => request(`/tables/${tableId}/cards`),
  createCard: (tableId, data) =>
    request(`/tables/${tableId}/cards`, {
      method: 'POST',
      body: buildCardFormData(data),
    }),
  updateCard: (tableId, id, data) =>
    request(`/tables/${tableId}/cards/${id}`, {
      method: 'PUT',
      body: buildCardFormData(data),
    }),
  moveCard: (tableId, id, data) =>
    request(`/tables/${tableId}/cards/${id}/move`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCard: (tableId, id) =>
    request(`/tables/${tableId}/cards/${id}`, { method: 'DELETE' }),
}
