import { NextRequest, NextResponse } from 'next/server'
import { handleCors, addCorsHeaders } from '@/lib/cors'

export async function GET(request: NextRequest) {
  const corsResponse = handleCors(request)
  if (corsResponse) return corsResponse

  const response = NextResponse.json({ status: 'ok' })
  return addCorsHeaders(response)
}

export async function OPTIONS(request: NextRequest) {
  return handleCors(request) || new NextResponse(null, { status: 200 })
}
