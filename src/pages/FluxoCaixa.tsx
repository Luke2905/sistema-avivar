import { useEffect, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  X,
  Save,
  Loader2,
  ReceiptText,
  BarChart3,
  Calendar
} from 'lucide-react';
import api from '../services/api';
import { showToast } from '../utils/swal-config';

interface Resumo {
  faturamento: number;
  faturamento_diario: number;
  faturamento_liquido: number;
  faturamento_liquido_diario: number;
  a_receber: number;
  despesas_pagas: number;
  despesas_pagas_diario: number;
  contas_a_pagar: number;
  lucro_estimado: number;
  lucro_bruto: number;
  lucro_bruto_diario: number;
  numero_pedidos: number;
  numero_pedidos_diario: number;
}

interface Extrato {
  id: number;
  descricao: string;
  valor: number;
  data: string;
  categoria: string;
  pago: number;
  tipo_origem: 'DESPESA' | 'COMPRA';
}

const fmt = (v: number) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const CATEGORIAS = ['Aluguel', 'Marketing', 'Salários', 'Fornecedor', 'Logística', 'Equipamentos', 'Impostos', 'Outros'];

export default function FluxoCaixa() {
  const [resumo, setResumo] = useState<Resumo | null>(null);
  const [extrato, setExtrato] = useState<Extrato[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const [form, setForm] = useState({
    descricao: '',
    valor: '',
    categoria: 'Outros',
    data_vencimento: new Date().toISOString().split('T')[0],
    pago: false
  });

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    try {
      setLoading(true);
      const [resResumo, resExtrato] = await Promise.all([
        api.get('/financeiro/resumo'),
        api.get('/financeiro/despesas')
      ]);
      setResumo(resResumo.data);
      setExtrato(resExtrato.data);
    } catch (error) {
      showToast('Erro ao carregar dados financeiros', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function salvarDespesa(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSalvando(true);
      await api.post('/financeiro/despesas', {
        descricao: form.descricao,
        valor: Number(form.valor),
        categoria: form.categoria,
        data_vencimento: form.data_vencimento,
        pago: form.pago
      });
      showToast('Despesa registrada!', 'success');
      setShowModal(false);
      setForm({ descricao: '', valor: '', categoria: 'Outros', data_vencimento: new Date().toISOString().split('T')[0], pago: false });
      carregar();
    } catch {
      showToast('Erro ao salvar despesa', 'error');
    } finally {
      setSalvando(false);
    }
  }

  async function togglePago(item: Extrato) {
    if (item.tipo_origem !== 'DESPESA') return;
    try {
      await api.patch(`/financeiro/despesas/${item.id}/status`, { pago: !item.pago });
      setExtrato(prev => prev.map(e => e.id === item.id && e.tipo_origem === 'DESPESA' ? { ...e, pago: e.pago ? 0 : 1 } : e));
    } catch {
      showToast('Erro ao atualizar status', 'error');
    }
  }

  async function excluirDespesa(id: number) {
    try {
      await api.delete(`/financeiro/despesas/${id}`);
      setExtrato(prev => prev.filter(e => !(e.id === id && e.tipo_origem === 'DESPESA')));
      carregar();
      showToast('Despesa excluída', 'success');
    } catch {
      showToast('Erro ao excluir', 'error');
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="animate-spin text-avivar-tiffany" size={40} />
      </div>
    );
  }

  const r = resumo!;

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center">
              <BarChart3 className="text-avivar-tiffany" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Fluxo de Caixa</h1>
              <p className="text-sm text-gray-500">Visão geral de entradas, saídas e saldo</p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-avivar-tiffany text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-teal-600 transition-colors font-bold text-sm shadow-md"
          >
            <Plus size={16} /> Nova Despesa
          </button>
        </header>

        {/* KPIs Principais */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard
            titulo="Faturamento Total"
            valor={fmt(r.faturamento)}
            sub={`Hoje: ${fmt(r.faturamento_diario)}`}
            icon={TrendingUp}
            cor="text-avivar-tiffany"
            bg="bg-teal-50"
            destaque
          />
          <KpiCard
            titulo="Faturamento Líquido"
            valor={fmt(r.faturamento_liquido)}
            sub={`Hoje: ${fmt(r.faturamento_liquido_diario)}`}
            icon={DollarSign}
            cor={r.faturamento_liquido >= 0 ? 'text-emerald-600' : 'text-red-500'}
            bg={r.faturamento_liquido >= 0 ? 'bg-emerald-50' : 'bg-red-50'}
          />
          <KpiCard
            titulo="Total Saídas"
            valor={fmt(r.despesas_pagas)}
            sub={`Hoje: ${fmt(r.despesas_pagas_diario)}`}
            icon={TrendingDown}
            cor="text-red-500"
            bg="bg-red-50"
          />
          <KpiCard
            titulo="Contas a Pagar"
            valor={fmt(r.contas_a_pagar)}
            sub="Em aberto"
            icon={AlertCircle}
            cor="text-amber-600"
            bg="bg-amber-50"
          />
        </div>

        {/* KPIs Secundários */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard
            titulo="Lucro Bruto"
            valor={fmt(r.lucro_bruto)}
            sub={`Hoje: ${fmt(r.lucro_bruto_diario)}`}
            icon={TrendingUp}
            cor={r.lucro_bruto >= 0 ? 'text-blue-600' : 'text-red-500'}
            bg="bg-blue-50"
          />
          <KpiCard
            titulo="A Receber"
            valor={fmt(r.a_receber)}
            sub="Pedidos em aberto"
            icon={Clock}
            cor="text-purple-600"
            bg="bg-purple-50"
          />
          <KpiCard
            titulo="Nº de Pedidos"
            valor={String(r.numero_pedidos)}
            sub={`Hoje: ${r.numero_pedidos_diario}`}
            icon={ShoppingBag}
            cor="text-gray-600"
            bg="bg-gray-50"
            moeda={false}
          />
          <KpiCard
            titulo="Ticket Médio"
            valor={fmt(r.numero_pedidos > 0 ? r.faturamento / r.numero_pedidos : 0)}
            sub="Por pedido"
            icon={ReceiptText}
            cor="text-indigo-600"
            bg="bg-indigo-50"
          />
        </div>

        {/* Extrato de Lançamentos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-700 flex items-center gap-2">
              <ReceiptText className="text-gray-400" size={18} /> Extrato de Lançamentos (Últimos 50)
            </h3>
            <span className="text-xs text-gray-400">{extrato.length} registros</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-bold border-b border-gray-200">
                <tr>
                  <th className="p-4">Data</th>
                  <th className="p-4">Descrição</th>
                  <th className="p-4">Categoria</th>
                  <th className="p-4 text-right">Valor</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {extrato.length === 0 && (
                  <tr><td colSpan={6} className="p-8 text-center text-gray-400">Nenhum lançamento encontrado.</td></tr>
                )}
                {extrato.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-gray-500 whitespace-nowrap flex items-center gap-1">
                      <Calendar size={13} className="text-gray-300" />
                      {new Date(item.data).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="p-4 text-gray-700 font-medium">{item.descricao}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        item.tipo_origem === 'COMPRA'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {item.categoria}
                      </span>
                    </td>
                    <td className="p-4 text-right font-bold text-red-500">
                      -{fmt(item.valor)}
                    </td>
                    <td className="p-4 text-center">
                      {item.tipo_origem === 'DESPESA' ? (
                        <button
                          onClick={() => togglePago(item)}
                          className={`px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 mx-auto transition-colors ${
                            item.pago
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                          }`}
                        >
                          {item.pago
                            ? <><CheckCircle size={12} /> Pago</>
                            : <><AlertCircle size={12} /> Pendente</>
                          }
                        </button>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">Compra</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {item.tipo_origem === 'DESPESA' && (
                        <button
                          onClick={() => excluirDespesa(item.id)}
                          className="text-gray-300 hover:text-red-500 transition-colors p-1"
                          title="Excluir"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Modal Nova Despesa */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-avivar-tiffany p-5 flex justify-between items-center text-white">
              <h2 className="font-bold text-lg flex items-center gap-2"><Plus size={20}/> Nova Despesa</h2>
              <button onClick={() => setShowModal(false)} className="hover:text-teal-100"><X size={20}/></button>
            </div>
            <form onSubmit={salvarDespesa} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descrição *</label>
                <input
                  type="text" required
                  value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })}
                  className="w-full border p-2.5 rounded-lg outline-none focus:border-avivar-tiffany"
                  placeholder="Ex: Aluguel do galpão"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Valor (R$) *</label>
                  <input
                    type="number" step="0.01" required min="0"
                    value={form.valor} onChange={e => setForm({ ...form, valor: e.target.value })}
                    className="w-full border p-2.5 rounded-lg outline-none focus:border-avivar-tiffany"
                    placeholder="0,00"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Vencimento *</label>
                  <input
                    type="date" required
                    value={form.data_vencimento} onChange={e => setForm({ ...form, data_vencimento: e.target.value })}
                    className="w-full border p-2.5 rounded-lg outline-none focus:border-avivar-tiffany"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Categoria</label>
                <select
                  value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })}
                  className="w-full border p-2.5 rounded-lg outline-none focus:border-avivar-tiffany bg-white"
                >
                  {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <label className="flex items-center gap-3 cursor-pointer p-3 bg-gray-50 rounded-lg border">
                <input
                  type="checkbox"
                  checked={form.pago}
                  onChange={e => setForm({ ...form, pago: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium text-gray-700">Marcar como já pago</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 border rounded-lg text-gray-500 hover:bg-gray-50 font-medium">Cancelar</button>
                <button type="submit" disabled={salvando} className="flex-1 py-2 bg-avivar-tiffany text-white rounded-lg font-bold hover:bg-teal-600 transition-colors flex items-center justify-center gap-2">
                  {salvando ? <Loader2 size={16} className="animate-spin"/> : <Save size={16}/>}
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function KpiCard({ titulo, valor, sub, icon: Icon, cor, bg, destaque, moeda = true }: any) {
  return (
    <div className={`bg-white p-5 rounded-xl border shadow-sm flex items-start justify-between transition-transform hover:-translate-y-0.5 ${destaque ? 'border-avivar-tiffany ring-1 ring-avivar-tiffany/20' : 'border-gray-100'}`}>
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{titulo}</p>
        <h2 className={`text-xl font-bold ${cor}`}>{valor}</h2>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
      <div className={`p-2.5 rounded-xl ${bg}`}>
        <Icon className={cor} size={20} />
      </div>
    </div>
  );
}
