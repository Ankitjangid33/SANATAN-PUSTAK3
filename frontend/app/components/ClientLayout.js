"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function ClientLayout({ children }) {
    const pathname = usePathname();
    // Check if the current path is the admin page or any of its children
    const isAdminSection = pathname.startsWith("/arya-super-admin");

    return (
        <>
            {!isAdminSection && <Navbar />}
            <main className={isAdminSection ? "" : "main-content"}>{children}</main>
            {!isAdminSection && <Footer />}
        </>
    );
}
