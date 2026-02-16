const { PrismaClient } = require('../src/generated/prisma');
const p = new PrismaClient();
(async () => {
  try {
    const rows = await p.$queryRawUnsafe('select id,migration_name,finished_at from _prisma_migrations order by finished_at desc');
    console.log('prisma_migrations:', rows);
  } catch (e) {
    console.error('err', e && e.message ? e.message : e);
    process.exitCode = 2;
  } finally {
    try { await p.$disconnect(); } catch {};
  }
})();