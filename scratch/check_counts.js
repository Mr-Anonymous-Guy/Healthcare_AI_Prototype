const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const counts = {
    users: await prisma.user.count().catch(() => 'error'),
    profiles: await prisma.profile.count().catch(() => 'error'),
    medicalReports: await prisma.medicalReport.count().catch(() => 'error'),
    appointments: await prisma.appointment.count().catch(() => 'error'),
    symptoms: await prisma.symptom.count().catch(() => 'error'),
    vitals: await prisma.vital.count().catch(() => 'error'),
    healthLogs: await prisma.healthLog.count().catch(() => 'error'),
    conversations: await prisma.conversation.count().catch(() => 'error'),
    messages: await prisma.message.count().catch(() => 'error'),
    notifications: await prisma.notification.count().catch(() => 'error'),
    files: await prisma.file.count().catch(() => 'error'),
    aiSessions: await prisma.aISession.count().catch(() => 'error'),
    auditLogs: await prisma.auditLog.count().catch(() => 'error'),
  };

  console.log('TABLE ROW COUNTS IN DATABASE:');
  console.log(JSON.stringify(counts, null, 2));
}

main()
  .catch(err => console.error(err))
  .finally(() => prisma.$disconnect());
