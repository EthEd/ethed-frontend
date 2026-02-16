const { PrismaClient } = require('../src/generated/prisma');
const p = new PrismaClient();

(async () => {
  try {
    try {
      const migrations = await p.$queryRawUnsafe(`SELECT id, checksum, finished_at, migration_name, logs FROM _prisma_migrations ORDER BY finished_at DESC LIMIT 10`);
      console.log('migrations rows:', migrations);
    } catch (err) {
      console.log('_prisma_migrations not present or query failed —', err && err.message ? err.message : err);
    }

    try {
      const locks = await p.$queryRawUnsafe(`SELECT * FROM pg_locks WHERE NOT granted LIMIT 20`);
      console.log('ungranted pg_locks (sample):', locks);
    } catch (err) {
      console.log('pg_locks query failed —', err && err.message ? err.message : err);
    }

    try {
      const active = await p.$queryRawUnsafe(`SELECT pid, usename, application_name, state, query_start, query FROM pg_stat_activity WHERE state <> 'idle' ORDER BY query_start DESC LIMIT 20`);
      console.log('active pg_stat_activity (sample):', active);
    } catch (err) {
      console.log('pg_stat_activity query failed —', err && err.message ? err.message : err);
    }
  } catch (e) {
    try { await p.$disconnect(); } catch {};
  }
})();
