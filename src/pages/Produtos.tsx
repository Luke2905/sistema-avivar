// src/pages/Produtos.tsx
import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { Plus, Package, Trash2, FlaskConical, AlertCircle } from 'lucide-react';
import api from '../services/api';
import MySwal, { showToast, showAlert } from '../utils/swal-config';

// Importando o Modal de Ficha Técnica
import ModalFichaTecnica from '../components/ModalFichaTecnica';

interface Produto {
  ID_PRODUTO: number;
  SKU_PRODUTO: string;
  NOME_PRODUTO: string;
  PRECO_VENDA: string | number;
}

export default function Produtos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados do Formulário
  const [sku, setSku] = useState('');
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');

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

  async function handleSalvar(e: FormEvent) {
    e.preventDefault();
    if (!sku || !nome || !preco) return showToast('Preencha os campos obrigatórios', 'error');

    try {
      await api.post('/produtos', { 
        sku, 
        nome, 
        preco: parseFloat(preco), 
        id_categoria: 1 
      });
      
      showToast('Produto cadastrado!');
      setSku(''); setNome(''); setPreco('');
      carregarProdutos();
    } catch (error) {
      showAlert('Erro', 'Não foi possível salvar o produto.', 'error');
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
    // 1. ESTRUTURA TRAVADA (Igual Estoque)
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden">
      
      {/* 2. CABEÇALHO FIXO (shrink-0) */}
      <div className="flex-none p-8 pb-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Package className="text-avivar-tiffany" /> Gestão de Produtos
            </h1>
            <p className="text-sm text-gray-500 mt-1">Cadastre os itens de venda e configure suas receitas</p>
          </div>
        </div>
      </div>

      {/* 3. ÁREA DE SCROLL (Formulário + Tabela rolam juntos) */}
      <div className="flex-1 overflow-y-auto min-h-0 p-8 pt-0 custom-scrollbar">
        <div className="max-w-6xl mx-auto space-y-8 pb-10">
        
          {/* --- FORMULÁRIO DE CADASTRO --- */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Adicionar Novo Item</h2>
            <form onSubmit={handleSalvar} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">SKU (Código)</label>
                <input 
                  value={sku} 
                  onChange={e => setSku(e.target.value)} 
                  className="w-full border-gray-200 bg-gray-50 rounded-lg p-2.5 text-sm focus:border-avivar-tiffany focus:ring-2 focus:ring-avivar-tiffany/20 outline-none transition-all" 
                  placeholder="Ex: CAN-001" 
                />
              </div>

              <div className="md:col-span-5">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Produto</label>
                <input 
                  value={nome} 
                  onChange={e => setNome(e.target.value)} 
                  className="w-full border-gray-200 bg-gray-50 rounded-lg p-2.5 text-sm focus:border-avivar-tiffany focus:ring-2 focus:ring-avivar-tiffany/20 outline-none transition-all" 
                  placeholder="Ex: Caneca Personalizada" 
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={preco} 
                  onChange={e => setPreco(e.target.value)} 
                  className="w-full border-gray-200 bg-gray-50 rounded-lg p-2.5 text-sm focus:border-avivar-tiffany focus:ring-2 focus:ring-avivar-tiffany/20 outline-none transition-all" 
                  placeholder="0,00" 
                />
              </div>

              <div className="md:col-span-2">
                <button type="submit" className="w-full bg-avivar-tiffany text-white font-bold py-2.5 px-4 rounded-lg hover:bg-teal-600 transition-all shadow-sm hover:shadow flex items-center justify-center gap-2">
                  <Plus size={18} /> Salvar
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
                    <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Preço</th>
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
                      <td className="py-4 px-6 text-sm font-bold text-gray-800 text-right">
                        {Number(p.PRECO_VENDA).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      
                      {/* AÇÕES */}
                      <td className="py-4 px-6 text-center flex justify-center gap-2">
                        
                        {/* Botão Ficha Técnica */}
                        <button 
                          onClick={() => abrirFicha(p)} 
                          className="text-indigo-400 hover:text-indigo-600 p-2 hover:bg-indigo-50 rounded-full transition-colors"
                          title="Configurar Ficha Técnica / Receita"
                        >
                          <FlaskConical size={18} />
                        </button>

                        {/* Botão Excluir */}
                        <button 
                          onClick={() => handleExcluir(p.ID_PRODUTO, p.NOME_PRODUTO)}
                          className="text-gray-300 hover:text-red-500 p-2 hover:bg-red-50 rounded-full transition-colors"
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

      {/* MODAL (Fica fora do scroll) */}
      <ModalFichaTecnica 
        isOpen={modalFichaOpen}
        onClose={() => setModalFichaOpen(false)}
        produto={produtoParaFicha}
      />

    </div>
  );
}