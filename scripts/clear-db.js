const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting DB cleanup: will delete Tasks -> Columns -> Users');
  try {
    await prisma.$connect();

    // As a safety step, null any authorId references (in case of constraints).
    try {
      const nulled = await prisma.task.updateMany({ data: { authorId: null } });
      console.log('Tasks updated (authorId nulled):', nulled.count);
    } catch (e) {
      console.warn('Could not null authorId on tasks (maybe column/author absent):', e.message || e);
    }

    // Delete all tasks first (tasks reference columns)
    try {
      const deletedTasks = await prisma.task.deleteMany({});
      console.log('Deleted tasks count:', deletedTasks.count);
    } catch (e) {
      console.error('Error deleting tasks:', e.message || e);
    }

    // Then delete columns
    try {
      const deletedCols = await prisma.columns.deleteMany({});
      console.log('Deleted columns count:', deletedCols.count);
    } catch (e) {
      console.error('Error deleting columns:', e.message || e);
    }

    // Finally delete users
    try {
      const deletedUsers = await prisma.user.deleteMany({});
      console.log('Deleted users count:', deletedUsers.count);
    } catch (e) {
      console.error('Error deleting users:', e.message || e);
    }

    console.log('DB cleanup finished.');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error('Error during DB cleanup:', e);
  process.exit(1);
});
