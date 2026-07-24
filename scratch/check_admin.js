const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, role: true }
  });
  console.log('ALL USERS IN DB:', JSON.stringify(users, null, 2));

  const admins = users.filter(u => u.role === 'ADMIN');
  console.log('ADMIN USERS COUNT:', admins.length);
  console.log('ADMIN USERS:', JSON.stringify(admins, null, 2));
}

main()
  .catch(err => console.error(err))
  .finally(() => prisma.$disconnect());
