require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    // Test basic connection by querying user count
    const userCount = await prisma.user.count();
    console.log(`✓ Prisma Client connected successfully`);
    console.log(`✓ Users table exists and contains ${userCount} records`);

    // Test pgvector extension is loaded
    const extensionCheck = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT 1 FROM pg_extension WHERE extname = 'vector'
      ) as vector_available;
    `;
    console.log(`✓ pgvector extension available:`, extensionCheck);

  } catch (error) {
    console.error('✗ Connection failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
