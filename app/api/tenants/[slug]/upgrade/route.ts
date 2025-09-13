import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { upgradeTenantSchema } from '@/lib/validations'
import { verifyToken } from '@/lib/auth'
import { handleCors, addCorsHeaders } from '@/lib/cors'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
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
    const userRole = payload.role
    const { slug: tenantSlug } = await params

    // Only admins can upgrade tenants
    if (userRole !== 'Admin') {
      return NextResponse.json(
        { error: 'Only admins can upgrade tenants' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { plan } = upgradeTenantSchema.parse(body)

    // Verify the tenant exists and belongs to the user
    const tenant = await prisma.tenant.findFirst({
      where: {
        id: tenantId,
        slug: tenantSlug,
      },
    })

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      )
    }

    // Update tenant plan
    const updatedTenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: { plan },
    })

    const response = NextResponse.json({
      message: 'Tenant upgraded successfully',
      tenant: {
        id: updatedTenant.id,
        name: updatedTenant.name,
        slug: updatedTenant.slug,
        plan: updatedTenant.plan,
      },
    })
    return addCorsHeaders(response)
  } catch (error) {
    console.error('Upgrade tenant error:', error)
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
