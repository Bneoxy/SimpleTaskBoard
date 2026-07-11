import { useEffect, useRef, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { useBoard } from '../hooks/useGroups'
import {
  findContainer,
  getDropIndex,
  getTable,
  moveCardBetweenTables,
} from '../utils/boardDrag'
import TableColumn from './TableColumn'
import TaskCard from './TaskCard'
import TaskModal from './TaskModal'
import AddTableForm from './AddTableForm'

export default function BoardView({ groupId, groupName }) {
  const {
    board: serverBoard,
    loading,
    addTable,
    addCard,
    updateCard,
    deleteCard,
    moveCard,
    deleteTable,
    refresh,
  } = useBoard(groupId)

  const [board, setBoard] = useState(null)
  const [activeCard, setActiveCard] = useState(null)
  const [editingCard, setEditingCard] = useState(null)
  const dragOriginRef = useRef(null)

  useEffect(() => {
    setBoard(serverBoard)
  }, [serverBoard])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const findCard = (cardId) => {
    for (const table of board?.tables ?? []) {
      const card = table.cards.find((item) => item.id === cardId)
      if (card) return { card, tableId: table.id }
    }
    return null
  }

  const handleDragStart = (event) => {
    const found = findCard(event.active.id)
    if (!found) return

    setActiveCard(found.card)
    const table = getTable(board, found.tableId)
    if (!table) return

    dragOriginRef.current = {
      tableId: found.tableId,
      index: table.cards.findIndex((card) => card.id === event.active.id),
    }
  }

  const handleDragOver = (event) => {
    const { active, over } = event
    if (!over || !board) return

    const activeContainer = findContainer(board, active.id)
    const overContainer = findContainer(board, over.id)
    if (!activeContainer || !overContainer) return

    const overIndex = getDropIndex(board, over)
    if (overIndex === null) return

    if (activeContainer === overContainer) {
      const activeTable = getTable(board, activeContainer)
      const activeIndex = activeTable.cards.findIndex((card) => card.id === active.id)
      if (activeIndex === overIndex) return
    }

    setBoard((current) =>
      moveCardBetweenTables(current, active.id, activeContainer, overContainer, overIndex)
    )
  }

  const handleDragEnd = async (event) => {
    setActiveCard(null)
    const { active, over } = event
    const origin = dragOriginRef.current
    dragOriginRef.current = null

    if (!over || !board || !origin) return

    const overContainer = findContainer(board, over.id)
    if (!overContainer) return

    const overIndex = getDropIndex(board, over)
    if (overIndex === null) return

    let nextBoard = board
    const currentContainer = findContainer(board, active.id)
    const currentIndex = currentContainer
      ? getTable(board, currentContainer).cards.findIndex((card) => card.id === active.id)
      : -1

    if (currentContainer !== overContainer || currentIndex !== overIndex) {
      nextBoard = moveCardBetweenTables(
        board,
        active.id,
        currentContainer ?? origin.tableId,
        overContainer,
        overIndex
      )
      setBoard(nextBoard)
    }

    const targetTable = getTable(nextBoard, overContainer)
    const finalIndex = targetTable.cards.findIndex((card) => card.id === active.id)

    if (origin.tableId === overContainer && origin.index === finalIndex) return

    try {
      await moveCard(origin.tableId, active.id, overContainer, finalIndex)
    } catch {
      await refresh()
    }
  }

  const handleDragCancel = () => {
    setActiveCard(null)
    dragOriginRef.current = null
    setBoard(serverBoard)
  }

  if (loading || !board) {
    return (
      <div className="flex flex-1 items-center justify-center text-white/80">
        Loading board...
      </div>
    )
  }

  return (
    <main className="flex min-w-0 flex-1 flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <div>
          <h2 className="text-xl font-bold text-white">{groupName}</h2>
          {board.description && (
            <p className="text-sm text-white/70">{board.description}</p>
          )}
        </div>
      </header>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="flex flex-1 gap-4 overflow-x-auto px-6 pb-6">
          {board.tables.map((table) => (
            <TableColumn
              key={table.id}
              table={table}
              onAddCard={(data) => addCard(table.id, data)}
              onCardClick={setEditingCard}
              onDeleteTable={() => deleteTable(table.id)}
            />
          ))}
          <AddTableForm onAdd={addTable} />
        </div>

        <DragOverlay>
          {activeCard ? (
            <div className="w-72 rotate-2 opacity-90">
              <TaskCard card={activeCard} isDragging />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {editingCard && (
        <TaskModal
          card={editingCard}
          onClose={() => setEditingCard(null)}
          onSave={async (data) => {
            await updateCard(editingCard.tableId, editingCard.id, data)
            setEditingCard(null)
          }}
          onDelete={async () => {
            await deleteCard(editingCard.tableId, editingCard.id)
            setEditingCard(null)
          }}
        />
      )}
    </main>
  )
}
