const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const email = '2025arcade1@gmail.com'
  const authId = 'auth_2025arcade1'
  const name = 'Sagnik'

  let existing = await prisma.user.findFirst({ where: { email } })
  if (existing) {
    const updated = await prisma.user.update({ where: { id: existing.id }, data: { approved: true, role: 'ADMIN', authId, name } })
    console.log('Updated user:', updated)
  } else {
    const created = await prisma.user.create({ data: { email, authId, approved: true, role: 'ADMIN', name } })
    console.log('Created user:', created)
  }
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
