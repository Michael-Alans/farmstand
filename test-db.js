const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://postgres.bkpzfvpwkhwreiapfmew:PP8Mi5CDjppeU6wl@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
});

client.connect()
  .then(() => {
    console.log("Successfully connected to Supabase!");
    return client.end();
  })
  .catch((err) => {
    console.error("Connection error:", err.message);
  });