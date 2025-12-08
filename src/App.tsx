import { Routes, Route, Navigate } from 'react-router-dom'; // Removi BrowserRouter daqui
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Produtos from './pages/Produtos';
import PedidosLista from './pages/PedidosLista';
import Layout from './components/Layout'; 
import Estoque from './pages/Estoque';
import Compras from './pages/Compras';
import ProducaoScanner from './pages/ProducaoScanner';
import Predicoes from './pages/Predicoes';
import ProducaoGerar from './pages/ProducaoGerar';

// Guardião
const RotaPrivada = () => {
  const token = localStorage.getItem('avivar_token');
  return token ? <Layout /> : <Navigate to="/" replace />;
};

function App() {
  // ⚠️ ATENÇÃO: Não use <BrowserRouter> aqui, pois ele já está no main.tsx
  return (
      <Routes>
        {/* Rota Pública */}
        <Route path="/" element={<Login />} />
        
        {/* Rotas Privadas (Protegidas pelo Guardião + Layout) */}
        <Route element={<RotaPrivada />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/produtos" element={<Produtos />} />
            <Route path="/pedidos-lista" element={<PedidosLista />} />
            <Route path="/estoque" element={<Estoque />} />
            <Route path="/compras" element={<Compras />} />
            <Route path="/pcp" element={<ProducaoGerar />} />
            <Route path="/scanner" element={<ProducaoScanner />} />
            <Route path="/ia" element={<Predicoes />} />
        </Route>

        {/* Fallback para rota inexistente */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
  );
}

export default App;