// src/pages/PedidosLista.tsx
import { useState, useEffect } from 'react';
import { Plus, Filter, Calendar, Eye, Upload, Trash2, FileText, CheckCircle, FileCheck } from 'lucide-react';
import api from '../services/api';
import MySwal, { showToast } from '../utils/swal-config';

import ModalNovoPedido from '../components/ModalNovoPedido';
import ModalDetalhesPedido from '../components/ModalDetalhesPedido';
import ModalImportarPedidos from '../components/ModalImportarPedidos';

interface Pedido {
  ID_PEDIDO: number;
  DATA_PEDIDO: string;
  NUM_PEDIDO_PLATAFORMA: string;
  NOME_CLIENTE: string;
  VALOR_TOTAL: string | number;
  STATUS_PEDIDO: string;
  PLATAFORMA_ORIGEM: string;
  NUM_NOTA_FISCAL: string | null; // <--- Novo Campo
  resumo_itens?: string;
}

export default function PedidosLista() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  
  const [modalNovoOpen, setModalNovoOpen] = useState(false);
  const [modalDetalhesOpen, setModalDetalhesOpen] = useState(false);
  const [modalImportarOpen, setModalImportarOpen] = useState(false);
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    try {
      const res = await api.get('/pedidos');
      setPedidos(res.data);
    } catch (error) { console.error(error); }
  }

  const abrirDetalhes = async (id: number) => {
    try {
      const res = await api.get(`/pedidos/${id}`);
      setPedidoSelecionado(res.data); 
      setModalDetalhesOpen(true);
    } catch (e) { showToast('Erro ao abrir detalhes', 'error'); }
  };

  const handleExcluir = async (id: number, numero: string) => {
    const result = await MySwal.fire({
        title: 'Excluir Pedido?',
        text: `Apagar pedido #${numero}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Sim, excluir!'
    });

    if (result.isConfirmed) {
        try {
            await api.delete(`/pedidos/${id}`);
            showToast('Pedido excluído!', 'success');
            carregar();
        } catch (error) { showToast('Erro ao excluir.', 'error'); }
    }
  };

  // --- NOVA FUNÇÃO DE NF COM INPUT ---
  const handleNotaFiscal = async (id: number, notaAtual: string | null) => {
    const { value: numeroNota } = await MySwal.fire({
        title: 'Controle Fiscal',
        text: 'Informe o número da Nota Fiscal emitida:',
        input: 'text',
        inputValue: notaAtual || '',
        inputPlaceholder: 'Ex: 10554',
        showCancelButton: true,
        confirmButtonText: 'Salvar Nota',
        confirmButtonColor: '#0ABAB5',
        cancelButtonText: 'Remover NF / Cancelar',
        cancelButtonColor: '#d33'
    });

    // Se clicou em cancelar ou fechou, não faz nada (a menos que tenha limpado o campo explicitamente)
    // Mas aqui vamos assumir: Se digitou algo -> Salva. Se limpou e salvou -> Remove.
    if (numeroNota !== undefined) {
        try {
            await api.patch(`/pedidos/${id}/nf`, { numero_nota: numeroNota });
            
            // Atualiza localmente para ser rápido
            setPedidos(antigos => antigos.map(p => 
                p.ID_PEDIDO === id ? { ...p, NUM_NOTA_FISCAL: numeroNota || null } : p
            ));

            showToast(numeroNota ? 'Nota Fiscal salva!' : 'Nota removida.', 'success');
        } catch (error) {
            showToast('Erro ao salvar NF', 'error');
        }
    }
  };

  const getStatusBadge = (status: string) => {
    if (!status) return null;
    const styles: any = {
      'ENTRADA': 'bg-gray-100 text-gray-600',
      'AGUARDANDO_ARTE': 'bg-yellow-100 text-yellow-700',
      'CRIACAO': 'bg-blue-50 text-blue-600',
      'IMPRIMINDO': 'bg-purple-100 text-purple-700',
      'PRODUCAO': 'bg-orange-100 text-orange-700',
      'ENVIADO': 'bg-green-100 text-green-700',
      'CANCELADO': 'bg-red-50 text-red-600',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${styles[status] || styles['ENTRADA']}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Pedidos</h1>
          <p className="text-sm text-gray-500">Gestão de vendas, importação e produção</p>
        </div>
        
        <div className="flex gap-3">
            <button onClick={() => setModalImportarOpen(true)} className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm font-medium shadow-sm transition-all">
                <Upload size={16} /> Importar Excel
            </button>
            <button className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm font-medium shadow-sm transition-all">
                <Filter size={16} /> Filtrar
            </button>
            <button onClick={() => setModalNovoOpen(true)} className="px-4 py-2 bg-avivar-tiffany text-white rounded-lg hover:bg-teal-600 flex items-center gap-2 text-sm font-bold shadow-md hover:shadow-lg transition-all">
                <Plus size={18} /> Novo Pedido
            </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Pedido / Data</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Itens</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Valor</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Status / NF</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Ações</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-gray-100">
              {pedidos.map((p) => {
                if (!p || !p.ID_PEDIDO) return null;
                const temNf = !!p.NUM_NOTA_FISCAL;

                return (
                  <tr key={p.ID_PEDIDO} className="hover:bg-gray-50/80 transition-colors group cursor-default">
                    
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-mono text-xs font-bold text-gray-800 mb-1">
                            #{p.NUM_PEDIDO_PLATAFORMA || 'MANUAL'}
                        </span>
                        <div className="flex items-center gap-1 text-gray-400 text-[11px]">
                          <Calendar size={10} />
                          {p.DATA_PEDIDO ? new Date(p.DATA_PEDIDO).toLocaleDateString('pt-BR') : '-'}
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-avivar-tiffany to-teal-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                          {(p.NOME_CLIENTE || '?').charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-700">{p.NOME_CLIENTE || 'Consumidor'}</span>
                          <span className="text-[10px] text-gray-400">{p.PLATAFORMA_ORIGEM}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <span className="text-xs text-gray-500 line-clamp-1" title={p.resumo_itens}>
                          {p.resumo_itens || '-'}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <span className="text-sm font-bold text-gray-800">
                        {Number(p.VALOR_TOTAL || 0).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}
                      </span>
                    </td>

                    {/* STATUS + VISUALIZAÇÃO DA NF */}
                    <td className="py-4 px-6 text-center">
                        <div className="flex flex-col items-center gap-1">
                            {getStatusBadge(p.STATUS_PEDIDO)}
                            
                            {/* SE TIVER NF, MOSTRA ELA AQUI */}
                            {temNf && (
                                <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100">
                                    <FileCheck size={10} /> NF: {p.NUM_NOTA_FISCAL}
                                </span>
                            )}
                        </div>
                    </td>

                    {/* AÇÕES */}
                    <td className="py-4 px-6 text-center flex justify-center gap-2">
                      <button 
                          onClick={() => abrirDetalhes(p.ID_PEDIDO)}
                          className="text-blue-400 hover:text-blue-600 p-1.5 rounded-full hover:bg-blue-50 transition-colors"
                          title="Ver Detalhes"
                      >
                        <Eye size={18} />
                      </button>

                      {/* Botão de NF (Agora abre o Input) */}
                      <button 
                          onClick={() => handleNotaFiscal(p.ID_PEDIDO, p.NUM_NOTA_FISCAL)}
                          className={`p-1.5 rounded-full transition-colors border ${temNf ? 'text-green-600 bg-green-50 border-green-200' : 'text-gray-300 hover:text-green-500 border-transparent hover:bg-green-50'}`}
                          title={temNf ? `NF Emitida: ${p.NUM_NOTA_FISCAL} (Editar)` : "Registrar Nota Fiscal"}
                      >
                        {temNf ? <CheckCircle size={18} /> : <FileText size={18} />}
                      </button>
                      
                      <button 
                        onClick={() => handleExcluir(p.ID_PEDIDO, p.NUM_PEDIDO_PLATAFORMA)}
                        className="text-gray-300 hover:text-red-500 p-1.5 rounded-full hover:bg-red-50 transition-colors"
                        title="Excluir Pedido"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {pedidos.length === 0 && (
            <div className="p-10 text-center text-gray-400 text-sm">Nenhum pedido encontrado.</div>
        )}
      </div>

      <ModalNovoPedido isOpen={modalNovoOpen} onClose={() => setModalNovoOpen(false)} onSuccess={carregar} />
      <ModalDetalhesPedido isOpen={modalDetalhesOpen} dados={pedidoSelecionado} onClose={() => setModalDetalhesOpen(false)} />
      <ModalImportarPedidos isOpen={modalImportarOpen} onClose={() => setModalImportarOpen(false)} onSuccess={carregar} />
    </div>
  );
}