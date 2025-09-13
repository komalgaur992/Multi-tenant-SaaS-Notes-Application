import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createNoteSchema } from '@/lib/validations'
import { verifyToken } from '@/lib/auth'
import { handleCors, addCorsHeaders } from '@/lib/cors'

export async function GET(request: NextRequest) {
  const corsResponse = handleCors(request)
  if (corsResponse) return corsResponse

  try {
    // Extract token from Authorization header
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      )
    }

    const payload = verifyToken(token)
    console.log('Notes API - Token:', token.substring(0, 50) + '...')
    console.log('Notes API - Payload:', payload)
    console.log('Notes API - JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set')
    
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const tenantId = payload.tenantId
    const authorId = payload.userId

    const notes = await prisma.note.findMany({
      where: { tenantId },
      include: {
        author: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const response = NextResponse.json({ notes })
    return addCorsHeaders(response)
  } catch (error) {
    console.error('Get notes error:', error)
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
    return addCorsHeaders(response)
  }
}

export async function POST(request: NextRequest) {
  const corsResponse = handleCors(request)
  if (corsResponse) return corsResponse

  try {
    // Extract token from Authorization header
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      )
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const tenantId = payload.tenantId
    const authorId = payload.userId

    const body = await request.json()
    const { title, content } = createNoteSchema.parse(body)

    // Check if tenant is on free plan and has reached the limit
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { _count: { select: { notes: true } } },
    })

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      )
    }

    if (tenant.plan === 'free' && tenant._count.notes >= 3) {
      return NextResponse.json(
        { error: 'Free plan limit reached. Upgrade to Pro for unlimited notes.' },
        { status: 403 }
      )
    }

    const note = await prisma.note.create({
      data: {
        title,
        content,
        tenantId,
        authorId,
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    })

    const response = NextResponse.json({ note }, { status: 201 })
    return addCorsHeaders(response)
  } catch (error) {
    console.error('Create note error:', error)
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
    return addCorsHeaders(response)
  }
}

export async function OPTIONS(request: NextRequest) {
  return handleCors(request) || new NextResponse(null, { status: 200 })
}
