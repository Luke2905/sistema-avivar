const fs = require('fs');

const path = 'src/pages/Financeiro.tsx';
let content = fs.readFileSync(path, 'utf8');

// Import
content = content.replace(
    /import \{ showToast \} from '\.\.\/utils\/swal-config';/,
    `import { showToast } from '../utils/swal-config';
import { exportToExcel, exportToPDF } from '../utils/exportUtils';`
);

// Functions
content = content.replace(
    /async function salvarMetas\(e: React\.FormEvent\) \{/,
    `const handleExportExcel = () => {
    if (!data?.tabelaConsolidada) return;
    const exportData = data.tabelaConsolidada.map(linha => ({
      'Período': \`\${String(linha.mes).padStart(2,'0')}/\${linha.ano}\`,
      'Vendas': linha.qtdVendas,
      'Meta (R$)': linha.meta,
      'Faturamento (R$)': linha.faturamento,
      'Custos Prod. (R$)': linha.custoProducao,
      'Mão de Obra (R$)': linha.custoMaoDeObra,
      'Invest. ADS (R$)': linha.ads,
      'Outros Custos (R$)': (linha.maquinas + linha.custoNaoProdutivo),
      'Custo Total (R$)': linha.custoTotal,
      'Lucro Líquido (R$)': linha.lucroLiquido,
      'Margem %': linha.margemPercentual.toFixed(1)
    }));
    exportToExcel(exportData, 'DRE_Consolidado');
  };

  const handleExportPDF = () => {
    if (!data?.tabelaConsolidada) return;
    const headers = ['Período', 'Vendas', 'Meta', 'Faturamento', 'Custo Prod.', 'Mão Obra', 'ADS', 'Total Custos', 'Lucro Líq.', 'Margem %'];
    const exportData = data.tabelaConsolidada.map(linha => [
      \`\${String(linha.mes).padStart(2,'0')}/\${linha.ano}\`,
      linha.qtdVendas,
      Number(linha.meta).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      Number(linha.faturamento).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      Number(linha.custoProducao).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      Number(linha.custoMaoDeObra).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      Number(linha.ads).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      Number(linha.custoTotal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      Number(linha.lucroLiquido).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      \`\${linha.margemPercentual.toFixed(1)}%\`
    ]);
    exportToPDF(headers, exportData, 'DRE_Consolidado', 'DRE Consolidado');
  };

  async function salvarMetas(e: React.FormEvent) {`
);

// Buttons
content = content.replace(
    /<button\s*onClick=\{abrirModalLançamento\}\s*className="bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-black transition-colors font-bold text-sm shadow-md"\s*>\s*<Settings size=\{16\} \/> Lançar Custos \/ Meta\s*<\/button>/,
    `<button
              onClick={handleExportExcel}
              className="bg-green-50 text-green-700 border border-green-200 px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-green-100 transition-colors font-bold text-sm shadow-sm"
              title="Exportar Excel"
            >
              EXCEL
            </button>
            <button
              onClick={handleExportPDF}
              className="bg-red-50 text-red-700 border border-red-200 px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-red-100 transition-colors font-bold text-sm shadow-sm"
              title="Exportar PDF"
            >
              PDF
            </button>
            <button
              onClick={abrirModalLançamento}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-black transition-colors font-bold text-sm shadow-md"
            >
              <Settings size={16} /> Lançar Custos / Meta
            </button>`
);

fs.writeFileSync(path, content);
console.log('Done replacing in Financeiro.tsx (Exports)');
