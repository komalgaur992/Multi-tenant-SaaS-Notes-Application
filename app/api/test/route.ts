import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'Test API working',
    timestamp: new Date().toISOString(),
    env: {
      JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'Not set'
    }
  })
}
