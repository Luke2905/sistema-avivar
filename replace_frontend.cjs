const fs = require('fs');

const path = 'src/components/ModalNovoPedido.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
    /const \[cliente, setCliente\] = useState\(''\);\s*const \[numPedido, setNumPedido\] = useState\(''\);\s*const \[plataforma, setPlataforma\] = useState\('Balcão'\);/,
    `const [cliente, setCliente] = useState('');
  const [numPedido, setNumPedido] = useState('');
  const [plataforma, setPlataforma] = useState('Balcão');
  const [prazoEnvio, setPrazoEnvio] = useState('');
  const [linkArte, setLinkArte] = useState('');`
);

content = content.replace(
    /setCliente\(p\.NOME_CLIENTE\);\s*setNumPedido\(p\.NUM_PEDIDO_PLATAFORMA\);\s*setPlataforma\(p\.PLATAFORMA_ORIGEM\);/,
    `setCliente(p.NOME_CLIENTE);
            setNumPedido(p.NUM_PEDIDO_PLATAFORMA);
            setPlataforma(p.PLATAFORMA_ORIGEM);
            
            if (p.PRAZO_ENVIO) {
                setPrazoEnvio(p.PRAZO_ENVIO.split('T')[0]);
            } else {
                setPrazoEnvio('');
            }
            setLinkArte(p.LINK_ARTE || '');`
);

content = content.replace(
    /setCliente\(''\);\s*setNumPedido\(''\);\s*setPlataforma\('Balcão'\);\s*setItens\(\[\]\);/,
    `setCliente('');
    setNumPedido('');
    setPlataforma('Balcão');
    setPrazoEnvio('');
    setLinkArte('');
    setItens([]);`
);

content = content.replace(
    /nome_cliente: cliente,\s*num_pedido: numPedido,\s*plataforma: plataforma,\s*valor_total: calcularTotalPedido\(\),/g,
    `nome_cliente: cliente,
      num_pedido: numPedido,
      plataforma: plataforma,
      prazo_envio: prazoEnvio || null,
      link_arte: linkArte || null,
      valor_total: calcularTotalPedido(),`
);

content = content.replace(
    /<\/div>\s*<hr className="border-gray-100" \/>/,
    `</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Prazo de Envio</label>
              <input 
                type="date"
                value={prazoEnvio} onChange={e => setPrazoEnvio(e.target.value)}
                className="w-full border p-2 rounded-lg outline-none focus:border-avivar-tiffany"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Link da Arte (Drive)</label>
              <input 
                type="text"
                value={linkArte} onChange={e => setLinkArte(e.target.value)}
                className="w-full border p-2 rounded-lg outline-none focus:border-avivar-tiffany"
                placeholder="https://drive.google.com/..."
              />
            </div>
          </div>

          <hr className="border-gray-100" />`
);

fs.writeFileSync(path, content);
console.log('Done replacing in ModalNovoPedido.tsx');
