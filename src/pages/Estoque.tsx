// src/pages/Estoque.tsx
import { useState, useEffect } from 'react';
import { Boxes, Plus, AlertTriangle, Save, Pencil, Trash2 } from 'lucide-react'; // Adicionados ícones
import api from '../services/api';
import MySwal, { showToast } from '../utils/swal-config';
import ModalNovoInsumo from '../components/ModalNovoInsumo';

interface Materia {
  ID_MATERIA: number;
  SKU_MATERIA: string;
  NOME_MATERIA: string;
  UNIDADE_MEDIDA: string;
  CUSTO_UNITARIO: string | number;
  SALDO_ESTOQUE: string | number;
  ESTOQUE_MINIMO: string | number;
  FORNECEDOR: string;
  alerta_baixo: number; 
}

export default function Estoque() {
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Novo estado: Guarda quem está sendo editado
  const [itemParaEditar, setItemParaEditar] = useState<Materia | null>(null);

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    try {
      // Nota: Ajustei a rota para /materias para bater com seu backend novo, 
      // mas se lá estiver /estoque, mantenha /estoque.
      const res = await api.get('/estoque'); 
      setMaterias(res.data);
    } catch (error) { console.error(error); }
  }

  // ABRIR MODAL (NOVO)
  function handleNovo() {
      setItemParaEditar(null); // Limpa edição
      setModalOpen(true);
  }

  // ABRIR MODAL (EDITAR)
  function handleEditar(item: Materia) {
      setItemParaEditar(item); // Define quem é
      setModalOpen(true);
  }

  // DELETAR
  async function handleDeletar(id: number, nome: string) {
    const result = await MySwal.fire({
        title: 'Tem certeza?',
        text: `Você vai excluir o insumo "${nome}".`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sim, excluir!',
        cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
        try {
            await api.delete(`/estoque/${id}`);
            showToast('Item excluído.', 'success');
            setMaterias(prev => prev.filter(m => m.ID_MATERIA !== id)); // Atualiza visualmente
        } catch (error: any) {
            // Mostra aquela mensagem do backend se o item já estiver em uso
            const msg = error.response?.data?.mensagem || 'Erro ao excluir.';
            MySwal.fire('Erro', msg, 'error');
        }
    }
  }

  // ATUALIZAR SALDO RÁPIDO (Mantido sua lógica original)
  const atualizarSaldo = async (id: number, saldoAtual: string | number) => {
    const { value: novoSaldo } = await MySwal.fire({
      title: 'Ajuste de Inventário',
      input: 'number',
      inputValue: String(saldoAtual),
      inputLabel: 'Digite o saldo real em estoque:',
      showCancelButton: true,
      confirmButtonColor: '#0ABAB5'
    });

    if (novoSaldo) {
        try {
            await api.patch(`/estoque/${id}/saldo`, { novo_saldo: novoSaldo });
            showToast('Estoque ajustado!');
            carregar();
        } catch (e) {
            showToast('Erro ao atualizar', 'error');
        }
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-700 flex items-center gap-2">
            <Boxes className="text-avivar-tiffany" /> Controle de Estoque
        </h1>
        
        <button 
            onClick={handleNovo} 
            className="px-4 py-2 bg-avivar-tiffany text-white rounded hover:bg-teal-600 flex items-center gap-2 font-bold shadow-sm transition-transform hover:scale-105"
        >
            <Plus size={18} /> Novo Insumo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {materias.map(m => (
          <div key={m.ID_MATERIA} className={`relative group bg-white p-4 rounded-lg border-l-4 shadow-sm hover:shadow-md transition-all ${m.alerta_baixo ? 'border-l-red-500' : 'border-l-green-500'}`}>
            
            {/* --- BOTÕES DE AÇÃO (EDITAR / EXCLUIR) --- */}
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                    onClick={() => handleEditar(m)}
                    className="p-1.5 bg-gray-100 text-blue-500 rounded hover:bg-blue-50"
                    title="Editar Cadastro"
                >
                    <Pencil size={16} />
                </button>
                <button 
                    onClick={() => handleDeletar(m.ID_MATERIA, m.NOME_MATERIA)}
                    className="p-1.5 bg-gray-100 text-red-500 rounded hover:bg-red-50"
                    title="Excluir Item"
                >
                    <Trash2 size={16} />
                </button>
            </div>

            {/* Cabeçalho do Card */}
            <div className="flex justify-between items-start pr-16"> {/* pr-16 para não bater nos botões */}
                <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                        {m.SKU_MATERIA}
                    </span>
                    <h3 className="font-bold text-gray-800 text-lg leading-tight mt-1">
                        {m.NOME_MATERIA}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                       🏢 {m.FORNECEDOR || 'Fornecedor não inf.'}
                    </p>
                </div>
            </div>

            {/* Corpo do Card */}
            <div className="mt-4 flex items-end justify-between bg-gray-50 p-3 rounded border border-gray-100">
                <div>
                    <p className="text-xs text-gray-500 mb-1">Saldo ({m.UNIDADE_MEDIDA})</p>
                    <div className="flex items-center gap-2">
                        <span className={`text-2xl font-bold ${m.alerta_baixo ? 'text-red-600' : 'text-gray-700'}`}>
                            {Number(m.SALDO_ESTOQUE).toLocaleString('pt-BR')}
                        </span>
                        <button 
                            onClick={() => atualizarSaldo(m.ID_MATERIA, m.SALDO_ESTOQUE)} 
                            className="p-1 text-gray-400 hover:text-avivar-tiffany hover:bg-white rounded-full transition-colors" 
                            title="Ajuste Rápido de Saldo"
                        >
                            <Save size={16} />
                        </button>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xs text-gray-500">Custo Unit.</p>
                    <p className="font-medium text-avivar-pink">
                        R$ {Number(m.CUSTO_UNITARIO).toFixed(2)}
                    </p>
                </div>
            </div>
            
            {/* Rodapé do Card */}
            <div className="mt-2 flex justify-between items-center text-xs px-1 h-6">
                <span className="text-gray-400">Estoque Mínimo: {Number(m.ESTOQUE_MINIMO)}</span>
                {m.alerta_baixo === 1 && (
                    <div className="flex items-center gap-1 text-red-500 font-bold animate-pulse">
                        <AlertTriangle size={12} /> REPOR ESTOQUE
                    </div>
                )}
            </div>
          </div>
        ))}
      </div>
      
      {materias.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-300">
            <Boxes size={64} className="mb-4 opacity-50"/>
            <p className="text-lg">Nenhum insumo cadastrado.</p>
        </div>
      )}

      {/* O Modal agora recebe o item para editar */}
      <ModalNovoInsumo 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={carregar} 
        insumoParaEditar={itemParaEditar} 
      />
    </div>
  );
}