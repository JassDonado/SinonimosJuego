import { Poppins } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";
import LenisScroll from "@/components/LenisScroll";

const poppins = Poppins({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-poppins",
});

export const metadata: Metadata = {
    title: "Sinónimos en Contexto",
    description: "Aprende sinónimos jugando",
    icons: {
        icon: "/favicon.ico",
    },
};

export default function RootLayout({ children, }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                <link rel="preload" href="/assets/background-splash.svg" as="image" />
            </head>
            <body>
                <LenisScroll />
                {children}
            </body>
        </html>
    );
}