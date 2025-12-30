// src/pages/PedidosLista.tsx
import { useState, useEffect } from 'react';
import { 
  Plus, 
  Filter, 
  Calendar, 
  Eye, 
  Upload, 
  Trash2, 
  FileText, 
  CheckCircle, 
  FileCheck, 
  Search, 
  Edit3 
} from 'lucide-react';
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
  NUM_NOTA_FISCAL: string | null;
  resumo_itens?: string;
}

export default function PedidosLista() {
  // --- ESTADOS ---
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [busca, setBusca] = useState('');
  
  // Controles de Modais
  const [modalNovoOpen, setModalNovoOpen] = useState(false);
  const [modalDetalhesOpen, setModalDetalhesOpen] = useState(false);
  const [modalImportarOpen, setModalImportarOpen] = useState(false);
  
  // Seleções
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);
  const [pedidoParaEditar, setPedidoParaEditar] = useState<any | null>(null);

  // --- CARREGAMENTO INICIAL ---
  useEffect(() => { carregar(); }, []);

  async function carregar() {
    try {
      const res = await api.get('/pedidos');
      setPedidos(res.data);
    } catch (error) { 
      console.error(error); 
      showToast('Erro ao carregar lista de pedidos', 'error');
    }
  }

  // --- LÓGICA DE EDIÇÃO ---
  const handleEditar = async (id: number) => {
    try {
        // Busca os dados completos (incluindo itens) para preencher o formulário
        const res = await api.get(`/pedidos/${id}`);
        setPedidoParaEditar(res.data); // Guarda os dados completos
        setModalNovoOpen(true); // Abre o modal de criação em "modo edição"
    } catch (e) {
        showToast('Erro ao carregar dados para edição', 'error');
    }
  };

  const handleFecharModalNovo = () => {
    setModalNovoOpen(false);
    setPedidoParaEditar(null); // Limpa para garantir que o próximo clique em "Novo" venha vazio
  };

  // --- LÓGICA DE FILTRO (SEARCH) ---
  const pedidosFiltrados = pedidos.filter((p) => {
    const termo = busca.toLowerCase();
    return (
      (p.NOME_CLIENTE || '').toLowerCase().includes(termo) ||
      (p.NUM_PEDIDO_PLATAFORMA || '').toLowerCase().includes(termo) ||
      (p.NUM_NOTA_FISCAL || '').toLowerCase().includes(termo) ||
      (p.resumo_itens || '').toLowerCase().includes(termo) ||
      (p.PLATAFORMA_ORIGEM || '').toLowerCase().includes(termo)
    );
  });

  // --- AÇÕES ---
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
        text: `Apagar pedido #${numero}? Essa ação não pode ser desfeita.`,
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
        cancelButtonText: 'Cancelar / Remover',
        cancelButtonColor: '#d33'
    });

    if (numeroNota !== undefined) {
        try {
            await api.patch(`/pedidos/${id}/nf`, { numero_nota: numeroNota });
            // Atualiza localmente para feedback instantâneo
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
    // LAYOUT FIXO: h-full e overflow-hidden no pai
    <div className="flex flex-col h-full bg-gray-50 p-8 overflow-hidden">
      
      {/* CABEÇALHO (Fixo) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Pedidos</h1>
          <p className="text-sm text-gray-500">Gestão de vendas, importação e produção</p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            {/* CAMPO DE BUSCA */}
            <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input 
                    type="text"
                    placeholder="Buscar cliente, pedido, NF..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-avivar-tiffany focus:border-transparent outline-none transition-all shadow-sm"
                />
            </div>

            <div className="flex gap-2">
                <button onClick={() => setModalImportarOpen(true)} className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm font-medium shadow-sm transition-all whitespace-nowrap">
                    <Upload size={16} /> <span className="hidden md:inline">Importar</span>
                </button>
                
                <button 
                    onClick={() => { setPedidoParaEditar(null); setModalNovoOpen(true); }} 
                    className="px-4 py-2 bg-avivar-tiffany text-white rounded-lg hover:bg-teal-600 flex items-center gap-2 text-sm font-bold shadow-md hover:shadow-lg transition-all whitespace-nowrap"
                >
                    <Plus size={18} /> <span className="hidden md:inline">Novo</span>
                </button>
            </div>
        </div>
      </div>

      {/* ÁREA DA TABELA (Scrollável) */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="overflow-auto custom-scrollbar flex-1">
          <table className="w-full text-left border-collapse">
            {/* Cabeçalho da Tabela Fixo (Sticky) */}
            <thead className="bg-gray-50 border-b border-gray-100 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Pedido / Data</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Itens</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Valor</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Status / NF</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Ações</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-gray-100">
              {pedidosFiltrados.map((p) => {
                if (!p || !p.ID_PEDIDO) return null;
                const temNf = !!p.NUM_NOTA_FISCAL;

                return (
                  <tr key={p.ID_PEDIDO} className="hover:bg-gray-50/80 transition-colors group cursor-default">
                    
                    {/* COLUNA 1: PEDIDO + DATA */}
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

                    {/* COLUNA 2: CLIENTE */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-avivar-tiffany to-teal-600 text-white flex items-center justify-center text-xs font-bold shadow-sm shrink-0">
                          {(p.NOME_CLIENTE || '?').charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-medium text-gray-700 truncate max-w-[140px]" title={p.NOME_CLIENTE}>
                             {p.NOME_CLIENTE || 'Consumidor'}
                          </span>
                          <span className="text-[10px] text-gray-400">{p.PLATAFORMA_ORIGEM}</span>
                        </div>
                      </div>
                    </td>

                    {/* COLUNA 3: RESUMO DOS ITENS */}
                    <td className="py-4 px-6">
                      <span className="text-xs text-gray-500 line-clamp-1 max-w-[180px]" title={p.resumo_itens}>
                          {p.resumo_itens || '-'}
                      </span>
                    </td>

                    {/* COLUNA 4: VALOR */}
                    <td className="py-4 px-6 text-right">
                      <span className="text-sm font-bold text-gray-800">
                        {Number(p.VALOR_TOTAL || 0).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}
                      </span>
                    </td>

                    {/* COLUNA 5: STATUS E NF */}
                    <td className="py-4 px-6 text-center">
                        <div className="flex flex-col items-center gap-1">
                            {getStatusBadge(p.STATUS_PEDIDO)}
                            
                            {temNf && (
                                <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100">
                                    <FileCheck size={10} /> NF: {p.NUM_NOTA_FISCAL}
                                </span>
                            )}
                        </div>
                    </td>

                    {/* COLUNA 6: AÇÕES */}
                    <td className="py-4 px-6 text-center">
                        <div className="flex justify-center gap-2">
                            <button 
                                onClick={() => abrirDetalhes(p.ID_PEDIDO)}
                                className="text-blue-400 hover:text-blue-600 p-1.5 rounded-full hover:bg-blue-50 transition-colors"
                                title="Ver Detalhes"
                            >
                                <Eye size={18} />
                            </button>

                            {/* Botão de Editar */}
                            <button 
                                onClick={() => handleEditar(p.ID_PEDIDO)} 
                                className="text-amber-400 hover:text-amber-600 p-1.5 rounded-full hover:bg-amber-50 transition-colors"
                                title="Editar Pedido"
                            >
                                <Edit3 size={18} />
                            </button>

                            {/* Botão de Nota Fiscal */}
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
                        </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* MENSAGEM QUANDO O FILTRO NÃO ENCONTRA NADA */}
        {pedidosFiltrados.length === 0 && (
            <div className="p-10 text-center text-gray-400 text-sm">
                {busca ? `Nenhum pedido encontrado para "${busca}".` : 'Nenhum pedido cadastrado.'}
            </div>
        )}
      </div>

      {/* MODAIS */}
      <ModalNovoPedido 
        isOpen={modalNovoOpen} 
        onClose={handleFecharModalNovo} 
        onSuccess={carregar} 
        pedidoParaEditar={pedidoParaEditar} 
      />
      <ModalDetalhesPedido 
        isOpen={modalDetalhesOpen} 
        dados={pedidoSelecionado} 
        onClose={() => setModalDetalhesOpen(false)} 
      />
      <ModalImportarPedidos 
        isOpen={modalImportarOpen} 
        onClose={() => setModalImportarOpen(false)} 
        onSuccess={carregar} 
      />
    </div>
  );
}