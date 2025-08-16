const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const email = '2025arcade1@gmail.com'
  const reqs = await prisma.joinRequest.findMany({ where: { email } })
  console.log('JoinRequests for', email, reqs)
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
