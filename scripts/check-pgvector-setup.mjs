import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ext = await prisma.$queryRawUnsafe(
  `SELECT extname, extversion FROM pg_extension WHERE extname = 'vector'`
);
console.log('pgvector extension:', ext);

const cols = await prisma.$queryRawUnsafe(`
  SELECT column_name, data_type FROM information_schema.columns
  WHERE table_name = 'article_chunks' ORDER BY ordinal_position
`);
console.log('article_chunks columns:', cols);

await prisma.$disconnect();
