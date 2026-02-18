"use client";
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from "next/navigation"; // Ajout de usePathname
import DashboardLayout from './DashboardLayout';

export default function DashboardHome() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold text-slate-800">
        Bienvenue, {user?.prenom || 'Utilisateur'} !
      </h1>
      <p className="text-slate-500 mt-2 italic">Connecté en tant que : {user?.role || 'Personnel'}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition cursor-pointer">
          <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider">État du système</p>
          <p className="text-2xl font-bold text-green-500 mt-1">Opérationnel</p>
        </div>
        {/* Tu pourras mettre tes compteurs d'élèves ici après avoir fait les fetchs */}
      </div>
    </DashboardLayout>
  );
}