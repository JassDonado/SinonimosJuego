require("dotenv").config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL;
console.log("🔍 Intentando conectar a:");
console.log(connectionString);

// Parse URL
const url = new URL(connectionString);
console.log("\n📋 Detalles de la conexión:");
console.log("  Host:", url.hostname);
console.log("  Usuario:", url.username);
console.log("  Puerto:", url.port);
console.log("  Base de datos:", url.pathname);
console.log("  Contraseña:", url.password);

// Try with postgres library directly
const { Client } = require("pg");

const client = new Client({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false }
});

client.connect()
  .then(() => {
    console.log("\n✅ Conexión exitosa!");
    return client.query("SELECT 1 as test");
  })
  .then(result => {
    console.log("✅ Query exitosa:", result.rows);
    return client.end();
  })
  .catch(error => {
    console.error("\n❌ Error:", error.message);
    if (error.code) console.error("Código:", error.code);
  });
