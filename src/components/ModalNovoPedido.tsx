// src/components/ModalNovoPedido.tsx
import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Search, Save } from 'lucide-react';
import api from '../services/api';
import { showToast } from '../utils/swal-config';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  pedidoParaEditar?: any | null; // <--- NOVA PROP (Opicional)
}

export default function ModalNovoPedido({ isOpen, onClose, onSuccess, pedidoParaEditar }: Props) {
  const [loading, setLoading] = useState(false);
  
  // Estados do Formulário
  const [cliente, setCliente] = useState('');
  const [numPedido, setNumPedido] = useState('');
  const [plataforma, setPlataforma] = useState('Balcão');
  
  // Itens do Pedido
  const [itens, setItens] = useState<any[]>([]);
  
  // Busca de Produtos
  const [buscaProduto, setBuscaProduto] = useState('');
  const [produtosEncontrados, setProdutosEncontrados] = useState<any[]>([]);

  // --- EFEITO: Carregar dados se for EDIÇÃO ---
  useEffect(() => {
    if (isOpen) {
        if (pedidoParaEditar) {
            // Se veio dados, preenche tudo (Modo Edição)
            const p = pedidoParaEditar.pedido; // O objeto vem { pedido: {...}, itens: [...] } do backend
            const listaItens = pedidoParaEditar.itens;

            setCliente(p.NOME_CLIENTE);
            setNumPedido(p.NUM_PEDIDO_PLATAFORMA);
            setPlataforma(p.PLATAFORMA_ORIGEM);
            
            // Mapeia os itens do banco para o formato do state local
            const itensFormatados = listaItens.map((item: any) => ({
                id_produto: item.ID_PRODUTO,
                nome: item.NOME_PRODUTO, // Precisamos garantir que o backend mande isso no detalhe
                sku: item.SKU_PRODUTO,
                quantidade: item.QUANTIDADE,
                valor_unitario: item.VALOR_UNITARIO,
                total: item.QUANTIDADE * item.VALOR_UNITARIO
            }));
            setItens(itensFormatados);

        } else {
            // Se não, limpa tudo (Modo Criação)
            limparForm();
        }
    }
  }, [isOpen, pedidoParaEditar]);

  const limparForm = () => {
    setCliente('');
    setNumPedido('');
    setPlataforma('Balcão');
    setItens([]);
    setBuscaProduto('');
    setProdutosEncontrados([]);
  };

  // Buscar produtos enquanto digita
  useEffect(() => {
    if (buscaProduto.length > 2) {
      const delay = setTimeout(async () => {
        try {
          const res = await api.get(`/produtos?busca=${buscaProduto}`);
          setProdutosEncontrados(res.data);
        } catch (e) { console.error(e); }
      }, 500);
      return () => clearTimeout(delay);
    } else {
      setProdutosEncontrados([]);
    }
  }, [buscaProduto]);

  const adicionarItem = (produto: any) => {
    const novoItem = {
      id_produto: produto.ID_PRODUTO,
      nome: produto.NOME_PRODUTO,
      sku: produto.SKU_PRODUTO,
      quantidade: 1,
      valor_unitario: Number(produto.PRECO_VENDA),
      total: Number(produto.PRECO_VENDA)
    };
    setItens([...itens, novoItem]);
    setBuscaProduto('');
    setProdutosEncontrados([]);
  };

  const removerItem = (index: number) => {
    const novaLista = [...itens];
    novaLista.splice(index, 1);
    setItens(novaLista);
  };

  const atualizarQtd = (index: number, novaQtd: number) => {
    const novaLista = [...itens];
    novaLista[index].quantidade = novaQtd;
    novaLista[index].total = novaQtd * novaLista[index].valor_unitario;
    setItens(novaLista);
  };

  const calcularTotalPedido = () => {
    return itens.reduce((acc, item) => acc + item.total, 0);
  };

  const handleSubmit = async () => {
    if (!cliente || !numPedido || itens.length === 0) {
      showToast('Preencha cliente, nº pedido e adicione itens.', 'warning');
      return;
    }

    setLoading(true);
    const payload = {
      nome_cliente: cliente,
      num_pedido: numPedido,
      plataforma: plataforma,
      valor_total: calcularTotalPedido(), // Recalcula no front só pra garantir, mas back deve validar
      itens: itens.map(i => ({
        id_produto: i.id_produto,
        quantidade: i.quantidade,
        valor_unitario: i.valor_unitario
      }))
    };

    try {
      if (pedidoParaEditar) {
        // --- MODO EDIÇÃO (PUT) ---
        await api.put(`/pedidos/${pedidoParaEditar.pedido.ID_PEDIDO}`, payload);
        showToast('Pedido atualizado com sucesso!', 'success');
      } else {
        // --- MODO CRIAÇÃO (POST) ---
        await api.post('/pedidos', payload);
        showToast('Pedido criado com sucesso!', 'success');
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      showToast('Erro ao salvar pedido.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50 rounded-t-xl">
          <h2 className="text-xl font-bold text-gray-700">
            {pedidoParaEditar ? `Editar Pedido #${pedidoParaEditar.pedido.NUM_PEDIDO_PLATAFORMA}` : 'Novo Pedido'}
          </h2>
          <button onClick={onClose}><X className="text-gray-400 hover:text-red-500" /></button>
        </div>

        {/* Body (Scrollável) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Dados Gerais */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Cliente</label>
              <input 
                value={cliente} onChange={e => setCliente(e.target.value)}
                className="w-full border p-2 rounded-lg outline-none focus:border-avivar-tiffany"
                placeholder="Nome do cliente"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Nº Pedido</label>
              <input 
                value={numPedido} onChange={e => setNumPedido(e.target.value)}
                className="w-full border p-2 rounded-lg outline-none focus:border-avivar-tiffany"
                placeholder="Ex: 22050"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Plataforma</label>
              <select 
                value={plataforma} onChange={e => setPlataforma(e.target.value)}
                className="w-full border p-2 rounded-lg outline-none focus:border-avivar-tiffany bg-white"
              >
                <option value="Balcão">Balcão (Loja Física)</option>
                <option value="Shopee">Shopee</option>
                <option value="Mercado Livre">Mercado Livre</option>
                <option value="Elo7">Elo7</option>
                <option value="Instagram">Instagram / WhatsApp</option>
              </select>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Busca de Produtos */}
          <div className="relative z-10">
            <label className="block text-xs font-bold text-gray-500 mb-1">Adicionar Produtos</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input 
                value={buscaProduto} onChange={e => setBuscaProduto(e.target.value)}
                className="w-full pl-10 p-2 border border-gray-300 rounded-lg outline-none focus:border-avivar-tiffany focus:ring-1 focus:ring-avivar-tiffany"
                placeholder="Digite SKU ou Nome do produto..."
              />
            </div>
            
            {/* Lista de Sugestões */}
            {produtosEncontrados.length > 0 && (
              <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-lg shadow-xl mt-1 max-h-60 overflow-y-auto">
                {produtosEncontrados.map(prod => (
                  <div 
                    key={prod.ID_PRODUTO} 
                    onClick={() => adicionarItem(prod)}
                    className="p-3 hover:bg-teal-50 cursor-pointer border-b border-gray-50 last:border-0 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-bold text-gray-700 text-sm">{prod.NOME_PRODUTO}</p>
                      <p className="text-xs text-gray-400">SKU: {prod.SKU_PRODUTO}</p>
                    </div>
                    <span className="font-bold text-avivar-tiffany">R$ {Number(prod.PRECO_VENDA).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tabela de Itens Selecionados */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="p-3">Produto</th>
                  <th className="p-3 text-center w-24">Qtd</th>
                  <th className="p-3 text-right">Unitário</th>
                  <th className="p-3 text-right">Total</th>
                  <th className="p-3 text-center w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {itens.map((item, idx) => (
                  <tr key={idx}>
                    <td className="p-3">
                      <p className="text-sm font-medium text-gray-800">{item.nome}</p>
                      <p className="text-[10px] text-gray-400">{item.sku}</p>
                    </td>
                    <td className="p-3 text-center">
                      <input 
                        type="number" min="1" 
                        value={item.quantidade}
                        onChange={e => atualizarQtd(idx, Number(e.target.value))}
                        className="w-16 text-center border rounded p-1"
                      />
                    </td>
                    <td className="p-3 text-right text-sm">R$ {Number(item.valor_unitario).toFixed(2)}</td>
                    <td className="p-3 text-right text-sm font-bold">R$ {item.total.toFixed(2)}</td>
                    <td className="p-3 text-center">
                      <button onClick={() => removerItem(idx)} className="text-red-400 hover:text-red-600">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {itens.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-400 text-sm">Nenhum item adicionado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 bg-gray-50 rounded-b-xl flex justify-between items-center">
          <div>
            <span className="text-xs text-gray-500 uppercase font-bold block">Total do Pedido</span>
            <span className="text-2xl font-bold text-avivar-tiffany">
              {itens.reduce((acc, i) => acc + i.total, 0).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}
            </span>
          </div>
          
          <button 
            onClick={handleSubmit} 
            disabled={loading}
            className="px-8 py-3 bg-gray-800 text-white rounded-lg font-bold hover:bg-black transition-colors flex items-center gap-2 shadow-lg disabled:opacity-50"
          >
            {loading ? 'Salvando...' : <><Save size={18} /> {pedidoParaEditar ? 'Atualizar Pedido' : 'Finalizar Pedido'}</>}
          </button>
        </div>

      </div>
    </div>
  );
}