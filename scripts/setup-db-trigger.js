const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createFunctionSql = `
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.users (id, email, full_name, is_active, created_at)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    true,
    now()
  );

  -- Insert default preferences
  INSERT INTO public.user_preferences (id, user_id, digest_frequency, digest_time, summary_length, timezone, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    new.id,
    'daily',
    '08:00:00',
    'medium',
    'UTC',
    now(),
    now()
  );

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
`;

const dropTriggerSql = `
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
`;

const createTriggerSql = `
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
`;

async function main() {
  console.log('Connecting to database and deploying trigger elements sequentially...');
  try {
    console.log('1/3 Creating public.handle_new_user function...');
    await prisma.$executeRawUnsafe(createFunctionSql);
    
    console.log('2/3 Dropping existing trigger if it exists...');
    await prisma.$executeRawUnsafe(dropTriggerSql);
    
    console.log('3/3 Binding trigger to auth.users table...');
    await prisma.$executeRawUnsafe(createTriggerSql);

    console.log('✅ Successfully installed auth.users triggers and handle_new_user functions!');
  } catch (error) {
    console.error('❌ Failed to deploy database trigger:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

