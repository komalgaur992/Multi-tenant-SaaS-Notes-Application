'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    console.log('Login attempt:', { email, password })

    try {
      console.log('Sending login request with:', { email, password: '***' })
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response data:', data)

      if (!response.ok) {
        console.error('Login failed:', data)
        throw new Error(data.error || 'Login failed')
      }

      // Store token in localStorage
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      console.log('Login successful, redirecting to notes')
      // Redirect to notes page
      router.push('/notes')
    } catch (err) {
      console.error('Login error:', err)
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Notes App</h1>
          <p className="mt-2 text-sm text-blue-600">Multi-tenant SaaS Notes Application</p>
        </div>

        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-blue-800 text-xl font-bold">Sign in to your account</CardTitle>
            <CardDescription className="text-blue-600">
              Enter your email and password to access your notes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-blue-700 mb-1">
                  Email address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="border-blue-200 focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-blue-700 mb-1">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="border-blue-200 focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>

            <div className="mt-6">
              <div className="text-sm text-blue-600">
                <p className="font-medium mb-3">Test Accounts (Click to fill):</p>
                <div className="space-y-2 text-xs">
                  <div>
                    <p className="font-semibold text-blue-700">Acme Corporation:</p>
                    <div className="space-y-1 mt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEmail('admin@acme.test')
                          setPassword('password')
                        }}
                        className="block w-full text-left px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-700 border border-blue-200 transition-colors"
                      >
                        Admin: admin@acme.test / password
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEmail('user@acme.test')
                          setPassword('password')
                        }}
                        className="block w-full text-left px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-700 border border-blue-200 transition-colors"
                      >
                        User: user@acme.test / password
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-blue-700 mt-2">Globex Corporation:</p>
                    <div className="space-y-1 mt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEmail('admin@globex.test')
                          setPassword('password')
                        }}
                        className="block w-full text-left px-3 py-2 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-indigo-700 border border-indigo-200 transition-colors"
                      >
                        Admin: admin@globex.test / password
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEmail('user@globex.test')
                          setPassword('password')
                        }}
                        className="block w-full text-left px-3 py-2 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-indigo-700 border border-indigo-200 transition-colors"
                      >
                        User: user@globex.test / password
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
