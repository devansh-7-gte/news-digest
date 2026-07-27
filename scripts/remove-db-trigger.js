const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const dropTriggerSql = `
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
`;

const dropFunctionSql = `
DROP FUNCTION IF EXISTS public.handle_new_user();
`;

async function main() {
  console.log('Removing triggers and function from database sequentially...');
  try {
    console.log('1/2 Dropping trigger on auth.users...');
    await prisma.$executeRawUnsafe(dropTriggerSql);
    
    console.log('2/2 Dropping handle_new_user function...');
    await prisma.$executeRawUnsafe(dropFunctionSql);

    console.log('✅ Successfully removed database trigger (on_auth_user_created) and function (handle_new_user)!');
  } catch (error) {
    console.error('❌ Failed to remove database objects:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

