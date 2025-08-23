const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Disconnecting authors from tasks (setting authorId = NULL) to avoid FK issues...');
  try {
    await prisma.$connect();
    // If tasks have authorId foreign key, clear them first to avoid constraint errors
    try {
      const update = await prisma.task.updateMany({ data: { authorId: null } });
      console.log('Tasks updated (authorId nulled):', update.count);
    } catch (e) {
      console.warn('Could not null authorId on tasks (maybe model/column missing):', e.message || e);
    }

    const result = await prisma.user.deleteMany({});
    console.log('Deleted users count:', result.count);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error('Error clearing users:', e);
  process.exit(1);
});
