import { Navigate, Outlet } from 'react-router-dom';

export function PrivateRoute() {
  // 1. A Verdade Nua e Crua: Lemos direto do cofre.
  // Não dependemos de estados que podem demorar para atualizar.
  const token = localStorage.getItem('avivar_token');

  // 2. O Julgamento
  // Se tem token, deixa passar (renderiza o Outlet/Filhos).
  // Se não tem, chuta pro login.
  return token ? <Outlet /> : <Navigate to="/login" replace />;
}