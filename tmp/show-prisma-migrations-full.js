const { PrismaClient } = require('../src/generated/prisma');
const p = new PrismaClient();
(async () => {
  try {
    const rows = await p.$queryRawUnsafe('select * from _prisma_migrations');
    console.log(JSON.stringify(rows, null, 2));
  } catch (e) {
    console.error('err', e && e.message ? e.message : e);
    process.exitCode = 2;
  } finally {
    try { await p.$disconnect(); } catch {};
  }
})();