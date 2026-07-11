import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

function formatDate(dateStr) {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

export default function TaskCard({ card, tableId, onClick, isDragging = false }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSortDragging } =
    useSortable({
      id: card.id,
      data: { type: 'card', tableId },
      disabled: isDragging,
    })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortDragging ? 0.4 : 1,
  }

  const dueDate = formatDate(card.dueDate)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`cursor-pointer rounded-lg bg-card shadow-sm ring-1 ring-slate-200/80 transition hover:ring-board/30 ${
        isDragging ? 'shadow-lg ring-board/40' : ''
      }`}
      onClick={onClick}
    >
      {card.imageUrl && (
        <img
          src={card.imageUrl}
          alt=""
          className="h-28 w-full rounded-t-lg object-cover"
        />
      )}

      <div className="flex items-start gap-2 px-3 py-2.5">
        <button
          {...attributes}
          {...listeners}
          onClick={(event) => event.stopPropagation()}
          className="mt-0.5 shrink-0 cursor-grab text-slate-300 hover:text-slate-500 active:cursor-grabbing"
          aria-label="Drag card"
        >
          ⠿
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-800">{card.title}</p>
          {card.description && (
            <p className="mt-1 line-clamp-2 text-xs text-slate-500">{card.description}</p>
          )}
          {dueDate && (
            <span className="mt-2 inline-block rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-800">
              {dueDate}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
