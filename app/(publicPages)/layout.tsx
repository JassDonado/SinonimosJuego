
import Navbar from "@/components/Navbar";
import React from "react";

export const metadata = {
    title: "Juguemos con Sinónimos",
    description: "Una aplicación para aprender sinónimos de manera divertida y contextualizada. Mejora tu vocabulario mientras juegas y compites con tus amigos.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Navbar />
            {children}
           
        </>
    );
}