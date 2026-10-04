const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export async function getDashboard() {
  const r = await fetch(`${API}/dashboard`)
  if (!r.ok) throw new Error('Failed to load dashboard')
  return r.json()
}

export async function getActions() {
  const r = await fetch(`${API}/actions`)
  if (!r.ok) throw new Error('Failed to load actions')
  return r.json()
}

export async function updateAction(id, patch) {
  const r = await fetch(`${API}/actions/${id}`, {
    method: 'PATCH',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(patch)
  })
  if (!r.ok) throw new Error('Failed to update action')
  return r.json()
}

export async function ingestText(text, title='Text input') {
  const r = await fetch(`${API}/ingest/text`, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({text, title})
  })
  if (!r.ok) throw new Error(await r.text())
  return r.json()
}

export async function uploadFile(file) {
  const fd = new FormData()
  fd.append('file', file)
  const r = await fetch(`${API}/ingest/file`, {method:'POST', body:fd})
  if (!r.ok) throw new Error(await r.text())
  return r.json()
}

export async function askActra(message) {
  const r = await fetch(`${API}/chat`, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({message})
  })
  if (!r.ok) throw new Error(await r.text())
  return r.json()
}
