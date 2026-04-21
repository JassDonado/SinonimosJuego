"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "./LoadingSpinner";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "login" | "register";
}

export default function AuthModal({ isOpen, onClose, mode: initialMode }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const normalizedEmail = email.toLowerCase().trim();

      if (mode === "register") {
        // Registrar nuevo usuario
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: normalizedEmail,
            username,
            password,
            confirmPassword,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Error en el registro");
          return;
        }

        // Después de registrarse, hacer login automático
        const loginRes = await signIn("credentials", {
          email: normalizedEmail,
          password,
          redirect: false,
        });

        if (loginRes?.error) {
          setError("Error al iniciar sesión después del registro");
          return;
        }

        setError("");
        onClose();
        router.push("/leaderboard");
      } else {
        // Login
        const result = await signIn("credentials", {
          email: normalizedEmail,
          password,
          redirect: false,
        });

        if (result?.error) {
          setError("Email o contraseña incorrectos");
          return;
        }

        setError("");
        onClose();
        router.push("/leaderboard");
      }
    } catch (err) {
      setError("Ocurrió un error. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-md border border-blue-500/30 relative">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
        >
          ✕
        </button>

        <div className="p-6">
          {loading ? (
            <LoadingSpinner />
          ) : (
            <>
              <h2 className="text-2xl font-bold text-white mb-6">
                {mode === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
              </h2>

              {error && (
                <div className="bg-red-500/10 border border-red-500 rounded-lg p-3 mb-4">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
                placeholder="tu@email.com"
              />
            </div>

            {mode === "register" && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Usuario
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
                  placeholder="Tu nombre de usuario"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
                placeholder="••••••"
              />
            </div>

            {mode === "register" && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Confirmar Contraseña
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
                  placeholder="••••••"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 text-white font-semibold rounded-lg transition"
            >
              {loading
                ? "Cargando..."
                : mode === "login"
                ? "Iniciar Sesión"
                : "Crear Cuenta"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm mb-2">
              {mode === "login"
                ? "¿No tienes cuenta?"
                : "¿Ya tienes cuenta?"}
            </p>
            <button
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              className="text-blue-400 hover:text-blue-300 font-semibold transition"
            >
              {mode === "login" ? "Crear cuenta" : "Iniciar sesión"}
            </button>
          </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
