import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

export default function Layout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  const usuarioSalvo = localStorage.getItem('avivar_user');
  const user = usuarioSalvo ? JSON.parse(usuarioSalvo) : { nome: 'Visitante', perfil: '' };

  let perfilTratado = user.perfil || '';
  if (perfilTratado) {
      perfilTratado = perfilTratado.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
  }

  return (
    // 1. h-screen: Força a altura exata da janela
    // 2. overflow-hidden: Impede que a JANELA role. Só os filhos rolam.
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50 font-sans">
      
      <Sidebar 
        userRole={perfilTratado} 
        userName={user.nome || 'Usuário'} 
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* CONTEÚDO PRINCIPAL */}
      <main 
        className={`
          flex-1 h-full relative
          transition-all duration-300 ease-in-out
          ${isSidebarCollapsed ? 'ml-20' : 'ml-64'} 
          
          /* AQUI O PULO DO GATO: */
          /* Removemos 'overflow-auto' DAQUI. */
          /* Quem deve rolar é o componente filho (Dashboard/Estoque) ou um div interno. */
          /* Se deixar auto aqui e no filho, cria duas barras de rolagem. */
          overflow-hidden 
        `}
      >
        {/* O Outlet vai renderizar o Dashboard, que já tem 'h-full' e controle de scroll interno */}
        <Outlet />
      </main>
    </div>
  );
}