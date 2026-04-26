import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';

// Exportação Dinâmica para Excel
export const exportToExcel = (data: any[], filename: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Dados");
  XLSX.writeFile(workbook, `${filename}_${new Date().getTime()}.xlsx`);
};

// Exportação Dinâmica para PDF com Tabela
export const exportToPDF = (
  headers: string[], 
  data: any[][], 
  filename: string, 
  title: string
) => {
  const doc = new jsPDF('landscape');

  doc.setFontSize(18);
  doc.text(title, 14, 22);
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 30);

  autoTable(doc, {
    startY: 35,
    head: [headers],
    body: data,
    theme: 'grid',
    headStyles: { fillColor: [10, 186, 181] },
    styles: { fontSize: 9, cellPadding: 3 },
  });

  doc.save(`${filename}_${new Date().getTime()}.pdf`);
};
