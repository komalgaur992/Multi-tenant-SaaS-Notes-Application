import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../lib/auth'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create tenants
  const acmeTenant = await prisma.tenant.upsert({
    where: { slug: 'acme' },
    update: {},
    create: {
      slug: 'acme',
      name: 'Acme Corporation',
      plan: 'free',
    },
  })

  const globexTenant = await prisma.tenant.upsert({
    where: { slug: 'globex' },
    update: {},
    create: {
      slug: 'globex',
      name: 'Globex Corporation',
      plan: 'free',
    },
  })

  console.log('✅ Tenants created')

  // Create users
  const hashedPassword = await hashPassword('password')

  const acmeAdmin = await prisma.user.upsert({
    where: { email: 'admin@acme.test' },
    update: {},
    create: {
      email: 'admin@acme.test',
      password: hashedPassword,
      role: 'Admin',
      tenantId: acmeTenant.id,
    },
  })

  const acmeUser = await prisma.user.upsert({
    where: { email: 'user@acme.test' },
    update: {},
    create: {
      email: 'user@acme.test',
      password: hashedPassword,
      role: 'Member',
      tenantId: acmeTenant.id,
    },
  })

  const globexAdmin = await prisma.user.upsert({
    where: { email: 'admin@globex.test' },
    update: {},
    create: {
      email: 'admin@globex.test',
      password: hashedPassword,
      role: 'Admin',
      tenantId: globexTenant.id,
    },
  })

  const globexUser = await prisma.user.upsert({
    where: { email: 'user@globex.test' },
    update: {},
    create: {
      email: 'user@globex.test',
      password: hashedPassword,
      role: 'Member',
      tenantId: globexTenant.id,
    },
  })

  console.log('✅ Users created')

  // Create sample notes for Acme
  await prisma.note.createMany({
    data: [
      {
        title: 'Welcome to Acme Notes',
        content: 'This is your first note in the Acme Corporation workspace.',
        tenantId: acmeTenant.id,
        authorId: acmeAdmin.id,
      },
      {
        title: 'Project Planning',
        content: 'We need to plan our Q1 objectives and deliverables.',
        tenantId: acmeTenant.id,
        authorId: acmeUser.id,
      },
    ],
  })

  // Create sample notes for Globex
  await prisma.note.createMany({
    data: [
      {
        title: 'Globex Team Meeting',
        content: 'Notes from our weekly team standup meeting.',
        tenantId: globexTenant.id,
        authorId: globexAdmin.id,
      },
      {
        title: 'Client Requirements',
        content: 'Updated requirements from our main client project.',
        tenantId: globexTenant.id,
        authorId: globexUser.id,
      },
    ],
  })

  console.log('✅ Sample notes created')

  console.log('🎉 Database seeded successfully!')
  console.log('\n📋 Test Accounts:')
  console.log('Acme Corporation (Free Plan):')
  console.log('  Admin: admin@acme.test / password')
  console.log('  User:  user@acme.test / password')
  console.log('\nGlobex Corporation (Free Plan):')
  console.log('  Admin: admin@globex.test / password')
  console.log('  User:  user@globex.test / password')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
