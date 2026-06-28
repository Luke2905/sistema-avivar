const fs = require('fs');

const file = 'src/components/ModalDetalhesPedido.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /VALOR_TOTAL: string \| number;\s*PLATAFORMA_ORIGEM: string;\s*\};/,
    "VALOR_TOTAL: string | number;\n    PLATAFORMA_ORIGEM: string;\n    OBSERVACOES?: string;\n  };"
);

content = content.replace(
    /\{\/\* Tabela de Itens \*\/\}\s*<h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">/,
    `{/* Observações */}
            {pedido.OBSERVACOES && (
              <div className="mb-6 p-4 bg-yellow-50/50 border border-yellow-100 rounded-lg">
                <p className="text-xs text-yellow-800 uppercase font-bold mb-1">Observações do Pedido</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{pedido.OBSERVACOES}</p>
              </div>
            )}

            {/* Tabela de Itens */}
            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">`
);

fs.writeFileSync(file, content, 'utf8');
console.log('Replaced successfully');
