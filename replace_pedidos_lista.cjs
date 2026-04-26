const fs = require('fs');

const path = 'src/pages/PedidosLista.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
    /export default function PedidosLista\(\) {/,
    `export default function PedidosLista() {
  const usuarioSalvo = localStorage.getItem('avivar_user');
  const user = usuarioSalvo ? JSON.parse(usuarioSalvo) : { perfil: '' };
  const perfil = user.perfil ? user.perfil.toUpperCase() : '';
  const isFinanceiroOculto = perfil === 'ARTES' || perfil === 'PRODUCAO';`
);

content = content.replace(
    /<th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Valor<\/th>\s*<th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Lucro Est\.<\/th>/,
    `{!isFinanceiroOculto && <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Valor</th>}
                {!isFinanceiroOculto && <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Lucro Est.</th>}`
);

content = content.replace(
    /<td className="py-4 px-6 text-right">\s*<span className="text-sm font-bold text-gray-800">\s*\{Number\(p\.VALOR_TOTAL \|\| 0\)\.toLocaleString\('pt-BR', \{ style: 'currency', currency: 'BRL' \}\)\}\s*<\/span>\s*<\/td>\s*<td className="py-4 px-6 text-right">\s*<div className="flex flex-col items-end">\s*<span className=\{\`text-sm font-bold \$\{Number\(p\.LUCRO_BRUTO_ESTIMADO \|\| 0\) < 0 \? 'text-red-600' : 'text-emerald-600'\}\`\}>\s*\{Number\(p\.LUCRO_BRUTO_ESTIMADO \|\| 0\)\.toLocaleString\('pt-BR', \{ style: 'currency', currency: 'BRL' \}\)\}\s*<\/span>\s*<span className="text-\[10px\] text-gray-400">\s*Custo: \{Number\(p\.CUSTO_MATERIAIS_ESTIMADO \|\| 0\)\.toLocaleString\('pt-BR', \{ style: 'currency', currency: 'BRL' \}\)\}\s*<\/span>\s*<\/div>\s*<\/td>/,
    `{!isFinanceiroOculto && (
                      <td className="py-4 px-6 text-right">
                        <span className="text-sm font-bold text-gray-800">
                          {Number(p.VALOR_TOTAL || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </td>
                    )}

                    {!isFinanceiroOculto && (
                      <td className="py-4 px-6 text-right">
                        <div className="flex flex-col items-end">
                          <span className={\`text-sm font-bold \${Number(p.LUCRO_BRUTO_ESTIMADO || 0) < 0 ? 'text-red-600' : 'text-emerald-600'}\`}>
                            {Number(p.LUCRO_BRUTO_ESTIMADO || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            Custo: {Number(p.CUSTO_MATERIAIS_ESTIMADO || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </span>
                        </div>
                      </td>
                    )}`
);

fs.writeFileSync(path, content);
console.log('Done replacing in PedidosLista.tsx');
