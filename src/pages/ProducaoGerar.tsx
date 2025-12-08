// src/pages/ProducaoGerar.tsx
import { useState, useEffect } from 'react';
import { Printer, FileText, Trash2, RefreshCw, AlertCircle, CheckCircle, Clock, Play } from 'lucide-react';
import api from '../services/api';
import MySwal, { showToast } from '../utils/swal-config';

export default function ProducaoGerar() {
  const [pendentes, setPendentes] = useState<any[]>([]);
  const [todasOps, setTodasOps] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { carregarDados(); }, []);

  async function carregarDados() {
    setLoading(true);
    try {
      const resPendentes = await api.get('/producao/pendentes'); 
      setPendentes(resPendentes.data);

      const resTodas = await api.get('/producao/todas');
      setTodasOps(resTodas.data);
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  }

  // --- GERAR NOVA OP ---
  async function gerarOP(pedido: any) {
    try {
      const res = await api.post('/producao/gerar', { id_pedido: pedido.ID_PEDIDO });
      const codigoOP = res.data.codigo_barras;

      // Mostra a "Etiqueta" na tela
      await MySwal.fire({
        title: 'OP Gerada!',
        html: `
            <div class="bg-white border-2 border-dashed border-gray-800 p-4 rounded text-center">
                <h3 class="text-lg font-bold">ORDEM DE PRODUÇÃO</h3>
                <h1 class="text-5xl font-black my-2">${codigoOP}</h1>
                <p class="text-sm">${pedido.NOME_CLIENTE}</p>
                <div class="mt-2 bg-black h-8 w-full mx-auto max-w-[200px]"></div>
            </div>
        `,
        confirmButtonText: 'Imprimir',
        confirmButtonColor: '#0ABAB5'
      });

      carregarDados();
    } catch (error) { showToast('Erro ao gerar OP', 'error'); }
  }

  // --- EXCLUIR OP ---
  async function excluirOp(idOp: number) {
    const result = await MySwal.fire({
        title: 'Cancelar OP?',
        text: `Deseja excluir a OP-${idOp}? O pedido voltará para a fila de "Imprimindo".`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Sim, excluir'
    });

    if (result.isConfirmed) {
        try {
            await api.delete(`/producao/${idOp}`);
            showToast('OP Excluída.', 'success');
            carregarDados();
        } catch (e) { showToast('Erro ao excluir', 'error'); }
    }
  }

  const getStatusBadge = (status: string) => {
      if(status === 'ABERTA') return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-[10px] font-bold border border-blue-200 flex items-center gap-1"><FileText size={10}/> ABERTA</span>;
      if(status === 'EM_ANDAMENTO') return <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-[10px] font-bold border border-orange-200 flex items-center gap-1"><Play size={10}/> PRODUZINDO</span>;
      if(status === 'CONCLUIDA') return <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-[10px] font-bold border border-green-200 flex items-center gap-1"><CheckCircle size={10}/> CONCLUÍDA</span>;
      return null;
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Printer className="text-avivar-pink" /> Central de OPs (PCP)
        </h1>
        <button onClick={carregarDados} className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-100 text-gray-500">
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* COLUNA DA ESQUERDA: PEDIDOS PENDENTES (1/3 da tela) */}
        <div className="xl:col-span-1 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-600 uppercase text-sm tracking-wider flex items-center gap-2">
                    <AlertCircle size={16}/> Pendentes de OP ({pendentes.length})
                </h3>
            </div>

            <div className="space-y-3">
                {pendentes.map(p => (
                    <div key={p.ID_PEDIDO} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all group">
                        <div className="flex justify-between items-start mb-2">
                            <span className="font-mono text-xs font-bold bg-gray-100 px-2 py-1 rounded">#{p.NUM_PEDIDO_PLATAFORMA}</span>
                            <span className="text-[10px] text-gray-400">{new Date(p.DATA_PEDIDO).toLocaleDateString()}</span>
                        </div>
                        <p className="font-bold text-gray-800 text-sm mb-1">{p.NOME_CLIENTE}</p>
                        <p className="text-xs text-gray-500 mb-3">{p.PLATAFORMA_ORIGEM}</p>
                        
                        <button 
                            onClick={() => gerarOP(p)}
                            className="w-full bg-avivar-tiffany hover:bg-teal-600 text-white text-xs font-bold py-2 rounded flex items-center justify-center gap-2 transition-colors uppercase"
                        >
                            <Printer size={14} /> Gerar OP
                        </button>
                    </div>
                ))}
                {pendentes.length === 0 && <div className="p-8 text-center text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">Fila limpa! Sem pedidos pendentes.</div>}
            </div>
        </div>

        {/* COLUNA DA DIREITA: GERENCIAMENTO DE OPS (2/3 da tela) */}
        <div className="xl:col-span-2">
            <h3 className="font-bold text-gray-600 uppercase text-sm tracking-wider mb-4 flex items-center gap-2">
                <FileText size={16}/> Histórico e Status de OPs
            </h3>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase">
                        <tr>
                            <th className="px-6 py-4">OP #</th>
                            <th className="px-6 py-4">Pedido / Cliente</th>
                            <th className="px-6 py-4 text-center">Status</th>
                            <th className="px-6 py-4">Responsável</th>
                            <th className="px-6 py-4 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {todasOps.map(op => (
                            <tr key={op.ID_ORDEM} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-mono font-bold text-gray-700">OP-{op.ID_ORDEM}</td>
                                <td className="px-6 py-4">
                                    <p className="font-bold text-gray-800">{op.NUM_PEDIDO_PLATAFORMA}</p>
                                    <p className="text-xs text-gray-500">{op.NOME_CLIENTE}</p>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex justify-center">{getStatusBadge(op.STATUS_OP)}</div>
                                </td>
                                <td className="px-6 py-4 text-gray-600">
                                    {op.RESPONSAVEL || '-'}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {/* Só permite excluir se não estiver concluída (ou permite sempre, vc decide) */}
                                    <button 
                                        onClick={() => excluirOp(op.ID_ORDEM)}
                                        className="text-gray-300 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors"
                                        title="Excluir OP e retornar pedido"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {todasOps.length === 0 && (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-400">Nenhuma OP gerada ainda.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>

      </div>
    </div>
  );
}