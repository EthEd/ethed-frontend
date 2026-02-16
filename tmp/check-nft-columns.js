const { PrismaClient } = require('../src/generated/prisma');
const p = new PrismaClient();

(async () => {
  try {
    const tables = await p.$queryRawUnsafe(`select table_name from information_schema.tables where table_schema='public'`);
    console.log('tables count=', tables.length, ' —', tables.map(t=>t.table_name).join(', '));

    const nftCols = await p.$queryRawUnsafe(`select column_name, data_type from information_schema.columns where table_name='nft' order by ordinal_position`);
    console.log('nft columns:', nftCols);
  } catch (e) {
    console.error('err', e && e.message ? e.message : e);
    process.exitCode = 2;
  } finally {
    try { await p.$disconnect(); } catch {};
  }
})();