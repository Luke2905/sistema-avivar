// src/pages/ProducaoScanner.tsx
import { useState, useRef, useEffect } from 'react';
import { ScanBarcode, PackageCheck, AlertTriangle, ListTodo, User, Clock, Eye, Factory } from 'lucide-react';
import api from '../services/api';
import ModalDetalhesProducao from '../components/ModalDetalhesProducao';

export default function ProducaoScanner() {
  const [codigo, setCodigo] = useState('');
  const [ultimoLog, setUltimoLog] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  const [minhaFila, setMinhaFila] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [pedidoSelecionadoId, setPedidoSelecionadoId] = useState<number | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  // Carrega a fila ao abrir
  useEffect(() => { carregarFila(); }, []);

  // Timer para recarregar a fila a cada 10s (para manter sincronizado)
  useEffect(() => {
    const interval = setInterval(() => carregarFila(), 10000);
    return () => clearInterval(interval);
  }, []);

  // Foco no input
  useEffect(() => {
    const interval = setInterval(() => {
      if (!inputRef.current?.matches(':focus') && !modalOpen) {
         inputRef.current?.focus();
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [modalOpen]);

  async function carregarFila() {
    try {
        const res = await api.get('/producao/minha-producao');
        setMinhaFila(res.data);
    } catch (error) { console.error('Erro fila'); }
  }

  const processarCodigo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigo) return;
    setLoading(true);
    setUltimoLog(null);

    try {
      // Envia o código (pode ser "OP-15" ou só "15")
      const res = await api.post('/scanner', { codigo });
      setUltimoLog(res.data);
      
      // Atualiza a lista imediatamente após o bipe
      carregarFila();
      
    } catch (error: any) {
      setUltimoLog({
        tipo: 'erro',
        mensagem: error.response?.data?.mensagem || 'Erro de conexão',
        pedido: { NUM_PEDIDO_PLATAFORMA: codigo }
      });
    } finally {
      setLoading(false);
      setCodigo('');
    }
  };

  const abrirDetalhes = (id: number) => {
    setPedidoSelecionadoId(id);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col md:flex-row ml-64">
      
      {/* LADO ESQUERDO: SCANNER */}
      <div className="flex-1 p-8 flex flex-col items-center justify-center border-r border-gray-800">
        
        <div className="mb-8 text-center opacity-50">
            <h2 className="text-2xl font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                <Factory /> Terminal de Produção
            </h2>
            <p className="text-sm mt-1">Bipe o código da <strong className="text-avivar-tiffany">OP</strong> para iniciar ou encerrar.</p>
        </div>

        <form onSubmit={processarCodigo} className="w-full max-w-xl relative mb-8">
            <input 
            ref={inputRef}
            value={codigo}
            onChange={e => setCodigo(e.target.value)}
            className="w-full bg-gray-800 border-2 border-gray-700 rounded-xl p-6 text-center text-4xl font-mono focus:border-avivar-tiffany outline-none text-white placeholder-gray-600 transition-colors uppercase"
            placeholder="OP-..."
            autoFocus
            disabled={loading || modalOpen}
            />
            {loading && <div className="absolute right-6 top-6 animate-spin">⏳</div>}
        </form>

        {ultimoLog ? (
            <div className={`w-full max-w-xl rounded-2xl border-l-8 shadow-2xl animate-fadeIn overflow-hidden ${
                ultimoLog.tipo === 'sucesso' ? 'bg-green-900/40 border-green-500' :
                ultimoLog.tipo === 'aviso' ? 'bg-yellow-900/40 border-yellow-500' :
                'bg-red-900/40 border-red-500'
            }`}>
                <div className="p-8">
                    <div className="flex items-center justify-between mb-4">
                        <span className="font-mono text-3xl font-bold">
                            {ultimoLog.pedido?.NUM_PEDIDO_PLATAFORMA?.includes('OP') 
                                ? ultimoLog.pedido.NUM_PEDIDO_PLATAFORMA 
                                : `OP-${codigo.replace('OP-', '')}`
                            }
                        </span>
                        {ultimoLog.tipo === 'sucesso' && <PackageCheck size={48} className="text-green-400" />}
                        {ultimoLog.tipo === 'erro' && <AlertTriangle size={48} className="text-red-400" />}
                    </div>
                    <h2 className="text-4xl font-bold mb-2 uppercase tracking-tight">
                        {ultimoLog.tipo === 'sucesso' ? (ultimoLog.acao === 'INICIO' ? 'OP Iniciada 🚀' : 'OP Finalizada ✅') : 'Atenção'}
                    </h2>
                    <p className="text-xl opacity-90">{ultimoLog.mensagem}</p>
                </div>
                
                {ultimoLog.itens && ultimoLog.itens.length > 0 && ultimoLog.acao === 'INICIO' && (
                    <div className="bg-black/20 p-6 border-t border-white/10">
                        <p className="text-xs font-bold uppercase text-gray-400 mb-3">Tarefa Atual:</p>
                        {ultimoLog.itens.map((item: any, idx: number) => (
                             <div key={idx} className="flex items-center gap-3 mb-2 bg-white/5 p-2 rounded">
                                <span className="font-bold text-2xl text-avivar-tiffany">{item.QUANTIDADE}x</span>
                                <span className="text-lg">{item.NOME_PRODUTO}</span>
                             </div>
                        ))}
                    </div>
                )}
            </div>
        ) : (
            <div className="text-center opacity-20">
                <ScanBarcode size={120} className="mx-auto mb-4" />
                <p>Aguardando leitura...</p>
            </div>
        )}
      </div>

      {/* LADO DIREITO: MINHA FILA (Listando OPs) */}
      <div className="w-full md:w-96 bg-gray-800 p-6 overflow-y-auto border-l border-gray-700">
         <h3 className="text-lg font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <ListTodo size={20}/> Minhas OPs Ativas ({minhaFila.length})
         </h3>

         <div className="space-y-3">
            {minhaFila.map(op => (
                <div key={op.ID_PEDIDO} className="bg-gray-700/50 p-4 rounded-lg border border-gray-600 hover:bg-gray-700 transition-colors group relative overflow-hidden">
                    
                    {/* Faixa lateral colorida indicando status */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-avivar-tiffany"></div>

                    <div className="flex justify-between items-start mb-2 pl-2">
                        <span className="font-black text-2xl text-white tracking-tight">
                            {op.CODIGO_VISUAL}
                        </span>
                        <span className="text-[10px] text-gray-400 flex items-center gap-1 bg-black/20 px-2 py-1 rounded">
                            <Clock size={10}/> 
                            {new Date(op.DATA_INICIO).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                    </div>
                    
                    <div className="pl-2 mb-3">
                        <p className="text-xs text-gray-500 uppercase font-bold mb-0.5">Cliente</p>
                        <p className="text-sm font-bold text-gray-300 truncate">{op.NOME_CLIENTE}</p>
                        <p className="text-[10px] text-gray-500">Ref: {op.NUM_PEDIDO_PLATAFORMA}</p>
                    </div>

                    <div className="bg-black/20 p-2 rounded mb-3 ml-2">
                        <p className="text-xs text-gray-400 italic line-clamp-2">
                            {op.resumo_itens}
                        </p>
                    </div>

                    <button 
                        onClick={() => abrirDetalhes(op.ID_PEDIDO)}
                        className="ml-2 w-full bg-gray-600 hover:bg-avivar-tiffany hover:text-white text-gray-300 text-xs font-bold py-2.5 rounded transition-colors flex items-center justify-center gap-2 uppercase tracking-wide"
                    >
                        <Eye size={14} /> Detalhes da OP
                    </button>
                </div>
            ))}
            
            {minhaFila.length === 0 && (
                <div className="text-center mt-20 opacity-50">
                    <Factory size={48} className="mx-auto mb-3 text-gray-600"/>
                    <p className="text-sm text-gray-500">Nenhuma OP em andamento.</p>
                    <p className="text-xs text-gray-600 mt-1">Bipe um código para começar.</p>
                </div>
            )}
         </div>
      </div>

      <ModalDetalhesProducao 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        idPedido={pedidoSelecionadoId}
      />

    </div>
  );
}