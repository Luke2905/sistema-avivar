import { useEffect, useState, FormEvent } from 'react';
import api from '../services/api'; // Seu axios configurado
import { showToast, showAlert } from '../utils/swal-config'; // Suas configs de alerta
import { Users, Edit, Trash2, Plus, CheckCircle, XCircle, Shield, X } from 'lucide-react';

// Tipagem idêntica ao que vem do Banco de Dados (TiDB)
interface Usuario {
  ID_USUARIO: number;
  NOME_USUARIO: string;
  EMAIL_USUARIO: string;
  PERFIL_USUARIO: 'ADMIN' | 'PRODUCAO' | 'ARTES' | 'FINANCEIRO';
  ATIVO: number; // O banco retorna 1 (true) ou 0 (false)
}

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Controle do Modal
  const [modalAberto, setModalAberto] = useState(false);
  const [modoEdicao, setModoEdicao] = useState<Usuario | null>(null);

  // Formulário
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [perfil, setPerfil] = useState('PRODUCAO');
  const [ativo, setAtivo] = useState(true);

  // --- 1. CARREGAR DADOS ---
  async function carregarUsuarios() {
    try {
      setLoading(true);
      const response = await api.get('/usuarios');
      setUsuarios(response.data);
    } catch (error) {
      console.error(error);
      showToast('Erro ao carregar lista de usuários', 'error');
    } finally {
      setLoading(false);
    }
  }

  // Roda assim que a tela abre
  useEffect(() => {
    carregarUsuarios();
  }, []);

  // --- 2. ABRIR MODAL (LIMPO OU PREENCHIDO) ---
  function abrirModal(usuario?: Usuario) {
    if (usuario) {
      // Modo Edição: Preenche os campos
      setModoEdicao(usuario);
      setNome(usuario.NOME_USUARIO);
      setEmail(usuario.EMAIL_USUARIO);
      setPerfil(usuario.PERFIL_USUARIO);
      setAtivo(usuario.ATIVO === 1);
      setSenha(''); // Senha vazia para não alterar sem querer
    } else {
      // Modo Criação: Limpa tudo
      setModoEdicao(null);
      setNome('');
      setEmail('');
      setPerfil('PRODUCAO');
      setAtivo(true);
      setSenha('');
    }
    setModalAberto(true);
  }

  // --- 3. SALVAR (CRIA OU EDITA) ---
  async function handleSalvar(e: FormEvent) {
    e.preventDefault();

    // Validação básica
    if (!modoEdicao && !senha) {
      return showToast('Para novos usuários, a senha é obrigatória!', 'warning');
    }

    try {
      // Prepara o objeto para mandar pro Back (Controller espera esses nomes)
      const dadosParaEnviar = {
        nome,
        email,
        perfil,
        ativo: ativo ? 1 : 0,
        senha: senha || undefined // Se estiver vazio na edição, nem manda
      };

      if (modoEdicao) {
        // PUT: Atualiza
        await api.put(`/usuarios/${modoEdicao.ID_USUARIO}`, dadosParaEnviar);
        showToast('Usuário atualizado com sucesso!', 'success');
      } else {
        // POST: Cria novo
        await api.post('/usuarios', dadosParaEnviar);
        showToast('Usuário criado com sucesso!', 'success');
      }

      setModalAberto(false);
      carregarUsuarios(); // Recarrega a tabela

    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.mensagem || 'Erro ao salvar.';
      showAlert('Ops!', msg, 'error');
    }
  }

  // --- 4. EXCLUIR ---
  async function handleExcluir(id: number, nomeUser: string) {
    // Confirmação nativa (ou use Swal se preferir)
    if (window.confirm(`Tem certeza que deseja remover ${nomeUser}? Essa ação não pode ser desfeita.`)) {
      try {
        await api.delete(`/usuarios/${id}`);
        showToast('Usuário removido.', 'success');
        carregarUsuarios();
      } catch (error) {
        showAlert('Erro', 'Não foi possível excluir. Verifique se o usuário tem registros vinculados.', 'error');
      }
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="text-avivar-pink" size={28} />
            Gestão de Usuários
          </h1>
          <p className="text-gray-500 text-sm mt-1">Controle de acesso e permissões do sistema</p>
        </div>
        <button 
          onClick={() => abrirModal()}
          className="bg-avivar-tiffany hover:bg-teal-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold shadow-md transition-all"
        >
          <Plus size={20} /> Novo Usuário
        </button>
      </div>

      {/* TABELA DE DADOS */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Usuário</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Perfil</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {usuarios.map((user) => (
                <tr key={user.ID_USUARIO} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-gray-800">{user.NOME_USUARIO}</div>
                    <div className="text-xs text-gray-400">{user.EMAIL_USUARIO}</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold border uppercase
                      ${user.PERFIL_USUARIO === 'ADMIN' ? 'bg-purple-50 text-purple-600 border-purple-200' : 
                        user.PERFIL_USUARIO === 'FINANCEIRO' ? 'bg-green-50 text-green-600 border-green-200' : 
                        'bg-blue-50 text-blue-600 border-blue-200'}`
                    }>
                      {user.PERFIL_USUARIO}
                    </span>
                  </td>
                  <td className="p-4">
                    {user.ATIVO === 1 ? (
                      <span className="flex items-center gap-1 text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded-full w-fit">
                        <CheckCircle size={12} /> Ativo
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-500 text-xs font-bold bg-red-50 px-2 py-1 rounded-full w-fit">
                        <XCircle size={12} /> Inativo
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => abrirModal(user)}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" 
                        title="Editar"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleExcluir(user.ID_USUARIO, user.NOME_USUARIO)}
                        className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors" 
                        title="Excluir"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Loading e Estado Vazio */}
        {loading && <div className="p-8 text-center text-gray-400 animate-pulse">Carregando usuários...</div>}
        {!loading && usuarios.length === 0 && (
          <div className="p-10 text-center text-gray-400 flex flex-col items-center">
            <Shield size={48} className="mb-2 opacity-20" />
            <p>Nenhum usuário encontrado.</p>
          </div>
        )}
      </div>

      {/* MODAL DE CRIAÇÃO/EDIÇÃO */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            
            {/* Header do Modal */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-bold text-gray-800">
                {modoEdicao ? 'Editar Usuário' : 'Novo Usuário'}
              </h2>
              <button onClick={() => setModalAberto(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSalvar} className="p-6 space-y-4">
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Nome Completo</label>
                <input 
                  type="text" required
                  value={nome} onChange={e => setNome(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-avivar-tiffany focus:border-transparent outline-none transition-all"
                  placeholder="Ex: João da Silva"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">E-mail de Acesso</label>
                <input 
                  type="email" required
                  value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-avivar-tiffany focus:border-transparent outline-none transition-all"
                  placeholder="joao@avivar.com.br"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Perfil</label>
                  <select 
                    value={perfil} onChange={e => setPerfil(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-avivar-tiffany outline-none"
                  >
                    <option value="PRODUCAO">Produção</option>
                    <option value="ARTES">Artes</option>
                    <option value="FINANCEIRO">Financeiro</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>

                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer select-none group">
                    <input 
                      type="checkbox" 
                      checked={ativo} onChange={e => setAtivo(e.target.checked)}
                      className="w-5 h-5 text-avivar-tiffany rounded focus:ring-avivar-tiffany border-gray-300 cursor-pointer"
                    />
                    <span className="text-sm font-bold text-gray-600 group-hover:text-avivar-tiffany transition-colors">Usuário Ativo</span>
                  </label>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 mt-2">
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  {modoEdicao ? 'Nova Senha (Opcional)' : 'Senha Inicial'}
                </label>
                <input 
                  type="password" 
                  value={senha} onChange={e => setSenha(e.target.value)}
                  placeholder={modoEdicao ? "Deixe em branco para manter" : "Mínimo 6 caracteres"}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-avivar-tiffany focus:border-transparent outline-none transition-all"
                />
                {modoEdicao && <p className="text-xs text-gray-400 mt-1">Só preencha se quiser alterar a senha atual.</p>}
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setModalAberto(false)}
                  className="flex-1 py-2.5 border border-gray-300 rounded-lg font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 bg-avivar-tiffany text-white rounded-lg font-bold hover:bg-teal-600 shadow-lg shadow-avivar-tiffany/30 transition-all"
                >
                  {modoEdicao ? 'Salvar Alterações' : 'Criar Usuário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}