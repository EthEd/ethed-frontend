const { PrismaClient } = require('../src/generated/prisma');
const p = new PrismaClient();

(async () => {
  try {
    const res = await Promise.race([
      p.$queryRawUnsafe('SELECT 1 as ok'),
      new Promise((_, r) => setTimeout(() => r(new Error('timeout')), 10000)),
    ]);
    console.log('ok', res);
  } catch (e) {
    console.error('err', e && e.message ? e.message : e);
    process.exitCode = 2;
  } finally {
    try { await p.$disconnect(); } catch {};
  }
})();
