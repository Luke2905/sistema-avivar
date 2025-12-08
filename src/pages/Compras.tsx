// src/pages/Compras.tsx
import { useState, useEffect } from 'react';
import { ShoppingBag, Plus, Calendar } from 'lucide-react';
import api from '../services/api';
import ModalNovaCompra from '../components/ModalNovaCompra'; // <--- Importe o novo modal

// Interfaces em Maiúsculo (Banco de Dados)
interface Compra {
  ID_COMPRA: number;
  DATA_COMPRA: string;
  NOME_MATERIA: string;
  SKU_MATERIA: string;
  QTD_COMPRADA: string | number;
  UNIDADE_MEDIDA: string;
  CUSTO_TOTAL: string | number;
  OBSERVACOES: string;
}

interface Materia {
  ID_MATERIA: number;
  NOME_MATERIA: string;
  UNIDADE_MEDIDA: string;
}

export default function Compras() {
  const [compras, setCompras] = useState<Compra[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [modalOpen, setModalOpen] = useState(false); // <--- Controle do modal

  useEffect(() => {
    carregar();
    // Carrega a lista de matérias para passar pro modal
    api.get('/estoque').then(res => setMaterias(res.data));
  }, []);

  async function carregar() {
    try {
      const res = await api.get('/compras');
      setCompras(res.data);
    } catch (error) { console.error(error); }
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <ShoppingBag className="text-avivar-tiffany" /> Compras & Entradas
            </h1>
            <p className="text-sm text-gray-500">Histórico de aquisições de matéria-prima</p>
        </div>
        {/* Botão agora abre o Modal React */}
        <button onClick={() => setModalOpen(true)} className="px-4 py-2 bg-avivar-tiffany text-white rounded hover:bg-teal-600 flex items-center gap-2 font-bold shadow-md">
            <Plus size={18} /> Nova Compra
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                    <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase">Data</th>
                    <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase">Insumo</th>
                    <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase">Fornecedor</th>
                    <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase text-center">Qtd Entrada</th>
                    <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase text-right">Custo Total</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {compras.map(c => (
                    <tr key={c.ID_COMPRA} className="hover:bg-gray-50">
                        <td className="py-4 px-6 text-sm text-gray-600 flex items-center gap-2">
                            <Calendar size={14} className="text-gray-400"/>
                            {new Date(c.DATA_COMPRA).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-4 px-6">
                            <p className="font-bold text-gray-800 text-sm">{c.NOME_MATERIA}</p>
                            <p className="text-xs text-gray-400 font-mono">{c.SKU_MATERIA}</p>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600 uppercase">
                            {c.OBSERVACOES || '-'}
                        </td>
                        <td className="py-4 px-6 text-center">
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold border border-green-200">
                                + {Number(c.QTD_COMPRADA)} {c.UNIDADE_MEDIDA}
                            </span>
                        </td>
                        <td className="py-4 px-6 text-right font-bold text-gray-800">
                             {Number(c.CUSTO_TOTAL).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}
                        </td>
                    </tr>
                ))}
                {compras.length === 0 && (
                    <tr><td colSpan={5} className="p-8 text-center text-gray-400">Nenhuma compra registrada.</td></tr>
                )}
            </tbody>
        </table>
      </div>

      {/* Renderizando o Modal Novo */}
      <ModalNovaCompra 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={carregar}
        materias={materias} // Passamos a lista de insumos para o select
      />

    </div>
  );
}