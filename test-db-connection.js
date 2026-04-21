require("dotenv").config({ path: ".env.local" });
const { PrismaClient } = require("@prisma/client");

console.log("DATABASE_URL cargada:", process.env.DATABASE_URL ? "✅ Sí" : "❌ No");

const prisma = new PrismaClient();

async function test() {
  try {
    console.log("🔍 Probando conexión a Supabase...");
    
    // Test simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log("✅ Conexión exitosa:", result);
    
    // Count users
    const userCount = await prisma.user.count();
    console.log("✅ Total usuarios en DB:", userCount);
    
    // List all users
    const users = await prisma.user.findMany();
    console.log("✅ Usuarios:", users);
    
  } catch (error) {
    console.error("❌ Error de conexión:", error.message);
    console.error("Detalles completos:", error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
