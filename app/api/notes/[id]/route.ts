import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { updateNoteSchema } from '@/lib/validations'
import { verifyToken } from '@/lib/auth'
import { handleCors, addCorsHeaders } from '@/lib/cors'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const corsResponse = handleCors(request)
  if (corsResponse) return corsResponse

  try {
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
    const { id: noteId } = await params

    const note = await prisma.note.findFirst({
      where: {
        id: noteId,
        tenantId, // Ensure tenant isolation
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

    if (!note) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      )
    }

    const response = NextResponse.json({ note })
    return addCorsHeaders(response)
  } catch (error) {
    console.error('Get note error:', error)
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
    return addCorsHeaders(response)
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const corsResponse = handleCors(request)
  if (corsResponse) return corsResponse

  try {
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
    const { id: noteId } = await params

    const body = await request.json()
    const updateData = updateNoteSchema.parse(body)

    // Check if note exists and belongs to tenant
    const existingNote = await prisma.note.findFirst({
      where: {
        id: noteId,
        tenantId,
      },
    })

    if (!existingNote) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      )
    }

    const note = await prisma.note.update({
      where: { id: noteId },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    })

    const response = NextResponse.json({ note })
    return addCorsHeaders(response)
  } catch (error) {
    console.error('Update note error:', error)
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
    return addCorsHeaders(response)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const corsResponse = handleCors(request)
  if (corsResponse) return corsResponse

  try {
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
    const { id: noteId } = await params

    // Check if note exists and belongs to tenant
    const existingNote = await prisma.note.findFirst({
      where: {
        id: noteId,
        tenantId,
      },
    })

    if (!existingNote) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      )
    }

    await prisma.note.delete({
      where: { id: noteId },
    })

    const response = NextResponse.json({ message: 'Note deleted successfully' })
    return addCorsHeaders(response)
  } catch (error) {
    console.error('Delete note error:', error)
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
