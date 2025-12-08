// src/components/ModalNovaCompra.tsx
import { useState, useEffect } from 'react';
import { X, Save, ShoppingBag, DollarSign } from 'lucide-react';
import api from '../services/api';
import { showToast } from '../utils/swal-config';

interface Materia {
  ID_MATERIA: number;
  NOME_MATERIA: string;
  UNIDADE_MEDIDA: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  materias: Materia[]; // Recebe a lista de produtos do pai
}

export default function ModalNovaCompra({ isOpen, onClose, onSuccess, materias }: Props) {
  const [idMateria, setIdMateria] = useState('');
  const [qtd, setQtd] = useState('');
  const [total, setTotal] = useState('');
  const [fornecedor, setFornecedor] = useState('');
  const [data, setData] = useState(new Date().toISOString().split('T')[0]); // Hoje

  const handleSalvar = async () => {
    if (!idMateria || !qtd || !total) return showToast('Preencha os campos obrigatórios', 'error');

    try {
      await api.post('/compras', {
        id_materia: idMateria,
        qtd: parseFloat(qtd),
        custo_total: parseFloat(total),
        fornecedor,
        data_compra: data
      });

      showToast('Entrada registrada com sucesso!', 'success');
      onSuccess(); // Atualiza a tabela
      handleClose();
    } catch (error) {
      showToast('Erro ao registrar compra', 'error');
    }
  };

  const handleClose = () => {
    setIdMateria(''); setQtd(''); setTotal(''); setFornecedor('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
        
        {/* Cabeçalho */}
        <div className="bg-avivar-tiffany p-5 flex justify-between items-center text-white">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <ShoppingBag size={20} /> Registrar Entrada
          </h2>
          <button onClick={handleClose} className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/20 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Corpo do Formulário */}
        <div className="p-6 space-y-4">
          
          {/* Seleção do Insumo */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Insumo / Matéria-Prima</label>
            <select 
              value={idMateria}
              onChange={e => setIdMateria(e.target.value)}
              className="w-full border rounded-lg p-2.5 text-sm bg-white focus:border-avivar-tiffany outline-none"
            >
              <option value="">Selecione o item comprado...</option>
              {materias.map(m => (
                <option key={m.ID_MATERIA} value={m.ID_MATERIA}>
                  {m.NOME_MATERIA} ({m.UNIDADE_MEDIDA})
                </option>
              ))}
            </select>
          </div>

          {/* Grid: Qtd e Valor */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Quantidade Comprada</label>
              <input 
                type="number" 
                step="0.001"
                value={qtd}
                onChange={e => setQtd(e.target.value)}
                className="w-full border rounded-lg p-2.5 text-sm focus:border-avivar-tiffany outline-none"
                placeholder="Ex: 10"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Valor Total da Nota (R$)</label>
              <div className="relative">
                <DollarSign size={14} className="absolute left-2.5 top-3 text-gray-400" />
                <input 
                  type="number" 
                  step="0.01"
                  value={total}
                  onChange={e => setTotal(e.target.value)}
                  className="w-full border rounded-lg p-2.5 pl-8 text-sm focus:border-avivar-tiffany outline-none font-bold text-gray-700"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Grid: Fornecedor e Data */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Fornecedor / N.F.</label>
              <input 
                value={fornecedor}
                onChange={e => setFornecedor(e.target.value)}
                className="w-full border rounded-lg p-2.5 text-sm focus:border-avivar-tiffany outline-none"
                placeholder="Ex: Kalunga"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Data da Compra</label>
              <input 
                type="date" 
                value={data}
                onChange={e => setData(e.target.value)}
                className="w-full border rounded-lg p-2.5 text-sm focus:border-avivar-tiffany outline-none"
              />
            </div>
          </div>

        </div>

        {/* Rodapé */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={handleClose} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors">
            Cancelar
          </button>
          <button onClick={handleSalvar} className="px-4 py-2 bg-avivar-tiffany text-white rounded-lg hover:bg-teal-600 text-sm font-bold shadow-sm flex items-center gap-2 transition-colors">
            <Save size={16} /> Lançar Estoque
          </button>
        </div>

      </div>
    </div>
  );
}