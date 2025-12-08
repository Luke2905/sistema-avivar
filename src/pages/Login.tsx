import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom'; 
import api from '../services/api';
import { showToast, showAlert } from '../utils/swal-config';

export default function Login() {
  const navigate = useNavigate(); 
  
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState(''); // Mantive, embora o Swal seja melhor
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, senha });
      const { token, usuario } = response.data;

      if (!token) throw new Error("Token ausente na resposta.");

      // Salvando com os nomes corretos
      localStorage.setItem('avivar_token', token);
      localStorage.setItem('avivar_user', JSON.stringify(usuario));
      
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      showToast(`Bem-vindo, ${usuario.nome}!`, 'success');

      // Agora podemos usar o navigate normal, pois o Layout vai ler o localStorage atualizado ao montar
      setTimeout(() => {
        navigate('/dashboard'); 
      }, 1000);
      
    } catch (error: any) {
      console.error(error);
      const msgErro = error.response?.data?.mensagem || 'Falha no login.';
      showAlert('Acesso Negado', msgErro, 'error');
    } finally {
      setLoading(false);
    }
  }

  // ... (O restante do JSX do return mantém igual ao seu original)
  return (
    <div className="min-h-screen flex items-center justify-center bg-avivar-tiffany/10">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md border-t-4 border-avivar-pink">
        <h1 className="text-3xl font-bold text-center text-avivar-tiffany mb-6">
          Sistema Avivar
        </h1>
        
        {erro && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded border border-red-200 text-sm">
            {erro}
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">E-mail</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-avivar-tiffany focus:border-avivar-tiffany"
              placeholder="admin@avivar.com.br"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Senha</label>
            <input 
              type="password" 
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-avivar-tiffany focus:border-avivar-tiffany"
              placeholder="********"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
              ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-avivar-tiffany hover:bg-teal-500'} 
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-avivar-pink transition-colors`}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-500">Ambiente Seguro • Avivar ERP</p>
      </div>
    </div>
  );
}