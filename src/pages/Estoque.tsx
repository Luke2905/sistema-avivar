import { useState, useEffect } from 'react';
import { Boxes, Plus, AlertTriangle, Save, Pencil, Trash2 } from 'lucide-react';
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
  const [itemParaEditar, setItemParaEditar] = useState<Materia | null>(null);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    try {
      const res = await api.get('/estoque');
      setMaterias(res.data);
    } catch (error) {
      console.error(error);
    }
  }

  function handleNovo() {
    setItemParaEditar(null);
    setModalOpen(true);
  }

  function handleEditar(item: Materia) {
    setItemParaEditar(item);
    setModalOpen(true);
  }

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
        setMaterias(prev => prev.filter(m => m.ID_MATERIA !== id));
      } catch (error: any) {
        const msg = error.response?.data?.mensagem || 'Erro ao excluir.';
        MySwal.fire('Erro', msg, 'error');
      }
    }
  }

  const atualizarSaldo = async (id: number, saldoAtual: string | number) => {
    const { value: novoSaldo } = await MySwal.fire({
      title: 'Ajuste de Inventário',
      input: 'number',
      inputValue: String(saldoAtual),
      inputLabel: 'Digite o saldo real em estoque:',
      showCancelButton: true,
      confirmButtonColor: '#0ABAB5'
    });

    if (novoSaldo !== undefined) {
      try {
        await api.patch(`/estoque/${id}/saldo`, { novo_saldo: novoSaldo });
        showToast('Estoque ajustado!');
        carregar();
      } catch {
        showToast('Erro ao atualizar', 'error');
      }
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen flex flex-col">
      
      {/* HEADER FIXO */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-700 flex items-center gap-2">
          <Boxes className="text-avivar-tiffany" />
          Controle de Estoque
        </h1>

        <button
          onClick={handleNovo}
          className="px-4 py-2 bg-avivar-tiffany text-white rounded hover:bg-teal-600 flex items-center gap-2 font-bold shadow-sm transition-transform hover:scale-105"
        >
          <Plus size={18} />
          Novo Insumo
        </button>
      </div>

      {/* LISTA COM SCROLL */}
      <div className="flex-1 overflow-y-auto pr-2 scroll-smooth">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {materias.map(m => (
            <div
              key={m.ID_MATERIA}
              className={`relative group bg-white p-4 rounded-lg border-l-4 shadow-sm hover:shadow-md transition-all
                ${m.alerta_baixo ? 'border-l-red-500' : 'border-l-green-500'}
              `}
            >
              {/* BOTÕES */}
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

              {/* HEADER CARD */}
              <div className="pr-16">
                <span className="text-xs font-bold text-gray-400 uppercase">
                  {m.SKU_MATERIA}
                </span>
                <h3 className="font-bold text-gray-800 text-lg mt-1">
                  {m.NOME_MATERIA}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  🏢 {m.FORNECEDOR || 'Fornecedor não informado'}
                </p>
              </div>

              {/* CORPO */}
              <div className="mt-4 flex justify-between bg-gray-50 p-3 rounded border">
                <div>
                  <p className="text-xs text-gray-500">Saldo ({m.UNIDADE_MEDIDA})</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-2xl font-bold ${m.alerta_baixo ? 'text-red-600' : 'text-gray-700'}`}>
                      {Number(m.SALDO_ESTOQUE).toLocaleString('pt-BR')}
                    </span>
                    <button
                      onClick={() => atualizarSaldo(m.ID_MATERIA, m.SALDO_ESTOQUE)}
                      className="p-1 text-gray-400 hover:text-avivar-tiffany"
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

              {/* RODAPÉ */}
              <div className="mt-2 flex justify-between text-xs">
                <span className="text-gray-400">
                  Estoque Mínimo: {Number(m.ESTOQUE_MINIMO)}
                </span>
                {m.alerta_baixo === 1 && (
                  <div className="flex items-center gap-1 text-red-500 font-bold animate-pulse">
                    <AlertTriangle size={12} />
                    REPOR ESTOQUE
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {materias.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-300">
            <Boxes size={64} className="mb-4 opacity-50" />
            <p className="text-lg">Nenhum insumo cadastrado.</p>
          </div>
        )}
      </div>

      {/* MODAL */}
      <ModalNovoInsumo
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={carregar}
        insumoParaEditar={itemParaEditar}
      />
    </div>
  );
}
