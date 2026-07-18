// src/pages/Produtos.tsx
import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { Plus, Package, Trash2, FlaskConical, AlertCircle, Edit3, X } from 'lucide-react';
import api from '../services/api';
import MySwal, { showToast, showAlert } from '../utils/swal-config';

// Importando o Modal de Ficha Técnica
import ModalFichaTecnica from '../components/ModalFichaTecnica';

interface Produto {
  ID_PRODUTO: number;
  SKU_PRODUTO: string;
  NOME_PRODUTO: string;
  PRECO_VENDA: string | number;
  IMPOSTO_PERCENTUAL?: number;
  MAO_DE_OBRA_VALOR?: number;
}

export default function Produtos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados do Formulário
  const [modoEdicao, setModoEdicao] = useState(false);
  const [produtoEditandoId, setProdutoEditandoId] = useState<number | null>(null);

  const [sku, setSku] = useState('');
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [impostos, setImpostos] = useState('');
  const [maoDeObra, setMaoDeObra] = useState('');

  // Modal
  const [modalFichaOpen, setModalFichaOpen] = useState(false);
  const [produtoParaFicha, setProdutoParaFicha] = useState<Produto | null>(null);

  useEffect(() => {
    carregarProdutos();
  }, []);

  async function carregarProdutos() {
    try {
      const response = await api.get('/produtos');
      setProdutos(response.data);
    } catch (error) {
      console.error(error);
      showToast('Erro ao carregar produtos', 'error');
    } finally {
      setLoading(false);
    }
  }

  const cancelarEdicao = () => {
    setModoEdicao(false);
    setProdutoEditandoId(null);
    setSku('');
    setNome('');
    setPreco('');
    setImpostos('');
    setMaoDeObra('');
  };

  const handleEditar = (p: Produto) => {
    setModoEdicao(true);
    setProdutoEditandoId(p.ID_PRODUTO);
    setSku(p.SKU_PRODUTO);
    setNome(p.NOME_PRODUTO);
    setPreco(String(p.PRECO_VENDA));
    setImpostos(p.IMPOSTO_PERCENTUAL ? String(p.IMPOSTO_PERCENTUAL) : '');
    setMaoDeObra(p.MAO_DE_OBRA_VALOR ? String(p.MAO_DE_OBRA_VALOR) : '');
    
    // Rola para o topo do form para a pessoa ver que está editando
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  async function handleSalvar(e: FormEvent) {
    e.preventDefault();
    if (!sku || !nome || !preco) return showToast('Preencha SKU, Nome e Preço', 'error');

    try {
      const payload = { 
        sku, 
        nome, 
        preco: parseFloat(preco), 
        id_categoria: 1, // Fixado como estava antes
        impostos: parseFloat(impostos || '0'),
        mao_de_obra: parseFloat(maoDeObra || '0')
      };

      if (modoEdicao && produtoEditandoId) {
        await api.put(`/produtos/${produtoEditandoId}`, payload);
        showToast('Produto atualizado!');
      } else {
        await api.post('/produtos', payload);
        showToast('Produto cadastrado!');
      }
      
      cancelarEdicao();
      carregarProdutos();
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.mensagem || 'Não foi possível salvar o produto.';
      showAlert('Erro', msg, 'error');
    }
  }

  const handleExcluir = async (id: number, nome: string) => {
    const result = await MySwal.fire({
      title: 'Tem certeza?',
      text: `Você vai excluir o produto "${nome}"`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, excluir!'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/produtos/${id}`); 
        showToast('Produto excluído!', 'success');
        carregarProdutos();
      } catch (error) {
        showToast('Erro ao excluir (pode ter vínculos)', 'error');
      }
    }
  };

  const abrirFicha = (produto: Produto) => {
    setProdutoParaFicha(produto);
    setModalFichaOpen(true);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden">
      
      <div className="flex-none p-8 pb-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Package className="text-avivar-tiffany" /> Gestão de Produtos
            </h1>
            <p className="text-sm text-gray-500 mt-1">Cadastre os itens de venda, configure receitas, impostos e frete</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 p-8 pt-0 custom-scrollbar">
        <div className="max-w-6xl mx-auto space-y-8 pb-10">
        
          {/* --- FORMULÁRIO DE CADASTRO --- */}
          <div className={`p-6 rounded-xl shadow-sm border transition-all ${modoEdicao ? 'bg-teal-50 border-avivar-tiffany' : 'bg-white border-gray-100'}`}>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    {modoEdicao ? <><Edit3 size={16} className="text-avivar-tiffany"/> Editando Produto</> : 'Adicionar Novo Item'}
                </h2>
                {modoEdicao && (
                    <button onClick={cancelarEdicao} className="text-gray-500 hover:text-red-500 text-xs font-bold flex items-center gap-1 bg-white px-2 py-1 rounded border border-gray-200 shadow-sm">
                        <X size={14} /> Cancelar Edição
                    </button>
                )}
            </div>
            
            <form onSubmit={handleSalvar} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">SKU (Código)</label>
                <input 
                  value={sku} 
                  onChange={e => setSku(e.target.value)} 
                  className="w-full border-gray-200 bg-white rounded-lg p-2.5 text-sm focus:border-avivar-tiffany focus:ring-2 focus:ring-avivar-tiffany/20 outline-none transition-all shadow-sm border" 
                  placeholder="Ex: CAN-001" 
                />
              </div>

              <div className="md:col-span-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Produto</label>
                <input 
                  value={nome} 
                  onChange={e => setNome(e.target.value)} 
                  className="w-full border-gray-200 bg-white rounded-lg p-2.5 text-sm focus:border-avivar-tiffany focus:ring-2 focus:ring-avivar-tiffany/20 outline-none transition-all shadow-sm border" 
                  placeholder="Ex: Caneca Personalizada" 
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Preço Venda (R$)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={preco} 
                  onChange={e => setPreco(e.target.value)} 
                  className="w-full border-gray-200 bg-white rounded-lg p-2.5 text-sm focus:border-avivar-tiffany focus:ring-2 focus:ring-avivar-tiffany/20 outline-none transition-all shadow-sm border" 
                  placeholder="0.00" 
                />
              </div>

              <div className="md:col-span-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Impostos (%)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={impostos} 
                  onChange={e => setImpostos(e.target.value)} 
                  className="w-full border-gray-200 bg-white rounded-lg p-2.5 text-sm focus:border-avivar-tiffany focus:ring-2 focus:ring-avivar-tiffany/20 outline-none transition-all shadow-sm border" 
                  placeholder="Ex: 6.00" 
                />
              </div>

              <div className="md:col-span-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Mão de Obra (R$)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={maoDeObra} 
                  onChange={e => setMaoDeObra(e.target.value)} 
                  className="w-full border-gray-200 bg-white rounded-lg p-2.5 text-sm focus:border-avivar-tiffany focus:ring-2 focus:ring-avivar-tiffany/20 outline-none transition-all shadow-sm border" 
                  placeholder="Ex: 2.50" 
                />
              </div>

              <div className="md:col-span-4">
                <button type="submit" className="w-full bg-avivar-tiffany text-white font-bold py-2.5 px-4 rounded-lg hover:bg-teal-600 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 border border-teal-600">
                  {modoEdicao ? <><Edit3 size={18} /> Salvar Edição</> : <><Plus size={18} /> Cadastrar Produto</>}
                </button>
              </div>
            </form>
          </div>

          {/* --- LISTAGEM DE PRODUTOS --- */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {produtos.length === 0 && !loading ? (
               <div className="p-12 text-center flex flex-col items-center text-gray-400">
                  <AlertCircle size={48} className="mb-4 opacity-20" />
                  <p>Nenhum produto encontrado.</p>
               </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100 sticky top-0">
                  <tr>
                    <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">SKU</th>
                    <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Produto</th>
                    <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Mão de Obra</th>
                    <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Impostos</th>
                    <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Preço Venda</th>
                    <th className="py-4 px-6 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {produtos.map((p) => (
                    <tr key={p.ID_PRODUTO} className="hover:bg-gray-50/80 transition-colors group">
                      <td className="py-4 px-6">
                        <span className="font-mono text-xs font-bold text-avivar-tiffany bg-avivar-tiffany/10 px-2 py-1 rounded border border-avivar-tiffany/20">
                          {p.SKU_PRODUTO}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm font-medium text-gray-700">{p.NOME_PRODUTO}</td>
                      <td className="py-4 px-6 text-sm text-gray-500 text-right">
                        {p.MAO_DE_OBRA_VALOR ? Number(p.MAO_DE_OBRA_VALOR).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-'}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-500 text-right">
                        {p.IMPOSTO_PERCENTUAL ? `${Number(p.IMPOSTO_PERCENTUAL).toFixed(2)}%` : '-'}
                      </td>
                      <td className="py-4 px-6 text-sm font-bold text-gray-800 text-right">
                        {Number(p.PRECO_VENDA).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      
                      {/* AÇÕES */}
                      <td className="py-4 px-6 text-center flex justify-center gap-2">
                        
                        {/* Botão Ficha Técnica */}
                        <button 
                          onClick={() => abrirFicha(p)} 
                          className="text-indigo-400 hover:text-indigo-600 p-2 hover:bg-indigo-50 rounded-full transition-colors border border-transparent hover:border-indigo-100"
                          title="Configurar Ficha Técnica / Receita"
                        >
                          <FlaskConical size={18} />
                        </button>

                        {/* Botão Editar */}
                        <button 
                          onClick={() => handleEditar(p)}
                          className="text-amber-400 hover:text-amber-600 p-2 hover:bg-amber-50 rounded-full transition-colors border border-transparent hover:border-amber-100"
                          title="Editar Produto"
                        >
                          <Edit3 size={18} />
                        </button>

                        {/* Botão Excluir */}
                        <button 
                          onClick={() => handleExcluir(p.ID_PRODUTO, p.NOME_PRODUTO)}
                          className="text-gray-300 hover:text-red-500 p-2 hover:bg-red-50 rounded-full transition-colors border border-transparent hover:border-red-100"
                          title="Excluir Produto"
                        >
                          <Trash2 size={18} />
                        </button>

                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        
        </div>
      </div>

      <ModalFichaTecnica 
        isOpen={modalFichaOpen}
        onClose={() => setModalFichaOpen(false)}
        produto={produtoParaFicha}
      />

    </div>
  );
}