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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">🏆 Leaderboard</h1>
          <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
            <Link
              href="/"
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm sm:text-base bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition text-center"
            >
              Volver
            </Link>
            {session && (
              <>
                <button
                  onClick={scrollToGame}
                  className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm sm:text-base bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-center"
                >
                  Jugar
                </button>
                <button
                  onClick={() => signOut({ redirectTo: "/" })}
                  className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm sm:text-base bg-red-600 hover:bg-red-700 text-white rounded-lg transition text-center"
                >
                  Cerrar Sesión
                </button>
              </>
            )}
          </div>
        </div>

        {/* Información del usuario si está logueado */}
        {session && (
          <div className="mb-6 sm:mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-slate-800 rounded-lg p-3 sm:p-4 border border-blue-500/30">
              <p className="text-slate-400 text-xs sm:text-sm mb-1">Usuario</p>
              <p className="text-white font-semibold text-sm sm:text-base truncate">{session.user?.name}</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-3 sm:p-4 border border-blue-500/30">
              <p className="text-slate-400 text-xs sm:text-sm mb-1">Email</p>
              <p className="text-white font-semibold text-xs sm:text-sm truncate">{session.user?.email}</p>
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <LeaderboardComponent showFullDetail={!!session} />

        {/* Sección del juego */}
        {session && (
          <div ref={gameRef} className="mt-8 sm:mt-12">
            <JuegoSinonimos />
          </div>
        )}
      </div>
    </div>
  );
}
