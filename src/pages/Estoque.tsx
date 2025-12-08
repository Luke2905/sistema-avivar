// src/pages/Estoque.tsx
import { useState, useEffect } from 'react';
import { Boxes, Plus, AlertTriangle, Save } from 'lucide-react';
import api from '../services/api';
import MySwal, { showToast } from '../utils/swal-config';
import ModalNovoInsumo from '../components/ModalNovoInsumo';

// CORREÇÃO: Interface em MAIÚSCULO (igual vem do Banco de Dados)
interface Materia {
  ID_MATERIA: number;
  SKU_MATERIA: string;
  NOME_MATERIA: string;
  UNIDADE_MEDIDA: string;
  CUSTO_UNITARIO: string | number;
  SALDO_ESTOQUE: string | number;
  ESTOQUE_MINIMO: string | number;
  FORNECEDOR: string;
  alerta_baixo: number; // Esse continua minúsculo pois é um apelido criado no SQL (AS alerta_baixo)
}

export default function Estoque() {
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    try {
      const res = await api.get('/estoque');
      console.log("Estoque:", res.data); // Debug para confirmar
      setMaterias(res.data);
    } catch (error) { console.error(error); }
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
        
        <button onClick={() => setModalOpen(true)} className="px-4 py-2 bg-avivar-tiffany text-white rounded hover:bg-teal-600 flex items-center gap-2 font-bold shadow-sm">
            <Plus size={18} /> Novo Insumo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {materias.map(m => (
          <div key={m.ID_MATERIA} className={`bg-white p-4 rounded-lg border-l-4 shadow-sm hover:shadow-md transition-all ${m.alerta_baixo ? 'border-l-red-500' : 'border-l-green-500'}`}>
            
            {/* Cabeçalho do Card */}
            <div className="flex justify-between items-start">
                <div>
                    {/* CORREÇÃO: Usando SKU_MATERIA */}
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        {m.SKU_MATERIA}
                    </span>
                    {/* CORREÇÃO: Usando NOME_MATERIA */}
                    <h3 className="font-bold text-gray-800 text-lg">
                        {m.NOME_MATERIA}
                    </h3>
                    {/* CORREÇÃO: Usando FORNECEDOR */}
                    <p className="text-xs text-gray-500">
                        {m.FORNECEDOR || 'Fornecedor não inf.'}
                    </p>
                </div>
                {m.alerta_baixo === 1 && (
                    <div className="text-red-500 animate-pulse" title="Estoque Baixo!">
                        <AlertTriangle size={20} />
                    </div>
                )}
            </div>

            {/* Corpo do Card */}
            <div className="mt-4 flex items-end justify-between bg-gray-50 p-3 rounded">
                <div>
                    {/* CORREÇÃO: Usando UNIDADE_MEDIDA */}
                    <p className="text-xs text-gray-500 mb-1">Saldo Atual ({m.UNIDADE_MEDIDA})</p>
                    <div className="flex items-center gap-2">
                        {/* CORREÇÃO: Usando SALDO_ESTOQUE */}
                        <span className={`text-2xl font-bold ${m.alerta_baixo ? 'text-red-600' : 'text-gray-700'}`}>
                            {Number(m.SALDO_ESTOQUE).toLocaleString('pt-BR')}
                        </span>
                        <button 
                            onClick={() => atualizarSaldo(m.ID_MATERIA, m.SALDO_ESTOQUE)} 
                            className="p-1 text-gray-400 hover:text-avivar-tiffany" 
                            title="Ajustar Saldo"
                        >
                            <Save size={14} />
                        </button>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xs text-gray-500">Custo Unit.</p>
                    {/* CORREÇÃO: Usando CUSTO_UNITARIO */}
                    <p className="font-medium text-avivar-pink">
                        R$ {Number(m.CUSTO_UNITARIO).toFixed(2)}
                    </p>
                </div>
            </div>
            
            {/* Rodapé do Card */}
            <div className="mt-2 flex justify-between text-xs text-gray-400 px-1">
                {/* CORREÇÃO: Usando ESTOQUE_MINIMO */}
                <span>Mínimo: {Number(m.ESTOQUE_MINIMO)}</span>
                {m.alerta_baixo === 1 && <span className="text-red-500 font-bold">COMPRAR URGENTE</span>}
            </div>
          </div>
        ))}
      </div>
      
      {materias.length === 0 && (
        <div className="text-center py-10 text-gray-400">Nenhum insumo cadastrado.</div>
      )}

      <ModalNovoInsumo 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={carregar} 
      />
    </div>
  );
}