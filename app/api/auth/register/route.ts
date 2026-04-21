import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import { Pool } from "pg";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? true : { rejectUnauthorized: false },
  });

  try {
    const { email, username, password, confirmPassword } = await request.json();

    // Normalizar email y username
    const normalizedEmail = email?.toLowerCase().trim();
    const normalizedUsername = username?.trim();

    // Validaciones
    if (!normalizedEmail || !normalizedUsername || !password || !confirmPassword) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos" },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Las contraseñas no coinciden" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    // Verificar si el usuario ya existe
    const existingUserQuery = `
      SELECT id, email, username FROM users 
      WHERE email = $1 OR username = $2
      LIMIT 1
    `;

    const existingUserResult = await pool.query(existingUserQuery, [
      normalizedEmail,
      normalizedUsername,
    ]);

    if (existingUserResult.rows.length > 0) {
      const existingUser = existingUserResult.rows[0];
      if (existingUser.email === normalizedEmail) {
        return NextResponse.json(
          { error: "El email ya está registrado" },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: "El usuario ya existe" },
        { status: 400 }
      );
    }

    // Hashear contraseña
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Crear usuario con ID generado
    const userId = uuidv4();
    const createUserQuery = `
      INSERT INTO users (id, email, username, password, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING id, email, username, "createdAt"
    `;

    const createUserResult = await pool.query(createUserQuery, [
      userId,
      normalizedEmail,
      normalizedUsername,
      hashedPassword,
    ]);

    const user = createUserResult.rows[0];

    return NextResponse.json(
      {
        success: true,
        message: "Usuario registrado exitosamente",
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error en registro:", error);
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      { error: `Error al registrar: ${errorMessage}` },
      { status: 500 }
    );
  } finally {
    await pool.end();
  }
}
