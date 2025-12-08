// src/pages/Predicoes.tsx
import { useState, useEffect } from 'react';
import { BrainCircuit, TrendingUp, TrendingDown, Minus, Sparkles, AlertCircle } from 'lucide-react';
import api from '../services/api';

interface Predicao {
  id: number;
  produto: string;
  sku: string;
  media_vendas_mes: number;
  previsao_ia: number;
  tendencia: 'ALTA' | 'BAIXA' | 'ESTAVEL';
  crescimento_pct: string;
  sugestao: string;
}

export default function Predicoes() {
  const [dados, setDados] = useState<Predicao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/ia/previsoes')
       .then(res => setDados(res.data))
       .catch(console.error)
       .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-indigo-600">
        <BrainCircuit size={64} className="animate-pulse mb-4"/>
        <p className="text-xl font-bold">Processando Algoritmos...</p>
        <p className="text-sm text-gray-400">Analisando histórico de vendas</p>
    </div>
  );

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      
      {/* Cabeçalho */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <BrainCircuit className="text-indigo-600" size={32} /> 
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            Avivar Intelligence
          </span>
        </h1>
        <p className="text-sm text-gray-500 mt-1">Análise preditiva de demanda baseada em histórico.</p>
      </div>

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {dados.map((item) => (
          <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all group">
            
            {/* Topo do Card com Gradiente baseado na Tendência */}
            <div className={`h-2 w-full ${
                item.tendencia === 'ALTA' ? 'bg-gradient-to-r from-green-400 to-emerald-600' :
                item.tendencia === 'BAIXA' ? 'bg-gradient-to-r from-red-400 to-rose-600' :
                'bg-gradient-to-r from-gray-300 to-gray-400'
            }`}></div>

            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="font-bold text-gray-800 text-lg line-clamp-1">{item.produto}</h3>
                        <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{item.sku}</span>
                    </div>
                    
                    {/* Ícone de Tendência */}
                    <div className={`p-2 rounded-full ${
                        item.tendencia === 'ALTA' ? 'bg-green-100 text-green-600' :
                        item.tendencia === 'BAIXA' ? 'bg-red-100 text-red-600' :
                        'bg-gray-100 text-gray-500'
                    }`}>
                        {item.tendencia === 'ALTA' && <TrendingUp size={24} />}
                        {item.tendencia === 'BAIXA' && <TrendingDown size={24} />}
                        {item.tendencia === 'ESTAVEL' && <Minus size={24} />}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <p className="text-xs text-gray-500 uppercase font-bold">Média Mensal</p>
                        <p className="text-xl font-bold text-gray-700">{item.media_vendas_mes} un</p>
                    </div>
                    <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100 relative overflow-hidden">
                        <Sparkles size={40} className="absolute -right-2 -bottom-4 text-indigo-200 opacity-50" />
                        <p className="text-xs text-indigo-600 uppercase font-bold flex items-center gap-1">
                            <Sparkles size={10} /> Previsão IA
                        </p>
                        <p className="text-2xl font-bold text-indigo-700">{item.previsao_ia} un</p>
                    </div>
                </div>

                {/* Sugestão da IA */}
                <div className={`text-sm p-3 rounded-lg flex items-start gap-2 ${
                    item.tendencia === 'ALTA' ? 'bg-green-50 text-green-800' :
                    item.tendencia === 'BAIXA' ? 'bg-red-50 text-red-800' :
                    'bg-gray-50 text-gray-600'
                }`}>
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <p className="font-medium leading-tight">{item.sugestao}</p>
                </div>
                
                {item.tendencia !== 'ESTAVEL' && (
                    <p className={`text-xs text-right mt-2 font-bold ${item.tendencia === 'ALTA' ? 'text-green-500' : 'text-red-500'}`}>
                        {item.crescimento_pct}% vs mês anterior
                    </p>
                )}

            </div>
          </div>
        ))}
      </div>

      {dados.length === 0 && (
          <div className="text-center py-20 text-gray-400">
              <BrainCircuit size={48} className="mx-auto mb-4 opacity-50" />
              <p>Ainda não temos dados suficientes para gerar previsões.</p>
              <p className="text-sm">Continue vendendo para alimentar a Inteligência Artificial.</p>
          </div>
      )}
    </div>
  );
}