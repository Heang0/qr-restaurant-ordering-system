const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:9WqBad7Upfd3rzvW@db.dyeyxdhxcomisuzairnd.supabase.co:5432/postgres'
});

async function run() {
  try {
    await client.connect();
    console.log("Connected to PostgreSQL!");
    
    // Add bill_requested column to tables
    const res1 = await client.query(`
      ALTER TABLE tables 
      ADD COLUMN IF NOT EXISTS bill_requested boolean DEFAULT false;
    `);
    console.log("Added bill_requested column.");
    
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.end();
  }
}

run();
