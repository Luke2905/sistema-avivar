// src/components/ModalDetalhesProducao.tsx
import { X, Calendar, User, Box, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../services/api';

interface Item {
  QUANTIDADE: number;
  NOME_PRODUTO: string;
  SKU_PRODUTO: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  idPedido: number | null;
}

export default function ModalDetalhesProducao({ isOpen, onClose, idPedido }: Props) {
  const [itens, setItens] = useState<Item[]>([]);
  const [pedidoInfo, setPedidoInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && idPedido) {
      carregarDetalhes();
    }
  }, [isOpen, idPedido]);

  async function carregarDetalhes() {
    setLoading(true);
    try {
      const res = await api.get(`/pedidos/${idPedido}`);
      setPedidoInfo(res.data.pedido);
      setItens(res.data.itens);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Cabeçalho de Produção (Laranja) */}
        <div className="bg-orange-600 p-5 flex justify-between items-center text-white shrink-0">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
               <Box size={24}/> Ordem de Produção
            </h2>
            <p className="text-orange-200 text-sm mt-1">
               Pedido: <strong>#{pedidoInfo?.NUM_PEDIDO_PLATAFORMA}</strong>
            </p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/20">
            <X size={24} />
          </button>
        </div>

        {loading ? (
            <div className="p-10 text-center text-gray-500">Carregando dados...</div>
        ) : (
            <div className="p-6 overflow-y-auto">
                
                {/* Dados do Cliente e Data */}
                <div className="grid grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1">
                            <User size={12}/> Cliente
                        </p>
                        <p className="font-bold text-gray-800">{pedidoInfo?.NOME_CLIENTE}</p>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1">
                            <Calendar size={12}/> Data Pedido
                        </p>
                        <p className="font-bold text-gray-800">
                            {new Date(pedidoInfo?.DATA_PEDIDO).toLocaleDateString('pt-BR')}
                        </p>
                    </div>
                </div>

                {/* LISTA DE TAREFAS (ITENS) */}
                <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Itens para Produzir</h3>
                <div className="space-y-3">
                    {itens.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4 border-b border-gray-100 pb-3 last:border-0">
                            <div className="h-10 w-10 bg-orange-100 text-orange-700 rounded-lg flex items-center justify-center font-bold text-lg">
                                {item.QUANTIDADE}x
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-gray-800 text-lg leading-tight">{item.NOME_PRODUTO}</p>
                                <p className="text-sm font-mono text-gray-500 bg-gray-100 inline-block px-1 rounded mt-1">
                                    {item.SKU_PRODUTO}
                                </p>
                            </div>
                            <div className="h-6 w-6 border-2 border-gray-300 rounded-full"></div>
                        </div>
                    ))}
                </div>

                {/* Obs: Sem valores financeiros aqui! Apenas trabalho. */}
            </div>
        )}

        <div className="p-4 bg-gray-50 border-t border-gray-200 text-center">
            <button onClick={onClose} className="text-gray-500 font-bold hover:text-gray-800 transition-colors">
                Fechar Janela
            </button>
        </div>

      </div>
    </div>
  );
}