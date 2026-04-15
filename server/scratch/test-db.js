import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

console.log('DATABASE_URL:', process.env.DATABASE_URL);

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$connect();
    console.log('Successfully connected to the database!');
    const result = await prisma.$queryRaw`SELECT 1 as result`;
    console.log('Query result:', result);
  } catch (e) {
    console.error('Connection failed:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
