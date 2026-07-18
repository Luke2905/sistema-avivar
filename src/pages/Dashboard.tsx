import { useState, useEffect } from 'react';
import { RefreshCw, ArrowRight, ArrowLeft, Box, User, ChevronUp, ChevronDown, Truck } from 'lucide-react';
import api from '../services/api';
import { showAlert, showToast } from '../utils/swal-config';
import ModalNovoPedido from '../components/ModalNovoPedido';
import ModalDetalhesPedido from '../components/ModalDetalhesPedido';
import { Search, Filter, Calendar, Eye, AlertTriangle, Clock } from 'lucide-react';

// Interface
interface Pedido {
  ID_PEDIDO: number;
  NOME_CLIENTE: string;
  NUM_PEDIDO_PLATAFORMA: string;
  PLATAFORMA_ORIGEM?: string;
  VALOR_TOTAL: string;
  STATUS_PEDIDO: string;
  DATA_PEDIDO: string;
  RESPONSAVEL_PRODUCAO?: string;
  resumo_itens?: string;
  PRAZO_ENVIO?: string;
  LINK_ARTE?: string;
  OBSERVACOES?: string;
  COD_RASTREIO?: string;
  VALOR_REPASSE?: string | number;
}

const FASES_ORDEM = ['ENTRADA', 'AGUARDANDO_ARTE', 'CRIACAO', 'IMPRIMINDO', 'PRODUCAO', 'ENVIADO', 'CANCELADO'];

const FASES_KANBAN = [
  { id: 'ENTRADA', titulo: 'Entrada', style: 'bg-slate-100 text-slate-700 border-slate-300' },
  { id: 'AGUARDANDO_ARTE', titulo: 'Aguardando Arte', style: 'bg-amber-100 text-amber-800 border-amber-300' },
  { id: 'CRIACAO', titulo: 'Criação', style: 'bg-blue-100 text-blue-800 border-blue-300' },
  { id: 'IMPRIMINDO', titulo: 'Imprimindo', style: 'bg-purple-100 text-purple-800 border-purple-300' },
  { id: 'PRODUCAO', titulo: 'Produção', style: 'bg-orange-100 text-orange-800 border-orange-300' },
  { id: 'ENVIADO', titulo: 'Enviado', style: 'bg-green-100 text-green-800 border-green-300' },
];

type OrdemTipo = 'data_desc' | 'data_asc' | 'valor_desc' | 'valor_asc' | 'prazo_asc' | 'prazo_desc';

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
  if (!resumo) return <span className="italic text-gray-400">Sem itens definidos</span>;
  // Destaca o "Nx" no início de cada segmento: "1x Produto, 2x Outro"
  const partes = resumo.split(', ');
  return (
    <>
      {partes.map((parte, i) => {
        const match = parte.match(/^(\d+x)\s(.+)$/);
        if (match) {
          return (
            <span key={i}>
              {i > 0 && <span className="text-gray-400">, </span>}
              <strong className="text-gray-800 font-bold">{match[1]}</strong>
              {' '}{match[2]}
            </span>
          );
        }
        return <span key={i}>{i > 0 ? ', ' : ''}{parte}</span>;
      })}
    </>
  );
}

