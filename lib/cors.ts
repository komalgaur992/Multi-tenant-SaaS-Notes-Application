import { NextRequest, NextResponse } from 'next/server'

export function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}

export function handleCors(request: NextRequest) {
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: corsHeaders(),
    })
  }
  return null
}

export function addCorsHeaders(response: NextResponse) {
  Object.entries(corsHeaders()).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  return response
}
