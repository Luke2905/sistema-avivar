// src/components/ModalNovoInsumo.tsx
import { useState } from 'react';
import { X, Save, Package } from 'lucide-react';
import api from '../services/api';
import { showToast } from '../utils/swal-config';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ModalNovoInsumo({ isOpen, onClose, onSuccess }: Props) {
  const [sku, setSku] = useState('');
  const [nome, setNome] = useState('');
  const [unidade, setUnidade] = useState('');
  const [minimo, setMinimo] = useState('');
  const [custo, setCusto] = useState('');
  const [fornecedor, setFornecedor] = useState('');

  const handleSalvar = async () => {
    if (!sku || !nome || !custo) return showToast('Preencha os campos obrigatórios', 'error');

    try {
      await api.post('/estoque', {
        sku,
        nome,
        unidade,
        estoque_min: minimo,
        custo: parseFloat(custo),
        fornecedor
      });

      showToast('Insumo cadastrado com sucesso!');
      onSuccess(); // Atualiza a lista lá no pai
      onClose();   // Fecha o modal
      
      // Limpar campos
      setSku(''); setNome(''); setUnidade(''); setMinimo(''); setCusto(''); setFornecedor('');
      
    } catch (error) {
      showToast('Erro ao salvar insumo', 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
        
        {/* Cabeçalho */}
        <div className="bg-avivar-tiffany p-5 flex justify-between items-center text-white">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Package size={20} /> Novo Insumo
          </h2>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/20 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Corpo do Formulário */}
        <div className="p-6 space-y-4">
          
          {/* Linha 1: SKU e Nome */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
              <label className="block text-xs font-bold text-gray-500 mb-1">SKU</label>
              <input value={sku} onChange={e => setSku(e.target.value)} className="w-full border rounded-lg p-2 text-sm focus:border-avivar-tiffany outline-none" placeholder="MP-01" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-500 mb-1">Nome do Material</label>
              <input value={nome} onChange={e => setNome(e.target.value)} className="w-full border rounded-lg p-2 text-sm focus:border-avivar-tiffany outline-none" placeholder="Ex: Tinta Sublimática" />
            </div>
          </div>

          {/* Linha 2: Unidade e Estoque Mínimo */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Unidade (Kg, L, Un)</label>
              <input value={unidade} onChange={e => setUnidade(e.target.value)} className="w-full border rounded-lg p-2 text-sm focus:border-avivar-tiffany outline-none" placeholder="Ex: Litro" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Estoque Mínimo (Alerta)</label>
              <input type="number" value={minimo} onChange={e => setMinimo(e.target.value)} className="w-full border rounded-lg p-2 text-sm focus:border-avivar-tiffany outline-none" placeholder="Ex: 5" />
            </div>
          </div>

          {/* Linha 3: Custo e Fornecedor */}
          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Custo Unitário (R$)</label>
              <input type="number" step="0.01" value={custo} onChange={e => setCusto(e.target.value)} className="w-full border rounded-lg p-2 text-sm focus:border-avivar-tiffany outline-none" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Fornecedor</label>
              <input value={fornecedor} onChange={e => setFornecedor(e.target.value)} className="w-full border rounded-lg p-2 text-sm focus:border-avivar-tiffany outline-none" placeholder="Nome do Fornecedor" />
            </div>
          </div>

        </div>

        {/* Rodapé */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors">
            Cancelar
          </button>
          <button onClick={handleSalvar} className="px-4 py-2 bg-avivar-tiffany text-white rounded-lg hover:bg-teal-600 text-sm font-bold shadow-sm flex items-center gap-2 transition-colors">
            <Save size={16} /> Salvar Insumo
          </button>
        </div>

      </div>
    </div>
  );
}