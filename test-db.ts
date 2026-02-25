import * as dotenv from 'dotenv';
dotenv.config();

import { prisma } from './src/lib/prisma-client';

async function main() {
  try {
    console.log('Testing connection with URL:', process.env.DATABASE_URL?.split('@')[1]);
    const result = await (prisma as any).$queryRaw`SELECT 1 as connected`;
    console.log('Connected successfully:', result);
    
    console.log('Checking columns for User table...');
    const columns = await (prisma as any).$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'User';
    `;
    console.log('Columns in User table:', columns);
  } catch (error) {
    console.error('Connection failed:', error);
  } finally {
    // Note: In Next.js we usually don't disconnect manually in a singleton
    // but for a standalone script it's okay if it was the base client.
    // However, our prisma export is an extended client.
  }
}

main();
