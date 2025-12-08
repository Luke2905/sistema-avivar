// src/components/ModalDetalhesPedido.tsx
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { X, Printer, User, Calendar, Box, ShoppingBag } from 'lucide-react';
import { ImpressoPedido } from './ImpressoPedido';
import { GerenciadorArtes } from '../components/GerenciadorArtes';
// Interfaces alinhadas com o Banco de Dados (Maiúsculas)
interface Item {
  ID_ITEM: number;
  QUANTIDADE: number;
  VALOR_UNITARIO: string | number;
  NOME_PRODUTO: string;
  SKU_PRODUTO: string;
}

interface PedidoDetalhes {
  pedido: {
    ID_PEDIDO: number;
    NOME_CLIENTE: string;
    NUM_PEDIDO_PLATAFORMA: string;
    DATA_PEDIDO: string;
    STATUS_PEDIDO: string;
    VALOR_TOTAL: string | number;
    PLATAFORMA_ORIGEM: string;
  };
  itens: Item[];
}

interface Props {
  isOpen: boolean;
  dados: PedidoDetalhes | null;
  onClose: () => void;
}

export default function ModalDetalhesPedido({ isOpen, dados, onClose }: Props) {
  const componentRef = useRef<HTMLDivElement>(null); // Referência para o papel de impressão

  // Configuração da impressão
  const handlePrint = useReactToPrint({
    contentRef: componentRef, // Atualizado para sintaxe mais recente, se der erro use 'content: () => componentRef.current'
    documentTitle: `Pedido_${dados?.pedido.NUM_PEDIDO_PLATAFORMA || 'Avivar'}`,
  });

  // Só renderiza se estiver aberto e tiver dados
  if (!isOpen || !dados) return null;

  const { pedido, itens } = dados;

  return (
    <>
      {/* --- COMPONENTE INVISÍVEL (SERÁ USADO APENAS NA IMPRESSÃO) --- */}
      <div style={{ display: "none" }}>
        <ImpressoPedido ref={componentRef} dados={dados} />
      </div>

      {/* --- O MODAL VISÍVEL NA TELA --- */}
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fadeIn">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden relative flex flex-col max-h-[90vh]">
          
          {/* Cabeçalho do Modal */}
          <div className="bg-avivar-tiffany p-6 flex justify-between items-start text-white shrink-0">
            <div>
              <h2 className="text-2xl font-bold">Pedido #{pedido.NUM_PEDIDO_PLATAFORMA || 'BALCÃO'}</h2>
              <p className="text-teal-100 text-sm flex items-center gap-2 mt-1">
                <Calendar size={14} /> {new Date(pedido.DATA_PEDIDO).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <button 
              onClick={onClose} 
              className="text-white/80 hover:text-white hover:bg-white/20 p-1 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Corpo do Modal (Com Scroll se for muito grande) */}
          <div className="p-6 overflow-y-auto">
            
            {/* Info Cliente e Origem */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 pb-4 border-b border-gray-100">
              
              {/* Cliente */}
              <div className="flex items-center gap-3 md:col-span-2">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                  <User size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold">Cliente</p>
                  <p className="text-base font-medium text-gray-800">{pedido.NOME_CLIENTE}</p>
                </div>
              </div>

              {/* Origem (Plataforma) */}
              <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-500">
                      <ShoppingBag size={20} />
                  </div>
                  <div>
                      <p className="text-xs text-gray-500 uppercase font-bold">Origem</p>
                      <p className="text-base font-bold text-orange-600">{pedido.PLATAFORMA_ORIGEM || 'Não inf.'}</p>
                  </div>
              </div>
            </div>

            {/* Tabela de Itens */}
            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <Box size={16} /> Itens do Pedido
            </h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 font-medium">
                  <tr>
                    <th className="p-3">Produto</th>
                    <th className="p-3 text-center">Qtd</th>
                    <th className="p-3 text-right">Valor Unit.</th>
                    <th className="p-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {itens.map(item => (
                    <tr key={item.ID_ITEM}>
                      <td className="p-3">
                        <p className="font-medium text-gray-800">{item.NOME_PRODUTO}</p>
                        <p className="text-xs text-gray-400 font-mono">{item.SKU_PRODUTO}</p>
                      </td>
                      <td className="p-3 text-center">{item.QUANTIDADE}</td>
                      <td className="p-3 text-right">
                        {Number(item.VALOR_UNITARIO).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="p-3 text-right font-bold text-gray-700">
                        {(Number(item.VALOR_UNITARIO) * item.QUANTIDADE).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={3} className="p-3 text-right font-bold text-gray-600">TOTAL DO PEDIDO:</td>
                    <td className="p-3 text-right font-bold text-avivar-pink text-lg">
                      {Number(pedido.VALOR_TOTAL).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <h3 className="font-bold mb-2">Arquivos e Artes</h3>
            <GerenciadorArtes idPedido={pedido.ID_PEDIDO} />
          </div>

          {/* Rodapé com Botões (Fixo embaixo) */}
          <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0 rounded-b-xl">
            <button 
              onClick={() => handlePrint()} 
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-200 flex items-center gap-2 text-sm font-medium transition-colors"
            >
              <Printer size={16} /> Imprimir Ficha
            </button>
            <button 
              onClick={onClose} 
              className="px-4 py-2 bg-avivar-tiffany text-white rounded hover:bg-teal-600 text-sm font-bold shadow-sm transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}