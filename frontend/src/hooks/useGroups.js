import { useCallback, useEffect, useState } from 'react'
import { api } from '../api/client'

export function useGroups() {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.getGroups()
      setGroups(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const createGroup = async (name) => {
    const group = await api.createGroup({ name, description: null })
    setGroups((prev) => [...prev, group])
    return group
  }

  const deleteGroup = async (id) => {
    await api.deleteGroup(id)
    setGroups((prev) => prev.filter((g) => g.id !== id))
  }

  return { groups, loading, error, refresh, createGroup, deleteGroup }
}

export function useBoard(groupId) {
  const [board, setBoard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    if (!groupId) return
    setLoading(true)
    setError(null)
    try {
      const data = await api.getGroup(groupId)
      setBoard(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [groupId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const addTable = async (name) => {
    await api.createTable(groupId, { name })
    await refresh()
  }

  const addCard = async (tableId, data) => {
    await api.createCard(tableId, data)
    await refresh()
  }

  const updateCard = async (tableId, cardId, data) => {
    await api.updateCard(tableId, cardId, data)
    await refresh()
  }

  const deleteCard = async (tableId, cardId) => {
    await api.deleteCard(tableId, cardId)
    await refresh()
  }

  const moveCard = async (sourceTableId, cardId, targetTableId, position) => {
    await api.moveCard(sourceTableId, cardId, { tableId: targetTableId, position })
  }

  const deleteTable = async (tableId) => {
    await api.deleteTable(groupId, tableId)
    await refresh()
  }

  return {
    board,
    loading,
    error,
    refresh,
    addTable,
    addCard,
    updateCard,
    deleteCard,
    moveCard,
    deleteTable,
  }
}
