"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // On récupère l'URL depuis le .env.local
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Extrait du handleSubmit dans app/login/page.tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setErrorMsg('');
  setIsLoading(true);

  try {
    // Note: Utilise /api/login/ car c'est le préfixe dans ton urls.py global
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (res.ok) {
      // 1. On stocke les tokens pour les futurs appels API
      localStorage.setItem('token', data.access);
      localStorage.setItem('refresh', data.refresh);
      
      // 2. On stocke les infos utilisateur pour le Dashboard
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // 3. On redirige
      router.push('/dashboard');
    } else {
      // On utilise le message d'erreur précis venant de Django
      setErrorMsg(data.error || 'Identifiants incorrects ou compte inactif.');
    }
  } catch (err) {
    setErrorMsg('Erreur de communication avec le serveur (CORS ou Serveur éteint).');
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 p-4">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-extrabold text-blue-600">ECO2</h1>
            <p className="text-slate-500 mt-2 font-medium">Gestion Scolaire Intégrée</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Nom d'utilisateur
              </label>
              <input 
                type="text" 
                required
                placeholder="Ex: admin_ecorys"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                onChange={(e) => setFormData({...formData, username: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Mot de passe
              </label>
              <input 
                type="password" 
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg text-center animate-pulse">
                {errorMsg}
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-xl font-bold text-white transition-all ${
                isLoading 
                ? 'bg-slate-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-lg shadow-blue-200'
              }`}
            >
              {isLoading ? 'Connexion en cours...' : 'Se connecter'}
            </button>
          </form>
        </div>
        
        <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
          <p className="text-xs text-slate-400">
            &copy; 2026 ECO2 System - Tous droits réservés.
          </p>
        </div>
      </div>
    </div>
  );
}