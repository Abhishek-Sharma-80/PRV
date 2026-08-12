'use strict';

const db = require('../lib/db');

async function main() {
  console.log('Initializing database schema and sample data...');
  try {
    const res = await db.query('SELECT COUNT(*) as count FROM client_enquiries');
    console.log(`Database connected successfully! Total client enquiries count: ${res.rows[0]?.count || 0}`);
    process.exit(0);
  } catch (err) {
    console.error('Database initialization failed:', err);
    process.exit(1);
  }
}

main();
