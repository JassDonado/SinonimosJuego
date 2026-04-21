"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import LoadingSpinner from "./LoadingSpinner";

interface LeaderboardEntry {
  position: number;
  user: {
    id: string;
    username: string;
    email: string;
  };
  totalPoints: number;
  gamesPlayed: number;
}

interface LeaderboardComponentProps {
  showFullDetail?: boolean;
}

export default function LeaderboardComponent({
  showFullDetail = false,
}: LeaderboardComponentProps) {
  const { data: session } = useSession();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userScores, setUserScores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener leaderboard top 5
        const leaderboardResponse = await fetch("/api/leaderboard");
        if (leaderboardResponse.ok) {
          const data = await leaderboardResponse.json();
          setLeaderboard(data.leaderboard);
        }

        // Obtener scores del usuario actual si está logueado
        if (session?.user?.id) {
          const userScoresResponse = await fetch("/api/scores");
          if (userScoresResponse.ok) {
            const data = await userScoresResponse.json();
            setUserScores(data.scores);
          }
        }

        setLoading(false);
      } catch (err) {
        setError("Error al cargar los datos");
        setLoading(false);
      }
    };

    fetchData();
  }, [session?.user?.id]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className={`${showFullDetail ? "" : "max-w-2xl mx-auto"}  space-y-4 sm:space-y-6`}>
      {/* Top 5 Leaderboard */}
      <div className="bg-slate-800 rounded-lg shadow-2xl p-4 sm:p-6 border border-blue-500/30">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">🏆 Top 5 Jugadores</h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500 rounded-lg p-3 sm:p-4 mb-4">
            <p className="text-red-400 text-sm sm:text-base">{error}</p>
          </div>
        )}

        {leaderboard.length === 0 ? (
          <p className="text-slate-400 text-sm sm:text-base">No hay datos todavía</p>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {leaderboard.map((entry) => (
              <div
                key={entry.user.id}
                className={`p-3 sm:p-4 rounded-lg flex items-center justify-between gap-3 ${
                  entry.position === 1
                    ? "bg-yellow-500/10 border border-yellow-500"
                    : entry.position === 2
                    ? "bg-gray-400/10 border border-gray-400"
                    : entry.position === 3
                    ? "bg-orange-500/10 border border-orange-500"
                    : "bg-slate-700/50 border border-slate-600"
                }`}
              >
                <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                  <span className="text-lg sm:text-2xl font-bold text-yellow-400 w-7 sm:w-8 flex-shrink-0">
                    #{entry.position}
                  </span>
                  <div className="min-w-0">
                    <p className="text-white font-semibold text-sm sm:text-base flex items-center gap-2 flex-wrap">
                      <span className="truncate">{entry.user.username}</span>
                      {session?.user?.id === entry.user.id && (
                        <span className="text-xs px-2 py-1 bg-blue-500 rounded flex-shrink-0">
                          Tú
                        </span>
                      )}
                    </p>
                    <p className="text-slate-400 text-xs sm:text-sm">
                      {entry.gamesPlayed} juego{entry.gamesPlayed !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <p className="text-lg sm:text-2xl font-bold text-blue-400 flex-shrink-0">
                  {entry.totalPoints}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Historial de Scores - solo si estás logueado y showFullDetail es true */}
      {showFullDetail && session?.user && userScores.length > 0 && (
        <div className="bg-slate-800 rounded-lg shadow-2xl p-4 sm:p-6 border border-blue-500/30">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Tu Historial</h2>

          <div className="overflow-x-auto -mx-4 sm:-mx-6 px-4 sm:px-6">
            <table className="w-full text-sm sm:text-base">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-2 px-2 sm:px-4 text-slate-400 text-xs sm:text-sm">Puntos</th>
                  <th className="text-left py-2 px-2 sm:px-4 text-slate-400 text-xs sm:text-sm">Sinónimos</th>
                  <th className="text-left py-2 px-2 sm:px-4 text-slate-400 text-xs sm:text-sm">Tiempo</th>
                  <th className="text-left py-2 px-2 sm:px-4 text-slate-400 text-xs sm:text-sm">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {userScores.map((score) => (
                  <tr key={score.id} className="border-b border-slate-700 hover:bg-slate-700/30">
                    <td className="py-2 px-2 sm:px-4 text-white text-xs sm:text-base">{score.points}</td>
                    <td className="py-2 px-2 sm:px-4 text-white text-xs sm:text-base">{score.sinonimosAcertados}</td>
                    <td className="py-2 px-2 sm:px-4 text-white text-xs sm:text-base">{score.tiempoJuego}s</td>
                    <td className="py-2 px-4 text-slate-400">
                      {new Date(score.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
