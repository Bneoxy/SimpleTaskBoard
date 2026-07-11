import { useState } from 'react'

export default function Sidebar({ groups, selectedId, onSelect, onCreate, onDelete }) {
  const [name, setName] = useState('')
  const [creating, setCreating] = useState(false)

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setCreating(true)
    try {
      const group = await onCreate(name.trim())
      onSelect(group.id)
      setName('')
    } finally {
      setCreating(false)
    }
  }

  return (
    <aside className="flex w-64 shrink-0 flex-col bg-board-dark text-white">
      <div className="border-b border-white/20 px-4 py-5">
        <h1 className="text-lg font-bold tracking-tight">Simple Taskboard</h1>
        <p className="mt-1 text-xs text-white/70">Groups &amp; boards</p>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {groups.map((group) => (
          <div key={group.id} className="group mb-1 flex items-center gap-1">
            <button
              onClick={() => onSelect(group.id)}
              className={`flex-1 rounded-lg px-3 py-2 text-left text-sm transition ${
                selectedId === group.id
                  ? 'bg-white/20 font-medium'
                  : 'hover:bg-white/10'
              }`}
            >
              {group.name}
            </button>
            <button
              onClick={() => onDelete(group.id)}
              className="rounded px-2 py-1 text-xs text-white/50 opacity-0 transition hover:bg-white/10 hover:text-white group-hover:opacity-100"
              title="Delete group"
            >
              ×
            </button>
          </div>
        ))}
      </nav>

      <form onSubmit={handleCreate} className="border-t border-white/20 p-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New group name"
          className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/50 focus:border-white/40 focus:outline-none"
        />
        <button
          type="submit"
          disabled={creating || !name.trim()}
          className="mt-2 w-full rounded-lg bg-white/20 py-2 text-sm font-medium transition hover:bg-white/30 disabled:opacity-50"
        >
          {creating ? 'Creating...' : '+ Add Group'}
        </button>
      </form>
    </aside>
  )
}
