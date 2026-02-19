"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import DashboardLayout from "../dashboard/DashboardLayout";
import toast from "react-hot-toast";
// Imports pour l'exportation
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

interface Classe {
  id: number;
  code_classe: string;
  lib_classe: string;
  niveau_classe: string; // Libellé
  option_classe: string; // Libellé
  niveau_id?: number;    // ID pour l'édition (si ton serializer le permet)
  option_id?: number;    // ID pour l'édition
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
// ÉTAT POUR LA RECHERCHE
  const [searchTerm, setSearchTerm] = useState("")
  
    
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
        } 
        catch (err) { console.error("Erreur classes:", err);} 
        finally { setLoading(false); }
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
        } 
        catch (err) { console.error("Erreur metadata:", err);}
    }, []);

    useEffect(() => {
        // Test manuel : si ça s'affiche, le problème est bien ton FETCH
        // setNiveaux([{id: 1, lib_niveau: "Test Niveau"}]); 
        fetchClasses();
        fetchMetadata();
    }, [fetchClasses, fetchMetadata]);

    // --- LOGIQUE DE RECHERCHE (Solution à ton problème) ---
  const filteredClasses = useMemo(() => {
    return classes.filter(c => 
      c.code_classe.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.lib_classe.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [classes, searchTerm]);

    const resetForm = () => {
        setFormData({ code_classe: "", lib_classe: "", niveau_classe: "", option_classe: "" });
        setEditId(null);
        setShowForm(false);
    };

    // 3. Soumission du formulaire
    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Crucial pour éviter le rechargement de page
    console.log("Tentative d'envoi...", formData); // Debug : vérifie si cette ligne s'affiche en console

    const token = localStorage.getItem("token");

    // Nettoyage du payload
    const payload = {
        code_classe: formData.code_classe,
        lib_classe: formData.lib_classe,
        // Si c'est vide ou "(Aucun)", on envoie null pour Django
        niveau_classe: formData.niveau_classe && formData.niveau_classe !== "" ? Number(formData.niveau_classe) : null,
        option_classe: formData.option_classe && formData.option_classe !== "" ? Number(formData.option_classe) : null,
    };

    try {
        const url = editId
            ? `${process.env.NEXT_PUBLIC_API_URL}/classes/${editId}/`
            : `${process.env.NEXT_PUBLIC_API_URL}/classes/`;

        const res = await fetch(url, {
            method: editId ? "PUT" : "POST",
            headers: { 
                "Content-Type": "application/json", 
                Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify(payload),
        });

        if (res.ok) {
            await fetchClasses();
            resetForm();
            toast.success(editId ? "Modifié avec succès !" : "Enregistré avec succès !");
        } else {
            const errorData = await res.json();
            console.error("Erreur API:", errorData);
            toast.error("Erreur : " + JSON.stringify(errorData));
        }
    } catch (err) {
        console.error("Erreur réseau:", err);
        toast.error("Impossible de contacter le serveur");
    }
};// FIN DE HANDLESUBMIT

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
                headers: { Authorization: `Bearer ${token}`,},
            });

            if (res.ok) {
                // Option 1: Recharger les données depuis le serveur
                await fetchClasses();
                toast.success("Classe supprimée !");
            } else { throw new Error(); }
        } 
        catch (err) { toast.error("Erreur lors de la suppression"); console.error("Delete error:", err); }
    };

    // Calcul des statistiques
    const stats = {
        total: classes.length,
        parNiveau: niveaux.map(n => ({
            nom: n.niveau,
            count: classes.filter(c => Number(c.niveau_classe) === n.id || c.niveau_classe === n.niveau).length
        })).filter(s => s.count > 0),
        parOption: options.map(o => ({
            nom: o.option,
            count: classes.filter(c => Number(c.option_classe) === o.id || c.option_classe === o.option).length
        })).filter(s => s.count > 0)
    };

    // --- LOGIQUE D'EXPORTATION ---

    const exportToPDF = () => {
    const doc = new jsPDF();
    const totalPagesExp = "{total_pages_count_string}"; // Placeholder pour le total de pages

    autoTable(doc, {
        head: [['Code', 'Nom de la Classe', 'Niveau', 'Option']],
        body: classes.map(cls => [
            cls.code_classe,
            cls.lib_classe,
            niveaux.find(n => n.id === Number(cls.niveau_classe))?.niveau || cls.niveau_classe || "—",
            options.find(o => o.id === Number(cls.option_classe))?.option || cls.option_classe || "—"
        ]),
        startY: 50, // On commence plus bas pour laisser de la place au titre
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235], fontSize: 11, halign: 'center' },
        columnStyles: {
            0: { cellWidth: 30 },
            2: { halign: 'center' },
            3: { halign: 'center' }
        },
        
        // --- LOGIQUE DE MISE EN PAGE (En-tête et Pied de page) ---
        didDrawPage: (data) => {
            // 1. EN-TÊTE (Header)
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text("MINISTERE DE L'ENSEIGNEMENT PRE-UNIVERSITAIRE", 14, 15);
            doc.text("ET DE L'ALPHABETISATION", 14, 20);
            doc.text("D.C.E ", 14, 15);
            doc.text("ET DE L'ALPHABETISATION", 14, 20);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(0);
            doc.text("REPUBLQUE DE GUINEE", 151, 15);
            const labels = [
    { text: "Travail", color: [255, 0, 0], x: 150 },
    { text: "Justice", color: [255, 180, 0], x: 165 },
    { text: "Solidarité", color: [0, 180, 0], x: 180 }
];

labels.forEach(item => {
    doc.setTextColor(item.color[0], item.color[1], item.color[2]);
    doc.text(item.text, item.x, 20);
});

doc.setTextColor(0, 0, 0); // Toujours réinitialiser
            
            // Ligne de séparation sous l'en-tête
            doc.setDrawColor(200);
            doc.line(14, 25, 196, 25);

            // 2. TITRE PRINCIPAL (Uniquement sur la première page ou partout)
            if (data.pageNumber === 1) {
                doc.setFontSize(18);
                doc.setTextColor(37, 99, 235); // Bleu-600
                doc.setFont("helvetica", "bold");
                doc.text("LISTE DES CLASSES", 105, 40, { align: "center" });
            }

             // Ligne de séparation dessus le pied de page
            doc.setDrawColor(200);
            doc.line(14, doc.internal.pageSize.height - 15, 196, doc.internal.pageSize.height - 15);

            // 3. PIED DE PAGE (Footer)
            let str = "Page " + doc.internal.getNumberOfPages(); // Utilise 'let' ici
            if (typeof doc.putTotalPages === 'function') {
                str = str + " sur " + totalPagesExp; // Maintenant, cette réassignation fonctionnera
            }
            doc.setFontSize(9);
            doc.setTextColor(150);
            
            // Texte à gauche (Date)
            const date = new Date().toLocaleDateString();
            doc.text(`Généré le : ${date}`, 14, doc.internal.pageSize.height - 10);
            
            // Numérotation à droite
            doc.text(str, 185, doc.internal.pageSize.height - 10);
        },
        margin: { top: 40, bottom: 20 }
    });

    // Remplacement du placeholder par le nombre total de pages
    if (typeof doc.putTotalPages === 'function') {
        doc.putTotalPages(totalPagesExp);
    }

    doc.save("liste_classes.pdf");
    toast.success("PDF professionnel généré !");
};

    const exportToExcel = () => {
        const dataToExport = classes.map(cls => ({
            "Code": cls.code_classe,
            "Classe": cls.lib_classe,
            "Niveau": niveaux.find(n => n.id === Number(cls.niveau_classe))?.niveau || cls.niveau_classe,
            "Option": options.find(o => o.id === Number(cls.option_classe))?.option || cls.option_classe
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Classes");
        XLSX.writeFile(workbook, "export_classes.xlsx");
        toast.success("Fichier Excel généré !");
    };
    return (
        <DashboardLayout>
            <div className="space-y-2">
                {/* 1. HEADER & ACTIONS PRINCIPALES */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-800">Gestion des Classes</h1>
                        <p className="text-slate-500 text-sm">Consultez et gérez les structures pédagogiques.</p>
                    </div>

                <div className="flex gap-2">
                  <button onClick={exportToPDF} className="bg-white border border-red-200 text-red-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-50 transition">
                    PDF
                  </button>
                  <button onClick={exportToExcel} className="bg-white border border-green-200 text-green-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-green-50 transition">
                    Excel
                  </button>
                  <button 
                    onClick={() => setShowForm(!showForm)}
                    className="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition"
                  >
                    {showForm ? "✖ Fermer" : "＋ Nouvelle Classe"}
                  </button>
                </div>
              </div>

              {/* 2. STATISTIQUES (KPIs) - Remontées en haut */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-md">
                  <p className="opacity-80 text-xs font-bold uppercase">Total Classes</p>
                  <h3 className="text-3xl font-black">{stats.total}</h3>
                </div>

                <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                  <p className="text-slate-600 text-xs font-bold uppercase mb-3">Par Niveau</p>
                  <div className="flex flex-wrap gap-2">
                    {stats.parNiveau.map((s, i) => (
                      <span key={i} className="text-[11px] bg-slate-100 px-2 py-1 rounded-lg font-bold text-slate-600">
                        {s.nom}: {s.count}
                      </span>
                    ))}
                  </div>
                </div>
                  
                <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                  <p className="text-slate-600 text-xs font-bold uppercase mb-3">Par Option</p>
                  <div className="flex flex-wrap gap-2">
                    {stats.parOption.map((s, i) => (
                      <span key={i} className="text-[11px] bg-blue-50 px-2 py-1 rounded-lg font-bold text-blue-600">
                        {s.nom}: {s.count}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
                  
              {/* 3. FORMULAIRE (S'affiche en dessous des stats) */}
              {showForm && (
                <div className="bg-slate-800 p-4 rounded-2xl shadow-xl animate-in fade-in slide-in-from-top-4">
                  <h3 className="text-white font-bold mb-4">{editId ? "Modifier la classe" : "Ajouter une nouvelle classe"}</h3>
                  <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    {/* ... tes inputs ici (garder les mêmes mais adapter les couleurs pour le fond sombre si besoin) ... */}
                    {/* Note: j'ai mis un fond sombre pour bien détacher le formulaire de la liste */}
                    <div className="flex flex-col gap-1">

                            <label className="text-xs font-bold text-slate-500 uppercase">Code</label>

                            <input type="text" value={formData.code_classe}

                                onChange={(e) => setFormData({ ...formData, code_classe: e.target.value })}

                                className="border border-slate-300 px-3 py-2 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500 h-7"

                                required

                            />

                        </div>



                        <div className="flex flex-col gap-1 flex-1 min-w-[200px]">

                            <label className="text-xs font-bold text-slate-500 uppercase">Nom de la classe</label>

                            <input type="text" value={formData.lib_classe}

                                onChange={(e) => setFormData({ ...formData, lib_classe: e.target.value })}

                                className="border border-slate-300 px-3 py-2 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500 h-7"

                                required

                            />

                        </div>



                        {/* SELECT NIVEAU */}

                        <select value={formData.niveau_classe}

                            onChange={(e) => setFormData({ ...formData, niveau_classe: e.target.value })}

                            className="border border-slate-300 px-3 py-1 rounded-lg bg-white h-7 outline-none"

                        >

                            <option value="">(Aucun)</option>

                            {niveaux.map((n) => (

                                <option key={n.id} value={n.id}>{n.niveau}</option> // On utilise n.niveau au lieu de n.lib_niveau

                            ))}

                        </select>



                        {/* SELECT OPTION */}

                        <select value={formData.option_classe}

                            onChange={(e) => setFormData({ ...formData, option_classe: e.target.value })}

                            className="border border-slate-300 px-3 py-1 rounded-lg bg-white h-7 outline-none"

                        >

                            <option value="">(Aucun)</option>

                            {options.map((o) => (

                                <option key={o.id} value={o.id}>{o.option}</option> // On utilise o.option au lieu de o.lib_option

                            ))}

                        </select>



                        <div className="flex gap-2">

                            <button type="submit" className="bg-blue-600 text-white px-4 py-1 rounded-lg font-bold hover:bg-blue-700 h-7">

                                {editId ? "Modifier" : "Enregistrer"}

                            </button>

                            <button type="button" onClick={resetForm} className="bg-white text-slate-500 border border-slate-300 px-4 py-1 rounded-lg font-bold h-7">

                                Annuler

                            </button>

                        </div>
                  </form>
                </div>
              )}

              {/* 4. TABLEAU ET RECHERCHE */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Barre de recherche interne au tableau */}
                <div className="p-4 pb-1 border-b border-slate-50 bg-slate-50/50">
                  <div className="relative max-w-sm">
                    <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">🔍</span>
                    <input type="text" placeholder="Rechercher par code ou nom..." 
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
        
                <div className="overflow-x-auto m-4">
                    <table className="w-full text-left text-sm text-slate-500">
                        {/* ... ton <thead> et <tbody> ... */}
                        <thead className="bg-slate-200">
                            <tr className="text-slate-700 text-xs uppercase tracking-wider">
                                <th className="px-6 py-4 font-bold">Code</th>
                                <th className="px-6 py-4 font-bold">Classe</th>
                                <th className="px-6 py-4 font-bold">Niveau</th>
                                <th className="px-6 py-4 font-bold">Option</th>
                                <th className="px-6 py-4 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                    <tbody className="divide-y divide-slate-300">
                {loading ? (
                  <tr><td colSpan={5} className="py-20 text-center text-slate-400">Chargement des données...</td></tr>
                ) : filteredClasses.length > 0 ? (
                  filteredClasses.map((cls) => (
                    <tr key={cls.id} className="hover:bg-blue-50/70 transition-colors group">
                      <td className="px-6 py-4 text-sm font-bold text-blue-600">{cls.code_classe}</td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-700">{cls.lib_classe}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {niveaux.find(n => n.id === Number(cls.niveau_classe))?.niveau || cls.niveau_classe || "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {options.find(o => o.id === Number(cls.option_classe))?.option || cls.option_classe || "—"}
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { 
                          setFormData({
                            code_classe: cls.code_classe,
                            lib_classe: cls.lib_classe,
                            niveau_classe: cls.niveau_id?.toString() || "",
                            option_classe: cls.option_id?.toString() || "",
                          }); 
                          setEditId(cls.id); 
                          setShowForm(true); 
                        }} className="text-blue-500 hover:scale-110">✏️</button>
                        <button onClick={() => handleDelete(cls.id)} className="text-red-400 hover:scale-110">🗑️</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={5} className="py-10 text-center text-slate-400">Aucun résultat trouvé pour "{searchTerm}"</td></tr>
                )}
              </tbody>
                  </table>
                </div>
              </div>
            </div>
        </DashboardLayout>
    );
}