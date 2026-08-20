import pg from 'pg';

const urls = [
  'postgresql://postgres:MySecurePass123%23@aws-0-us-east-1.pooler.supabase.com:6543/postgres?options=reference%3Dmuisvsqoimlcjvqycomi',
  'postgresql://postgres:MySecurePass123%23@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?options=reference%3Dmuisvsqoimlcjvqycomi',
];

for (const url of urls) {
  console.log('\nTrying:', url.substring(0, 90) + '...');
  try {
    const client = new pg.Client({ connectionString: url, connectionTimeoutMillis: 15000 });
    await client.connect();
    const res = await client.query('SELECT 1 as test');
    console.log('SUCCESS:', res.rows);
    await client.end();
  } catch (e) {
    console.log('FAILED:', e.message);
  }
}
