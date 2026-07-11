import { useState } from 'react'
import { useImageAttachment } from '../hooks/useImageAttachment'

export default function AddTaskForm({ onSubmit, onCancel }) {
  const [title, setTitle] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { image, preview, fileInputRef, setImageFile, clearImage, openFilePicker, handlePaste } =
    useImageAttachment()

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!title.trim()) return

    setSubmitting(true)
    try {
      await onSubmit({
        title: title.trim(),
        description: null,
        dueDate: null,
        image,
      })
      setTitle('')
      clearImage()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      onPaste={handlePaste}
      className="rounded-lg bg-white p-2 shadow-sm ring-1 ring-slate-200"
    >
      <textarea
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Enter a title for this card..."
        autoFocus
        rows={3}
        className="w-full resize-none rounded border-0 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-0"
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => setImageFile(event.target.files?.[0])}
      />

      {preview ? (
        <div className="relative mt-2 overflow-hidden rounded-lg border border-slate-200">
          <img src={preview} alt="Card attachment preview" className="max-h-36 w-full object-cover" />
          <button
            type="button"
            onClick={clearImage}
            className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white"
          >
            Remove
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={openFilePicker}
          className="mt-2 w-full rounded-lg border border-dashed border-slate-300 px-3 py-2 text-left text-xs text-slate-500 transition hover:border-board hover:text-board"
        >
          Add image or paste screenshot (Ctrl+V)
        </button>
      )}

      <div className="mt-2 flex gap-2">
        <button
          type="submit"
          disabled={submitting || !title.trim()}
          className="rounded-lg bg-board px-3 py-1.5 text-sm font-medium text-white hover:bg-board-dark disabled:opacity-50"
        >
          Add card
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-100"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
