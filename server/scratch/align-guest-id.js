import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Aligning Guest User ID...');
    const result = await prisma.user.updateMany({
      where: {
        email: "guest@dailytm.app"
      },
      data: {
        externalId: "cm1234567890guest"
      }
    });

    console.log(`Success! Updated ${result.count} records.`);
    
    const updatedUser = await prisma.user.findUnique({
      where: { email: "guest@dailytm.app" }
    });
    console.log('Current Guest User record:', JSON.stringify(updatedUser, null, 2));
    
  } catch (e) {
    console.error('Migration failed:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
