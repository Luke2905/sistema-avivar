const fs = require('fs');

const file = 'src/pages/PedidosLista.tsx';
let content = fs.readFileSync(file, 'utf8');

// Interface
content = content.replace(
    'CUSTO_MATERIAIS_ESTIMADO?: string | number;\n  LUCRO_BRUTO_ESTIMADO?: string | number;\n}',
    'CUSTO_MATERIAIS_ESTIMADO?: string | number;\n  LUCRO_BRUTO_ESTIMADO?: string | number;\n  PRAZO_ENVIO?: string;\n  OBSERVACOES?: string;\n}'
);

// Add API function to update status
if (!content.includes('const handleAlterarStatus = async')) {
    content = content.replace(
        'const getStatusBadge = (status: string) => {',
        `const handleAlterarStatus = async (id: number, novoStatus: string) => {
    try {
      await api.patch(\`/pedidos/\${id}/status\`, { novo_status: novoStatus });
      setPedidos(antigos => antigos.map(p => 
        p.ID_PEDIDO === id ? { ...p, STATUS_PEDIDO: novoStatus } : p
      ));
      showToast('Status atualizado!', 'success');
    } catch {
      showToast('Erro ao atualizar status', 'error');
    }
  };

  const getStatusBadge = (status: string) => {`
    );
}

// Table headers
content = content.replace(
    '<th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Itens</th>\n                {!isFinanceiroOculto && <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Valor</th>}',
    '<th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Itens</th>\n                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Prazo</th>\n                {!isFinanceiroOculto && <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Valor</th>}'
);

content = content.replace(
    '<th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Status / NF</th>\n                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Ações</th>',
    '<th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Status / NF</th>\n                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-left">OBS</th>\n                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Ações</th>'
);

// Table columns
// Prazo column (after itens, before valor)
content = content.replace(
    /<\/td>\s*\{\!isFinanceiroOculto && \(\s*<td className="py-4 px-6 text-right">/,
    `</td>

                    <td className="py-4 px-6 text-center">
                        {p.PRAZO_ENVIO ? (
                            <span className={\`text-xs font-bold px-2 py-1 rounded \${new Date(p.PRAZO_ENVIO) <= new Date() ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}\`}>
                                {new Date(p.PRAZO_ENVIO).toLocaleDateString('pt-BR')}
                            </span>
                        ) : (
                            <span className="text-gray-400 text-xs">-</span>
                        )}
                    </td>

                    {!isFinanceiroOculto && (
                      <td className="py-4 px-6 text-right">`
);

// OBS Column and Status Select
content = content.replace(
    /<td className="py-4 px-6 text-center">\s*<div className="flex flex-col items-center gap-1">\s*\{getStatusBadge\(p.STATUS_PEDIDO\)\}\s*\{temNf && \(\s*<span className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-\[10px\] font-bold border border-emerald-100">\s*<FileCheck size=\{10\} \/> NF: \{p.NUM_NOTA_FISCAL\}\s*<\/span>\s*\)\}\s*<\/div>\s*<\/td>\s*<td className="py-4 px-6 text-center">/g,
    `<td className="py-4 px-6 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <select 
                            value={p.STATUS_PEDIDO} 
                            onChange={(e) => handleAlterarStatus(p.ID_PEDIDO, e.target.value)}
                            className="text-xs font-bold outline-none border border-gray-200 rounded px-2 py-1 bg-white hover:border-avivar-tiffany transition-colors cursor-pointer"
                        >
                            {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt.replace('_', ' ')}</option>)}
                        </select>
                        {temNf && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100 mt-1">
                            <FileCheck size={10} /> NF: {p.NUM_NOTA_FISCAL}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-6">
                        <div className="text-[11px] text-gray-500 bg-yellow-50/50 p-2 border border-yellow-100 rounded line-clamp-3 max-w-[150px]" title={p.OBSERVACOES || ''}>
                            {p.OBSERVACOES || <span className="italic opacity-50">Sem OBS</span>}
                        </div>
                    </td>

                    <td className="py-4 px-6 text-center">`
);

fs.writeFileSync(file, content, 'utf8');
console.log('Replaced successfully');
