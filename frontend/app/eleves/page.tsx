"use client";
import { useState } from "react";
import DashboardLayout from "../dashboard/DashboardLayout";

export default function ElevesPage() {
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ prenom, nom });
    // Ici tu feras ton POST vers ton API
  };

  return (
    <DashboardLayout>
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h1 className="text-2xl font-bold mb-4">Gestion des élèves</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Prénom"
          value={prenom}
          onChange={(e) => setPrenom(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Nom"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Enregistrer
        </button>
      </form>
    </div>
    </DashboardLayout>
  );
}