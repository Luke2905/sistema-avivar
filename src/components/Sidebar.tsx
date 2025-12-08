// src/components/Sidebar.tsx
import { Link, useLocation } from 'react-router-dom';
import { LogOut, AlertTriangle } from 'lucide-react';
import { MENU_ITEMS } from '../config/menuItems'; 
import type { UserRole } from '../config/menuItems';

interface SidebarProps {
  userRole: string;
  userName: string;
}

export default function Sidebar({ userRole, userName }: SidebarProps) {
  const location = useLocation();

  // Se não tem perfil definido, não mostra nada (evita erro visual)
  if (!userRole) return null;

  const roleUpper = userRole as UserRole;

  // Filtra o menu baseado no perfil
  const allowedItems = MENU_ITEMS.filter(item => {
    return item.roles && item.roles.includes(roleUpper);
  });

  // --- LOGOUT SEGURO ---
  const handleLogout = () => {
    // 1. Limpa o banco local
    localStorage.clear();
    // 2. Força o navegador a ir para a raiz (Login) limpando a memória RAM do React
    window.location.href = '/';
  };

  let lastSection = '';

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-20 shadow-sm">
      
      {/* LOGO */}
      <div className="p-6 border-b border-gray-100 flex items-center gap-2">
        <div className="w-8 h-8 bg-avivar-tiffany rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-avivar-tiffany/30">
            A
        </div>
        <div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">Avivar<span className="text-avivar-pink">Sys</span></h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Perfil: {userRole}</p>
        </div>
      </div>

      {/* NAVEGAÇÃO */}
      <nav className="flex-1 px-4 py-4 overflow-y-auto custom-scrollbar">
        {allowedItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          const showSection = item.section && item.section !== lastSection;
          if (showSection) lastSection = item.section!;
          
          const IconComponent = item.icon || AlertTriangle;

          return (
            <div key={index}>
              {showSection && (
                <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-4 first:mt-0">
                  {item.section}
                </p>
              )}
              
              <Link
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 mb-1
                  ${isActive 
                    ? 'bg-avivar-tiffany/10 text-avivar-tiffany shadow-sm border-r-4 border-avivar-tiffany' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`}
              >
                <IconComponent size={20} />
                {item.label}
              </Link>
            </div>
          );
        })}
      </nav>

      {/* RODAPÉ DO USUÁRIO */}
      <div className="p-4 border-t border-gray-200 bg-gray-50/50">
        <div className="flex items-center gap-3 mb-4 px-2">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-white shadow-sm bg-gray-400`}>
                {userName.charAt(0).toUpperCase()}
            </div>
            
            <div className="overflow-hidden">
                <p className="text-sm font-bold text-gray-700 leading-none truncate w-32" title={userName}>
                    {userName}
                </p>
                <div className="mt-1">
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border bg-white border-gray-200 text-gray-500">
                        Online
                    </span>
                </div>
            </div>
        </div>
        
        <button 
            onClick={handleLogout} 
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-600 bg-white border border-red-100 hover:bg-red-50 hover:border-red-200 rounded-lg transition-colors font-bold shadow-sm"
        >
            <LogOut size={16} /> Sair
        </button>
      </div>
    </aside>
  );
}