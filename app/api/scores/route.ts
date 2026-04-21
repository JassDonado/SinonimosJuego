import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { Pool } from "pg";

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    console.error("No se encontró sesión válida:", { session });
    return NextResponse.json(
      { error: "No autorizado - Sesión inválida" },
      { status: 401 }
    );
  }

  const body = await request.json();
  console.log("Score data recibido:", body);

  const { points, sinonimosAcertados, tiempoJuego } = body;

  if (typeof points !== "number" || points < 0) {
    return NextResponse.json(
      { error: "Puntos inválidos" },
      { status: 400 }
    );
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? true : { rejectUnauthorized: false },
  });

  try {
    console.log("Guardando score para usuario:", session.user.id);

    const query = `
      INSERT INTO scores ("userId", points, "sinonimosAcertados", "tiempoJuego", "createdAt")
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING id, "userId", points, "sinonimosAcertados", "tiempoJuego", "createdAt"
    `;

    const result = await pool.query(query, [
      session.user.id,
      points,
      sinonimosAcertados || 0,
      tiempoJuego || 0,
    ]);

    const score = result.rows[0];
    console.log("Score guardado exitosamente:", score);

    return NextResponse.json(
      {
        success: true,
        message: "Score guardado correctamente",
        score,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error guardando score:", error);
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      { error: `Error al guardar el score: ${errorMessage}` },
      { status: 500 }
    );
  } finally {
    await pool.end();
  }
}

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json(
      { error: "No autorizado" },
      { status: 401 }
    );
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? true : { rejectUnauthorized: false },
  });

  try {
    const query = `
      SELECT id, "userId", points, "sinonimosAcertados", "tiempoJuego", "createdAt"
      FROM scores
      WHERE "userId" = $1
      ORDER BY "createdAt" DESC
      LIMIT 10
    `;

    const result = await pool.query(query, [session.user.id]);
    const scores = result.rows;

    return NextResponse.json({ scores }, { status: 200 });
  } catch (error) {
    console.error("Error obteniendo scores:", error);
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      { error: `Error al obtener scores: ${errorMessage}` },
      { status: 500 }
    );
  } finally {
    await pool.end();
  }
}
