"use client";

import { MenuIcon, XIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion } from "motion/react";
import { navlinks } from "@/data/navlinks";
import { INavLink } from "@/types";
import { useSession, signOut } from "next-auth/react";
import AuthModal from "./AuthModal";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [authModal, setAuthModal] = useState<{
        isOpen: boolean;
        mode: "login" | "register";
    }>({
        isOpen: false,
        mode: "login",
    });
    const { data: session } = useSession();

    return (
        <>
            <motion.nav className="fixed top-0 z-50 flex items-center justify-between w-full py-4 px-6 md:px-16 lg:px-24 xl:px-32 backdrop-blur"
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 250, damping: 70, mass: 1 }}
            >
                <div className="text-xl font-bold text-blue-500">
                    Sinónimos en Contexto
                </div>

                {/* Botones de autenticación */}
                <div className="flex items-center gap-4">
                    {session ? (
                        <>
                            <span className="text-slate-300 text-sm md:text-base">
                                {session.user?.name}
                            </span>
                            <Link
                                href="/leaderboard"
                                className="px-4 md:px-6 py-2 md:py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all rounded-full text-sm md:text-base"
                            >
                                Jugar
                            </Link>
                            <button
                                onClick={() => signOut({ redirectTo: "/" })}
                                className="px-4 md:px-6 py-2 md:py-2.5 bg-red-600 hover:bg-red-700 active:scale-95 transition-all rounded-full text-sm md:text-base"
                            >
                                Cerrar Sesión
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => setAuthModal({ isOpen: true, mode: "login" })}
                                className="px-4 py-2 text-slate-300 hover:text-white transition text-sm md:text-base"
                            >
                                Ingresar
                            </button>
                            
                            <Link
                                href="#jugar"
                                className="hidden md:block px-4 md:px-6 py-2 md:py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all rounded-full text-sm md:text-base"
                            >
                                Jugar ahora
                            </Link>
                        </>
                    )}
                </div>
            </motion.nav>

            {/* Modal de autenticación */}
            <AuthModal
                isOpen={authModal.isOpen}
                onClose={() => setAuthModal({ isOpen: false, mode: "login" })}
                mode={authModal.mode}
            />
        </>
    );
}