"use client";

import { useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import LeaderboardComponent from "@/components/LeaderboardComponent";
import JuegoSinonimos from "@/sections/JuegoSinonimos";

export default function LeaderboardPage() {
  const { data: session } = useSession();
  const gameRef = useRef<HTMLDivElement>(null);

  const scrollToGame = () => {
    gameRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">🏆 Leaderboard</h1>
          <div className="flex gap-4">
            <Link
              href="/"
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
            >
              Volver
            </Link>
            {session && (
              <>
                <button
                  onClick={scrollToGame}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                >
                  Jugar
                </button>
                <button
                  onClick={() => signOut({ redirectTo: "/" })}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                >
                  Cerrar Sesión
                </button>
              </>
            )}
          </div>
        </div>

        {/* Información del usuario si está logueado */}
        {session && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-800 rounded-lg p-4 border border-blue-500/30">
              <p className="text-slate-400 text-sm mb-1">Usuario</p>
              <p className="text-white font-semibold">{session.user?.name}</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-4 border border-blue-500/30">
              <p className="text-slate-400 text-sm mb-1">Email</p>
              <p className="text-white font-semibold text-sm">{session.user?.email}</p>
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <LeaderboardComponent showFullDetail={!!session} />

        {/* Sección del juego */}
        {session && (
          <div ref={gameRef} className="mt-12">
            <JuegoSinonimos />
          </div>
        )}
      </div>
    </div>
  );
}
