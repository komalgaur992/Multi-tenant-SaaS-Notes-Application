'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Edit2, Trash2, LogOut, Crown } from 'lucide-react'

interface User {
  id: string
  email: string
  role: string
  tenant: {
    id: string
    name: string
    slug: string
    plan: string
  }
}

interface Note {
  id: string
  title: string
  content: string | null
  createdAt: string
  updatedAt: string
  author: {
    id: string
    email: string
  } | null
}

export default function NotesPage() {
  const [user, setUser] = useState<User | null>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [newNote, setNewNote] = useState({ title: '', content: '' })
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    loadNotes()
  }, [])

  const checkAuth = async () => {
    const token = localStorage.getItem('token')
    console.log('Checking auth with token:', token ? token.substring(0, 50) + '...' : 'No token')
    
    if (!token) {
      console.log('No token found, redirecting to login')
      router.push('/login')
      return
    }

    try {
      console.log('Making auth request to /api/auth/me')
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      console.log('Auth response status:', response.status)
      if (!response.ok) {
        const errorData = await response.json()
        console.error('Auth failed:', errorData)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        router.push('/login')
        return
      }

      const data = await response.json()
      console.log('Auth successful, user data:', data)
      setUser(data.user)
    } catch (err) {
      console.error('Auth error:', err)
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      router.push('/login')
    }
  }

  const loadNotes = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      console.log('Loading notes with token:', token.substring(0, 50) + '...')
      const response = await fetch('/api/notes', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      console.log('Notes response status:', response.status)
      if (response.ok) {
        const data = await response.json()
        console.log('Notes data:', data)
        setNotes(data.notes)
      } else {
        const errorData = await response.json()
        console.error('Notes API error:', errorData)
      }
    } catch (err) {
      console.error('Failed to load notes:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNote.title.trim()) return

    const token = localStorage.getItem('token')
    if (!token) return

    setIsCreating(true)
    setError('')

    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newNote),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create note')
      }

      setNotes([data.note, ...notes])
      setNewNote({ title: '', content: '' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create note')
    } finally {
      setIsCreating(false)
    }
  }

  const handleUpdateNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingNote || !editingNote.title.trim()) return

    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch(`/api/notes/${editingNote.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editingNote.title,
          content: editingNote.content,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update note')
      }

      const data = await response.json()
      setNotes(notes.map(note => note.id === editingNote.id ? data.note : note))
      setEditingNote(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update note')
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return

    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete note')
      }

      setNotes(notes.filter(note => note.id !== noteId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete note')
    }
  }

  const handleUpgrade = async () => {
    if (!user) return

    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch(`/api/tenants/${user.tenant.slug}/upgrade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ plan: 'pro' }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to upgrade tenant')
      }

      const data = await response.json()
      setUser({
        ...user,
        tenant: {
          ...user.tenant,
          plan: 'pro',
        },
      })
      alert('Tenant upgraded to Pro successfully!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upgrade tenant')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const isFreePlan = user.tenant.plan === 'free'
  const canUpgrade = user.role === 'Admin'
  const isAtLimit = isFreePlan && notes.length >= 3

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Notes App
              </h1>
              <p className="text-sm text-blue-600">
                {user.tenant.name} • {user.role} • 
                <span className={`ml-1 px-3 py-1 rounded-full text-xs font-medium ${
                  user.tenant.plan === 'free' 
                    ? 'bg-orange-100 text-orange-700 border border-orange-200' 
                    : 'bg-green-100 text-green-700 border border-green-200'
                }`}>
                  {user.tenant.plan === 'free' ? 'Free Plan' : 'Pro Plan'}
                </span>
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {isFreePlan && canUpgrade && (
                <Button 
                  onClick={handleUpgrade} 
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0"
                  size="sm"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade to Pro
                </Button>
              )}
              <Button 
                onClick={handleLogout} 
                variant="outline" 
                className="border-blue-200 hover:bg-blue-50 text-blue-600 bg-white hover:bg-blue-50"
                size="sm"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-sm">
            {error}
          </div>
        )}

        {/* Upgrade Banner */}
        {isAtLimit && (
          <div className="mb-6 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 text-orange-800 px-6 py-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-lg">Free plan limit reached!</p>
                <p className="text-sm">You've reached the maximum of 3 notes on the free plan.</p>
              </div>
              {canUpgrade ? (
                <Button 
                  onClick={handleUpgrade} 
                  size="sm"
                  className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white border-0"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade to Pro
                </Button>
              ) : (
                <p className="text-sm">Ask your Admin to upgrade to Pro for unlimited notes.</p>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Note Form */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className={`rounded-t-lg ${isAtLimit ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-gradient-to-r from-blue-500 to-purple-500'} text-white`}>
                <CardTitle className="text-white">
                  {isAtLimit ? 'Note Limit Reached' : 'Create New Note'}
                </CardTitle>
                <CardDescription className={isAtLimit ? 'text-red-100' : 'text-blue-100'}>
                  {isFreePlan ? `Add a new note (${notes.length}/3 used)` : 'Add a new note'}
                  {isAtLimit && ' - Upgrade to Pro for unlimited notes!'}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleCreateNote} className="space-y-4">
                  <div>
                    <Input
                      placeholder={isAtLimit ? "Note limit reached - upgrade to Pro" : "Note title"}
                      value={newNote.title}
                      onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                      disabled={isAtLimit}
                      required
                      className={`border-slate-300 focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900 ${isAtLimit ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    />
                  </div>
                  <div>
                    <Textarea
                      placeholder={isAtLimit ? "Note limit reached - upgrade to Pro" : "Note content (optional)"}
                      value={newNote.content}
                      onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                      disabled={isAtLimit}
                      rows={4}
                      className={`border-slate-300 focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900 ${isAtLimit ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isCreating || isAtLimit}
                    className={`w-full ${isAtLimit 
                      ? 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
                    } text-white border-0 disabled:opacity-50`}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {isAtLimit ? 'Limit Reached' : isCreating ? 'Creating...' : 'Create Note'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Notes List */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-blue-800">Your Notes</h2>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium border border-blue-200">
                {notes.length} {notes.length === 1 ? 'note' : 'notes'}
              </span>
            </div>

            {notes.length === 0 ? (
              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                <CardContent className="text-center py-16">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                    <Plus className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-blue-700 mb-2">No notes yet</h3>
                  <p className="text-blue-500">Create your first note to get started!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
                {notes.map((note) => (
                  <Card key={note.id} className="border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="p-6">
                      {editingNote?.id === note.id ? (
                        <form onSubmit={handleUpdateNote} className="space-y-4">
                          <Input
                            value={editingNote.title}
                            onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                            required
                            className="border-slate-300 focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900"
                          />
                          <Textarea
                            value={editingNote.content || ''}
                            onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                            rows={3}
                            className="border-slate-300 focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900"
                          />
                          <div className="flex space-x-2">
                            <Button 
                              type="submit" 
                              size="sm"
                              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0"
                            >
                              Save
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingNote(null)}
                              className="border-slate-300 hover:bg-slate-50 bg-white text-gray-700"
                            >
                              Cancel
                            </Button>
                          </div>
                        </form>
                      ) : (
                        <div>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-blue-800 mb-2">{note.title}</h3>
                              {note.content && (
                                <p className="text-blue-600 whitespace-pre-wrap leading-relaxed mb-4">{note.content}</p>
                              )}
                              <div className="flex items-center text-sm text-blue-500 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">
                                <span className="font-medium">By {note.author?.email || 'Unknown'}</span>
                                <span className="mx-2">•</span>
                                <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div className="flex space-x-1 ml-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingNote(note)}
                                className="text-blue-500 hover:text-blue-700 hover:bg-blue-100"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteNote(note.id)}
                                className="text-red-400 hover:text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
