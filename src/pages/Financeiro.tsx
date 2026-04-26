import { useEffect, useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  BarChart2,
  Calendar as CalendarIcon,
  PieChart as PieChartIcon,
  List,
  Target,
  Settings,
  X,
  Save,
  Loader2,
  Percent
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import api from '../services/api';
import { showToast } from '../utils/swal-config';
import { exportToExcel, exportToPDF } from '../utils/exportUtils';

interface DREData {
  kpis: {
    faturamentoTotal: number;
    metaTotal: number;
    lucroTotal: number;
    custosTotais: number;
    faturamentoHoje: number;
    crescimentoPercentual: number;
  };
  tabelaConsolidada: any[];
  graficos: {
    pizza: any[];
    linha: any[];
  };
}

export default function Financeiro() {
  const [data, setData] = useState<DREData | null>(null);
  const [loading, setLoading] = useState(true);

  const [ano, setAno] = useState(new Date().getFullYear());
  const [mes, setMes] = useState(new Date().getMonth() + 1);

  // Modal Metas e Custos
  const [showModal, setShowModal] = useState(false);
  const [formMeta, setFormMeta] = useState({
    meta_faturamento: '',
    investimento_ads: '',
    novas_maquinas: '',
    custo_nao_produtivo: ''
  });

  useEffect(() => {
    carregarDRE();
  }, [ano, mes]);

  async function carregarDRE() {
    try {
      setLoading(true);
      const res = await api.get(`/financeiro/dre?ano=${ano}&mes=${mes}`);
      setData(res.data);
    } catch (error) {
      console.error(error);
      showToast('Erro ao carregar o DRE', 'error');
    } finally {
      setLoading(false);
    }
  }

  function abrirModalLançamento() {
    // Preenche com os dados do mês selecionado se existirem
    if (data?.tabelaConsolidada && data.tabelaConsolidada.length > 0) {
      const mesData = data.tabelaConsolidada[0]; // Como filtramos por mês, só tem 1
      setFormMeta({
        meta_faturamento: String(mesData.meta || ''),
        investimento_ads: String(mesData.ads || ''),
        novas_maquinas: String(mesData.maquinas || ''),
        custo_nao_produtivo: String(mesData.custoNaoProdutivo || '')
      });
    } else {
      setFormMeta({ meta_faturamento: '', investimento_ads: '', novas_maquinas: '', custo_nao_produtivo: '' });
    }
    setShowModal(true);
  }

  const handleExportExcel = () => {
    if (!data?.tabelaConsolidada) return;
    const exportData = data.tabelaConsolidada.map(linha => ({
      'Período': `${String(linha.mes).padStart(2,'0')}/${linha.ano}`,
      'Vendas': linha.qtdVendas,
      'Meta (R$)': linha.meta,
      'Faturamento (R$)': linha.faturamento,
      'Custos Prod. (R$)': linha.custoProducao,
      'Mão de Obra (R$)': linha.custoMaoDeObra,
      'Invest. ADS (R$)': linha.ads,
      'Outros Custos (R$)': (linha.maquinas + linha.custoNaoProdutivo),
      'Custo Total (R$)': linha.custoTotal,
      'Lucro Líquido (R$)': linha.lucroLiquido,
      'Margem %': linha.margemPercentual.toFixed(1)
    }));
    exportToExcel(exportData, 'DRE_Consolidado');
  };

  const handleExportPDF = () => {
    if (!data?.tabelaConsolidada) return;
    const headers = ['Período', 'Vendas', 'Meta', 'Faturamento', 'Custo Prod.', 'Mão Obra', 'ADS', 'Total Custos', 'Lucro Líq.', 'Margem %'];
    const exportData = data.tabelaConsolidada.map(linha => [
      `${String(linha.mes).padStart(2,'0')}/${linha.ano}`,
      linha.qtdVendas,
      Number(linha.meta).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      Number(linha.faturamento).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      Number(linha.custoProducao).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      Number(linha.custoMaoDeObra).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      Number(linha.ads).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      Number(linha.custoTotal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      Number(linha.lucroLiquido).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      `${linha.margemPercentual.toFixed(1)}%`
    ]);
    exportToPDF(headers, exportData, 'DRE_Consolidado', 'DRE Consolidado');
  };

  async function salvarMetas(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post('/financeiro/metas', {
        mes,
        ano,
        meta_faturamento: Number(formMeta.meta_faturamento),
        investimento_ads: Number(formMeta.investimento_ads),
        novas_maquinas: Number(formMeta.novas_maquinas),
        custo_nao_produtivo: Number(formMeta.custo_nao_produtivo)
      });
      showToast('Dados salvos!', 'success');
      setShowModal(false);
      carregarDRE(); // Recarrega
    } catch (error) {
      showToast('Erro ao salvar', 'error');
    }
  }

  if (loading && !data) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="animate-spin text-avivar-tiffany" size={40} />
      </div>
    );
  }

  const { kpis, tabelaConsolidada, graficos } = data || { 
    kpis: { faturamentoTotal: 0, metaTotal: 0, lucroTotal: 0, custosTotais: 0, faturamentoHoje: 0, crescimentoPercentual: 0 },
    tabelaConsolidada: [], graficos: { pizza: [], linha: [] }
  };

  const COLORS = ['#0ABAB5', '#FF69B4', '#3b82f6', '#f59e0b', '#8b5cf6'];

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* Header e Filtros */}
        <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <BarChart2 className="text-avivar-tiffany" /> DRE Consolidado
            </h1>
            <p className="text-sm text-gray-500">Acompanhamento financeiro avançado</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
              <CalendarIcon size={18} className="text-gray-400" />
              <select 
                value={mes} 
                onChange={e => setMes(Number(e.target.value))}
                className="bg-transparent text-sm font-bold text-gray-700 outline-none"
              >
                {Array.from({length: 12}, (_, i) => i+1).map(m => (
                  <option key={m} value={m}>{new Date(2000, m-1, 1).toLocaleString('pt-BR', { month: 'long' }).toUpperCase()}</option>
                ))}
              </select>
              <span className="text-gray-300">|</span>
              <select 
                value={ano} 
                onChange={e => setAno(Number(e.target.value))}
                className="bg-transparent text-sm font-bold text-gray-700 outline-none"
              >
                {[ano-1, ano, ano+1].map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>

            <button
              onClick={handleExportExcel}
              className="bg-green-50 text-green-700 border border-green-200 px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-green-100 transition-colors font-bold text-sm shadow-sm"
              title="Exportar Excel"
            >
              EXCEL
            </button>
            <button
              onClick={handleExportPDF}
              className="bg-red-50 text-red-700 border border-red-200 px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-red-100 transition-colors font-bold text-sm shadow-sm"
              title="Exportar PDF"
            >
              PDF
            </button>
            <button
              onClick={abrirModalLançamento}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-black transition-colors font-bold text-sm shadow-md"
            >
              <Settings size={16} /> Lançar Custos / Meta
            </button>
          </div>
        </header>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <CardKPI 
            titulo="Faturamento Total" 
            valor={kpis.faturamentoTotal} 
            icone={DollarSign} 
            cor="text-avivar-tiffany" 
            bg="bg-teal-50" 
            destaque 
          />
          <CardKPI 
            titulo="Faturamento vs Meta" 
            valor={kpis.metaTotal} 
            icone={Target} 
            cor="text-indigo-600" 
            bg="bg-indigo-50" 
            legenda={`${kpis.metaTotal > 0 ? ((kpis.faturamentoTotal / kpis.metaTotal) * 100).toFixed(1) : 0}% atingido`}
          />
          <CardKPI 
            titulo="Lucro Líquido" 
            valor={kpis.lucroTotal} 
            icone={TrendingUp} 
            cor={kpis.lucroTotal >= 0 ? "text-emerald-600" : "text-red-500"} 
            bg={kpis.lucroTotal >= 0 ? "bg-emerald-50" : "bg-red-50"} 
          />
          <CardKPI 
            titulo="Crescimento (vs Mês Ant.)" 
            valor={kpis.crescimentoPercentual} 
            icone={Percent} 
            cor={kpis.crescimentoPercentual >= 0 ? "text-blue-600" : "text-orange-500"} 
            bg={kpis.crescimentoPercentual >= 0 ? "bg-blue-50" : "bg-orange-50"} 
            moeda={false}
            sufixo="%"
          />
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Evolução Diária */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-[350px]">
            <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
              <TrendingUp className="text-avivar-tiffany" size={18} /> Evolução Diária (Faturamento)
            </h3>
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={graficos.linha} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="dia" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `R$${val/1000}k`} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                  <Tooltip 
                    formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Faturamento']}
                    labelFormatter={(label) => `Dia ${label}`}
                  />
                  <Line type="monotone" dataKey="faturamento" stroke="#0ABAB5" strokeWidth={3} dot={{ r: 3, fill: '#0ABAB5' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Origem das Vendas */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-[350px]">
            <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
              <PieChartIcon className="text-avivar-pink" size={18} /> Distribuição por Origem
            </h3>
            <div className="flex-1 w-full">
              {graficos.pizza.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                    <Pie
                        data={graficos.pizza}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {graficos.pizza.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR')}`} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">Sem dados no período</div>
              )}
            </div>
          </div>
        </div>

        {/* Tabela Consolidada */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-gray-700 flex items-center gap-2">
              <List className="text-gray-500" size={18} /> Balanço Detalhado (DRE)
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-bold border-b border-gray-200">
                <tr>
                  <th className="p-4">Período</th>
                  <th className="p-4 text-center">Vendas</th>
                  <th className="p-4 text-right">Meta (R$)</th>
                  <th className="p-4 text-right text-avivar-tiffany">Faturamento</th>
                  <th className="p-4 text-right">Custos Prod.</th>
                  <th className="p-4 text-right">Mão de Obra</th>
                  <th className="p-4 text-right">Invest. ADS</th>
                  <th className="p-4 text-right">Outros Custos</th>
                  <th className="p-4 text-right text-red-500">Custo Total</th>
                  <th className="p-4 text-right font-black">Lucro Líquido</th>
                  <th className="p-4 text-center bg-gray-100">Margem %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tabelaConsolidada.length === 0 && (
                  <tr><td colSpan={11} className="p-8 text-center text-gray-400">Nenhum dado encontrado para este mês.</td></tr>
                )}
                {tabelaConsolidada.map((linha, idx) => {
                  const outrosCustos = linha.maquinas + linha.custoNaoProdutivo;
                  return (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-bold text-gray-700">{String(linha.mes).padStart(2,'0')}/{linha.ano}</td>
                      <td className="p-4 text-center text-gray-500">{linha.qtdVendas}</td>
                      <td className="p-4 text-right text-gray-500">{linha.meta.toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}</td>
                      <td className="p-4 text-right font-bold text-avivar-tiffany">{linha.faturamento.toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}</td>
                      <td className="p-4 text-right text-gray-500">{linha.custoProducao.toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}</td>
                      <td className="p-4 text-right text-gray-500">{linha.custoMaoDeObra.toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}</td>
                      <td className="p-4 text-right text-blue-500">{linha.ads.toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}</td>
                      <td className="p-4 text-right text-gray-500">{outrosCustos.toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}</td>
                      <td className="p-4 text-right font-bold text-red-500">{linha.custoTotal.toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}</td>
                      <td className={`p-4 text-right font-black ${linha.lucroLiquido >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {linha.lucroLiquido.toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}
                      </td>
                      <td className="p-4 text-center font-bold bg-gray-50">
                        <span className={`px-2 py-1 rounded-full text-xs ${linha.margemPercentual >= 20 ? 'bg-emerald-100 text-emerald-700' : linha.margemPercentual > 0 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                          {linha.margemPercentual.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Modal Lançamento */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fadeIn">
            <div className="bg-gray-800 p-5 flex justify-between items-center text-white">
              <h2 className="font-bold text-lg">Lançamentos - {String(mes).padStart(2,'0')}/{ano}</h2>
              <button onClick={() => setShowModal(false)} className="hover:text-avivar-tiffany transition-colors"><X size={20}/></button>
            </div>
            <form onSubmit={salvarMetas} className="p-6 space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Meta de Faturamento (R$)</label>
                <input 
                  type="number" step="0.01" required
                  value={formMeta.meta_faturamento} onChange={e => setFormMeta({...formMeta, meta_faturamento: e.target.value})}
                  className="w-full border p-2 rounded-lg outline-none focus:border-avivar-tiffany bg-indigo-50/30 text-lg font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Investimento ADS (R$)</label>
                  <input 
                    type="number" step="0.01" required
                    value={formMeta.investimento_ads} onChange={e => setFormMeta({...formMeta, investimento_ads: e.target.value})}
                    className="w-full border p-2 rounded-lg outline-none focus:border-avivar-tiffany"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Novas Máquinas (R$)</label>
                  <input 
                    type="number" step="0.01" required
                    value={formMeta.novas_maquinas} onChange={e => setFormMeta({...formMeta, novas_maquinas: e.target.value})}
                    className="w-full border p-2 rounded-lg outline-none focus:border-avivar-tiffany"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Custo Não Produtivo (R$)</label>
                <p className="text-[10px] text-gray-400 mb-1 leading-tight">Aluguel, luz, internet, contabilidade, salários fixos que não dependem da produção.</p>
                <input 
                  type="number" step="0.01" required
                  value={formMeta.custo_nao_produtivo} onChange={e => setFormMeta({...formMeta, custo_nao_produtivo: e.target.value})}
                  className="w-full border p-2 rounded-lg outline-none focus:border-avivar-tiffany"
                />
              </div>

              <div className="pt-4 mt-4 border-t flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-500 hover:text-gray-800 font-medium">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-avivar-tiffany text-white font-bold rounded-lg hover:bg-teal-600 transition-colors shadow flex items-center gap-2">
                  <Save size={18}/> Salvar Dados
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// Componente Auxiliar para KPIs
function CardKPI({ titulo, valor, icone: Icon, cor, bg, legenda, destaque, moeda = true, sufixo = '' }: any) {
  const valorFormatado = moeda
    ? `R$ ${Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    : `${Number(valor).toLocaleString('pt-BR')}${sufixo}`;

  return (
    <div className={`p-5 rounded-xl border bg-white shadow-sm flex items-start justify-between transition-transform hover:-translate-y-1 ${destaque ? 'border-avivar-tiffany ring-1 ring-avivar-tiffany/30' : 'border-gray-100'}`}>
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{titulo}</p>
        <h2 className={`text-2xl font-bold ${cor}`}>{valorFormatado}</h2>
        {legenda && <p className="text-xs text-gray-400 mt-1 font-medium">{legenda}</p>}
      </div>
      <div className={`p-3 rounded-xl ${bg}`}>
        <Icon className={cor} size={24} />
      </div>
    </div>
  );
}
