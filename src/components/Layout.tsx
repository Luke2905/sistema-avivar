import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  // 🐛 CORREÇÃO CRÍTICA:
  // Antes estava lendo 'usuario', mas o Login salva como 'avivar_user'.
  const usuarioSalvo = localStorage.getItem('avivar_user');
  
  const user = usuarioSalvo ? JSON.parse(usuarioSalvo) : { nome: 'Visitante', perfil: '' };

  // Tratamento do perfil (Maiúsculo e sem acento)
  let perfilTratado = user.perfil || '';
  // Garante que é string antes de normalizar para evitar crash se vier null
  if (perfilTratado) {
      perfilTratado = perfilTratado.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
  }

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      
      {/* Sidebar recebe o perfil correto agora */}
      <Sidebar userRole={perfilTratado} userName={user.nome || 'Usuário'} />

      {/* Conteúdo Principal */}
      <main className="flex-1 ml-64 overflow-auto bg-gray-50 h-full relative p-0">
        <Outlet />
      </main>
    </div>
  );
}