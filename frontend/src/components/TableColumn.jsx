import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useState } from 'react'
import TaskCard from './TaskCard'
import AddTaskForm from './AddTaskForm'

export default function TableColumn({ table, onAddCard, onCardClick, onDeleteTable }) {
  const [adding, setAdding] = useState(false)
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${table.id}`,
    data: { type: 'column', tableId: table.id },
  })

  const cardIds = table.cards.map((card) => card.id)

  return (
    <div className="flex w-72 shrink-0 flex-col rounded-xl bg-column/90">
      <div className="flex items-center justify-between px-3 py-3">
        <h3 className="text-sm font-semibold text-slate-700">{table.name}</h3>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-slate-300/60 px-2 py-0.5 text-xs text-slate-600">
            {table.cards.length}
          </span>
          <button
            onClick={onDeleteTable}
            className="text-slate-400 transition hover:text-red-500"
            title="Delete table"
          >
            ×
          </button>
        </div>
      </div>

      <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={`flex min-h-24 flex-1 flex-col gap-2 overflow-y-auto px-2 pb-2 transition ${
            isOver ? 'rounded-lg bg-board/10 ring-2 ring-board/30' : ''
          }`}
        >
          {table.cards.map((card) => (
            <TaskCard
              key={card.id}
              card={card}
              tableId={table.id}
              onClick={() => onCardClick(card)}
            />
          ))}
          {table.cards.length === 0 && (
            <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-slate-300/80 px-3 py-6 text-center text-xs text-slate-400">
              Drop cards here
            </div>
          )}
        </div>
      </SortableContext>

      <div className="p-2">
        {adding ? (
          <AddTaskForm
            onSubmit={async (data) => {
              await onAddCard(data)
              setAdding(false)
            }}
            onCancel={() => setAdding(false)}
          />
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="w-full rounded-lg py-2 text-left text-sm text-slate-500 transition hover:bg-slate-200/60 hover:text-slate-700"
          >
            + Add a card
          </button>
        )}
      </div>
    </div>
  )
}
