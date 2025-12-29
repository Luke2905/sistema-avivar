import { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Search, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import api from '../services/api';
import MySwal, { showToast } from '../utils/swal-config';
import ModalDespesa from '../components/ModalDespesa';

export default function Despesas() {
  const [despesas, setDespesas] = useState<any[]>([]);
  const [busca, setBusca] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [itemEditando, setItemEditando] = useState<any | null>(null);

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    try {
      // Reutiliza a rota que criamos (ou você pode criar uma GET /despesas especifica se quiser só a tabela DESPESA)
      // Aqui assumindo que o endpoint /financeiro/despesas traz tudo. 
      // Se quiser filtrar só o que é da tabela DESPESA (e não compra), filtre no front ou crie rota específica.
      const res = await api.get('/financeiro/despesas');
      
      // Filtra apenas o que é DESPESA manual (ignora compras de estoque para essa tela, se desejar)
      const apenasDespesas = res.data.filter((d: any) => d.tipo_origem === 'DESPESA');
      setDespesas(apenasDespesas);
    } catch (error) { console.error(error); }
  }

  // Lógica das Cores
  const getStatusInfo = (d: any) => {
    if (d.pago === 1) {
      return { cor: 'bg-green-100 border-green-200 text-green-700', texto: 'PAGO', icone: CheckCircle };
    }
    
    const hoje = new Date();
    hoje.setHours(0,0,0,0);
    const vencimento = new Date(d.data);
    vencimento.setHours(0,0,0,0); // Ajusta fuso para comparar apenas dia

    if (vencimento < hoje) {
      return { cor: 'bg-red-100 border-red-200 text-red-700', texto: 'VENCIDA', icone: XCircle };
    }
    
    return { cor: 'bg-yellow-100 border-yellow-200 text-yellow-700', texto: 'A VENCER', icone: AlertCircle };
  };

  async function handleTogglePago(id: number, statusAtual: number) {
    try {
      // Inverte o status
      await api.patch(`/financeiro/despesas/${id}/status`, { pago: statusAtual === 1 ? false : true });
      showToast('Status atualizado!');
      carregar();
    } catch (e) { showToast('Erro ao atualizar', 'error'); }
  }

  async function handleExcluir(id: number) {
    const result = await MySwal.fire({
        title: 'Excluir despesa?',
        text: 'Essa ação não pode ser desfeita.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Sim, excluir'
    });

    if (result.isConfirmed) {
        try {
            await api.delete(`/financeiro/despesas/${id}`);
            showToast('Excluído com sucesso');
            carregar();
        } catch (e) { showToast('Erro ao excluir', 'error'); }
    }
  }

  // Filtro de busca
  const listaFiltrada = despesas.filter(d => 
    d.descricao.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="p-6 h-full flex flex-col bg-gray-50 overflow-hidden">
      
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
           <h1 className="text-2xl font-bold text-gray-800">Contas a Pagar</h1>
           <p className="text-sm text-gray-500">Gestão de despesas operacionais</p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
           <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input 
                value={busca}
                onChange={e => setBusca(e.target.value)}
                placeholder="Buscar conta..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-avivar-tiffany outline-none"
              />
           </div>
           <button 
             onClick={() => { setItemEditando(null); setModalOpen(true); }}
             className="bg-avivar-tiffany text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-teal-600 transition shadow-sm"
           >
             <Plus size={18} /> Nova Conta
           </button>
        </div>
      </div>

      {/* LISTAGEM (TABELA) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex-1 overflow-hidden flex flex-col">
        <div className="overflow-y-auto custom-scrollbar flex-1">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100 sticky top-0 z-10">
              <tr>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase">Descrição</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase">Categoria</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase">Vencimento</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase text-right">Valor</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase text-center">Status</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {listaFiltrada.map((d) => {
                 const status = getStatusInfo(d);
                 const StatusIcon = status.icone;

                 return (
                  <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-bold text-gray-700">{d.descricao}</td>
                    <td className="p-4">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full uppercase font-bold">
                            {d.categoria}
                        </span>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                        {new Date(d.data).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="p-4 text-right font-bold text-gray-800">
                        R$ {Number(d.valor).toFixed(2)}
                    </td>
                    <td className="p-4 text-center">
                        <button 
                           onClick={() => handleTogglePago(d.id, d.pago)}
                           className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-[10px] font-bold cursor-pointer hover:opacity-80 transition-opacity shadow-sm ${status.cor}`}
                           title="Clique para alterar status"
                        >
                            <StatusIcon size={12} /> {status.texto}
                        </button>
                    </td>
                    <td className="p-4 flex justify-center gap-2">
                        <button 
                          onClick={() => { 
                              // Mapeia para o formato que o modal espera (usando nomes do banco)
                              setItemEditando({
                                  ID_DESPESA: d.id,
                                  DESCRICAO: d.descricao,
                                  VALOR: d.valor,
                                  CATEGORIA: d.categoria,
                                  DATA_VENCIMENTO: d.data,
                                  PAGO: d.pago
                              }); 
                              setModalOpen(true); 
                          }} 
                          className="p-1.5 text-blue-500 hover:bg-blue-50 rounded" 
                          title="Editar"
                        >
                            <Edit3 size={18} />
                        </button>
                        <button 
                          onClick={() => handleExcluir(d.id)} 
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded" 
                          title="Excluir"
                        >
                            <Trash2 size={18} />
                        </button>
                    </td>
                  </tr>
                 );
              })}
            </tbody>
          </table>
          
          {listaFiltrada.length === 0 && (
             <div className="text-center py-10 text-gray-400">Nenhuma despesa encontrada.</div>
          )}
        </div>
      </div>

      <ModalDespesa 
         isOpen={modalOpen} 
         onClose={() => setModalOpen(false)} 
         onSuccess={carregar} 
         despesaParaEditar={itemEditando}
      />
    </div>
  );
}