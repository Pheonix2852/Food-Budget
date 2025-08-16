const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const email = process.argv[2]
if (!email) {
  console.error('Usage: node check_user_by_email.js <email>')
  process.exit(1)
}

async function main() {
  const user = await prisma.user.findFirst({ where: { email: email.toLowerCase() } })
  const byAuth = await prisma.user.findFirst({ where: { authId: { not: null }, email } })
  const req = await prisma.joinRequest.findFirst({ where: { email: email.toLowerCase() } })

  console.log('User by email:', user)
  console.log('User with non-null authId (by auth):', byAuth)
  console.log('JoinRequest by email:', req)
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
