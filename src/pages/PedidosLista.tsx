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
  Edit3,
  ArrowUpDown,
  Truck,
  Clock
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
  COD_RASTREIO?: string;
  VALOR_REPASSE?: string | number;
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

function getPrazoStatus(prazo?: string): 'vencido' | 'amanha' | 'normal' | null {
  if (!prazo) return null;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const amanha = new Date(hoje);
  amanha.setDate(amanha.getDate() + 1);
  const dataPrazo = new Date(prazo);
  dataPrazo.setHours(0, 0, 0, 0);
  if (dataPrazo < hoje) return 'vencido';
  if (dataPrazo.getTime() === amanha.getTime()) return 'amanha';
  return 'normal';
}

function formatarResumoItens(resumo?: string): React.ReactNode {
  if (!resumo) return <span className="italic text-gray-400">Sem itens</span>;
  const partes = resumo.split(', ');
  return (
    <div className="flex flex-col gap-1">
      {partes.map((parte, i) => {
        const match = parte.match(/^(\d+x)\s(.+)$/);
        if (match) {
          return (
            <span key={i} className="text-xs text-gray-600">
              <strong className="text-gray-800 font-bold">{match[1]}</strong> {match[2]}
            </span>
          );
        }
        return <span key={i} className="text-xs text-gray-600">{parte}</span>;
      })}
    </div>
  );
}

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
  const [filtroPrazoTipo, setFiltroPrazoTipo] = useState(''); // '' | 'vencido' | 'amanha'
  const [filtroProduto, setFiltroProduto] = useState('');
  
  const [produtos, setProdutos] = useState<any[]>([]);

  const [modalNovoOpen, setModalNovoOpen] = useState(false);
  const [modalDetalhesOpen, setModalDetalhesOpen] = useState(false);
  const [modalImportarOpen, setModalImportarOpen] = useState(false);

  const [pedidoSelecionado, setPedidoSelecionado] = useState<any | null>(null);
  const [pedidoParaEditar, setPedidoParaEditar] = useState<any | null>(null);

  // Ordenação e Seleção em Massa
  const [ordenacao, setOrdenacao] = useState<{ campo: string; direcao: 'asc' | 'desc' }>({ campo: 'data', direcao: 'desc' });
  const [selecionados, setSelecionados] = useState<number[]>([]);

  useEffect(() => {
    carregar({});
    carregarProdutos();
  }, []);

  async function carregarProdutos() {
    try {
      const res = await api.get('/produtos');
      setProdutos(res.data);
    } catch (e) {
      console.error(e);
    }
  }

  function montarParametrosFiltro() {
    const params: Record<string, string> = {};
    if (filtroDia) params.dia = filtroDia;
    if (filtroMes) params.mes = filtroMes;
    if (filtroAno) params.ano = filtroAno;
    if (filtroOrigem.trim()) params.origem = filtroOrigem.trim();
    if (filtroNumero.trim()) params.numero = filtroNumero.trim();
    if (filtroStatus) params.status = filtroStatus;
    if (filtroPrazoEnvio) params.prazo_envio = filtroPrazoEnvio;
    if (filtroPrazoTipo === 'vencido') params.prazo_vencido = 'true';
    if (filtroPrazoTipo === 'amanha') params.prazo_amanha = 'true';
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
    const data = pedidosOrdenados.map(p => ({
      ID: p.ID_PEDIDO,
      Data: p.DATA_PEDIDO ? new Date(p.DATA_PEDIDO).toLocaleDateString('pt-BR') : '',
      Cliente: p.NOME_CLIENTE,
      Plataforma: p.PLATAFORMA_ORIGEM,
      Numero: p.NUM_PEDIDO_PLATAFORMA,
      Rastreio: p.COD_RASTREIO || '',
      NF: p.NUM_NOTA_FISCAL || '',
      Status: p.STATUS_PEDIDO,
      Qtd_Itens: p.QTD_TOTAL_ITENS,
      Valor_Total: !isFinanceiroOculto ? Number(p.VALOR_TOTAL) : '***',
      Valor_Repasse: !isFinanceiroOculto ? Number(p.VALOR_REPASSE || 0) : '***',
      Lucro_Bruto: !isFinanceiroOculto ? Number(p.LUCRO_BRUTO_ESTIMADO) : '***'
    }));
    exportToExcel(data, 'Pedidos');
  };

  const handleExportPDF = () => {
    const headers = ['ID', 'Data', 'Cliente', 'Plataforma', 'Nº', 'Status', 'Valor'];
    const data = pedidosOrdenados.map(p => [
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
    setFiltroPrazoTipo('');
    setFiltroProduto('');
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

  const pedidosFiltrados = pedidos.filter((p) => {
    const termo = busca.toLowerCase();
    const passaBusca = (
      (p.NOME_CLIENTE || '').toLowerCase().includes(termo) ||
      (p.NUM_PEDIDO_PLATAFORMA || '').toLowerCase().includes(termo) ||
      (p.NUM_NOTA_FISCAL || '').toLowerCase().includes(termo) ||
      (p.COD_RASTREIO || '').toLowerCase().includes(termo) ||
      (p.resumo_itens || '').toLowerCase().includes(termo) ||
      (p.PLATAFORMA_ORIGEM || '').toLowerCase().includes(termo)
    );

    if (!passaBusca) return false;

    if (filtroProduto && p.resumo_itens && !p.resumo_itens.toLowerCase().includes(filtroProduto.toLowerCase())) {
        return false;
    }

    return true;
  });

  const pedidosOrdenados = [...pedidosFiltrados].sort((a, b) => {
    let valA: any, valB: any;
    switch (ordenacao.campo) {
      case 'pedido':
        valA = a.NUM_PEDIDO_PLATAFORMA || '';
        valB = b.NUM_PEDIDO_PLATAFORMA || '';
        break;
      case 'data':
        valA = new Date(a.DATA_PEDIDO).getTime();
        valB = new Date(b.DATA_PEDIDO).getTime();
        break;
      case 'prazo':
        valA = a.PRAZO_ENVIO ? new Date(a.PRAZO_ENVIO).getTime() : Infinity;
        valB = b.PRAZO_ENVIO ? new Date(b.PRAZO_ENVIO).getTime() : Infinity;
        break;
      case 'valor':
        valA = Number(a.VALOR_TOTAL || 0);
        valB = Number(b.VALOR_TOTAL || 0);
        break;
      default:
        return 0;
    }
    if (valA < valB) return ordenacao.direcao === 'asc' ? -1 : 1;
    if (valA > valB) return ordenacao.direcao === 'asc' ? 1 : -1;
    return 0;
  });

  const handleHeaderClick = (campo: string) => {
    setOrdenacao(prev => ({
      campo,
      direcao: prev.campo === campo && prev.direcao === 'asc' ? 'desc' : 'asc'
    }));
  };

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

  const handleMoverMassa = async (novoStatus: string) => {
    if (selecionados.length === 0) return;
    try {
      await api.patch('/pedidos/massa/status', { ids: selecionados, novo_status: novoStatus });
      showToast(`${selecionados.length} pedidos movidos para ${novoStatus.replace('_', ' ')}`, 'success');
      setSelecionados([]);
      carregar();
    } catch (e) {
      showToast('Erro ao mover pedidos em massa', 'error');
    }
  };

  const toggleSelectAll = () => {
    if (selecionados.length === pedidosOrdenados.length) {
      setSelecionados([]);
    } else {
      setSelecionados(pedidosOrdenados.map(p => p.ID_PEDIDO));
    }
  };

  const toggleSelect = (id: number) => {
    setSelecionados(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
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
              placeholder="Buscar cliente, pedido, rastreio, NF..."
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
          <Filter size={16} className="text-avivar-tiffany" /> Filtros Avançados
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-8 gap-3">
          <div className="flex flex-col">
            <label className="text-[10px] text-gray-500 font-bold uppercase mb-1">Prazo de Envio</label>
            <input
              type="date"
              value={filtroPrazoEnvio}
              onChange={(e) => setFiltroPrazoEnvio(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-avivar-tiffany"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-[10px] text-gray-500 font-bold uppercase mb-1">Prazo Rápido</label>
            <select
              value={filtroPrazoTipo}
              onChange={(e) => setFiltroPrazoTipo(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-avivar-tiffany bg-white"
            >
              <option value="">Todos os prazos</option>
              <option value="vencido">⛔ Vencidos</option>
              <option value="amanha">⚠️ Vencem amanhã</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-[10px] text-gray-500 font-bold uppercase mb-1">Dia do Pedido</label>
            <input
              type="date"
              value={filtroDia}
              onChange={(e) => setFiltroDia(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-avivar-tiffany"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-[10px] text-gray-500 font-bold uppercase mb-1">Mês do Pedido</label>
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
          </div>

          <div className="flex flex-col">
            <label className="text-[10px] text-gray-500 font-bold uppercase mb-1">Ano</label>
            <input
              type="number"
              min="2000"
              max="2100"
              placeholder="Ano"
              value={filtroAno}
              onChange={(e) => setFiltroAno(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-avivar-tiffany"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-[10px] text-gray-500 font-bold uppercase mb-1">Origem</label>
            <input
              type="text"
              placeholder="Origem (Shopee, ML...)"
              value={filtroOrigem}
              onChange={(e) => setFiltroOrigem(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-avivar-tiffany"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-[10px] text-gray-500 font-bold uppercase mb-1">Número</label>
            <input
              type="text"
              placeholder="Número do pedido"
              value={filtroNumero}
              onChange={(e) => setFiltroNumero(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-avivar-tiffany"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-[10px] text-gray-500 font-bold uppercase mb-1">Status</label>
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

          <div className="flex flex-col">
            <label className="text-[10px] text-gray-500 font-bold uppercase mb-1">Tipo de Produto</label>
            <select
              value={filtroProduto}
              onChange={(e) => setFiltroProduto(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-avivar-tiffany bg-white"
            >
              <option value="">Todos os Produtos</option>
              {produtos.map(p => (
                <option key={p.ID_PRODUTO} value={p.NOME_PRODUTO}>{p.NOME_PRODUTO}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center gap-2">
            {selecionados.length > 0 && (
              <>
                <span className="text-sm font-bold text-avivar-tiffany">{selecionados.length} selecionados</span>
                <select 
                  onChange={(e) => {
                    if (e.target.value) handleMoverMassa(e.target.value);
                    e.target.value = '';
                  }}
                  className="px-3 py-1.5 border border-avivar-tiffany rounded-lg text-sm text-avivar-tiffany bg-teal-50 outline-none"
                >
                  <option value="">Mover para status...</option>
                  {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt.replace('_', ' ')}</option>)}
                </select>
              </>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={limparFiltros} className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">Limpar</button>
            <button onClick={aplicarFiltros} className="px-4 py-2 text-sm bg-avivar-tiffany text-white rounded-lg font-bold hover:bg-teal-600">Aplicar Filtros</button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="overflow-auto custom-scrollbar flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-100 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="py-4 px-4">
                  <input 
                    type="checkbox" 
                    checked={selecionados.length > 0 && selecionados.length === pedidosOrdenados.length}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-avivar-tiffany focus:ring-avivar-tiffany"
                  />
                </th>
                <th 
                  className="py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-avivar-tiffany"
                  onClick={() => handleHeaderClick('pedido')}
                >
                  <div className="flex items-center gap-1">Identificação {ordenacao.campo === 'pedido' && <ArrowUpDown size={12}/>}</div>
                </th>
                <th className="py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Descrição (Itens)</th>
                <th 
                  className="py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center cursor-pointer hover:text-avivar-tiffany"
                  onClick={() => handleHeaderClick('prazo')}
                >
                  <div className="flex justify-center items-center gap-1">Prazo {ordenacao.campo === 'prazo' && <ArrowUpDown size={12}/>}</div>
                </th>
                {!isFinanceiroOculto && (
                  <th 
                    className="py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right cursor-pointer hover:text-avivar-tiffany"
                    onClick={() => handleHeaderClick('valor')}
                  >
                    <div className="flex justify-end items-center gap-1">Valor {ordenacao.campo === 'valor' && <ArrowUpDown size={12}/>}</div>
                  </th>
                )}
                {!isFinanceiroOculto && <th className="py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Lucro Est.</th>}
                <th className="py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Status / NF</th>
                <th className="py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Ações</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {pedidosOrdenados.map((p) => {
                if (!p?.ID_PEDIDO) return null;
                const temNf = !!p.NUM_NOTA_FISCAL;
                const prazoStatus = getPrazoStatus(p.PRAZO_ENVIO);
                
                const bgRow = prazoStatus === 'vencido' ? 'bg-red-50 hover:bg-red-100' :
                              prazoStatus === 'amanha' ? 'bg-yellow-50 hover:bg-yellow-100' :
                              'hover:bg-gray-50/80';

                return (
                  <tr key={p.ID_PEDIDO} className={`transition-colors group ${bgRow}`}>
                    <td className="py-4 px-4">
                      <input 
                        type="checkbox" 
                        checked={selecionados.includes(p.ID_PEDIDO)}
                        onChange={() => toggleSelect(p.ID_PEDIDO)}
                        className="rounded border-gray-300 text-avivar-tiffany focus:ring-avivar-tiffany"
                      />
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col min-w-0 max-w-[200px]">
                        <span className="font-mono text-sm font-bold text-gray-800 mb-0.5">#{p.NUM_PEDIDO_PLATAFORMA || 'MANUAL'}</span>
                        <div className="flex items-center gap-1 text-gray-500 text-[11px] mb-1">
                          <Calendar size={10} />
                          {p.DATA_PEDIDO ? new Date(p.DATA_PEDIDO).toLocaleDateString('pt-BR') : '-'}
                        </div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{p.PLATAFORMA_ORIGEM}</span>
                        <span className="text-xs text-gray-600 truncate mt-1" title={p.NOME_CLIENTE}>
                          👤 {p.NOME_CLIENTE || 'Consumidor'}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4 max-w-[250px]">
                      <div className="flex flex-col gap-2">
                        {formatarResumoItens(p.resumo_itens)}
                        {p.COD_RASTREIO && (
                          <div className="flex items-center gap-1 text-[10px] text-gray-500 bg-white/50 w-fit px-1.5 py-0.5 rounded border border-gray-200 mt-1">
                            <Truck size={10} />
                            <span className="font-mono">{p.COD_RASTREIO}</span>
                          </div>
                        )}
                        {p.OBSERVACOES && (
                          <div className="text-[10px] text-yellow-800 bg-yellow-100/50 p-1.5 border border-yellow-200 rounded line-clamp-2" title={p.OBSERVACOES}>
                            <span className="font-bold mr-1">OBS:</span>{p.OBSERVACOES}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-4 text-center">
                        {p.PRAZO_ENVIO ? (
                            <span className={`text-xs font-bold px-2 py-1 rounded whitespace-nowrap ${prazoStatus === 'vencido' ? 'bg-red-500 text-white' : prazoStatus === 'amanha' ? 'bg-yellow-400 text-yellow-900' : 'bg-gray-100 text-gray-700'}`}>
                                {new Date(p.PRAZO_ENVIO).toLocaleDateString('pt-BR')}
                            </span>
                        ) : (
                            <span className="text-gray-400 text-xs">-</span>
                        )}
                    </td>

                    {!isFinanceiroOculto && (
                      <td className="py-4 px-4 text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-bold text-gray-800">
                            {Number(p.VALOR_TOTAL || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </span>
                          {p.VALOR_REPASSE !== null && p.VALOR_REPASSE !== undefined && (
                            <span className="text-[10px] text-gray-500 font-medium mt-0.5 bg-white/50 px-1.5 py-0.5 rounded border border-gray-200">
                              Repasse: {Number(p.VALOR_REPASSE).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </span>
                          )}
                        </div>
                      </td>
                    )}

                    {!isFinanceiroOculto && (
                      <td className="py-4 px-4 text-right">
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

                    <td className="py-4 px-4 text-center">
                      <div className="flex flex-col items-center gap-1.5">
                        <select 
                            value={p.STATUS_PEDIDO} 
                            onChange={(e) => handleAlterarStatus(p.ID_PEDIDO, e.target.value)}
                            className="text-[10px] font-bold outline-none border border-gray-200 rounded px-1.5 py-1 bg-white hover:border-avivar-tiffany transition-colors cursor-pointer w-[120px]"
                        >
                            {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt.replace('_', ' ')}</option>)}
                        </select>
                        {temNf && (
                          <span className="flex items-center justify-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100 w-full">
                            <FileCheck size={10} /> {p.NUM_NOTA_FISCAL}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-4 text-center">
                      <div className="flex justify-center gap-1 flex-wrap w-[80px] mx-auto">
                        <button
                          onClick={() => abrirDetalhes(p.ID_PEDIDO)}
                          className="text-blue-400 hover:text-blue-600 p-1.5 rounded-full hover:bg-blue-50 transition-colors bg-white shadow-sm border border-gray-100"
                          title="Ver Detalhes"
                        >
                          <Eye size={14} />
                        </button>

                        <button
                          onClick={() => handleEditar(p.ID_PEDIDO)}
                          className="text-amber-400 hover:text-amber-600 p-1.5 rounded-full hover:bg-amber-50 transition-colors bg-white shadow-sm border border-gray-100"
                          title="Editar Pedido"
                        >
                          <Edit3 size={14} />
                        </button>

                        <button
                          onClick={() => handleNotaFiscal(p.ID_PEDIDO, p.NUM_NOTA_FISCAL)}
                          className={`p-1.5 rounded-full transition-colors shadow-sm border ${temNf ? 'text-green-600 bg-green-50 border-green-200' : 'text-gray-400 hover:text-green-500 bg-white border-gray-100 hover:bg-green-50'}`}
                          title={temNf ? `NF Emitida: ${p.NUM_NOTA_FISCAL} (Editar)` : 'Registrar Nota Fiscal'}
                        >
                          {temNf ? <CheckCircle size={14} /> : <FileText size={14} />}
                        </button>

                        <button
                          onClick={() => handleExcluir(p.ID_PEDIDO, p.NUM_PEDIDO_PLATAFORMA)}
                          className="text-gray-400 hover:text-red-500 p-1.5 rounded-full hover:bg-red-50 transition-colors bg-white shadow-sm border border-gray-100"
                          title="Excluir Pedido"
                        >
                          <Trash2 size={14} />
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

        {!loading && pedidosOrdenados.length === 0 && (
          <div className="p-10 text-center flex flex-col items-center gap-3">
            <span className="text-gray-300"><Search size={32}/></span>
            <p className="text-gray-500 font-medium">Nenhum pedido encontrado.</p>
            <p className="text-sm text-gray-400">Tente ajustar seus filtros de busca.</p>
          </div>
        )}
      </div>

      <ModalNovoPedido
        isOpen={modalNovoOpen}
        onClose={() => setModalNovoOpen(false)}
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
