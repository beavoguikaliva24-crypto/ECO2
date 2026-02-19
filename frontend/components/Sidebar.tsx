    "use client";
    import Link from 'next/link';
    import { usePathname, useRouter } from 'next/navigation';


    export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem('user'); // On vide la session
        router.push('/login');
    };
    const menu = [
        { name: 'Dashboard', path: '/dashboard', icon: '🏠' },
        { name: 'Élèves', path: '/eleves', icon: '🎓' },
        { name: 'Affectations', path: '/affectations', icon: '📋' },
        { name: 'Recouvrements', path: '/recouvrements', icon: '💰' },
        { name: 'Classes', path: '/classes', icon: '📚' },
    ];

    return (
        <div className="w-50 bg-slate-900 h-screen text-white flex flex-col p-2 shadow-xl">
        <div className="text-lg font-bold mb-4 text-blue-400 px-2 border-b border-slate-700 pb-4">
            ECO2 MANAGER
        </div>
        <nav className="flex-1 space-y-2">
            {menu.map((item) => (
            <Link 
                key={item.path} 
                href={item.path}
                className={`flex items-center gap-1 p-3 rounded-lg transition ${
                pathname === item.path ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-300'
                }`}
            >
                <span>{item.icon}</span>
                {item.name}
            </Link>
            ))}
        </nav>
        <button 
            onClick={handleLogout}
            className="mt-auto flex items-center gap-3 p-3 text-red-400 hover:bg-red-500/13 rounded-lg transition"
        >
            <span>🚪</span> Déconnexion
        </button>
        </div>
    );
    }