// src/components/ModalImportarPedidos.tsx
import { useState, useRef } from 'react';
import { X, UploadCloud, FileSpreadsheet, CheckCircle, Download, AlertTriangle } from 'lucide-react';
import * as XLSX from 'xlsx';
import api from '../services/api';
import { showToast } from '../utils/swal-config';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ModalImportarPedidos({ isOpen, onClose, onSuccess }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');
  const [pedidosAgrupados, setPedidosAgrupados] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Modelo atualizado com colunas de ITENS
  const baixarModelo = () => {
    const ws = XLSX.utils.json_to_sheet([
        { 
            NumeroPedido: 'SHOPEE-1001', 
            Data: '2025-11-25', 
            Plataforma: 'Shopee', 
            Cliente: 'Maria Silva', 
            ValorTotalPedido: 100.00,
            SKU: 'CAN-001',
            Qtd: 2 
        },
        { 
            NumeroPedido: 'SHOPEE-1001', 
            Data: '2025-11-25', 
            Plataforma: 'Shopee', 
            Cliente: 'Maria Silva', 
            ValorTotalPedido: 100.00,
            SKU: 'CAM-ROSA',
            Qtd: 1 
        },
        { 
            NumeroPedido: 'ML-554', 
            Data: '2025-11-26', 
            Plataforma: 'Mercado Livre', 
            Cliente: 'João Souza', 
            ValorTotalPedido: 50.00,
            SKU: 'CAN-002',
            Qtd: 1 
        }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Modelo Importacao");
    XLSX.writeFile(wb, "Modelo_Pedidos_Com_Itens.xlsx");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (evt) => {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const linhas = XLSX.utils.sheet_to_json(ws);
        
        // --- LÓGICA DE AGRUPAMENTO (O SEGREDO) ---
        const mapPedidos = new Map();

        linhas.forEach((row: any) => {
            // Tenta pegar o número do pedido (chave única)
            const numPedido = row['NumeroPedido'] || row['Pedido'] || `SEM-NUM-${Math.random()}`;
            
            // Se o pedido ainda não existe no mapa, cria o cabeçalho
            if (!mapPedidos.has(numPedido)) {
                mapPedidos.set(numPedido, {
                    num_pedido: numPedido,
                    data: row['Data'] || new Date(),
                    plataforma: row['Plataforma'] || 'Excel',
                    nome_cliente: row['Cliente'] || row['Nome'] || 'Consumidor',
                    valor_total: row['ValorTotalPedido'] || row['Valor'] || 0,
                    itens: [] // Array vazio para começar
                });
            }

            // Adiciona o item ao pedido existente
            if (row['SKU']) {
                const pedidoExistente = mapPedidos.get(numPedido);
                pedidoExistente.itens.push({
                    sku: row['SKU'],
                    qtd: row['Qtd'] || row['Quantidade'] || 1
                });
            }
        });

        // Converte o Mapa em Array para enviar pro Backend
        const arrayFinal = Array.from(mapPedidos.values());
        setPedidosAgrupados(arrayFinal);
    };
    reader.readAsBinaryString(file);
  };

  const enviarParaAPI = async () => {
    if (pedidosAgrupados.length === 0) return;
    setLoading(true);
    
    try {
        const res = await api.post('/pedidos/importar', { pedidos: pedidosAgrupados });
        showToast(res.data.detalhes || 'Importação realizada!', 'success');
        onSuccess();
        handleClose();
    } catch (error) {
        showToast('Erro ao importar. Verifique se os SKUs existem no cadastro de Produtos.', 'error');
    } finally {
        setLoading(false);
    }
  };

  const handleClose = () => {
    setFileName('');
    setPedidosAgrupados([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onClose();
  };

  if (!isOpen) return null;

  // Contagem de itens totais para preview
  const totalItens = pedidosAgrupados.reduce((acc, p) => acc + p.itens.length, 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
        
        <div className="bg-avivar-tiffany p-5 flex justify-between items-center text-white">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <FileSpreadsheet size={20} /> Importar Pedidos e Itens
          </h2>
          <button onClick={handleClose}><X className="text-white/80 hover:text-white" /></button>
        </div>

        <div className="p-6">
            
            <div className="flex justify-end mb-4">
                <button onClick={baixarModelo} className="text-xs flex items-center gap-1 text-avivar-tiffany hover:underline font-bold">
                    <Download size={12}/> Baixar Planilha Modelo
                </button>
            </div>

            <div 
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${fileName ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-avivar-tiffany hover:bg-teal-50'}`}
                onClick={() => fileInputRef.current?.click()}
            >
                <input ref={fileInputRef} type="file" accept=".xlsx, .xls, .csv" className="hidden" onChange={handleFileChange} />
                
                {fileName ? (
                    <div className="text-green-600">
                        <CheckCircle size={40} className="mx-auto mb-2" />
                        <p className="font-bold">{fileName}</p>
                        <p className="text-xs mt-1 text-gray-600">
                            {pedidosAgrupados.length} Pedidos identificados <br/>
                            ({totalItens} itens vinculados)
                        </p>
                    </div>
                ) : (
                    <div className="text-gray-400">
                        <UploadCloud size={40} className="mx-auto mb-2" />
                        <p className="font-medium">Clique para selecionar o Excel</p>
                    </div>
                )}
            </div>

            {/* Aviso Importante */}
            <div className="mt-4 bg-amber-50 p-3 rounded text-xs text-amber-700 border border-amber-200 flex gap-2">
                <AlertTriangle size={32} className="shrink-0" />
                <p>
                    <strong>Atenção:</strong> O sistema tentará vincular os itens pelo <strong>SKU</strong>. 
                    Certifique-se de que os códigos na planilha sejam iguais aos cadastrados na tela de Produtos.
                </p>
            </div>

            <div className="mt-6 flex justify-end gap-3">
                <button onClick={handleClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancelar</button>
                <button 
                    onClick={enviarParaAPI} 
                    disabled={pedidosAgrupados.length === 0 || loading}
                    className={`px-4 py-2 text-white rounded font-bold shadow-sm transition-all flex items-center gap-2 ${pedidosAgrupados.length === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-avivar-tiffany hover:bg-teal-600'}`}
                >
                    {loading ? 'Processando...' : 'Confirmar e Importar'}
                </button>
            </div>

        </div>
      </div>
    </div>
  );
}