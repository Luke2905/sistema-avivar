// src/components/Sidebar.tsx
import { Link, useLocation } from 'react-router-dom';
import { LogOut, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { MENU_ITEMS } from '../config/menuItems'; 
import type { UserRole } from '../config/menuItems';

interface SidebarProps {
  userRole: string;
  userName: string;
  // NOVAS PROPS: O Pai controla isso agora
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

export default function Sidebar({ userRole, userName, isCollapsed, toggleSidebar }: SidebarProps) {
  const location = useLocation();

  if (!userRole) return null;

  const roleUpper = userRole as UserRole;

  const allowedItems = MENU_ITEMS.filter(item => {
    return item.roles && item.roles.includes(roleUpper);
  });

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  let lastSection = '';

  return (
    <aside 
      className={`
        bg-white border-r border-gray-200 flex flex-col fixed h-full z-20 shadow-sm
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-20' : 'w-64'} 
      `}
    >
      
      {/* BOTÃO DE TOGGLE */}
      <button 
        onClick={toggleSidebar} // Chama a função do Pai
        className="absolute -right-3 top-9 bg-white border border-gray-200 text-gray-500 rounded-full p-1 shadow-md hover:text-avivar-tiffany hover:border-avivar-tiffany transition-colors z-30"
        title={isCollapsed ? "Expandir Menu" : "Recolher Menu"}
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* LOGO */}
      <div className={`p-6 border-b border-gray-100 flex items-center ${isCollapsed ? 'justify-center' : 'gap-2'} transition-all`}>
        <div className="w-8 h-8 bg-avivar-tiffany rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-avivar-tiffany/30 shrink-0">
            A
        </div>
        
        <div className={`overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight whitespace-nowrap">
              Avivar<span className="text-avivar-pink">Sys</span>
            </h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider whitespace-nowrap">
              Perfil: {userRole}
            </p>
        </div>
      </div>

      {/* NAVEGAÇÃO */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto custom-scrollbar overflow-x-hidden">
        {allowedItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          const showSection = item.section && item.section !== lastSection;
          if (showSection) lastSection = item.section!;
          
          const IconComponent = item.icon || AlertTriangle;

          return (
            <div key={index}>
              {showSection && (
                <div className={`mb-2 mt-4 first:mt-0 transition-all duration-300 ${isCollapsed ? 'opacity-0 h-0' : 'opacity-100'}`}>
                  <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    {item.section}
                  </p>
                </div>
              )}
              
              {showSection && isCollapsed && (
                 <div className="my-2 border-t border-gray-100 w-8 mx-auto" />
              )}

              <Link
                to={item.path}
                title={isCollapsed ? item.label : ''}
                className={`
                  flex items-center py-3 text-sm font-medium rounded-lg transition-all duration-200 mb-1
                  ${isCollapsed ? 'justify-center px-0' : 'px-4 gap-3'}
                  ${isActive 
                    ? 'bg-avivar-tiffany/10 text-avivar-tiffany shadow-sm' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }
                  ${isActive && !isCollapsed ? 'border-r-4 border-avivar-tiffany' : ''}
                `}
              >
                <IconComponent size={20} className="shrink-0" />
                <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                  {item.label}
                </span>
              </Link>
            </div>
          );
        })}
      </nav>

      {/* RODAPÉ */}
      <div className="p-4 border-t border-gray-200 bg-gray-50/50">
        <div className={`flex items-center mb-4 ${isCollapsed ? 'justify-center' : 'gap-3 px-2'} transition-all`}>
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-white shadow-sm bg-gray-400 shrink-0`}>
                {userName.charAt(0).toUpperCase()}
            </div>
            
            <div className={`overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                <p className="text-sm font-bold text-gray-700 leading-none truncate w-32 whitespace-nowrap">
                    {userName}
                </p>
            </div>
        </div>
        
        <button 
            onClick={handleLogout} 
            title={isCollapsed ? "Sair" : ""}
            className={`
              w-full flex items-center gap-2 py-2 text-sm text-red-600 bg-white border border-red-100 hover:bg-red-50 hover:border-red-200 rounded-lg transition-colors font-bold shadow-sm
              ${isCollapsed ? 'justify-center px-0' : 'justify-center px-4'}
            `}
        >
            <LogOut size={16} /> 
            <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
              Sair
            </span>
        </button>
      </div>
    </aside>
  );
}