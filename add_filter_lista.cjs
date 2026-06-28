const fs = require('fs');

const file = 'src/pages/PedidosLista.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('const [filtroPrazoEnvio, setFiltroPrazoEnvio] = useState')) {
    content = content.replace(
        'const [filtroStatus, setFiltroStatus] = useState(\'\');',
        "const [filtroStatus, setFiltroStatus] = useState('');\n  const [filtroPrazoEnvio, setFiltroPrazoEnvio] = useState('');"
    );

    content = content.replace(
        'if (filtroStatus) params.status = filtroStatus;',
        "if (filtroStatus) params.status = filtroStatus;\n    if (filtroPrazoEnvio) params.prazo_envio = filtroPrazoEnvio;"
    );

    content = content.replace(
        'setFiltroStatus(\'\');',
        "setFiltroStatus('');\n    setFiltroPrazoEnvio('');"
    );

    content = content.replace(
        '<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">',
        `<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
          <input
            type="date"
            value={filtroPrazoEnvio}
            onChange={(e) => setFiltroPrazoEnvio(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-avivar-tiffany"
            title="Filtrar por Prazo de Envio"
          />`
    );

    fs.writeFileSync(file, content, 'utf8');
    console.log('Replaced filter successfully');
}
