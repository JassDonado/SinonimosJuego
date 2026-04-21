import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

export async function GET(request: NextRequest) {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? true : { rejectUnauthorized: false },
  });

  try {
    const query = `
      SELECT u.id, u.username, u.email, COALESCE(SUM(s.points), 0) as "totalPoints", COUNT(s.id) as "gamesPlayed"
      FROM users u
      LEFT JOIN scores s ON u.id = s."userId"
      GROUP BY u.id, u.username, u.email
      ORDER BY COALESCE(SUM(s.points), 0) DESC
      LIMIT 5
    `;

    const result = await pool.query(query);

    const leaderboard = result.rows.map((entry: any, index: number) => ({
      position: index + 1,
      user: {
        id: entry.id,
        username: entry.username,
        email: entry.email,
      },
      totalPoints: parseInt(entry.totalPoints || 0),
      gamesPlayed: parseInt(entry.gamesPlayed || 0),
    }));

    return NextResponse.json({ leaderboard }, { status: 200 });
  } catch (error) {
    console.error("Error obteniendo leaderboard:", error);
    return NextResponse.json(
      { error: "Error al obtener el leaderboard" },
      { status: 500 }
    );
  } finally {
    await pool.end();
  }
}


