// src/components/ImpressoPedido.tsx
import React from 'react';

// Reutilizando as interfaces que já temos
interface Item {
  ID_ITEM: number;
  QUANTIDADE: number;
  VALOR_UNITARIO: string;
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
    VALOR_TOTAL: string;
    PLATAFORMA_ORIGEM: string;
  };
  itens: Item[];
}

interface Props {
  dados: PedidoDetalhes | null;
}

// Usamos forwardRef para que a biblioteca de impressão consiga "agarrar" esse componente
export const ImpressoPedido = React.forwardRef<HTMLDivElement, Props>(({ dados }, ref) => {
  if (!dados) return null;

  const { pedido, itens } = dados;

  return (
    <div ref={ref} className="p-8 bg-white text-black font-sans max-w-[210mm] mx-auto">
      {/* --- CABEÇALHO DA EMPRESA --- */}
      <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
        <h1 className="text-3xl font-bold uppercase tracking-wider">Avivar</h1>
        <p className="text-sm text-gray-600">Sistema de Gestão ERP</p>
        <p className="text-xs text-gray-400 mt-1">Impresso em: {new Date().toLocaleString('pt-BR')}</p>
      </div>

      {/* --- DADOS DO PEDIDO --- */}
      <div className="flex justify-between mb-8 border border-gray-300 p-4 rounded">
        <div>
            <p className="text-xs text-gray-500 uppercase font-bold">Cliente</p>
            <p className="font-bold text-lg">{pedido.NOME_CLIENTE}</p>
        </div>
        <div className="text-right">
            <p className="text-xs text-gray-500 uppercase font-bold">Pedido Nº</p>
            <p className="font-bold text-lg">#{pedido.NUM_PEDIDO_PLATAFORMA || 'BALCÃO'}</p>
            <p className="text-xs text-gray-500">{new Date(pedido.DATA_PEDIDO).toLocaleDateString('pt-BR')}</p>
        </div>
      </div>

      {/* --- TABELA DE ITENS --- */}
      <div className="mb-8">
        <h3 className="font-bold border-b border-gray-300 mb-2 pb-1">ITENS DA SEPARAÇÃO</h3>
        <table className="w-full text-sm text-left">
            <thead>
                <tr className="border-b border-black">
                    <th className="py-2">Qtd</th>
                    <th className="py-2">SKU</th>
                    <th className="py-2">Produto</th>
                    <th className="py-2 text-right">Unit.</th>
                    <th className="py-2 text-right">Total</th>
                </tr>
            </thead>
            <tbody>
                {itens.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-100">
                        <td className="py-3 font-bold">{item.QUANTIDADE}</td>
                        <td className="py-3 font-mono text-xs">{item.SKU_PRODUTO}</td>
                        <td className="py-3">{item.NOME_PRODUTO}</td>
                        <td className="py-3 text-right">
                            {Number(item.VALOR_UNITARIO).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </td>
                        <td className="py-3 text-right font-bold">
                            {(Number(item.VALOR_UNITARIO) * item.QUANTIDADE).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>

      {/* --- TOTAIS --- */}
      <div className="flex justify-end">
        <div className="w-48">
            <div className="flex justify-between py-2 border-t-2 border-black">
                <span className="font-bold text-lg">TOTAL:</span>
                <span className="font-bold text-lg">
                    {Number(pedido.VALOR_TOTAL).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
            </div>
        </div>
      </div>

      {/* --- RODAPÉ / CHECKLIST --- */}
      <div className="mt-12 pt-6 border-t border-dashed border-gray-400">
        <p className="font-bold mb-4 text-center text-sm">Checklist de Conferência</p>
        <div className="flex justify-center gap-8 text-xs text-gray-500">
            <div className="flex items-center gap-2">
                <div className="w-4 h-4 border border-black"></div> Produtos Corretos
            </div>
            <div className="flex items-center gap-2">
                <div className="w-4 h-4 border border-black"></div> Sem Avarias
            </div>
            <div className="flex items-center gap-2">
                <div className="w-4 h-4 border border-black"></div> Embalagem Ok
            </div>
        </div>
        
        <div className="mt-12 flex justify-between items-end">
            <div className="w-64 border-t border-black text-center text-xs pt-1">
                Responsável pela Separação
            </div>
            <div className="w-64 border-t border-black text-center text-xs pt-1">
                Responsável pela Entrega
            </div>
        </div>
      </div>
    </div>
  );
});

ImpressoPedido.displayName = 'ImpressoPedido';