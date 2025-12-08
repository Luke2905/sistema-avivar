// src/components/ModalNovoPedido.tsx
import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Search } from 'lucide-react';
import api from '../services/api';
import { showToast } from '../utils/swal-config';

interface Produto {
  ID_PRODUTO: number;
  NOME_PRODUTO: string;
  PRECO_VENDA: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ModalNovoPedido({ isOpen, onClose, onSuccess }: Props) {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  
  // Dados do Pedido
  const [cliente, setCliente] = useState('');
  const [numPedido, setNumPedido] = useState('');
  const [plataforma, setPlataforma] = useState('Shopee');
  
  // Itens do carrinho temporário
  const [itens, setItens] = useState<{ id_produto: number; qtd: number; nome: string; valor: number }[]>([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState(''); // ID do select
  
  useEffect(() => {
    if (isOpen) {
      api.get('/produtos').then(res => setProdutos(res.data));
    }
  }, [isOpen]);

  const adicionarItem = () => {
    if (!produtoSelecionado) return;
    const prod = produtos.find(p => p.ID_PRODUTO === Number(produtoSelecionado));
    if (!prod) return;

    setItens([...itens, { 
        id_produto: prod.ID_PRODUTO, 
        qtd: 1, 
        nome: prod.NOME_PRODUTO, 
        valor: Number(prod.PRECO_VENDA) 
    }]);
    setProdutoSelecionado('');
  };

  const removerItem = (index: number) => {
    setItens(itens.filter((_, i) => i !== index));
  };

  const salvarPedido = async () => {
    if (!cliente || itens.length === 0) return showToast('Preencha cliente e adicione itens', 'error');
    
    try {
        await api.post('/pedidos', {
            nome_cliente: cliente,
            num_pedido: numPedido || 'BALCÃO',
            plataforma,
            itens: itens.map(i => ({
                id_produto: i.id_produto,
                quantidade: i.qtd,
                valor_unitario: i.valor
            }))
        });
        showToast('Pedido Criado!');
        onSuccess();
        onClose();
        // Limpar form...
    } catch (error) {
        showToast('Erro ao criar pedido', 'error');
    }
  };

  if (!isOpen) return null;

  const total = itens.reduce((acc, item) => acc + (item.qtd * item.valor), 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl h-[90vh] flex flex-col">
        
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Novo Pedido</h2>
            <button onClick={onClose}><X className="text-gray-400 hover:text-red-500" /></button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
            {/* Cabeçalho do Pedido */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 mb-1">Cliente</label>
                    <input value={cliente} onChange={e => setCliente(e.target.value)} className="w-full border rounded p-2" placeholder="Nome do Cliente" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Plataforma</label>
                    <select value={plataforma} onChange={e => setPlataforma(e.target.value)} className="w-full border rounded p-2">
                        <option>Shopee</option>
                        <option>Mercado Livre</option>
                        <option>WhatsApp</option>
                        <option>Loja Física</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Nº Pedido (Opcional)</label>
                    <input value={numPedido} onChange={e => setNumPedido(e.target.value)} className="w-full border rounded p-2" placeholder="Ex: #1234" />
                </div>
            </div>

            <hr className="mb-6 border-gray-100" />

            {/* Adicionar Produtos */}
            <div className="flex gap-2 mb-4 items-end">
                <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 mb-1">Adicionar Produto</label>
                    <select value={produtoSelecionado} onChange={e => setProdutoSelecionado(e.target.value)} className="w-full border rounded p-2 bg-gray-50">
                        <option value="">Selecione um produto...</option>
                        {produtos.map(p => (
                            <option key={p.ID_PRODUTO} value={p.ID_PRODUTO}>{p.NOME_PRODUTO} - R$ {Number(p.PRECO_VENDA).toFixed(2)}</option>
                        ))}
                    </select>
                </div>
                <button onClick={adicionarItem} className="bg-avivar-tiffany text-white p-2 rounded hover:bg-teal-600"><Plus /></button>
            </div>

            {/* Lista de Itens */}
            <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                    <tr>
                        <th className="p-2 text-left">Produto</th>
                        <th className="p-2 w-20">Qtd</th>
                        <th className="p-2 w-24 text-right">Valor</th>
                        <th className="p-2 w-10"></th>
                    </tr>
                </thead>
                <tbody>
                    {itens.map((item, idx) => (
                        <tr key={idx} className="border-b">
                            <td className="p-2">{item.nome}</td>
                            <td className="p-2">
                                <input type="number" value={item.qtd} onChange={e => {
                                    const novos = [...itens];
                                    novos[idx].qtd = Number(e.target.value);
                                    setItens(novos);
                                }} className="w-16 border rounded p-1 text-center" min="1" />
                            </td>
                            <td className="p-2 text-right">R$ {(item.valor * item.qtd).toFixed(2)}</td>
                            <td className="p-2 text-center">
                                <button onClick={() => removerItem(idx)} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center rounded-b-xl">
            <div>
                <span className="text-gray-500 text-sm">Total do Pedido</span>
                <p className="text-2xl font-bold text-avivar-pink">R$ {total.toFixed(2)}</p>
            </div>
            <button onClick={salvarPedido} className="px-6 py-3 bg-avivar-tiffany text-white font-bold rounded-lg hover:bg-teal-600 shadow-lg">
                Confirmar Pedido
            </button>
        </div>
      </div>
    </div>
  );
}