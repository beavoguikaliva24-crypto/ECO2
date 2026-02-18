  "use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation"; // Ajout de usePathname
import Sidebar from '@/components/Sidebar';

  export default function DashboardLayout({ children }: { children: React.ReactNode }) {
     const router = useRouter();
  const pathname = usePathname(); // Récupère l'URL actuelle (ex: "/eleves")
  const [user, setUser] = useState(null);
    
    return (
      <div className="flex h-screen bg-slate-50">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          {/* Topbar pour afficher l'utilisateur */}
          <header className="h-12 bg-white border-b border-slate-200 flex items-center justify-end px-8">
            <div className="flex items-center gap-2">
              <span className="text-slate-600 text-sm font-medium">Connecté :</span>
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                U
              </div>
            </div>
          </header>
          {/* Contenu de la page */}
          <main className="flex-1 overflow-y-auto p-4">
            <div className="max-w-350 mx-auto">
            {children}
            </div>
          </main>
        </div>
      </div>
    );
  }