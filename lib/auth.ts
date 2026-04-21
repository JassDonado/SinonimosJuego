import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcryptjs from "bcryptjs";
import { Pool } from "pg";

export const { auth, handlers, signIn, signOut } = NextAuth({
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const pathname = request.nextUrl.pathname;
      const isOnLoginPage = pathname.startsWith("/login");
      const isOnRegisterPage = pathname.startsWith("/register");
      const isOnLeaderboard = pathname.startsWith("/leaderboard");

      if (isOnLeaderboard && !isLoggedIn) {
        return false;
      }

      if ((isOnLoginPage || isOnRegisterPage) && isLoggedIn) {
        return Response.redirect(new URL("/", "http://localhost:3000"));
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("Credenciales incompletas");
          return null;
        }

        const email = (credentials.email as string).toLowerCase().trim();
        const password = credentials.password as string;

        console.log("Intentando login con email:", email);

        const pool = new Pool({
          connectionString: process.env.DATABASE_URL,
          ssl: process.env.NODE_ENV === "production" ? true : { rejectUnauthorized: false },
        });

        try {
          const query = `
            SELECT id, email, username, password FROM users 
            WHERE email = $1
            LIMIT 1
          `;

          const result = await pool.query(query, [email]);

          if (result.rows.length === 0) {
            console.log("Usuario no encontrado:", email);
            return null;
          }

          const user = result.rows[0];
          console.log("Usuario encontrado, verificando contraseña...");

          const isPasswordValid = await bcryptjs.compare(password, user.password);

          if (!isPasswordValid) {
            console.log("Contraseña inválida para:", email);
            return null;
          }

          console.log("Login exitoso para:", email);

          return {
            id: user.id,
            email: user.email,
            name: user.username,
          };
        } catch (error) {
          console.error("Error en authorize:", error);
          return null;
        } finally {
          await pool.end();
        }
      },
    }),
  ],
});
