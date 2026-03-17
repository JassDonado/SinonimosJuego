'use client'
import { footerData } from "@/data/footer";
import { DribbbleIcon, InstagramIcon, LinkedinIcon, TwitterIcon, YoutubeIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { IFooterLink } from "@/types";

export default function Footer() {
    return (
        <footer className="flex flex-wrap justify-center md:justify-between overflow-hidden gap-10 md:gap-20 mt-40 py-6 px-6 md:px-16 lg:px-24 xl:px-32 text-[13px] text-gray-500">
            
            <motion.div className="flex flex-col max-md:items-center max-md:text-center gap-2 items-end"
                initial={{ x: 150, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 280, damping: 70, mass: 1 }}
            >
                <p className="max-w-60">Paginas del Desarrollador.</p>
                <div className="flex items-center gap-4 mt-3">
                    
                    <a href="" target="_blank" rel="noreferrer">
                        <LinkedinIcon className="size-5 hover:text-pink-500" />
                    </a>
                    <a href="" target="_blank" rel="noreferrer">
                        <InstagramIcon className="size-5 hover:text-pink-500" />
                    </a>
                    
                </div>
                <p className="mt-3 text-center">&copy; {new Date().getFullYear()} <a href=""></a></p>
            </motion.div>
        </footer>
    );
}