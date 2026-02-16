const fs = require('fs');
const crypto = require('crypto');
const { PrismaClient } = require('../src/generated/prisma');
const p = new PrismaClient();

(async () => {
  try {
    const name = '20260216143000_add-nft-onchain-fields';
    const sql = fs.readFileSync(`./prisma/migrations/${name}/migration.sql`, 'utf8');
    const checksum = crypto.createHash('sha256').update(sql).digest('hex');
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const applied_steps_count = 1;

    const insertSql = `INSERT INTO _prisma_migrations(id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES ('${id}', '${checksum}', '${now}', '${name}', '', NULL, '${now}', ${applied_steps_count});`;
    console.log('inserting migration record for', name);
    await p.$executeRawUnsafe(insertSql);
    console.log('insert complete');
  } catch (e) {
    console.error('err', e && e.message ? e.message : e);
    process.exitCode = 2;
  } finally {
    try { await p.$disconnect(); } catch {};
  }
})();