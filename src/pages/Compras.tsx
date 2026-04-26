import { useState, useEffect } from 'react';
import { ShoppingBag, Plus, Calendar, Filter, DollarSign, Package, BarChart3 } from 'lucide-react';
import api from '../services/api';
import ModalNovaCompra from '../components/ModalNovaCompra';

interface Compra {
  ID_COMPRA: number;
  DATA_COMPRA: string;
  NOME_MATERIA: string;
  SKU_MATERIA: string;
  QTD_COMPRADA: string | number;
  UNIDADE_MEDIDA: string;
  CUSTO_TOTAL: string | number;
  OBSERVACOES: string;
}

interface Materia {
  ID_MATERIA: number;
  NOME_MATERIA: string;
  UNIDADE_MEDIDA: string;
}

interface ResumoCompras {
  total_lancamentos: number;
  total_custo: number;
  qtd_total_comprada: number;
  ticket_medio: number;
}

interface TopInsumo {
  NOME_MATERIA: string;
  SKU_MATERIA: string;
  total_custo: string | number;
  qtd_comprada: string | number;
  total_lancamentos: number;
}

const RESUMO_INICIAL: ResumoCompras = {
  total_lancamentos: 0,
  total_custo: 0,
  qtd_total_comprada: 0,
  ticket_medio: 0
};

export default function Compras() {
  const [compras, setCompras] = useState<Compra[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [resumo, setResumo] = useState<ResumoCompras>(RESUMO_INICIAL);
  const [topInsumos, setTopInsumos] = useState<TopInsumo[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [filtroDia, setFiltroDia] = useState('');
  const [filtroMes, setFiltroMes] = useState('');
  const [filtroAno, setFiltroAno] = useState('');

  useEffect(() => {
    carregar({});
    api.get('/estoque').then((res) => setMaterias(res.data)).catch(() => setMaterias([]));
  }, []);

  function montarParametrosFiltro() {
    const params: Record<string, string> = {};
    if (filtroDia) params.dia = filtroDia;
    if (filtroMes) params.mes = filtroMes;
    if (filtroAno) params.ano = filtroAno;
    return params;
  }

  async function carregar(paramsOverride?: Record<string, string>) {
    setLoading(true);
    try {
      const params = paramsOverride ?? montarParametrosFiltro();

      const [resCompras, resResumo] = await Promise.all([
        api.get('/compras', { params }),
        api.get('/compras/resumo', { params })
      ]);

      setCompras(resCompras.data || []);
      setResumo(resResumo.data?.resumo || RESUMO_INICIAL);
      setTopInsumos(resResumo.data?.top_insumos || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const aplicarFiltros = () => {
    carregar();
  };

  const limparFiltros = () => {
    setFiltroDia('');
    setFiltroMes('');
    setFiltroAno('');
    carregar({});
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <ShoppingBag className="text-avivar-tiffany" /> Compras & Entradas
          </h1>
          <p className="text-sm text-gray-500">Histórico e custos de matéria-prima</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-avivar-tiffany text-white rounded hover:bg-teal-600 flex items-center gap-2 font-bold shadow-md"
        >
          <Plus size={18} /> Nova Compra
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3 text-sm font-bold text-gray-600 uppercase tracking-wider">
          <Filter size={16} className="text-avivar-tiffany" /> Filtros
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            type="date"
            value={filtroDia}
            onChange={(e) => setFiltroDia(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-avivar-tiffany"
          />

          <select
            value={filtroMes}
            onChange={(e) => setFiltroMes(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-avivar-tiffany bg-white"
          >
            <option value="">Mês</option>
            {['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'].map((mes, i) => (
              <option key={i + 1} value={String(i + 1)}>
                {mes}
              </option>
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

          <div className="flex justify-end gap-2">
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
              Aplicar
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <CardResumo
          titulo="Custo Total"
          valor={`R$ ${Number(resumo.total_custo || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icone={DollarSign}
          cor="text-red-600"
          bg="bg-red-50"
        />
        <CardResumo
          titulo="Lançamentos"
          valor={Number(resumo.total_lancamentos || 0).toLocaleString('pt-BR')}
          icone={BarChart3}
          cor="text-blue-600"
          bg="bg-blue-50"
        />
        <CardResumo
          titulo="Qtd Comprada"
          valor={Number(resumo.qtd_total_comprada || 0).toLocaleString('pt-BR')}
          icone={Package}
          cor="text-emerald-600"
          bg="bg-emerald-50"
        />
        <CardResumo
          titulo="Ticket Médio"
          valor={`R$ ${Number(resumo.ticket_medio || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icone={ShoppingBag}
          cor="text-avivar-tiffany"
          bg="bg-teal-50"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase">Data</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase">Insumo</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase">Fornecedor</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase text-center">Qtd Entrada</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase text-right">Custo Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {compras.map((c) => (
                <tr key={c.ID_COMPRA} className="hover:bg-gray-50">
                  <td className="py-4 px-6 text-sm text-gray-600 flex items-center gap-2">
                    <Calendar size={14} className="text-gray-400" />
                    {new Date(c.DATA_COMPRA).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="py-4 px-6">
                    <p className="font-bold text-gray-800 text-sm">{c.NOME_MATERIA}</p>
                    <p className="text-xs text-gray-400 font-mono">{c.SKU_MATERIA}</p>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600 uppercase">{c.OBSERVACOES || '-'}</td>
                  <td className="py-4 px-6 text-center">
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold border border-green-200">
                      + {Number(c.QTD_COMPRADA)} {c.UNIDADE_MEDIDA}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right font-bold text-gray-800">
                    {Number(c.CUSTO_TOTAL).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                </tr>
              ))}
              {!loading && compras.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">
                    Nenhuma compra encontrada para os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {loading && <div className="p-4 text-center text-sm text-gray-400 border-t border-gray-100">Carregando compras...</div>}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="font-bold text-gray-700 mb-4">Top Insumos por Custo</h3>
          <div className="space-y-3">
            {topInsumos.map((insumo, index) => (
              <div key={`${insumo.SKU_MATERIA}-${index}`} className="p-3 rounded-lg border border-gray-100 bg-gray-50">
                <div className="flex justify-between gap-3">
                  <div>
                    <p className="font-bold text-sm text-gray-800">{insumo.NOME_MATERIA}</p>
                    <p className="text-[11px] font-mono text-gray-400">{insumo.SKU_MATERIA}</p>
                  </div>
                  <span className="text-xs font-bold text-red-600">
                    {Number(insumo.total_custo).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  {Number(insumo.qtd_comprada).toLocaleString('pt-BR')} un • {insumo.total_lancamentos} lançamento(s)
                </p>
              </div>
            ))}
            {!loading && topInsumos.length === 0 && (
              <p className="text-sm text-gray-400">Sem dados no período selecionado.</p>
            )}
          </div>
        </div>
      </div>

      <ModalNovaCompra
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => carregar()}
        materias={materias}
      />
    </div>
  );
}

function CardResumo({
  titulo,
  valor,
  icone: Icon,
  cor,
  bg
}: {
  titulo: string;
  valor: string;
  icone: any;
  cor: string;
  bg: string;
}) {
  return (
    <div className="p-5 rounded-xl border border-gray-100 bg-white shadow-sm flex items-start justify-between">
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{titulo}</p>
        <h2 className={`text-2xl font-bold ${cor}`}>{valor}</h2>
      </div>
      <div className={`p-3 rounded-xl ${bg}`}>
        <Icon className={cor} size={24} />
      </div>
    </div>
  );
}
