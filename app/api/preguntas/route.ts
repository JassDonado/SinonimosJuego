import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const dificultad = searchParams.get("dificultad") || "facil";

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? true : { rejectUnauthorized: false },
  });

  try {
    // Mapear dificultad del frontend a la BD
    const dificultadMap: Record<string, string> = {
      facil: "facil",
      medio: "media",
      dificil: "dificil",
    };

    const difficultyInDb = dificultadMap[dificultad] || "facil";

    // Obtener todas las palabras con la dificultad especificada, mezcladas aleatoriamente
    const query = `
      SELECT id, palabra, sinonimos
      FROM sinonimos
      WHERE dificultad = $1
      ORDER BY RANDOM()
    `;

    const result = await pool.query(query, [difficultyInDb]);

    // Convertir el resultado al formato esperado por el frontend
    // sinonimos es un array de texto (text[]), así que ya está en el formato correcto
    const preguntas = result.rows.map((row: any) => ({
      palabra: row.palabra,
      respuestas: Array.isArray(row.sinonimos) ? row.sinonimos : [],
    }));

    return NextResponse.json({ preguntas, total: preguntas.length }, { status: 200 });
  } catch (error) {
    console.error("Error obteniendo preguntas:", error);
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      { error: `Error al obtener preguntas: ${errorMessage}` },
      { status: 500 }
    );
  } finally {
    await pool.end();
  }
}
