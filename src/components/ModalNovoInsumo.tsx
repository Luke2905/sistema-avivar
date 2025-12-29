// src/components/ModalNovoInsumo.tsx
import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import api from '../services/api';
import { showToast } from '../utils/swal-config';

// Interface igual à do Estoque.tsx
interface Materia {
  ID_MATERIA: number;
  SKU_MATERIA: string;
  NOME_MATERIA: string;
  UNIDADE_MEDIDA: string;
  CUSTO_UNITARIO: string | number;
  SALDO_ESTOQUE: string | number;
  ESTOQUE_MINIMO: string | number;
  FORNECEDOR: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  insumoParaEditar: Materia | null; // Nova prop!
}

export default function ModalNovoInsumo({ isOpen, onClose, onSuccess, insumoParaEditar }: Props) {
  const [loading, setLoading] = useState(false);
  
  // Estado do formulário
  const [form, setForm] = useState({
    sku: '',
    nome: '',
    unidade: 'UN',
    custo: '',
    estoque_min: '',
    fornecedor: ''
  });

  // EFEITO MÁGICO: Quando o modal abre, verifica se é Edição ou Novo
  useEffect(() => {
    if (isOpen) {
      if (insumoParaEditar) {
        // MODO EDIÇÃO: Preenche com os dados que vieram do banco
        setForm({
          sku: insumoParaEditar.SKU_MATERIA,
          nome: insumoParaEditar.NOME_MATERIA,
          unidade: insumoParaEditar.UNIDADE_MEDIDA,
          custo: String(insumoParaEditar.CUSTO_UNITARIO),
          estoque_min: String(insumoParaEditar.ESTOQUE_MINIMO),
          fornecedor: insumoParaEditar.FORNECEDOR || ''
        });
      } else {
        // MODO NOVO: Limpa tudo
        setForm({ sku: '', nome: '', unidade: 'UN', custo: '', estoque_min: '', fornecedor: '' });
      }
    }
  }, [isOpen, insumoParaEditar]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      if (insumoParaEditar) {
        // --- ATUALIZAR (PUT) ---
        await api.put(`/estoque/${insumoParaEditar.ID_MATERIA}`, form);
        showToast('Insumo atualizado com sucesso!', 'success');
      } else {
        // --- CRIAR (POST) ---
        await api.post('/estoque', form);
        showToast('Insumo cadastrado com sucesso!', 'success');
      }
      
      onSuccess(); // Recarrega a lista lá no pai
      onClose();   // Fecha o modal

    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.mensagem || 'Erro ao salvar.';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg animate-in fade-in zoom-in duration-200">
        
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50 rounded-t-xl">
          <h2 className="text-xl font-bold text-gray-700">
            {insumoParaEditar ? 'Editar Insumo' : 'Novo Insumo'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SKU (Código)</label>
              <input 
                required
                value={form.sku}
                onChange={e => setForm({...form, sku: e.target.value})}
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-avivar-tiffany outline-none uppercase"
                placeholder="EX: PAP-001"
              />
            </div>
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Unidade</label>
               <select 
                 value={form.unidade}
                 onChange={e => setForm({...form, unidade: e.target.value})}
                 className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-avivar-tiffany outline-none"
               >
                 <option value="UN">Unidade (UN)</option>
                 <option value="KG">Quilo (KG)</option>
                 <option value="MT">Metro (MT)</option>
                 <option value="L">Litro (L)</option>
                 <option value="M2">Metro² (M²)</option>
               </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Insumo</label>
            <input 
              required
              value={form.nome}
              onChange={e => setForm({...form, nome: e.target.value})}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-avivar-tiffany outline-none"
              placeholder="Ex: Papel Paraná 2mm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Custo Unit. (R$)</label>
                <input 
                  type="number" step="0.01" min="0"
                  required
                  value={form.custo}
                  onChange={e => setForm({...form, custo: e.target.value})}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-avivar-tiffany outline-none"
                />
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estoque Mínimo</label>
                <input 
                  type="number" min="0"
                  value={form.estoque_min}
                  onChange={e => setForm({...form, estoque_min: e.target.value})}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-avivar-tiffany outline-none"
                />
             </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Fornecedor Principal</label>
             <input 
               value={form.fornecedor}
               onChange={e => setForm({...form, fornecedor: e.target.value})}
               className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-avivar-tiffany outline-none"
               placeholder="Nome da empresa..."
             />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-avivar-tiffany text-white py-3 rounded-lg font-bold hover:bg-teal-600 transition-colors flex justify-center items-center gap-2 mt-4 shadow-md"
          >
             <Save size={20} />
             {loading ? 'Salvando...' : (insumoParaEditar ? 'Atualizar Dados' : 'Cadastrar Insumo')}
          </button>
        </form>
      </div>
    </div>
  );
}