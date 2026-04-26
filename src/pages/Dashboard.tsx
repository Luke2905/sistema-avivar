import { useState, useEffect } from 'react';
import { RefreshCw, ArrowRight, ArrowLeft, Box, User } from 'lucide-react'; // Ícones
import api from '../services/api';
import { showAlert, showToast } from '../utils/swal-config';
import ModalNovoPedido from '../components/ModalNovoPedido';

// Interface
interface Pedido {
  ID_PEDIDO: number;
  NOME_CLIENTE: string;
  NUM_PEDIDO_PLATAFORMA: string;
  VALOR_TOTAL: string;
  STATUS_PEDIDO: string;
  DATA_PEDIDO: string;
  RESPONSAVEL_PRODUCAO?: string;
  resumo_itens?: string;
  PRAZO_ENVIO?: string;
  LINK_ARTE?: string;
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

export default function Dashboard() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalNovoOpen, setModalNovoOpen] = useState(false);

  // Estados Drag and Drop
  const [draggedPedidoId, setDraggedPedidoId] = useState<number | null>(null);
  const [dragOverFase, setDragOverFase] = useState<string | null>(null);

  useEffect(() => { carregarPedidos(); }, []);

  async function carregarPedidos() {
    try {
      setLoading(true);
      const response = await api.get('/pedidos');
      setPedidos(response.data);
    } catch (error) {
      console.error("Erro", error);
      showToast('Erro ao atualizar lista', 'error');
    } finally {
      setLoading(false);
    }
  }

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

    // 🛑 PEDÁGIO DE ESTOQUE: SAINDO DA PRODUÇÃO PARA FRENTE 🛑
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

  // Compatibilidade com botões de setinha
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

  return (
    <div className="flex flex-col h-full bg-gray-50">
      
      {/* CABEÇALHO */}
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Painel de Produção</h2>
          <p className="text-xs text-gray-500">Acompanhamento de chão de fábrica</p>
        </div>
        <div className="flex gap-2">
            <button onClick={carregarPedidos} className="p-2 text-gray-400 hover:text-avivar-tiffany hover:bg-gray-50 rounded-full transition-all">
              <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            </button>
        </div>
      </header>

      {/* KANBAN BOARD */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 custom-scrollbar">
        <div className="flex gap-4 h-full min-w-max">
          {FASES_KANBAN.map((fase) => {
            const pedidosDaFase = pedidos.filter(p => p.STATUS_PEDIDO === fase.id);

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
                  {pedidosDaFase.map((pedido) => (
                    
                    <div 
                      key={pedido.ID_PEDIDO} 
                      draggable
                      onDragStart={(e) => handleDragStart(e, pedido.ID_PEDIDO)}
                      className={`bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-all group relative flex flex-col gap-2 cursor-grab active:cursor-grabbing
                        ${draggedPedidoId === pedido.ID_PEDIDO ? 'opacity-50 ring-2 ring-avivar-tiffany scale-[0.98]' : 'border-gray-200'}
                      `}
                    >
                      
                      {/* Topo Card */}
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] font-bold bg-gray-50 text-gray-500 px-2 py-1 rounded border border-gray-200">
                          #{pedido.NUM_PEDIDO_PLATAFORMA || 'BALCÃO'}
                        </span>
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] text-gray-400 font-medium leading-none">
                                Pedido: {new Date(pedido.DATA_PEDIDO).toLocaleDateString('pt-BR')}
                            </span>
                            {pedido.PRAZO_ENVIO && (
                                <span className="text-[10px] font-bold text-red-500 bg-red-50 border border-red-100 px-1 rounded mt-1 leading-none py-0.5">
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
                                {pedido.resumo_itens || <span className="italic text-gray-400">Sem itens definidos</span>}
                            </p>
                        </div>
                      </div>

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

                        {/* Avançar (Com lógica de baixa ao sair da produção) */}
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
                  ))}
                  
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
    </div>
  );
}