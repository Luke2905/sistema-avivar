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
import { exportToExcel, exportToPDF } from '../utils/exportUtils';
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
  QTD_TOTAL_ITENS?: string | number;
  resumo_itens?: string;
  CUSTO_MATERIAIS_ESTIMADO?: string | number;
  LUCRO_BRUTO_ESTIMADO?: string | number;
  PRAZO_ENVIO?: string;
  OBSERVACOES?: string;
}

const STATUS_OPTIONS = [
  'ENTRADA',
  'AGUARDANDO_ARTE',
  'CRIACAO',
  'IMPRIMINDO',
  'PRODUCAO',
  'ENVIADO',
  'CANCELADO'
];

export default function PedidosLista() {
  const usuarioSalvo = localStorage.getItem('avivar_user');
  const user = usuarioSalvo ? JSON.parse(usuarioSalvo) : { perfil: '' };
  const perfil = user.perfil ? user.perfil.toUpperCase() : '';
  const isFinanceiroOculto = perfil === 'ARTES' || perfil === 'PRODUCAO';
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(false);

  const [filtroDia, setFiltroDia] = useState('');
  const [filtroMes, setFiltroMes] = useState('');
  const [filtroAno, setFiltroAno] = useState('');
  const [filtroOrigem, setFiltroOrigem] = useState('');
  const [filtroNumero, setFiltroNumero] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroPrazoEnvio, setFiltroPrazoEnvio] = useState('');

  const [modalNovoOpen, setModalNovoOpen] = useState(false);
  const [modalDetalhesOpen, setModalDetalhesOpen] = useState(false);
  const [modalImportarOpen, setModalImportarOpen] = useState(false);

  const [pedidoSelecionado, setPedidoSelecionado] = useState<any | null>(null);
  const [pedidoParaEditar, setPedidoParaEditar] = useState<any | null>(null);

  useEffect(() => {
    carregar({});
  }, []);

  function montarParametrosFiltro() {
    const params: Record<string, string> = {};

    if (filtroDia) params.dia = filtroDia;
    if (filtroMes) params.mes = filtroMes;
    if (filtroAno) params.ano = filtroAno;
    if (filtroOrigem.trim()) params.origem = filtroOrigem.trim();
    if (filtroNumero.trim()) params.numero = filtroNumero.trim();
    if (filtroStatus) params.status = filtroStatus;
    if (filtroPrazoEnvio) params.prazo_envio = filtroPrazoEnvio;

    return params;
  }

  async function carregar(paramsOverride?: Record<string, string>) {
    setLoading(true);
    try {
      const params = paramsOverride ?? montarParametrosFiltro();
      const res = await api.get('/pedidos', { params });
      setPedidos(res.data);
    } catch (error) {
      console.error(error);
      showToast('Erro ao carregar lista de pedidos', 'error');
    } finally {
      setLoading(false);
    }
  }

  const handleExportExcel = () => {
    const data = pedidosFiltrados.map(p => ({
      ID: p.ID_PEDIDO,
      Data: p.DATA_PEDIDO ? new Date(p.DATA_PEDIDO).toLocaleDateString('pt-BR') : '',
      Cliente: p.NOME_CLIENTE,
      Plataforma: p.PLATAFORMA_ORIGEM,
      Numero: p.NUM_PEDIDO_PLATAFORMA,
      NF: p.NUM_NOTA_FISCAL || '',
      Status: p.STATUS_PEDIDO,
      Qtd_Itens: p.QTD_TOTAL_ITENS,
      Valor_Total: !isFinanceiroOculto ? Number(p.VALOR_TOTAL) : '***',
      Lucro_Bruto: !isFinanceiroOculto ? Number(p.LUCRO_BRUTO_ESTIMADO) : '***'
    }));
    exportToExcel(data, 'Pedidos');
  };

  const handleExportPDF = () => {
    const headers = ['ID', 'Data', 'Cliente', 'Plataforma', 'Nº', 'Status', 'Valor'];
    const data = pedidosFiltrados.map(p => [
      p.ID_PEDIDO,
      p.DATA_PEDIDO ? new Date(p.DATA_PEDIDO).toLocaleDateString('pt-BR') : '',
      p.NOME_CLIENTE,
      p.PLATAFORMA_ORIGEM,
      p.NUM_PEDIDO_PLATAFORMA,
      p.STATUS_PEDIDO,
      !isFinanceiroOculto ? Number(p.VALOR_TOTAL || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '***'
    ]);
    exportToPDF(headers, data, 'Pedidos', 'Relatório de Pedidos');
  };

  const aplicarFiltros = () => {
    carregar();
  };

  const limparFiltros = () => {
    setFiltroDia('');
    setFiltroMes('');
    setFiltroAno('');
    setFiltroOrigem('');
    setFiltroNumero('');
    setFiltroStatus('');
    setFiltroPrazoEnvio('');
    carregar({});
  };

  const handleEditar = async (id: number) => {
    try {
      const res = await api.get(`/pedidos/${id}`);
      setPedidoParaEditar(res.data);
      setModalNovoOpen(true);
    } catch {
      showToast('Erro ao carregar dados para edição', 'error');
    }
  };

  const handleFecharModalNovo = () => {
    setModalNovoOpen(false);
    setPedidoParaEditar(null);
  };

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

  const abrirDetalhes = async (id: number) => {
    try {
      const res = await api.get(`/pedidos/${id}`);
      setPedidoSelecionado(res.data);
      setModalDetalhesOpen(true);
    } catch {
      showToast('Erro ao abrir detalhes', 'error');
    }
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
      } catch {
        showToast('Erro ao excluir.', 'error');
      }
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
        setPedidos((antigos) => antigos.map((p) =>
          p.ID_PEDIDO === id ? { ...p, NUM_NOTA_FISCAL: numeroNota || null } : p
        ));
        showToast(numeroNota ? 'Nota Fiscal salva!' : 'Nota removida.', 'success');
      } catch {
        showToast('Erro ao salvar NF', 'error');
      }
    }
  };

  const handleAlterarStatus = async (id: number, novoStatus: string) => {
    try {
      await api.patch(`/pedidos/${id}/status`, { novo_status: novoStatus });
      setPedidos(antigos => antigos.map(p => 
        p.ID_PEDIDO === id ? { ...p, STATUS_PEDIDO: novoStatus } : p
      ));
      showToast('Status atualizado!', 'success');
    } catch {
      showToast('Erro ao atualizar status', 'error');
    }
  };

  const getStatusBadge = (status: string) => {
    if (!status) return null;
    const styles: Record<string, string> = {
      ENTRADA: 'bg-gray-100 text-gray-600',
      AGUARDANDO_ARTE: 'bg-yellow-100 text-yellow-700',
      CRIACAO: 'bg-blue-50 text-blue-600',
      IMPRIMINDO: 'bg-purple-100 text-purple-700',
      PRODUCAO: 'bg-orange-100 text-orange-700',
      ENVIADO: 'bg-green-100 text-green-700',
      CANCELADO: 'bg-red-50 text-red-600'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${styles[status] || styles.ENTRADA}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 p-8 overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Pedidos</h1>
          <p className="text-sm text-gray-500">Gestão de vendas, importação e produção</p>
        </div>

        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
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
            <button
              onClick={handleExportExcel}
              className="px-3 py-2 bg-green-50 border border-green-200 text-green-700 rounded-lg hover:bg-green-100 flex items-center gap-2 text-sm font-bold shadow-sm transition-all whitespace-nowrap"
              title="Exportar Excel"
            >
              EXCEL
            </button>
            <button
              onClick={handleExportPDF}
              className="px-3 py-2 bg-red-50 border border-red-200 text-red-700 rounded-lg hover:bg-red-100 flex items-center gap-2 text-sm font-bold shadow-sm transition-all whitespace-nowrap"
              title="Exportar PDF"
            >
              PDF
            </button>
            
            <button
              onClick={() => setModalImportarOpen(true)}
              className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm font-medium shadow-sm transition-all whitespace-nowrap"
            >
              <Upload size={16} /> <span className="hidden md:inline">Importar</span>
            </button>

            <button
              onClick={() => {
                setPedidoParaEditar(null);
                setModalNovoOpen(true);
              }}
              className="px-4 py-2 bg-avivar-tiffany text-white rounded-lg hover:bg-teal-600 flex items-center gap-2 text-sm font-bold shadow-md hover:shadow-lg transition-all whitespace-nowrap"
            >
              <Plus size={18} /> <span className="hidden md:inline">Novo</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-4 shrink-0">
        <div className="flex items-center gap-2 mb-3 text-sm font-bold text-gray-600 uppercase tracking-wider">
          <Filter size={16} className="text-avivar-tiffany" /> Filtros
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
          <input
            type="date"
            value={filtroPrazoEnvio}
            onChange={(e) => setFiltroPrazoEnvio(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-avivar-tiffany"
            title="Filtrar por Prazo de Envio"
          />
          <input
            type="date"
            value={filtroDia}
            onChange={(e) => setFiltroDia(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-avivar-tiffany"
            title="Filtrar por dia"
          />

          <select
            value={filtroMes}
            onChange={(e) => setFiltroMes(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-avivar-tiffany bg-white"
          >
            <option value="">Mês</option>
            {['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'].map((mes, i) => (
              <option key={i + 1} value={String(i + 1)}>{mes}</option>
            ))}
          </select>

          <input
            type="number"
            min="2000"
            max="2100"
            placeholder="Ano"
            value={filtroAno}
            onChange={(e) => setFiltroAno(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-avivar-tiffany"
          />

          <input
            type="text"
            placeholder="Origem (Shopee, ML...)"
            value={filtroOrigem}
            onChange={(e) => setFiltroOrigem(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-avivar-tiffany"
          />

          <input
            type="text"
            placeholder="Número do pedido"
            value={filtroNumero}
            onChange={(e) => setFiltroNumero(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-avivar-tiffany"
          />

          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-avivar-tiffany bg-white"
          >
            <option value="">Status</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>{status.replace('_', ' ')}</option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-2 mt-3">
          <button
            onClick={limparFiltros}
            className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
          >
            Limpar
          </button>
          <button
            onClick={aplicarFiltros}
            className="px-4 py-2 text-sm bg-avivar-tiffany text-white rounded-lg font-bold hover:bg-teal-600"
          >
            Aplicar Filtros
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="overflow-auto custom-scrollbar flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-100 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Pedido / Data</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Itens</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Prazo</th>
                {!isFinanceiroOculto && <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Valor</th>}
                {!isFinanceiroOculto && <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Lucro Est.</th>}
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Status / NF</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-left">OBS</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Ações</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {pedidosFiltrados.map((p) => {
                if (!p?.ID_PEDIDO) return null;
                const temNf = !!p.NUM_NOTA_FISCAL;

                return (
                  <tr key={p.ID_PEDIDO} className="hover:bg-gray-50/80 transition-colors group cursor-default">
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-mono text-xs font-bold text-gray-800 mb-1">#{p.NUM_PEDIDO_PLATAFORMA || 'MANUAL'}</span>
                        <div className="flex items-center gap-1 text-gray-400 text-[11px]">
                          <Calendar size={10} />
                          {p.DATA_PEDIDO ? new Date(p.DATA_PEDIDO).toLocaleDateString('pt-BR') : '-'}
                        </div>
                      </div>
                    </td>

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

                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex w-fit px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-[10px] font-bold uppercase">
                          {Number(p.QTD_TOTAL_ITENS || 0)} item(ns)
                        </span>
                        <span className="text-xs text-gray-500 line-clamp-1 max-w-[180px]" title={p.resumo_itens}>
                          {p.resumo_itens || '-'}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-center">
                        {p.PRAZO_ENVIO ? (
                            <span className={`text-xs font-bold px-2 py-1 rounded ${new Date(p.PRAZO_ENVIO) <= new Date() ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                                {new Date(p.PRAZO_ENVIO).toLocaleDateString('pt-BR')}
                            </span>
                        ) : (
                            <span className="text-gray-400 text-xs">-</span>
                        )}
                    </td>

                    {!isFinanceiroOculto && (
                      <td className="py-4 px-6 text-right">
                        <span className="text-sm font-bold text-gray-800">
                          {Number(p.VALOR_TOTAL || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </td>
                    )}

                    {!isFinanceiroOculto && (
                      <td className="py-4 px-6 text-right">
                        <div className="flex flex-col items-end">
                          <span className={`text-sm font-bold ${Number(p.LUCRO_BRUTO_ESTIMADO || 0) < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                            {Number(p.LUCRO_BRUTO_ESTIMADO || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            Custo: {Number(p.CUSTO_MATERIAIS_ESTIMADO || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </span>
                        </div>
                      </td>
                    )}

                    <td className="py-4 px-6 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <select 
                            value={p.STATUS_PEDIDO} 
                            onChange={(e) => handleAlterarStatus(p.ID_PEDIDO, e.target.value)}
                            className="text-xs font-bold outline-none border border-gray-200 rounded px-2 py-1 bg-white hover:border-avivar-tiffany transition-colors cursor-pointer"
                        >
                            {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt.replace('_', ' ')}</option>)}
                        </select>
                        {temNf && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100 mt-1">
                            <FileCheck size={10} /> NF: {p.NUM_NOTA_FISCAL}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-6">
                        <div className="text-[11px] text-gray-500 bg-yellow-50/50 p-2 border border-yellow-100 rounded line-clamp-3 max-w-[150px]" title={p.OBSERVACOES || ''}>
                            {p.OBSERVACOES || <span className="italic opacity-50">Sem OBS</span>}
                        </div>
                    </td>

                    <td className="py-4 px-6 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => abrirDetalhes(p.ID_PEDIDO)}
                          className="text-blue-400 hover:text-blue-600 p-1.5 rounded-full hover:bg-blue-50 transition-colors"
                          title="Ver Detalhes"
                        >
                          <Eye size={18} />
                        </button>

                        <button
                          onClick={() => handleEditar(p.ID_PEDIDO)}
                          className="text-amber-400 hover:text-amber-600 p-1.5 rounded-full hover:bg-amber-50 transition-colors"
                          title="Editar Pedido"
                        >
                          <Edit3 size={18} />
                        </button>

                        <button
                          onClick={() => handleNotaFiscal(p.ID_PEDIDO, p.NUM_NOTA_FISCAL)}
                          className={`p-1.5 rounded-full transition-colors border ${temNf ? 'text-green-600 bg-green-50 border-green-200' : 'text-gray-300 hover:text-green-500 border-transparent hover:bg-green-50'}`}
                          title={temNf ? `NF Emitida: ${p.NUM_NOTA_FISCAL} (Editar)` : 'Registrar Nota Fiscal'}
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

        {loading && (
          <div className="p-6 text-center text-sm text-gray-400 border-t border-gray-100">Carregando pedidos...</div>
        )}

        {!loading && pedidosFiltrados.length === 0 && (
          <div className="p-10 text-center text-gray-400 text-sm">
            {busca ? `Nenhum pedido encontrado para "${busca}".` : 'Nenhum pedido cadastrado para os filtros informados.'}
          </div>
        )}
      </div>

      <ModalNovoPedido
        isOpen={modalNovoOpen}
        onClose={handleFecharModalNovo}
        onSuccess={() => carregar()}
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
        onSuccess={() => carregar()}
      />
    </div>
  );
}
