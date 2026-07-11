import { useState } from 'react'

export default function AddTableForm({ onAdd }) {
  const [name, setName] = useState('')
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setSubmitting(true)
    try {
      await onAdd(name.trim())
      setName('')
      setOpen(false)
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) {
    return (
        <button
            onClick={() => setOpen(true)}
            className="flex h-fit w-64 shrink-0 items-center justify-center rounded-xl bg-white/20 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/30 sm:w-72"
        >
          + Add another table
        </button>
    )
  }

  return (
      <form
          onSubmit={handleSubmit}
          className="flex h-fit w-64 shrink-0 flex-col gap-2 rounded-xl bg-column p-3 sm:w-72"
      >
        <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Table name"
            autoFocus
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-board focus:outline-none"
        />
        <div className="flex gap-2">
          <button
              type="submit"
              disabled={submitting || !name.trim()}
              className="rounded-lg bg-board px-3 py-1.5 text-sm font-medium text-white hover:bg-board-dark disabled:opacity-50"
          >
            Add table
          </button>
          <button
              type="button"
              onClick={() => { setOpen(false); setName('') }}
              className="rounded-lg px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-200"
          >
            Cancel
          </button>
        </div>
      </form>
  )
}