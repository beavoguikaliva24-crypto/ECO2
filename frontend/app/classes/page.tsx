"use client";

import { useEffect, useState, useCallback } from "react";
import DashboardLayout from "../dashboard/DashboardLayout";
import toast from "react-hot-toast";

interface Classe {
  id: number;
  code_classe: string;
  lib_classe: string;
  niveau_classe: string; // Libellé
  option_classe: string; // Libellé
  niveau_id?: number;    // ID pour l'édition (si ton serializer le permet)
  option_id?: number;    // ID pour l'édition
}

// Remplace tes interfaces actuelles par celles-ci :
interface Niveau { 
  id: number; 
  niveau: string; // C'est le nom dans ton modèle Django
}

interface Option { 
  id: number; 
  option: string; // C'est le nom dans ton modèle Django
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<Classe[]>([]);
  const [niveaux, setNiveaux] = useState<Niveau[]>([]);
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    code_classe: "",
    lib_classe: "",
    niveau_classe: "", // Ici on stockera l'ID pour le POST/PUT
    option_classe: "", // Ici on stockera l'ID pour le POST/PUT
  });
  
  const [editId, setEditId] = useState<number | null>(null);

  // 1. Charger les Classes
  const fetchClasses = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/classes/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setClasses(data);
      }
    } catch (err) {
      console.error("Erreur classes:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Charger Niveaux et Options
  const fetchMetadata = useCallback(async () => {
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };
  try {
    const [resN, resO] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/niveaux/`, { headers }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/options/`, { headers })
    ]);
    
    if (resN.ok) {
      const dataN = await resN.json();
      // Django REST peut renvoyer soit [obj, obj] soit { results: [obj, obj] }
      setNiveaux(Array.isArray(dataN) ? dataN : dataN.results || []);
    }
    if (resO.ok) {
      const dataO = await resO.json();
      setOptions(Array.isArray(dataO) ? dataO : dataO.results || []);
    }
  } catch (err) {
    console.error("Erreur metadata:", err);
  }
}, []);

  useEffect(() => {
  // Test manuel : si ça s'affiche, le problème est bien ton FETCH
  // setNiveaux([{id: 1, lib_niveau: "Test Niveau"}]); 
  fetchClasses();
  fetchMetadata();
}, [fetchClasses, fetchMetadata]);

  // 3. Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    // On prépare l'objet à envoyer. Si niveau/option sont vides, on envoie null
    const payload = {
      ...formData,
      niveau_classe: formData.niveau_classe || null,
      option_classe: formData.option_classe || null,
    };

    try {
      const url = editId
        ? `${process.env.NEXT_PUBLIC_API_URL}/classes/${editId}/`
        : `${process.env.NEXT_PUBLIC_API_URL}/classes/`;

      const res = await fetch(url, {
        method: editId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();

      await fetchClasses();
      resetForm();
      toast.success(editId ? "Modifié !" : "Ajouté !");
    } catch (err) {
      toast.error("Erreur lors de l'enregistrement");
    }
  };

  const resetForm = () => {
    setFormData({ code_classe: "", lib_classe: "", niveau_classe: "", option_classe: "" });
    setEditId(null);
    setShowForm(false);
  };

  const handleEdit = (cls: any) => {
    setFormData({
      code_classe: cls.code_classe,
      lib_classe: cls.lib_classe,
      // On essaie de récupérer l'ID. Si ton serializer renvoie l'ID dans niveau_classe, on le prend
      niveau_classe: cls.niveau_classe_id || "", 
      option_classe: cls.option_classe_id || "",
    });
    setEditId(cls.id);
    setShowForm(true);
  };
  const handleDelete = async (id: number) => {
  if (!confirm("Voulez-vous vraiment supprimer cette classe ?")) return;

  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/classes/${id}/`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      // Option 1: Recharger les données depuis le serveur
      await fetchClasses();
      toast.success("Classe supprimée !");
    } else {
      throw new Error();
    }
  } catch (err) {
    toast.error("Erreur lors de la suppression");
    console.error("Delete error:", err);
  }
};

  return (
    <DashboardLayout>
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800">Gestion des Classes</h2>
          <button
            onClick={() => {
              if(showForm) resetForm();
              else setShowForm(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition"
          >
            {showForm ? "Fermer" : "+ Nouvelle Classe"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-8 p-4 bg-slate-50 rounded-xl flex flex-wrap gap-4 items-end shadow-inner border border-slate-200">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Code</label>
              <input
                type="text"
                value={formData.code_classe}
                onChange={(e) => setFormData({ ...formData, code_classe: e.target.value })}
                className="border border-slate-300 px-3 py-2 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500 h-10"
                required
              />
            </div>

            <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
              <label className="text-xs font-bold text-slate-500 uppercase">Nom de la classe</label>
              <input
                type="text"
                value={formData.lib_classe}
                onChange={(e) => setFormData({ ...formData, lib_classe: e.target.value })}
                className="border border-slate-300 px-3 py-2 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500 h-10"
                required
              />
            </div>

            {/* SELECT NIVEAU */}
<select
  value={formData.niveau_classe}
  onChange={(e) => setFormData({ ...formData, niveau_classe: e.target.value })}
  className="border border-slate-300 px-3 py-2 rounded-lg bg-white h-10 outline-none"
>
  <option value="">(Aucun)</option>
  {niveaux.map((n) => (
    // On utilise n.niveau au lieu de n.lib_niveau
    <option key={n.id} value={n.id}>{n.niveau}</option>
  ))}
</select>

{/* SELECT OPTION */}
<select
  value={formData.option_classe}
  onChange={(e) => setFormData({ ...formData, option_classe: e.target.value })}
  className="border border-slate-300 px-3 py-2 rounded-lg bg-white h-10 outline-none"
>
  <option value="">(Aucun)</option>
  {options.map((o) => (
    // On utilise o.option au lieu de o.lib_option
    <option key={o.id} value={o.id}>{o.option}</option>
  ))}
</select>

            <div className="flex gap-2">
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 h-10">
                {editId ? "Modifier" : "Enregistrer"}
              </button>
              <button type="button" onClick={resetForm} className="bg-white text-slate-500 border border-slate-300 px-4 py-2 rounded-lg font-bold h-10">
                Annuler
              </button>
            </div>
          </form>
        )}

        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left">
            <thead className="bg-slate-300">
              <tr className="text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-bold">Code</th>
                <th className="px-6 py-4 font-bold">Classe</th>
                <th className="px-6 py-4 font-bold">Niveau</th>
                <th className="px-6 py-4 font-bold">Option</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="py-20 text-center text-slate-400">Chargement...</td></tr>
              ) : classes.map((cls) => (
                <tr key={cls.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-blue-600">{cls.code_classe}</td>
                    <td className="px-6 py-4 font-medium text-slate-700">{cls.lib_classe}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">
  {/* 1. On cherche par ID. 2. Si pas trouvé, on affiche la valeur brute (le nom). 3. Sinon "-" */}
  {niveaux.find(n => n.id === cls.niveau_classe || n.id === Number(cls.niveau_classe))?.niveau 
    || (typeof cls.niveau_classe === 'string' ? cls.niveau_classe : "—")}
</td>

<td className="px-6 py-4 text-sm text-slate-500">
  {/* Même logique pour l'option */}
  {options.find(o => o.id === cls.option_classe || o.id === Number(cls.option_classe))?.option 
    || (typeof cls.option_classe === 'string' ? cls.option_classe : "—")}
</td>
                    <td className="px-6 py-4 text-right">
  <button 
    onClick={() => handleEdit(cls)} 
    className="mr-3 text-blue-500 hover:text-blue-700 transition-transform active:scale-90"
  >
    ✏️
  </button>
  <button 
    onClick={() => handleDelete(cls.id)} 
    className="text-red-400 hover:text-red-600 transition-transform active:scale-90"
  >
    🗑️
  </button>
</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}