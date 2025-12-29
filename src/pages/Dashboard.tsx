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

  // --- LÓGICA DE MOVIMENTAÇÃO INTELIGENTE ---

  async function avancarFase(pedido: Pedido) {
    const indexAtual = FASES_ORDEM.indexOf(pedido.STATUS_PEDIDO);
    if (indexAtual >= FASES_ORDEM.length - 2) return; // Trava fim da linha

    const proximaFase = FASES_ORDEM[indexAtual + 1];

    // 🛑 PEDÁGIO DE ESTOQUE: SAINDO DA PRODUÇÃO 🛑
    if (pedido.STATUS_PEDIDO === 'PRODUCAO') {
        try {
            showToast('Finalizando produção e baixando estoque...', 'info');

            // Tenta dar baixa no estoque
            const res = await api.post(`/producao/${pedido.ID_PEDIDO}/baixar-estoque`);
            
            // Se chegou aqui, deu certo!
            const qtdBaixada = res.data.insumos_baixados || 'vários';
            showToast(`Sucesso! ${qtdBaixada} insumos baixados.`, 'success');

            // AGORA sim, move para "ENVIADO"
            atualizarStatus(pedido, proximaFase, 'forward');

        } catch (error: any) {
            // Se der erro (ex: Estoque insuficiente), cai aqui e NÃO avança
            console.error(error);
            const msgErro = error.response?.data?.mensagem || 'Erro desconhecido.';
            
            // Alerta visual bonito travando a operação
            showAlert(
                'Estoque Insuficiente 🚫', 
                `Não foi possível finalizar a produção.\n\nMotivo: ${msgErro}`, 
                'error'
            );
        }
    } else {
        // Se NÃO for fase de produção, vida que segue normal
        atualizarStatus(pedido, proximaFase, 'forward');
    }
  }

  async function voltarFase(pedido: Pedido) {
    const indexAtual = FASES_ORDEM.indexOf(pedido.STATUS_PEDIDO);
    if (indexAtual <= 0) return;
    const faseAnterior = FASES_ORDEM[indexAtual - 1];
    atualizarStatus(pedido, faseAnterior, 'back');
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
              <div key={fase.id} className="w-[320px] flex flex-col bg-gray-100/50 rounded-xl max-h-full border border-gray-200 shadow-sm">
                
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
                    
                    <div key={pedido.ID_PEDIDO} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all group relative flex flex-col gap-2">
                      
                      {/* Topo Card */}
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-bold bg-gray-50 text-gray-500 px-2 py-1 rounded border border-gray-200">
                          #{pedido.NUM_PEDIDO_PLATAFORMA || 'BALCÃO'}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium">
                          {new Date(pedido.DATA_PEDIDO).toLocaleDateString('pt-BR')}
                        </span>
                      </div>

                      {/* Cliente */}
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-gray-400" />
                        <h4 className="font-bold text-gray-800 text-sm line-clamp-1" title={pedido.NOME_CLIENTE}>
                          {pedido.NOME_CLIENTE}
                        </h4>
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