export default function Dashboard() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalNovoOpen, setModalNovoOpen] = useState(false);
  const [modalDetalhesOpen, setModalDetalhesOpen] = useState(false);
  const [pedidoSelecionado, setPedidoSelecionado] = useState<any | null>(null);

  // Filtros
  const [busca, setBusca] = useState('');
  const [filtroDia, setFiltroDia] = useState('');
  const [filtroMes, setFiltroMes] = useState('');
  const [filtroAno, setFiltroAno] = useState('');
  const [filtroOrigem, setFiltroOrigem] = useState('');
  const [filtroPrazoEnvio, setFiltroPrazoEnvio] = useState('');
  const [filtroPrazoTipo, setFiltroPrazoTipo] = useState(''); // 'vencido' | 'amanha' | ''
  const [showFiltros, setShowFiltros] = useState(false);

  // Ordenação
  const [ordem, setOrdem] = useState<OrdemTipo>('data_desc');

  // Estados Drag and Drop
  const [draggedPedidoId, setDraggedPedidoId] = useState<number | null>(null);
  const [dragOverFase, setDragOverFase] = useState<string | null>(null);

  // Estoque Crítico
  const [estoqueCritico, setEstoqueCritico] = useState<any[]>([]);

  useEffect(() => { carregarPedidos(); carregarEstoque(); }, []);

  async function carregarEstoque() {
    try {
      const res = await api.get('/estoque');
      setEstoqueCritico(res.data.filter((m: any) => m.alerta_baixo === 1));
    } catch (error) {
      console.error(error);
    }
  }

  async function carregarPedidos() {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (filtroDia) params.dia = filtroDia;
      if (filtroMes) params.mes = filtroMes;
      if (filtroAno) params.ano = filtroAno;
      if (filtroOrigem.trim()) params.origem = filtroOrigem.trim();
      if (filtroPrazoEnvio) params.prazo_envio = filtroPrazoEnvio;

      const response = await api.get('/pedidos', { params });
      setPedidos(response.data);
    } catch (error) {
      console.error("Erro", error);
      showToast('Erro ao atualizar lista', 'error');
    } finally {
      setLoading(false);
    }
  }

  const aplicarFiltros = () => { carregarPedidos(); };

  const limparFiltros = () => {
    setFiltroDia(''); setFiltroMes(''); setFiltroAno(''); setFiltroOrigem('');
    setFiltroPrazoEnvio(''); setFiltroPrazoTipo(''); setBusca('');
    setTimeout(() => carregarPedidos(), 100);
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

  // --- LÓGICA DE MOVIMENTAÇÃO INTELIGENTE E DRAG & DROP ---

  const handleDragStart = (e: React.DragEvent, pedidoId: number) => {
    setDraggedPedidoId(pedidoId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, faseId: string) => {
    e.preventDefault();
    if (dragOverFase !== faseId) setDragOverFase(faseId);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverFase(null);
  };

  const handleDrop = async (e: React.DragEvent, novaFase: string) => {
    e.preventDefault();
    setDragOverFase(null);
    if (!draggedPedidoId) return;
    const pedido = pedidos.find(p => p.ID_PEDIDO === draggedPedidoId);
    setDraggedPedidoId(null);
    if (!pedido || pedido.STATUS_PEDIDO === novaFase) return;
    processarMovimentacao(pedido, novaFase);
  };

  async function processarMovimentacao(pedido: Pedido, novaFase: string) {
    const indexAtual = FASES_ORDEM.indexOf(pedido.STATUS_PEDIDO);
    const indexNovo = FASES_ORDEM.indexOf(novaFase);
    const direcao = indexNovo > indexAtual ? 'forward' : 'back';

    if (pedido.STATUS_PEDIDO === 'PRODUCAO' && indexNovo > indexAtual) {
      try {
        showToast('Finalizando produção e baixando estoque...', 'info');
        const res = await api.post(`/producao/${pedido.ID_PEDIDO}/baixar-estoque`);
        const qtdBaixada = res.data.insumos_baixados || 'vários';
        showToast(`Sucesso! ${qtdBaixada} insumos baixados.`, 'success');
        atualizarStatus(pedido, novaFase, direcao);
      } catch (error: any) {
        console.error(error);
        const msgErro = error.response?.data?.mensagem || 'Erro desconhecido.';
        showAlert('Estoque Insuficiente 🚫', `Não foi possível finalizar a produção.\n\nMotivo: ${msgErro}`, 'error');
      }
    } else {
      atualizarStatus(pedido, novaFase, direcao);
    }
  }

  async function avancarFase(pedido: Pedido) {
    const indexAtual = FASES_ORDEM.indexOf(pedido.STATUS_PEDIDO);
    if (indexAtual >= FASES_ORDEM.length - 2) return;
    processarMovimentacao(pedido, FASES_ORDEM[indexAtual + 1]);
  }

  async function voltarFase(pedido: Pedido) {
    const indexAtual = FASES_ORDEM.indexOf(pedido.STATUS_PEDIDO);
    if (indexAtual <= 0) return;
    processarMovimentacao(pedido, FASES_ORDEM[indexAtual - 1]);
  }

  async function atualizarStatus(pedido: Pedido, novaFase: string, direcao: 'forward' | 'back') {
    try {
      await api.patch(`/pedidos/${pedido.ID_PEDIDO}/status`, { novo_status: novaFase });
      setPedidos(antigos => antigos.map(p =>
        p.ID_PEDIDO === pedido.ID_PEDIDO ? { ...p, STATUS_PEDIDO: novaFase } : p
      ));
      if (direcao === 'back') showToast(`Voltou para ${novaFase.replace('_', ' ')}`);
    } catch (error) {
      showAlert('Erro', 'Não foi possível mover o pedido no servidor.', 'error');
    }
  }

  // Filtro de busca + prazo tipo
  const pedidosFiltrados = pedidos.filter((p) => {
    const termo = busca.toLowerCase();
    const passaBusca = !termo || (
      (p.NOME_CLIENTE || '').toLowerCase().includes(termo) ||
      (p.NUM_PEDIDO_PLATAFORMA || '').toLowerCase().includes(termo) ||
      (p.resumo_itens || '').toLowerCase().includes(termo) ||
      (p.OBSERVACOES || '').toLowerCase().includes(termo) ||
      (p.PLATAFORMA_ORIGEM || '').toLowerCase().includes(termo) ||
      (p.COD_RASTREIO || '').toLowerCase().includes(termo)
    );

    if (!passaBusca) return false;

    if (filtroPrazoTipo) {
      const status = getPrazoStatus(p.PRAZO_ENVIO);
      if (filtroPrazoTipo === 'vencido' && status !== 'vencido') return false;
      if (filtroPrazoTipo === 'amanha' && status !== 'amanha') return false;
      if (filtroPrazoTipo === 'urgente' && status !== 'vencido' && status !== 'amanha') return false;
    }

    return true;
  });

  // Função de ordenação
  function ordenarPedidos(lista: Pedido[]): Pedido[] {
    return [...lista].sort((a, b) => {
      switch (ordem) {
        case 'data_asc': return new Date(a.DATA_PEDIDO).getTime() - new Date(b.DATA_PEDIDO).getTime();
        case 'data_desc': return new Date(b.DATA_PEDIDO).getTime() - new Date(a.DATA_PEDIDO).getTime();
        case 'valor_asc': return Number(a.VALOR_TOTAL || 0) - Number(b.VALOR_TOTAL || 0);
        case 'valor_desc': return Number(b.VALOR_TOTAL || 0) - Number(a.VALOR_TOTAL || 0);
        case 'prazo_asc': {
          const pa = a.PRAZO_ENVIO ? new Date(a.PRAZO_ENVIO).getTime() : Infinity;
          const pb = b.PRAZO_ENVIO ? new Date(b.PRAZO_ENVIO).getTime() : Infinity;
          return pa - pb;
        }
        case 'prazo_desc': {
          const pa = a.PRAZO_ENVIO ? new Date(a.PRAZO_ENVIO).getTime() : -Infinity;
          const pb = b.PRAZO_ENVIO ? new Date(b.PRAZO_ENVIO).getTime() : -Infinity;
          return pb - pa;
        }
        default: return 0;
      }
    });
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">

      {/* CABEÇALHO */}
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Painel de Produção</h2>
          <p className="text-xs text-gray-500">Acompanhamento de chão de fábrica</p>
        </div>
        <div className="flex gap-2 items-center">
          {/* Seletor de Ordenação */}
          <select
            value={ordem}
            onChange={(e) => setOrdem(e.target.value as OrdemTipo)}
            className="text-xs border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-avivar-tiffany bg-white text-gray-600"
            title="Ordenar cartões"
          >
            <option value="data_desc">↓ Mais recentes</option>
            <option value="data_asc">↑ Mais antigos</option>
            <option value="valor_desc">↓ Maior valor</option>
            <option value="valor_asc">↑ Menor valor</option>
            <option value="prazo_asc">↑ Prazo mais próximo</option>
            <option value="prazo_desc">↓ Prazo mais distante</option>
          </select>
          <button onClick={() => { carregarPedidos(); carregarEstoque(); }} className="p-2 text-gray-400 hover:text-avivar-tiffany hover:bg-gray-50 rounded-full transition-all">
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </header>

      {/* ALERTA DE ESTOQUE CRÍTICO */}
      {estoqueCritico.length > 0 && (
        <div className="bg-red-50 border-b border-red-200 px-8 py-2 flex items-center gap-3 animate-fadeIn">
          <AlertTriangle size={18} className="text-red-500 shrink-0" />
          <div className="flex-1 overflow-x-auto custom-scrollbar flex items-center gap-4 py-1">
            <span className="text-sm font-bold text-red-800 shrink-0">Estoque Baixo:</span>
            {estoqueCritico.map(m => (
              <span key={m.ID_MATERIA} className="text-xs bg-white text-red-600 px-2 py-0.5 rounded border border-red-100 whitespace-nowrap shadow-sm font-medium">
                {m.NOME_MATERIA} ({Number(m.SALDO_ESTOQUE)} {m.UNIDADE_MEDIDA})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* FILTROS */}
      <div className="bg-white border-b border-gray-200 px-8 py-3 flex flex-col gap-3 shrink-0">
        <div className="flex justify-between items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar cliente, pedido, rastreio, observação..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-avivar-tiffany text-sm"
            />
          </div>
          <div className="flex gap-2">
            {/* Filtro rápido de prazo */}
            <select
              value={filtroPrazoTipo}
              onChange={e => setFiltroPrazoTipo(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-avivar-tiffany bg-white text-gray-600"
            >
              <option value="">Todos os prazos</option>
              <option value="vencido">⛔ Vencidos</option>
              <option value="amanha">⚠️ Vencem amanhã</option>
              <option value="urgente">🔴 Urgentes (vencido + amanhã)</option>
            </select>
            <button onClick={() => setShowFiltros(!showFiltros)} className="flex items-center gap-2 text-sm text-gray-600 hover:text-avivar-tiffany font-medium border border-gray-200 px-3 py-2 rounded-lg transition-colors">
              <Filter size={16} /> Filtros {showFiltros ? 'Ocultar' : 'Avançados'}
            </button>
          </div>
        </div>

        {showFiltros && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-2 border-t border-gray-100 animate-fadeIn">
            <input type="date" value={filtroDia} onChange={(e) => setFiltroDia(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none" title="Dia do pedido" />
            <select value={filtroMes} onChange={(e) => setFiltroMes(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none bg-white">
              <option value="">Mês</option>
              {['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'].map((mes, i) => <option key={i + 1} value={String(i + 1)}>{mes}</option>)}
            </select>
            <input type="number" placeholder="Ano" value={filtroAno} onChange={(e) => setFiltroAno(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none" />
            <input type="text" placeholder="Origem" value={filtroOrigem} onChange={(e) => setFiltroOrigem(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none" />
            <input type="date" value={filtroPrazoEnvio} onChange={(e) => setFiltroPrazoEnvio(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none" title="Prazo de Envio exato" />

            <div className="col-span-2 md:col-span-5 flex justify-end gap-2 mt-1">
              <button onClick={limparFiltros} className="px-4 py-1.5 text-xs font-bold text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">Limpar</button>
              <button onClick={aplicarFiltros} className="px-4 py-1.5 text-xs font-bold bg-avivar-tiffany text-white rounded-lg hover:bg-teal-600 shadow-sm">Aplicar</button>
            </div>
          </div>
        )}
      </div>

      {/* KANBAN BOARD */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 custom-scrollbar">
        <div className="flex gap-4 h-full min-w-max">
          {FASES_KANBAN.map((fase) => {
            const pedidosDaFase = ordenarPedidos(pedidosFiltrados.filter(p => p.STATUS_PEDIDO === fase.id));

            return (
              <div
                key={fase.id}
                onDragOver={(e) => handleDragOver(e, fase.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, fase.id)}
                className={`w-[320px] flex flex-col bg-gray-100/50 rounded-xl max-h-full border transition-all duration-200
                  ${dragOverFase === fase.id ? 'border-dashed border-2 border-avivar-tiffany bg-teal-50/50' : 'border-gray-200 shadow-sm'}
                `}
              >

                {/* Título Coluna */}
                <div className={`p-3 flex justify-between items-center border-b-2 rounded-t-xl ${fase.style}`}>
                  <h3 className="font-bold text-sm uppercase tracking-wide flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full bg-current opacity-50`}></div>
                    {fase.titulo}
                  </h3>
                  <span className="bg-white/50 px-2 py-0.5 rounded text-xs font-bold border border-black/5">
                    {pedidosDaFase.length}
                  </span>
                </div>

                {/* Lista de Cards */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                  {pedidosDaFase.map((pedido) => {
                    const prazoStatus = getPrazoStatus(pedido.PRAZO_ENVIO);
                    const bordaCard = prazoStatus === 'vencido'
                      ? 'border-l-4 border-l-red-500'
                      : prazoStatus === 'amanha'
                        ? 'border-l-4 border-l-yellow-400'
                        : 'border-gray-200';
                    const bgCard = prazoStatus === 'vencido'
                      ? 'bg-red-50'
                      : prazoStatus === 'amanha'
                        ? 'bg-yellow-50'
                        : 'bg-white';

                    return (
                      <div
                        key={pedido.ID_PEDIDO}
                        draggable
                        onDragStart={(e) => handleDragStart(e, pedido.ID_PEDIDO)}
                        className={`${bgCard} p-4 rounded-lg shadow-sm border hover:shadow-md transition-all group relative flex flex-col gap-2 cursor-grab active:cursor-grabbing
                          ${draggedPedidoId === pedido.ID_PEDIDO ? 'opacity-50 ring-2 ring-avivar-tiffany scale-[0.98]' : bordaCard}
                        `}
                      >

                        {/* Topo Card */}
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-[10px] font-bold bg-gray-50 text-gray-500 px-2 py-1 rounded border border-gray-200">
                            #{pedido.NUM_PEDIDO_PLATAFORMA || 'BALCÃO'}
                          </span>
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-[10px] text-gray-400 font-medium leading-none flex items-center gap-1">
                              <Calendar size={9} />
                              {new Date(pedido.DATA_PEDIDO).toLocaleDateString('pt-BR')}
                            </span>
                            {pedido.PRAZO_ENVIO && (
                              <span className={`text-[10px] font-bold px-1.5 rounded py-0.5 border flex items-center gap-1 ${
                                prazoStatus === 'vencido'
                                  ? 'bg-red-500 text-white border-red-600 animate-pulse shadow-sm shadow-red-200'
                                  : prazoStatus === 'amanha'
                                    ? 'bg-yellow-400 text-yellow-900 border-yellow-500'
                                    : 'text-orange-500 bg-orange-50 border-orange-100'
                              }`}>
                                <Clock size={8} />
                                Prazo: {new Date(pedido.PRAZO_ENVIO).toLocaleDateString('pt-BR')}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Cliente */}
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-gray-400" />
                          <h4 className="font-bold text-gray-800 text-sm line-clamp-1 flex-1" title={pedido.NOME_CLIENTE}>
                            {pedido.NOME_CLIENTE}
                          </h4>
                          {pedido.LINK_ARTE && (
                            <a href={pedido.LINK_ARTE} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 bg-blue-50 p-1 rounded-md border border-blue-100 shadow-sm" title="Abrir Arte no Drive" onClick={e => e.stopPropagation()}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
                            </a>
                          )}
                        </div>

                        {/* Destaque Responsável */}
                        {pedido.STATUS_PEDIDO === 'PRODUCAO' && pedido.RESPONSAVEL_PRODUCAO && (
                          <div className="flex items-center gap-2 bg-orange-50 p-1.5 rounded border border-orange-200 animate-pulse">
                            <div className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                              {pedido.RESPONSAVEL_PRODUCAO.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-[10px] font-bold text-orange-700 uppercase tracking-wide">
                              Prod. por {pedido.RESPONSAVEL_PRODUCAO.split(' ')[0]}
                            </span>
                          </div>
                        )}

                        {/* Resumo Itens */}
                        <div className="bg-blue-50/50 p-2 rounded border border-blue-100 mt-1">
                          <div className="flex items-start gap-2">
                            <Box size={14} className="text-avivar-tiffany mt-0.5 shrink-0" />
                            <p className="text-xs text-gray-600 font-medium leading-relaxed">
                              {formatarResumoItens(pedido.resumo_itens)}
                            </p>
                          </div>
                        </div>

                        {/* Código de Rastreio (discreto, indexado na busca) */}
                        {pedido.COD_RASTREIO && (
                          <div className="flex items-center gap-1.5 text-[10px] text-gray-400 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                            <Truck size={10} className="shrink-0" />
                            <span className="font-mono truncate" title={pedido.COD_RASTREIO}>{pedido.COD_RASTREIO}</span>
                          </div>
                        )}

                        {/* Observações */}
                        {pedido.OBSERVACOES && (
                          <div className="bg-yellow-50/70 p-2 rounded border border-yellow-200/50 mt-1">
                            <p className="text-[10px] text-yellow-800 font-medium line-clamp-2 leading-tight">
                              <span className="font-bold mr-1">OBS:</span>
                              {pedido.OBSERVACOES}
                            </p>
                          </div>
                        )}

                        {/* Botões Ação */}
                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-50">

                          {/* Voltar */}
                          <div className="h-8 w-8">
                            {fase.id !== 'ENTRADA' && (
                              <button
                                onClick={(e) => { e.stopPropagation(); voltarFase(pedido); }}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                              >
                                <ArrowLeft size={18} />
                              </button>
                            )}
                          </div>

                          {/* Detalhes (Olho) */}
                          <button
                            onClick={(e) => { e.stopPropagation(); abrirDetalhes(pedido.ID_PEDIDO); }}
                            className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors shadow-sm border border-transparent hover:border-blue-100"
                            title="Ver Detalhes do Pedido"
                          >
                            <Eye size={20} />
                          </button>

                          {/* Avançar */}
                          <div className="h-8 w-8">
                            {fase.id !== 'ENVIADO' && (
                              <button
                                onClick={(e) => { e.stopPropagation(); avancarFase(pedido); }}
                                className="p-1.5 text-gray-400 hover:text-avivar-tiffany hover:bg-teal-50 rounded-full transition-colors"
                                title={fase.id === 'PRODUCAO' ? 'Finalizar e Baixar Estoque' : 'Avançar fase'}
                              >
                                <ArrowRight size={18} />
                              </button>
                            )}
                          </div>

                        </div>
                      </div>
                    );
                  })}

                  {/* Vazio */}
                  {pedidosDaFase.length === 0 && (
                    <div className="text-center py-4 opacity-50 border-2 border-dashed border-gray-200 rounded-lg">
                      <p className="text-xs text-gray-400">Vazio</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ModalNovoPedido
        isOpen={modalNovoOpen}
        onClose={() => setModalNovoOpen(false)}
        onSuccess={carregarPedidos}
      />
      <ModalDetalhesPedido
        isOpen={modalDetalhesOpen}
        dados={pedidoSelecionado}
        onClose={() => setModalDetalhesOpen(false)}
      />
    </div>
  );
}