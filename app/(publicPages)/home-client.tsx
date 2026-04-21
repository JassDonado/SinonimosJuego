"use client";

import { useEffect, useState } from "react";
import FeaturesSection from "@/sections/FeaturesSection";
import HeroSection from "@/sections/HeroSection";
import JuegoSinonimos from "@/sections/JuegoSinonimos";
import LeaderboardComponent from "@/components/LeaderboardComponent";
import { useSession } from "next-auth/react";

export default function HomePage() {
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      {/* Contenido principal */}
      <HeroSection />
      <FeaturesSection />

      {/* Mostrar juego y leaderboard solo si NO está logueado */}
      {!session ? (
        <>
          <JuegoSinonimos />
          {/* Leaderboard visible solo para usuarios no logueados */}
          <section className="py-20 px-4 bg-slate-900/50">
            <div className="max-w-7xl mx-auto">
              <LeaderboardComponent showFullDetail={false} />
            </div>
          </section>
        </>
      ) : null}
    </>
  );
}
