import { useState } from 'react'
import { useImageAttachment } from '../hooks/useImageAttachment'

export default function TaskModal({ card, onClose, onSave, onDelete }) {
  const [title, setTitle] = useState(card.title)
  const [description, setDescription] = useState(card.description ?? '')
  const [dueDate, setDueDate] = useState(card.dueDate ? card.dueDate.split('T')[0] : '')
  const [removeImage, setRemoveImage] = useState(false)
  const [saving, setSaving] = useState(false)
  const { image, preview, fileInputRef, setImageFile, clearImage, openFilePicker, handlePaste } =
    useImageAttachment()

  const currentImage = !removeImage ? (preview || card.imageUrl) : preview

  const handleSave = async () => {
    if (!title.trim()) return
    setSaving(true)
    try {
      await onSave({
        title: title.trim(),
        description: description.trim() || null,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        image,
        removeImage: removeImage && !image,
      })
    } finally {
      setSaving(false)
    }
  }

  const handleRemoveImage = () => {
    clearImage()
    setRemoveImage(true)
  }

  const handlePickImage = () => {
    setRemoveImage(false)
    openFilePicker()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 pt-16"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        onPaste={handlePaste}
      >
        <div className="border-b border-slate-100 px-6 py-4">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full text-lg font-semibold text-slate-800 focus:outline-none"
            placeholder="Card title"
          />
        </div>

        <div className="space-y-4 px-6 py-4">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Image / Screenshot
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                setRemoveImage(false)
                setImageFile(event.target.files?.[0])
              }}
            />

            {currentImage ? (
              <div className="relative overflow-hidden rounded-lg border border-slate-200">
                <img src={currentImage} alt="Card attachment" className="max-h-56 w-full object-cover" />
                <div className="absolute right-2 top-2 flex gap-2">
                  <button
                    type="button"
                    onClick={handlePickImage}
                    className="rounded-full bg-black/60 px-2 py-0.5 text-xs text-white"
                  >
                    Replace
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="rounded-full bg-black/60 px-2 py-0.5 text-xs text-white"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={handlePickImage}
                className="w-full rounded-lg border border-dashed border-slate-300 px-3 py-6 text-sm text-slate-500 transition hover:border-board hover:text-board"
              >
                Upload image or paste screenshot (Ctrl+V)
              </button>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Description
            </label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
              placeholder="Add more details..."
              className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-board focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Due date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-board focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
          <button
            onClick={onDelete}
            className="rounded-lg px-3 py-2 text-sm text-red-600 transition hover:bg-red-50"
          >
            Delete card
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !title.trim()}
              className="rounded-lg bg-board px-4 py-2 text-sm font-medium text-white hover:bg-board-dark disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
