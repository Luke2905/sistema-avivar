const fs = require('fs');

const path = 'src/components/ModalDetalhesPedido.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
    /export default function ModalDetalhesPedido\(\{\s*isOpen,\s*dados,\s*onClose\s*\}\s*:\s*Props\)\s*\{/,
    `export default function ModalDetalhesPedido({ isOpen, dados, onClose }: Props) {
  const usuarioSalvo = localStorage.getItem('avivar_user');
  const user = usuarioSalvo ? JSON.parse(usuarioSalvo) : { perfil: '' };
  const perfil = user.perfil ? user.perfil.toUpperCase() : '';
  const isFinanceiroOculto = perfil === 'ARTES' || perfil === 'PRODUCAO';`
);

content = content.replace(
    /<th className="p-3 text-right">Valor Unit\.<\/th>\s*<th className="p-3 text-right">Total<\/th>/,
    `{!isFinanceiroOculto && <th className="p-3 text-right">Valor Unit.</th>}
                    {!isFinanceiroOculto && <th className="p-3 text-right">Total</th>}`
);

content = content.replace(
    /<td className="p-3 text-right">\s*\{Number\(item\.VALOR_UNITARIO\)\.toLocaleString\('pt-BR', \{ style: 'currency', currency: 'BRL' \}\)\}\s*<\/td>\s*<td className="p-3 text-right font-bold text-gray-700">\s*\{\(Number\(item\.VALOR_UNITARIO\) \* item\.QUANTIDADE\)\.toLocaleString\('pt-BR', \{ style: 'currency', currency: 'BRL' \}\)\}\s*<\/td>/,
    `{!isFinanceiroOculto && (
                        <td className="p-3 text-right">
                          {Number(item.VALOR_UNITARIO).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </td>
                      )}
                      {!isFinanceiroOculto && (
                        <td className="p-3 text-right font-bold text-gray-700">
                          {(Number(item.VALOR_UNITARIO) * item.QUANTIDADE).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </td>
                      )}`
);

content = content.replace(
    /<td colSpan=\{3\} className="p-3 text-right font-bold text-gray-600">TOTAL DO PEDIDO:<\/td>\s*<td className="p-3 text-right font-bold text-avivar-pink text-lg">\s*\{Number\(pedido\.VALOR_TOTAL\)\.toLocaleString\('pt-BR', \{ style: 'currency', currency: 'BRL' \}\)\}\s*<\/td>/,
    `{!isFinanceiroOculto && (
                      <>
                        <td colSpan={3} className="p-3 text-right font-bold text-gray-600">TOTAL DO PEDIDO:</td>
                        <td className="p-3 text-right font-bold text-avivar-pink text-lg">
                          {Number(pedido.VALOR_TOTAL).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </td>
                      </>
                    )}
                    {isFinanceiroOculto && (
                      <td colSpan={2} className="p-3 text-right font-bold text-gray-400 italic">Informação Financeira Oculta</td>
                    )}`
);

fs.writeFileSync(path, content);
console.log('Done replacing in ModalDetalhesPedido.tsx');
