import { useState } from 'react'
import Sidebar from './components/Sidebar'
import BoardView from './components/BoardView'
import { useGroups } from './hooks/useGroups'

export default function App() {
  const { groups, loading, error, refresh, createGroup, deleteGroup } = useGroups()
  const [selectedGroupId, setSelectedGroupId] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const selectedGroup = groups.find((g) => g.id === selectedGroupId) ?? groups[0] ?? null

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-600">
        Loading workspace...
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-100 p-8 text-center">
        <p className="text-lg font-medium text-red-600">Could not connect to the API</p>
        <button
          onClick={refresh}
          className="rounded-lg bg-board px-4 py-2 text-sm font-medium text-white hover:bg-board-dark"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-board">
      <Sidebar
        groups={groups}
        selectedId={selectedGroup?.id}
        onSelect={setSelectedGroupId}
        onCreate={createGroup}
        onDelete={deleteGroup}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {selectedGroup ? (
        <BoardView
          key={selectedGroup.id}
          groupId={selectedGroup.id}
          groupName={selectedGroup.name}
          onOpenSidebar={() => setSidebarOpen(true)}
        />
      ) : (
        <div className="flex flex-1 items-center justify-center text-white/80">
          Create a group to get started
        </div>
      )}
    </div>
  )
}