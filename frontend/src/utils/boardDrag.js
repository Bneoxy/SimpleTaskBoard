import { arrayMove } from '@dnd-kit/sortable'

export function parseColumnId(id) {
  if (typeof id === 'string' && id.startsWith('column-')) {
    return Number(id.replace('column-', ''))
  }
  return null
}

export function findContainer(board, id) {
  if (!board) return null

  const columnId = parseColumnId(id)
  if (columnId) return columnId

  for (const table of board.tables) {
    if (table.cards.some((card) => card.id === id)) {
      return table.id
    }
  }

  return null
}

export function getTable(board, tableId) {
  return board.tables.find((table) => table.id === tableId)
}

export function getCardIndex(table, cardId) {
  return table.cards.findIndex((card) => card.id === cardId)
}

export function getDropIndex(board, over) {
  const overContainer = findContainer(board, over.id)
  if (!overContainer) return null

  const overTable = getTable(board, overContainer)
  if (!overTable) return null

  if (over.data.current?.type === 'card') {
    return getCardIndex(overTable, over.id)
  }

  return overTable.cards.length
}

export function moveCardBetweenTables(board, activeId, activeContainer, overContainer, overIndex) {
  const activeTable = getTable(board, activeContainer)
  const overTable = getTable(board, overContainer)
  if (!activeTable || !overTable) return board

  const activeIndex = getCardIndex(activeTable, activeId)
  if (activeIndex < 0) return board

  const card = activeTable.cards[activeIndex]

  if (activeContainer === overContainer) {
    const reordered = arrayMove(activeTable.cards, activeIndex, overIndex)
    return {
      ...board,
      tables: board.tables.map((table) =>
        table.id === activeContainer ? { ...table, cards: reordered } : table
      ),
    }
  }

  const sourceCards = activeTable.cards.filter((item) => item.id !== activeId)
  const targetCards = [...overTable.cards]
  targetCards.splice(overIndex, 0, { ...card, tableId: overContainer })

  return {
    ...board,
    tables: board.tables.map((table) => {
      if (table.id === activeContainer) return { ...table, cards: sourceCards }
      if (table.id === overContainer) return { ...table, cards: targetCards }
      return table
    }),
  }
}
