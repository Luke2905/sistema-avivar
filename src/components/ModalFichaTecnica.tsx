// src/components/ModalFichaTecnica.tsx
import { useState, useEffect } from 'react';
import { X, Plus, Trash2, FlaskConical, Calculator, AlertTriangle, CheckCircle } from 'lucide-react';
import api from '../services/api';
import { showToast } from '../utils/swal-config';

interface Produto {
  ID_PRODUTO: number;
  NOME_PRODUTO: string;
  SKU_PRODUTO: string;
  PRECO_VENDA: string | number; // Precisamos do preço atual para comparar
  IMPOSTO_PERCENTUAL?: number;
  MAO_DE_OBRA_VALOR?: number;
}

interface Materia {
  ID_MATERIA: number;
  NOME_MATERIA: string;
  UNIDADE_MEDIDA: string;
  CUSTO_UNITARIO: string | number;
}

interface ItemFicha {
  ID_FICHA: number;
  ID_MATERIA: number;
  NOME_MATERIA: string;
  UNIDADE_MEDIDA: string;
  QTD_CONSUMO: string | number;
  CUSTO_UNITARIO: string | number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  produto: Produto | null;
}

export default function ModalFichaTecnica({ isOpen, onClose, produto }: Props) {
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [ficha, setFicha] = useState<ItemFicha[]>([]);
  
  const [materiaSelecionada, setMateriaSelecionada] = useState('');
  const [qtd, setQtd] = useState('');
  
  // Estados da Calculadora
  const [margemDesejada, setMargemDesejada] = useState(100); // Começa com 100% de markup

  useEffect(() => {
    if (isOpen && produto) {
      carregarDados();
    }
  }, [isOpen, produto]);

  async function carregarDados() {
    try {
      const resMat = await api.get('/estoque');
      setMaterias(resMat.data);

      if (produto) {
        const resFicha = await api.get(`/ficha/${produto.ID_PRODUTO}`);
        setFicha(resFicha.data);
      }
    } catch (error) { console.error(error); }
  }

  async function adicionar() {
    if (!materiaSelecionada || !qtd) return showToast('Preencha os campos', 'error');
    
    try {
      await api.post('/ficha', {
        id_produto: produto?.ID_PRODUTO,
        id_materia: materiaSelecionada,
        qtd_consumo: qtd
      });
      showToast('Item adicionado!');
      setQtd('');
      carregarDados();
    } catch (e: any) { 
        showToast(e.response?.data?.mensagem || 'Erro ao salvar', 'error'); 
    }
  }

  async function remover(id: number) {
    try {
      await api.delete(`/ficha/${id}`);
      carregarDados();
    } catch (e) { showToast('Erro ao remover', 'error'); }
  }

  if (!isOpen || !produto) return null;

  // --- CÁLCULOS FINANCEIROS ---
  const custoMaterial = ficha.reduce((acc, item) => acc + (Number(item.QTD_CONSUMO) * Number(item.CUSTO_UNITARIO)), 0);
  
  const impostoPct = Number(produto.IMPOSTO_PERCENTUAL || 0);
  const maoDeObra = Number(produto.MAO_DE_OBRA_VALOR || 0);
  const custoTotal = custoMaterial + maoDeObra;

  // Calculando Preço Sugerido por Markup Divisor: PV = Custo / (1 - Taxas%)
  // Taxas = Impostos + Margem de Lucro Desejada
  const taxaTotal = (impostoPct + margemDesejada) / 100;
  
  let precoSugerido = 0;
  if (taxaTotal >= 1) {
    precoSugerido = custoTotal * (1 + taxaTotal); // Fallback se a margem for >= 100%
  } else {
    precoSugerido = custoTotal / (1 - taxaTotal);
  }
  
  const precoAtual = Number(produto.PRECO_VENDA || 0);
  const impostosPagos = precoAtual * (impostoPct / 100);
  const lucroReal = precoAtual - custoTotal - impostosPagos;
  
  // Margem Real (%)
  const margemReal = precoAtual > 0 ? (lucroReal / precoAtual) * 100 : 0;
  
  const isLucroRuim = precoAtual < precoSugerido;

  // Helpers de visualização
  const matSelecionadaObj = materias.find(m => m.ID_MATERIA === Number(materiaSelecionada));
  const unidadeLabel = matSelecionadaObj ? `(${matSelecionadaObj.UNIDADE_MEDIDA})` : '';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row h-[600px] md:h-auto">
        
        {/* LADO ESQUERDO: Composição (Receita) */}
        <div className="flex-1 flex flex-col border-r border-gray-100">
            <div className="bg-indigo-600 p-5 flex justify-between items-center text-white shrink-0">
                <div>
                    <h2 className="text-lg font-bold flex items-center gap-2">
                    <FlaskConical size={20} /> Ficha Técnica
                    </h2>
                    <p className="text-indigo-200 text-xs mt-1">Prod: <strong>{produto.NOME_PRODUTO}</strong></p>
                </div>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                {/* Form Adicionar */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">Adicionar Insumo</h3>
                    <div className="flex gap-2 items-end">
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-gray-400 mb-1">Matéria-Prima</label>
                            <select 
                                value={materiaSelecionada}
                                onChange={e => setMateriaSelecionada(e.target.value)}
                                className="w-full border rounded p-2 text-sm bg-white outline-none focus:border-indigo-500"
                            >
                                <option value="">Selecione...</option>
                                {materias.map(m => (
                                    <option key={m.ID_MATERIA} value={m.ID_MATERIA}>
                                        {m.NOME_MATERIA} ({m.UNIDADE_MEDIDA}) - R$ {Number(m.CUSTO_UNITARIO).toFixed(2)}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="w-24">
                            <label className="block text-xs font-bold text-gray-400 mb-1">Qtd {unidadeLabel}</label>
                            <input 
                                type="number" step="0.001" value={qtd} onChange={e => setQtd(e.target.value)} 
                                className="w-full border rounded p-2 text-sm outline-none focus:border-indigo-500" 
                                placeholder="0.000"
                            />
                        </div>

                        <button onClick={adicionar} className="bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700 transition-colors shadow-sm">
                            <Plus size={20} />
                        </button>
                    </div>
                </div>

                {/* Lista */}
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-100 text-gray-600 font-bold text-xs uppercase">
                        <tr>
                            <th className="p-3">Insumo</th>
                            <th className="p-3 text-center">Qtd</th>
                            <th className="p-3 text-right">Custo</th>
                            <th className="p-3 w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {ficha.map(item => (
                            <tr key={item.ID_FICHA} className="hover:bg-gray-50">
                                <td className="p-3 text-gray-700">{item.NOME_MATERIA}</td>
                                <td className="p-3 text-center text-gray-600">{Number(item.QTD_CONSUMO)} <small>{item.UNIDADE_MEDIDA}</small></td>
                                <td className="p-3 text-right font-mono text-gray-600">R$ {(Number(item.QTD_CONSUMO) * Number(item.CUSTO_UNITARIO)).toFixed(2)}</td>
                                <td className="p-3 text-center">
                                    <button onClick={() => remover(item.ID_FICHA)} className="text-red-300 hover:text-red-500"><Trash2 size={16}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-col gap-2 text-indigo-900">
                <div className="flex justify-between items-center w-full">
                    <span className="text-sm uppercase flex items-center gap-2"><Calculator size={16}/> Custo Material:</span>
                    <span className="text-sm font-bold">R$ {custoMaterial.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center w-full">
                    <span className="text-sm uppercase flex items-center gap-2">Mão de Obra Fixa:</span>
                    <span className="text-sm font-bold">R$ {maoDeObra.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center w-full pt-2 border-t border-gray-200">
                    <span className="text-sm font-bold uppercase flex items-center gap-2">Custo Total de Produção:</span>
                    <span className="text-lg font-bold">R$ {custoTotal.toFixed(2)}</span>
                </div>
            </div>
        </div>

        {/* LADO DIREITO: Calculadora de Preço */}
        <div className="w-full md:w-80 bg-slate-50 p-6 flex flex-col justify-between relative overflow-hidden">
             <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20}/></button>
             
             <div>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6 flex items-center gap-2">
                    <Calculator size={16}/> Simulador de Preço
                </h3>

                <div className="space-y-6">
                    {/* Input Margem */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Margem Desejada (%)</label>
                        <div className="flex items-center gap-2">
                            <input 
                                type="number" 
                                value={margemDesejada} 
                                onChange={e => setMargemDesejada(Number(e.target.value))}
                                className="w-full border-2 border-slate-200 rounded p-2 font-bold text-center text-slate-700 focus:border-indigo-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between text-sm text-gray-500">
                            <span>Impostos Configurados:</span>
                            <span className="font-bold">{impostoPct}%</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500">
                            <span>Margem Desejada:</span>
                            <span className="font-bold">{margemDesejada}%</span>
                        </div>
                    </div>

                    <div className="border-t border-slate-200 my-4"></div>

                    {/* Resultado Sugerido */}
                    <div>
                        <p className="text-xs font-bold text-gray-500 mb-1">Preço Sugerido (Min)</p>
                        <p className="text-2xl font-bold text-slate-700">
                            R$ {precoSugerido.toFixed(2)}
                        </p>
                    </div>
                </div>
             </div>

             {/* Análise Final */}
             <div className={`mt-6 p-4 rounded-xl border-l-4 shadow-sm ${isLucroRuim ? 'bg-red-100 border-red-500 text-red-800' : 'bg-green-100 border-green-500 text-green-800'}`}>
                <div className="flex items-start gap-3">
                    {isLucroRuim ? <AlertTriangle className="shrink-0"/> : <CheckCircle className="shrink-0"/>}
                    <div>
                        <p className="text-xs font-bold uppercase opacity-70 mb-1">Análise Atual</p>
                        <p className="font-bold text-lg">R$ {precoAtual.toFixed(2)}</p>
                        <p className="text-xs mt-1 font-medium leading-tight">
                            {isLucroRuim 
                                ? `Atenção! Seu preço está abaixo da margem de ${margemDesejada}%.` 
                                : `Ótimo! Sua margem real é de ${margemReal.toFixed(0)}%.`
                            }
                        </p>
                    </div>
                </div>
             </div>

        </div>
      </div>
    </div>
  );
}