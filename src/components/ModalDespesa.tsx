import { useState, useEffect } from 'react';
import { X, Save, DollarSign } from 'lucide-react';
import api from '../services/api';
import { showToast } from '../utils/swal-config';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  despesaParaEditar: any | null; // Se vier null, é criação. Se vier objeto, é edição.
}

export default function ModalDespesa({ isOpen, onClose, onSuccess, despesaParaEditar }: Props) {
  const [form, setForm] = useState({
    descricao: '',
    valor: '',
    categoria: 'Fixa',
    data_vencimento: '',
    pago: false
  });

  useEffect(() => {
    if (isOpen) {
      if (despesaParaEditar) {
        // Preenche para editar
        setForm({
          descricao: despesaParaEditar.DESCRICAO,
          valor: despesaParaEditar.VALOR,
          categoria: despesaParaEditar.CATEGORIA || 'Fixa',
          data_vencimento: despesaParaEditar.DATA_VENCIMENTO.split('T')[0], // Formata data pro input
          pago: despesaParaEditar.PAGO === 1
        });
      } else {
        // Limpa para novo
        setForm({ descricao: '', valor: '', categoria: 'Fixa', data_vencimento: '', pago: false });
      }
    }
  }, [isOpen, despesaParaEditar]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (despesaParaEditar) {
        await api.put(`/financeiro/despesas/${despesaParaEditar.ID_DESPESA}`, form);
        showToast('Despesa atualizada!');
      } else {
        await api.post('/financeiro/despesas', form);
        showToast('Despesa criada!');
      }
      onSuccess();
      onClose();
    } catch (error) {
      showToast('Erro ao salvar.', 'error');
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-bold text-gray-700 flex items-center gap-2">
            <DollarSign className="text-avivar-tiffany" />
            {despesaParaEditar ? 'Editar Despesa' : 'Nova Despesa'}
          </h2>
          <button onClick={onClose}><X size={20} className="text-gray-400 hover:text-red-500" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Descrição</label>
            <input required value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})} className="w-full border rounded p-2 focus:ring-2 focus:ring-avivar-tiffany outline-none" placeholder="Ex: Internet Fibra" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Valor (R$)</label>
              <input required type="number" step="0.01" value={form.valor} onChange={e => setForm({...form, valor: e.target.value})} className="w-full border rounded p-2 focus:ring-2 focus:ring-avivar-tiffany outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Vencimento</label>
              <input required type="date" value={form.data_vencimento} onChange={e => setForm({...form, data_vencimento: e.target.value})} className="w-full border rounded p-2 focus:ring-2 focus:ring-avivar-tiffany outline-none" />
            </div>
          </div>

          <div>
             <label className="block text-xs font-bold text-gray-500 mb-1">Categoria</label>
             <select value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})} className="w-full border rounded p-2 outline-none">
                <option value="Fixa">Despesa Fixa (Água, Luz, etc)</option>
                <option value="Variável">Variável (Manutenção, Extra)</option>
                <option value="Imposto">Impostos / Taxas</option>
                <option value="Pessoal">Pessoal / Pró-labore</option>
             </select>
          </div>

          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-100">
            <input type="checkbox" id="modalPago" checked={form.pago} onChange={e => setForm({...form, pago: e.target.checked})} className="w-5 h-5 text-avivar-tiffany focus:ring-0" />
            <label htmlFor="modalPago" className="text-sm font-medium text-gray-700 cursor-pointer">Já está paga?</label>
          </div>

          <button type="submit" className="w-full bg-avivar-tiffany text-white py-2 rounded-lg font-bold hover:bg-teal-600 flex justify-center items-center gap-2">
            <Save size={18} /> Salvar
          </button>
        </form>
      </div>
    </div>
  );
}