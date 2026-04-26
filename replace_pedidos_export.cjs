const fs = require('fs');

const path = 'src/pages/PedidosLista.tsx';
let content = fs.readFileSync(path, 'utf8');

// Imports
content = content.replace(
    /import ModalDetalhesPedido from '\.\.\/components\/ModalDetalhesPedido';/,
    `import ModalDetalhesPedido from '../components/ModalDetalhesPedido';
import { exportToExcel, exportToPDF } from '../utils/exportUtils';`
);

// Functions
content = content.replace(
    /const aplicarFiltros = \(\) => \{/,
    `const handleExportExcel = () => {
    const data = pedidosFiltrados.map(p => ({
      ID: p.ID_PEDIDO,
      Data: p.DATA_PEDIDO ? new Date(p.DATA_PEDIDO).toLocaleDateString('pt-BR') : '',
      Cliente: p.NOME_CLIENTE,
      Plataforma: p.PLATAFORMA_ORIGEM,
      Numero: p.NUM_PEDIDO_PLATAFORMA,
      NF: p.NUM_NOTA_FISCAL || '',
      Status: p.STATUS_PEDIDO,
      Qtd_Itens: p.QTD_TOTAL_ITENS,
      Valor_Total: !isFinanceiroOculto ? Number(p.VALOR_TOTAL) : '***',
      Lucro_Bruto: !isFinanceiroOculto ? Number(p.LUCRO_BRUTO_ESTIMADO) : '***'
    }));
    exportToExcel(data, 'Pedidos');
  };

  const handleExportPDF = () => {
    const headers = ['ID', 'Data', 'Cliente', 'Plataforma', 'Nº', 'Status', 'Valor'];
    const data = pedidosFiltrados.map(p => [
      p.ID_PEDIDO,
      p.DATA_PEDIDO ? new Date(p.DATA_PEDIDO).toLocaleDateString('pt-BR') : '',
      p.NOME_CLIENTE,
      p.PLATAFORMA_ORIGEM,
      p.NUM_PEDIDO_PLATAFORMA,
      p.STATUS_PEDIDO,
      !isFinanceiroOculto ? Number(p.VALOR_TOTAL || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '***'
    ]);
    exportToPDF(headers, data, 'Pedidos', 'Relatório de Pedidos');
  };

  const aplicarFiltros = () => {`
);

// Buttons
content = content.replace(
    /<div className="flex gap-2">\s*<button\s*onClick=\{\(\) => setModalImportarOpen\(true\)\}/,
    `<div className="flex gap-2">
            <button
              onClick={handleExportExcel}
              className="px-3 py-2 bg-green-50 border border-green-200 text-green-700 rounded-lg hover:bg-green-100 flex items-center gap-2 text-sm font-bold shadow-sm transition-all whitespace-nowrap"
              title="Exportar Excel"
            >
              EXCEL
            </button>
            <button
              onClick={handleExportPDF}
              className="px-3 py-2 bg-red-50 border border-red-200 text-red-700 rounded-lg hover:bg-red-100 flex items-center gap-2 text-sm font-bold shadow-sm transition-all whitespace-nowrap"
              title="Exportar PDF"
            >
              PDF
            </button>
            
            <button
              onClick={() => setModalImportarOpen(true)}`
);

fs.writeFileSync(path, content);
console.log('Done replacing in PedidosLista.tsx (Exports)');
