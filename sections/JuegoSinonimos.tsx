"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { ChevronRightIcon, CheckIcon, RefreshCwIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Pregunta = {
  palabra: string;
  respuestas: string[];
};

function normalizarTexto(texto: string) {
  return texto
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function mezclarPreguntas(array: Pregunta[]) {
  return [...array].sort(() => Math.random() - 0.5);
}

async function obtenerPreguntasAleatorias(dificultad: "facil" | "medio" | "dificil" = "facil") {
  try {
    const res = await fetch(`/api/preguntas?dificultad=${dificultad}`);
    const data = await res.json();
    
    if (!res.ok || !data.preguntas) {
      console.error("Error obteniendo preguntas:", data.error);
      return [];
    }

    const cantidades = {
      facil: 5,
      medio: 8,
      dificil: 12,
    };

    return mezclarPreguntas(data.preguntas).slice(0, cantidades[dificultad]);
  } catch (error) {
    console.error("Error en obtenerPreguntasAleatorias:", error);
    return [];
  }
}

export default function JuegoSinonimos() {
  const { data: session } = useSession();
  const router = useRouter();
  const [preguntasPendientes, setPreguntasPendientes] = useState<Pregunta[]>([]);
  const [totalPreguntas, setTotalPreguntas] = useState(0);
  const [respuesta, setRespuesta] = useState("");
  const [puntaje, setPuntaje] = useState(0);
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState<"ok" | "error" | "skip" | "">("");
  const [terminado, setTerminado] = useState(false);
  const [cargado, setCargado] = useState(false);
  const [bloqueado, setBloqueado] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [tiempoInicio, setTiempoInicio] = useState<number>(0);
  const [dificultad, setDificultad] = useState<"facil" | "medio" | "dificil" | null>(null);
  const [juegoEnProceso, setJuegoEnProceso] = useState(false);
  const [cargandoPreguntas, setCargandoPreguntas] = useState(false);
  const [scoreGuardadoTemporalmente, setScoreGuardadoTemporalmente] = useState(false);
  const [scoreGuardadoEnBD, setScoreGuardadoEnBD] = useState(false);

  // Guard ref para prevenir sincronización duplicada en Strict Mode
  const yaSeIntentoSincronizar = useRef(false);

  const iniciarJuego = async (dificultadSeleccionada: "facil" | "medio" | "dificil") => {
    setCargandoPreguntas(true);
    const seleccionadas = await obtenerPreguntasAleatorias(dificultadSeleccionada);
    setCargandoPreguntas(false);

    if (seleccionadas.length === 0) {
      setMensaje("Error al cargar las preguntas. Intenta de nuevo.");
      setTipoMensaje("error");
      return;
    }

    setPreguntasPendientes(seleccionadas);
    setTotalPreguntas(seleccionadas.length);
    setRespuesta("");
    setPuntaje(0);
    setMensaje("");
    setTipoMensaje("");
    setTerminado(false);
    setBloqueado(false);
    setCargado(true);
    setJuegoEnProceso(true);
    setDificultad(dificultadSeleccionada);
    setTiempoInicio(Date.now());
  };

  const preguntasCorrectas = totalPreguntas - preguntasPendientes.length;

  const progreso = useMemo(() => {
    if (totalPreguntas === 0) return 0;
    return (preguntasCorrectas / totalPreguntas) * 100;
  }, [preguntasCorrectas, totalPreguntas]);

  const preguntaActual = preguntasPendientes[0];

  const avanzarTrasCorrecta = () => {
    setBloqueado(true);

    setTimeout(() => {
      setPreguntasPendientes((prev) => {
        const nuevas = prev.slice(1);
        if (nuevas.length === 0) {
          setTerminado(true);
        }
        return nuevas;
      });

      setRespuesta("");
      setMensaje("");
      setTipoMensaje("");
      setBloqueado(false);
    }, 1200);
  };

  const moverActualAlFinal = (conPenalizacion: boolean = false) => {
    setBloqueado(true);

    setTimeout(() => {
      setPreguntasPendientes((prev) => {
        if (prev.length <= 1) return prev;
        const [actual, ...resto] = prev;
        return [...resto, actual];
      });

      // Aplicar penalización por respuesta incorrecta
      if (conPenalizacion) {
        setPuntaje((prev) => Math.max(0, prev - 1));
      }

      setRespuesta("");
      setMensaje("");
      setTipoMensaje("");
      setBloqueado(false);
    }, 1200);
  };

  const verificarRespuesta = () => {
    if (bloqueado || !preguntaActual) return;

    if (!respuesta.trim()) {
      setMensaje("Escribe la palabra correcta antes de verificar.");
      setTipoMensaje("error");
      return;
    }

    const valorUsuario = normalizarTexto(respuesta);
    const respuestasValidas = preguntaActual.respuestas.map(normalizarTexto);

    if (respuestasValidas.includes(valorUsuario)) {
      setPuntaje((prev) => prev + 1);
      setMensaje("¡Palabra correcta! Ganaste un punto.");
      setTipoMensaje("ok");
      avanzarTrasCorrecta();
    } else {
      if (preguntasPendientes.length === 1) {
        setMensaje("No es correcto. Inténtalo de nuevo con esta misma palabra.");
        setTipoMensaje("error");
        setRespuesta("");
        return;
      }

      setMensaje("No es correcto. Pierdes 1 punto y verás otra palabra.");
      setTipoMensaje("error");
      moverActualAlFinal(true); // true = aplicar penalización
    }
  };

  const pasarPregunta = () => {
    setMensaje("No puedes pasar palabras. ¡Debes responder correctamente!");
    setTipoMensaje("error");
  };

  const guardarScore = async () => {
    // Prevenir guardar dos veces
    if (scoreGuardadoTemporalmente && !session?.user?.id) {
      setMensaje("Score ya fue guardado. Inicia sesión para sincronizarlo.");
      setTipoMensaje("ok");
      return;
    }

    // Prevenir guardar dos veces en BD
    if (scoreGuardadoEnBD && session?.user?.id) {
      setMensaje("Score ya fue guardado.");
      setTipoMensaje("ok");
      return;
    }

    setGuardando(true);
    const tiempoTranscurrido = Math.floor((Date.now() - tiempoInicio) / 1000);

    const scoreData = {
      points: puntaje,
      sinonimosAcertados: puntaje,
      tiempoJuego: tiempoTranscurrido,
      dificultad: dificultad,
    };

    // Si no hay sesión, guardar en localStorage para sincronizar después
    if (!session?.user?.id) {
      try {
        localStorage.setItem("scoreEnPendiente", JSON.stringify(scoreData));
        console.log("✅ Score guardado en localStorage:", scoreData);
        setScoreGuardadoTemporalmente(true);
        setMensaje("Puntuación guardada temporalmente. Inicia sesión para sincronizarla. 📝");
        setTipoMensaje("ok");
      } catch (error) {
        console.error("❌ Error guardando en localStorage:", error);
        setMensaje("Error al guardar puntuación temporalmente");
        setTipoMensaje("error");
      }
      setGuardando(false);
      return;
    }

    // Si hay sesión, guardar directamente en BD
    try {
      const response = await fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scoreData),
      });

      if (response.ok) {
        console.log("✅ Score guardado en BD:", scoreData);
        setScoreGuardadoEnBD(true);
        setMensaje("¡Score guardado correctamente! ✅");
        setTipoMensaje("ok");
        // Limpiar localStorage si existe
        localStorage.removeItem("scoreEnPendiente");
      } else {
        console.error("❌ Error en respuesta de BD:", response.statusText);
        setMensaje("Error al guardar el score");
        setTipoMensaje("error");
      }
    } catch (error) {
      console.error("❌ Error conectando con servidor:", error);
      setMensaje("Error al conectar con el servidor");
      setTipoMensaje("error");
    } finally {
      setGuardando(false);
    }
  };

  // Efecto para sincronizar score pendiente cuando el usuario inicia sesión
  useEffect(() => {
    const sincronizarScorePendiente = async () => {
      // Guard: Prevenir sincronización duplicada en Strict Mode
      if (yaSeIntentoSincronizar.current) {
        console.log("⚠️ Sincronización ya fue intentada, ignorando");
        return;
      }

      // Solo ejecutar si acaba de loguear (session existe y había localStorage)
      if (session?.user?.id) {
        const scorePendiente = localStorage.getItem("scoreEnPendiente");
        
        console.log("🔍 Verificando localStorage... session:", !!session?.user?.id);
        console.log("🔍 Score pendiente encontrado:", !!scorePendiente);
        
        if (scorePendiente) {
          // Marcar que se intentó sincronizar para evitar duplicados
          yaSeIntentoSincronizar.current = true;

          try {
            const scoreData = JSON.parse(scorePendiente);
            console.log("📤 Sincronizando score:", scoreData);
            
            const response = await fetch("/api/scores", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(scoreData),
            });

            if (response.ok) {
              // Limpiar localStorage después de sincronizar exitosamente
              localStorage.removeItem("scoreEnPendiente");
              // Limpiar también el estado para permitir nuevos guards si es necesario
              setScoreGuardadoTemporalmente(false);
              setScoreGuardadoEnBD(false);
              console.log("✅ Score pendiente sincronizado exitosamente");
            } else {
              console.error("❌ Error en respuesta de sincronización:", response.statusText);
            }
          } catch (error) {
            console.error("❌ Error sincronizando score pendiente:", error);
          }
        }
      }
    };

    sincronizarScorePendiente();
  }, [session?.user?.id]);


  const reiniciarJuego = () => {
    setJuegoEnProceso(false);
    setDificultad(null);
    setCargado(false);
    setScoreGuardadoTemporalmente(false);
    setScoreGuardadoEnBD(false);
    yaSeIntentoSincronizar.current = false;
  };

  // Pantalla de selección de dificultad
  if (!juegoEnProceso) {
    return (
      <section
        id="jugar"
        className="relative flex flex-col items-center justify-center px-4 md:px-16 lg:px-24 xl:px-32 py-16"
      >
        <div className="absolute top-30 -z-10 left-1/4 size-72 bg-blue-600 blur-[300px]"></div>
        <div className="max-w-4xl rounded-2xl border border-blue-900/30 bg-slate-900/50 backdrop-blur p-4 sm:p-6 md:p-8 w-full">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-4">Selecciona el nivel de dificultad</h2>
          <p className="text-sm sm:text-base text-slate-300 mb-6 sm:mb-8">Elige con cuantas palabras quieres practicar:</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Fácil */}
            <button
              onClick={() => iniciarJuego("facil")}
              disabled={cargandoPreguntas}
              className="rounded-xl bg-gradient-to-br from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 active:scale-95 transition-all px-4 py-4 sm:px-5 sm:py-5 md:px-6 md:py-6 font-semibold text-white border border-green-500/30 text-center disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <div className="text-2xl sm:text-3xl mb-2">{cargandoPreguntas ? "⏳" : "🟢"}</div>
              <h3 className="text-lg sm:text-xl font-bold mb-2">Fácil</h3>
              <p className="text-xs sm:text-sm">{cargandoPreguntas ? "Cargando..." : "5 palabras"}</p>
            </button>

            {/* Medio */}
            <button
              onClick={() => iniciarJuego("medio")}
              disabled={cargandoPreguntas}
              className="rounded-xl bg-gradient-to-br from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 active:scale-95 transition-all px-4 py-4 sm:px-5 sm:py-5 md:px-6 md:py-6 font-semibold text-white border border-yellow-500/30 text-center disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <div className="text-2xl sm:text-3xl mb-2">{cargandoPreguntas ? "⏳" : "🟡"}</div>
              <h3 className="text-lg sm:text-xl font-bold mb-2">Medio</h3>
              <p className="text-xs sm:text-sm">{cargandoPreguntas ? "Cargando..." : "8 palabras"}</p>
            </button>

            {/* Difícil */}
            <button
              onClick={() => iniciarJuego("dificil")}
              disabled={cargandoPreguntas}
              className="rounded-xl bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 active:scale-95 transition-all px-4 py-4 sm:px-5 sm:py-5 md:px-6 md:py-6 font-semibold text-white border border-red-500/30 text-center disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <div className="text-2xl sm:text-3xl mb-2">{cargandoPreguntas ? "⏳" : "🔴"}</div>
              <h3 className="text-lg sm:text-xl font-bold mb-2">Difícil</h3>
              <p className="text-xs sm:text-sm">{cargandoPreguntas ? "Cargando..." : "12 palabras"}</p>
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (terminado) {
    return (
      <section
        id="jugar"
        className="relative flex flex-col items-center justify-center px-4 md:px-16 lg:px-24 xl:px-32 py-16"
      >
        <div className="absolute top-30 -z-10 left-1/4 size-72 bg-blue-600 blur-[300px]"></div>
        <div className="max-w-3xl rounded-2xl border border-blue-900/30 bg-slate-900/50 backdrop-blur p-4 sm:p-6 md:p-8 w-full">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white">¡Juego terminado!</h2>

          <p className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-slate-200">Has concluido con la clase de sinónimos.</p>

          <div className="mt-4 inline-flex rounded-2xl bg-blue-900/40 backdrop-blur px-4 sm:px-5 md:px-6 py-3 sm:py-4 text-xl sm:text-2xl md:text-3xl font-extrabold text-blue-300 border border-blue-500/30">
            {puntaje} / {totalPreguntas}
          </div>

          <p className="mt-6 text-lg text-slate-300">Excelente. Respondiste correctamente todas las palabras.</p>

          {session ? (
            <div className="mt-8 flex flex-wrap gap-4">
              <button
                onClick={guardarScore}
                disabled={guardando}
                className="flex items-center gap-2 rounded-xl bg-green-600 hover:bg-green-700 active:scale-95 transition-all px-5 py-3 font-semibold text-white disabled:opacity-60"
              >
                <CheckIcon size={18} />
                {guardando ? "Guardando..." : "Guardar Score"}
              </button>
              <button
                onClick={reiniciarJuego}
                className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all px-5 py-3 font-semibold text-white"
              >
                <RefreshCwIcon size={18} />
                Juguemos de nuevo
              </button>
              <Link
                href="/leaderboard"
                className="flex items-center gap-2 rounded-xl bg-slate-700 hover:bg-slate-600 active:scale-95 transition-all px-5 py-3 font-semibold text-white"
              >
                🏆 Ver Leaderboard
              </Link>
            </div>
          ) : (
            <div className="mt-8 flex flex-col gap-4">
              <button
                onClick={guardarScore}
                disabled={guardando || scoreGuardadoTemporalmente}
                className="flex items-center justify-center gap-2 rounded-xl bg-green-600 hover:bg-green-700 active:scale-95 transition-all px-5 py-3 font-semibold text-white disabled:opacity-60 disabled:cursor-not-allowed w-full"
              >
                <CheckIcon size={18} />
                {scoreGuardadoTemporalmente ? "✓ Guardado" : guardando ? "Guardando..." : "Guardar Score Temporalmente"}
              </button>
              <p className="text-slate-300 text-center">Inicia sesión para sincronizar tu puntuación</p>
              <button
                onClick={() => router.push("/")}
                className="inline-block rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all px-5 py-3 font-semibold text-white text-center w-full"
              >
                Ir a Iniciar Sesión
              </button>
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <section
      id="jugar"
      className="relative flex flex-col items-center justify-center px-4 md:px-16 lg:px-24 xl:px-32 py-16"
    >
      <div className="absolute top-30 -z-10 left-1/4 size-72 bg-blue-600 blur-[300px]"></div>

      <div className="max-w-4xl rounded-2xl border border-blue-900/30 bg-slate-900/50 backdrop-blur p-4 sm:p-6 md:p-8 w-full">
        <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white">Juguemos con sinónimos</h2>

          <div className="rounded-2xl bg-blue-900/40 backdrop-blur px-3 sm:px-4 py-2 text-base sm:text-lg font-bold text-blue-300 border border-blue-500/30 w-fit">
            Puntaje: {puntaje}
          </div>
        </div>

        <div className="mt-4 sm:mt-6">
          <div className="mb-2 flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-300">
            <span>Completadas {preguntasCorrectas} de {totalPreguntas}</span>
            <span>{Math.round(progreso)}%</span>
          </div>

          <div className="h-3 sm:h-4 w-full overflow-hidden rounded-full bg-slate-700/50">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500 ease-in-out"
              style={{ width: `${progreso}%` }}
            />
          </div>
        </div>

        <div className="mt-6 sm:mt-10">
          <p className="text-base sm:text-lg font-semibold text-slate-300">Escribamos el sinónimo de:</p>

          <h3 className="mt-2 sm:mt-3 text-3xl sm:text-4xl md:text-5xl font-extrabold bg-linear-to-r from-blue-400 to-blue-300 text-transparent bg-clip-text">
            {preguntaActual?.palabra}
          </h3>

          <div className="mt-6 sm:mt-8">
            <input
              type="text"
              value={respuesta}
              onChange={(e) => setRespuesta(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && verificarRespuesta()}
              placeholder="Escribe tu respuesta aquí"
              disabled={bloqueado}
              className="w-full rounded-xl border border-blue-900/30 bg-slate-800/50 backdrop-blur px-4 sm:px-5 py-3 sm:py-4 text-base sm:text-lg text-white outline-none transition placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 disabled:opacity-60"
            />
          </div>

          <div className="mt-4 sm:mt-6 flex flex-wrap gap-3 sm:gap-4">
            <button
              onClick={verificarRespuesta}
              disabled={bloqueado}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all px-4 sm:px-5 md:px-6 py-2 sm:py-3 font-semibold text-sm sm:text-base text-white disabled:opacity-60"
            >
              Verificar
            </button>

          </div>

          {mensaje && (
            <div
              className={`mt-4 sm:mt-6 rounded-xl px-4 sm:px-5 py-3 sm:py-4 text-base sm:text-lg font-semibold backdrop-blur border transition-all ${
                tipoMensaje === "ok"
                  ? "bg-green-500/20 text-green-300 border-green-500/30"
                  : tipoMensaje === "error"
                  ? "bg-red-500/20 text-red-300 border-red-500/30"
                  : "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
              }`}
            >
              <div className="flex items-center gap-2">
                {tipoMensaje === "ok" && <CheckIcon size={18} className="sm:size-20" />}
                <span>{mensaje}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
