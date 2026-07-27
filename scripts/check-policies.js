const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const policies = await prisma.$queryRawUnsafe(`
      SELECT tablename, policyname, cmd, qual, with_check 
      FROM pg_policies 
      WHERE schemaname = 'public';
    `);
    console.log('--- Current RLS Policies in public schema ---');
    console.log(JSON.stringify(policies, null, 2));

    const rlsStatus = await prisma.$queryRawUnsafe(`
      SELECT relname, relrowsecurity 
      FROM pg_class 
      WHERE relname IN ('users', 'user_preferences', 'subscriptions') 
      AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
    `);
    console.log('\n--- RLS Status (relrowsecurity = true means enabled) ---');
    console.log(JSON.stringify(rlsStatus, null, 2));
  } catch (error) {
    console.error('Error fetching policies:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
