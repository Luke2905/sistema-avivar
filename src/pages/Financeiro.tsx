// src/pages/Financeiro.tsx
import { useEffect, useState } from 'react';
import { 
    DollarSign, 
    TrendingUp, 
    TrendingDown, 
    Calendar, 
    Plus, 
    Box, // Ícone para Estoque
    CheckCircle, 
    XCircle,
    Loader2
} from 'lucide-react';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer, 
    Cell 
} from 'recharts';
import api from '../services/api';
import { showToast } from '../utils/swal-config';

// Tipagem básica para ajudar no desenvolvimento
interface ResumoFinanceiro {
    faturamento: number;
    a_receber: number;
    despesas_pagas: number;
    contas_a_pagar: number;
    lucro_estimado: number;
}

interface ItemExtrato {
    id: number;
    descricao: string;
    valor: string | number;
    data: string;
    categoria: string;
    pago: number; // 1 ou 0
    tipo_origem: 'DESPESA' | 'COMPRA'; // Vindo do UNION do backend
}

export default function Financeiro() {
    // Estado dos Indicadores (KPIs)
    const [resumo, setResumo] = useState<ResumoFinanceiro>({
        faturamento: 0,
        a_receber: 0,
        despesas_pagas: 0,
        contas_a_pagar: 0,
        lucro_estimado: 0
    });

    // Estado da Lista de Extrato
    const [despesas, setDespesas] = useState<ItemExtrato[]>([]);
    const [loading, setLoading] = useState(true);

    // Estado do Formulário de Lançamento Rápido
    const [showForm, setShowForm] = useState(false);
    const [novaDespesa, setNovaDespesa] = useState({ 
        descricao: '', 
        valor: '', 
        categoria: 'Fixa', 
        data: '', 
        pago: false 
    });

    // Carrega dados ao abrir a tela
    useEffect(() => { 
        carregarDados(); 
    }, []);

    async function carregarDados() {
        try {
            setLoading(true);
            // Faz as duas requisições ao mesmo tempo para ser mais rápido
            const [resResumo, resExtrato] = await Promise.all([
                api.get('/financeiro/resumo'),
                api.get('/financeiro/despesas')
            ]);
            
            setResumo(resResumo.data);
            setDespesas(resExtrato.data);

        } catch (error) {
            console.error(error);
            showToast('Erro ao carregar dados financeiros.', 'error');
        } finally {
            setLoading(false);
        }
    }

    // Função para salvar uma despesa manual (Ex: Conta de Luz)
    async function salvarDespesa(e: React.FormEvent) {
        e.preventDefault();
        try {
            await api.post('/financeiro/despesas', {
                descricao: novaDespesa.descricao,
                valor: Number(novaDespesa.valor),
                categoria: novaDespesa.categoria,
                data_vencimento: novaDespesa.data,
                pago: novaDespesa.pago
            });

            showToast('Despesa lançada com sucesso!', 'success');
            
            // Limpa form e recarrega
            setShowForm(false);
            setNovaDespesa({ descricao: '', valor: '', categoria: 'Fixa', data: '', pago: false });
            carregarDados();

        } catch (error) {
            showToast('Erro ao salvar despesa.', 'error');
        }
    }

    // Dados formatados para o Gráfico
    const dadosGrafico = [
        { name: 'Entradas', valor: resumo.faturamento, color: '#0ABAB5' }, // Tiffany
        { name: 'Saídas', valor: resumo.despesas_pagas, color: '#F28B82' }, // Vermelho
        { name: 'Lucro Real', valor: resumo.lucro_estimado, color: '#34D399' } // Verde
    ];

    if (loading && resumo.faturamento === 0) {
        return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-avivar-tiffany" size={40} /></div>;
    }

    return (
        <div className="flex flex-col h-full bg-gray-50 overflow-hidden">
            
            {/* ÁREA DE SCROLL PRINCIPAL */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                
                {/* --- CABEÇALHO --- */}
                <header className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <DollarSign className="text-avivar-tiffany" /> Gestão Financeira
                        </h1>
                        <p className="text-sm text-gray-500">Fluxo de caixa unificado (Operacional + Estoque)</p>
                    </div>
                    <button 
                        onClick={() => setShowForm(!showForm)}
                        className="bg-avivar-tiffany text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-teal-600 transition-colors font-bold shadow-sm"
                    >
                        <Plus size={18} /> Lançar Despesa
                    </button>
                </header>

                {/* --- FORMULÁRIO DE LANÇAMENTO (TOGGLE) --- */}
                {showForm && (
                    <form onSubmit={salvarDespesa} className="bg-white p-5 rounded-xl shadow-md border border-gray-200 animate-in slide-in-from-top-4 duration-300">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-gray-700">Nova Despesa Operacional</h3>
                            <button type="button" onClick={() => setShowForm(false)} className="text-xs text-gray-400 hover:text-red-500 underline">Cancelar</button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                            <div className="md:col-span-2">
                                <label className="text-xs font-bold text-gray-500 mb-1 block">Descrição</label>
                                <input 
                                    required 
                                    value={novaDespesa.descricao} 
                                    onChange={e => setNovaDespesa({...novaDespesa, descricao: e.target.value})} 
                                    className="w-full border border-gray-300 p-2 rounded-lg outline-none focus:ring-2 focus:ring-avivar-tiffany" 
                                    placeholder="Ex: Aluguel do Galpão" 
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-1 block">Valor (R$)</label>
                                <input 
                                    required type="number" step="0.01" 
                                    value={novaDespesa.valor} 
                                    onChange={e => setNovaDespesa({...novaDespesa, valor: e.target.value})} 
                                    className="w-full border border-gray-300 p-2 rounded-lg outline-none focus:ring-2 focus:ring-avivar-tiffany" 
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-1 block">Vencimento</label>
                                <input 
                                    required type="date" 
                                    value={novaDespesa.data} 
                                    onChange={e => setNovaDespesa({...novaDespesa, data: e.target.value})} 
                                    className="w-full border border-gray-300 p-2 rounded-lg outline-none focus:ring-2 focus:ring-avivar-tiffany" 
                                />
                            </div>
                            <div className="flex items-center gap-2 pb-3">
                                <input 
                                    type="checkbox" id="pago" 
                                    checked={novaDespesa.pago} 
                                    onChange={e => setNovaDespesa({...novaDespesa, pago: e.target.checked})} 
                                    className="w-5 h-5 text-avivar-tiffany rounded focus:ring-avivar-tiffany" 
                                />
                                <label htmlFor="pago" className="text-sm font-medium text-gray-700 cursor-pointer">Já está pago?</label>
                            </div>
                        </div>
                        <div className="mt-4 text-right border-t border-gray-100 pt-3">
                            <button type="submit" className="bg-gray-800 text-white px-8 py-2 rounded-lg hover:bg-black transition font-medium shadow-sm">
                                Salvar Despesa
                            </button>
                        </div>
                    </form>
                )}

                {/* --- CARDS DE KPI (INDICADORES) --- */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <CardKPI 
                        titulo="Faturamento Total" 
                        valor={resumo.faturamento} 
                        icone={TrendingUp} 
                        cor="text-green-600" 
                        bg="bg-green-50" 
                    />
                    <CardKPI 
                        titulo="A Receber (Aberto)" 
                        valor={resumo.a_receber} 
                        icone={Calendar} 
                        cor="text-blue-600" 
                        bg="bg-blue-50" 
                        legenda="Pedidos não finalizados" 
                    />
                    <CardKPI 
                        titulo="Total de Saídas" 
                        valor={resumo.despesas_pagas} 
                        icone={TrendingDown} 
                        cor="text-red-600" 
                        bg="bg-red-50" 
                        legenda="Despesas + Compras Estoque"
                    />
                    <CardKPI 
                        titulo="Lucro Real" 
                        valor={resumo.lucro_estimado} 
                        icone={DollarSign} 
                        cor="text-avivar-tiffany" 
                        bg="bg-teal-50" 
                        destaque 
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* --- GRÁFICO DE BARRAS --- */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-[400px]">
                        <h3 className="font-bold text-gray-700 mb-6">Balanço do Período</h3>
                        <div className="flex-1 w-full h-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={dadosGrafico} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                                    <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `R$${val/1000}k`} tick={{fill: '#6b7280', fontSize: 12}} />
                                    <Tooltip 
                                        cursor={{fill: '#f8fafc'}}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Valor']}
                                    />
                                    <Bar dataKey="valor" radius={[6, 6, 0, 0]} barSize={60}>
                                        {dadosGrafico.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* --- EXTRATO UNIFICADO (DESPESAS + COMPRAS) --- */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-[400px]">
                        <h3 className="font-bold text-gray-700 mb-4 flex justify-between items-center">
                            Últimas Saídas
                            <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-full uppercase">Recentes</span>
                        </h3>
                        
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                            {despesas.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50">
                                    <CheckCircle size={40} className="mb-2" />
                                    <p className="text-sm">Nenhuma saída registrada.</p>
                                </div>
                            )}
                            
                            {despesas.map((d, index) => (
                                <div 
                                    key={`${d.tipo_origem}-${d.id}-${index}`} 
                                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-white hover:shadow-sm transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        {/* LÓGICA DE ÍCONE: Caixa para Compra, Seta para Despesa */}
                                        <div className={`p-2.5 rounded-full shrink-0 ${
                                            d.tipo_origem === 'COMPRA' 
                                            ? 'bg-blue-100 text-blue-600' 
                                            : 'bg-red-100 text-red-600'
                                        }`}>
                                            {d.tipo_origem === 'COMPRA' ? <Box size={18} /> : <TrendingDown size={18} />}
                                        </div>

                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-gray-700 truncate pr-2 group-hover:text-avivar-tiffany transition-colors">
                                                {d.descricao}
                                            </p>
                                            <div className="flex gap-2 text-xs text-gray-500 items-center mt-0.5">
                                                <span>{new Date(d.data).toLocaleDateString('pt-BR')}</span>
                                                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                <span className="uppercase font-semibold tracking-wider text-[10px]">
                                                    {d.categoria}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-right shrink-0">
                                        <p className="text-sm font-bold text-gray-800 mb-1">
                                            - R$ {Number(d.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </p>
                                        
                                        {/* BADGE DE STATUS */}
                                        {d.tipo_origem === 'DESPESA' ? (
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                                d.pago 
                                                ? 'bg-green-50 text-green-700 border-green-100' 
                                                : 'bg-amber-50 text-amber-700 border-amber-100'
                                            }`}>
                                                {d.pago ? 'PAGO' : 'PENDENTE'}
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                                                ESTOQUE
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

// Subcomponente para os Cards de KPI
function CardKPI({ titulo, valor, icone: Icon, cor, bg, legenda, destaque }: any) {
    return (
        <div className={`
            p-5 rounded-xl border bg-white shadow-sm flex items-start justify-between transition-transform hover:-translate-y-1
            ${destaque ? 'border-avivar-tiffany ring-1 ring-avivar-tiffany/30' : 'border-gray-100'}
        `}>
            <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{titulo}</p>
                <h2 className={`text-2xl font-bold ${cor}`}>
                    R$ {Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </h2>
                {legenda && <p className="text-xs text-gray-400 mt-1">{legenda}</p>}
            </div>
            <div className={`p-3 rounded-xl ${bg}`}>
                <Icon className={cor} size={24} />
            </div>
        </div>
    );
}