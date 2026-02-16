const { PrismaClient } = require('../src/generated/prisma');
const p = new PrismaClient();

(async () => {
  try {
    const t = await p.$queryRawUnsafe(`select table_name from information_schema.tables where table_schema='public' and table_name ilike '%nft%'`);
    console.log('matched nft tables:', t);
    const cols = await p.$queryRawUnsafe(`select column_name,data_type from information_schema.columns where table_schema='public' and table_name ilike '%nft%' order by ordinal_position`);
    console.log('columns:', cols);
  } catch (e) {
    console.error('err', e && e.message ? e.message : e);
  } finally {
    try { await p.$disconnect(); } catch {};
  }
})();