const fs = require('fs');

const file = 'src/pages/Dashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

// Imports
content = content.replace(
    "import ModalNovoPedido from '../components/ModalNovoPedido';",
    "import ModalNovoPedido from '../components/ModalNovoPedido';\nimport ModalDetalhesPedido from '../components/ModalDetalhesPedido';\nimport { Search, Filter, Calendar } from 'lucide-react';"
);

// Pedido Interface
content = content.replace(
    "LINK_ARTE?: string;\n}",
    "LINK_ARTE?: string;\n  OBSERVACOES?: string;\n}"
);

// State vars
content = content.replace(
    "const [modalNovoOpen, setModalNovoOpen] = useState(false);",
    `const [modalNovoOpen, setModalNovoOpen] = useState(false);
  const [modalDetalhesOpen, setModalDetalhesOpen] = useState(false);
  const [pedidoSelecionado, setPedidoSelecionado] = useState<any | null>(null);

  // Filtros
  const [busca, setBusca] = useState('');
  const [filtroDia, setFiltroDia] = useState('');
  const [filtroMes, setFiltroMes] = useState('');
  const [filtroAno, setFiltroAno] = useState('');
  const [filtroOrigem, setFiltroOrigem] = useState('');
  const [filtroPrazoEnvio, setFiltroPrazoEnvio] = useState('');
  const [showFiltros, setShowFiltros] = useState(false);`
);

// carregarPedidos query params
content = content.replace(
    "const response = await api.get('/pedidos');",
    `const params: Record<string, string> = {};
      if (filtroDia) params.dia = filtroDia;
      if (filtroMes) params.mes = filtroMes;
      if (filtroAno) params.ano = filtroAno;
      if (filtroOrigem.trim()) params.origem = filtroOrigem.trim();
      if (filtroPrazoEnvio) params.prazo_envio = filtroPrazoEnvio;

      const response = await api.get('/pedidos', { params });`
);

// Filter application function
if (!content.includes('const aplicarFiltros')) {
    content = content.replace(
        "// --- LÓGICA DE MOVIMENTAÇÃO INTELIGENTE E DRAG & DROP ---",
        `const aplicarFiltros = () => { carregarPedidos(); };
  
  const limparFiltros = () => {
    setFiltroDia(''); setFiltroMes(''); setFiltroAno(''); setFiltroOrigem(''); setFiltroPrazoEnvio(''); setBusca('');
    setTimeout(() => carregarPedidos(), 100);
  };

  const abrirDetalhes = async (id: number) => {
    try {
      const res = await api.get(\`/pedidos/\${id}\`);
      setPedidoSelecionado(res.data);
      setModalDetalhesOpen(true);
    } catch {
      showToast('Erro ao abrir detalhes', 'error');
    }
  };

  // --- LÓGICA DE MOVIMENTAÇÃO INTELIGENTE E DRAG & DROP ---`
    );
}

// Filter the search bar over the results
if (!content.includes('const pedidosFiltrados = pedidos.filter')) {
    content = content.replace(
        "return (\n    <div className=\"flex flex-col h-full bg-gray-50\">",
        `const pedidosFiltrados = pedidos.filter((p) => {
    const termo = busca.toLowerCase();
    return (
      (p.NOME_CLIENTE || '').toLowerCase().includes(termo) ||
      (p.NUM_PEDIDO_PLATAFORMA || '').toLowerCase().includes(termo) ||
      (p.resumo_itens || '').toLowerCase().includes(termo) ||
      (p.OBSERVACOES || '').toLowerCase().includes(termo) ||
      (p.PLATAFORMA_ORIGEM || '').toLowerCase().includes(termo)
    );
  });

  return (
    <div className="flex flex-col h-full bg-gray-50">`
    );
}

// Render Filters UI
content = content.replace(
    "{/* KANBAN BOARD */}",
    `{/* FILTROS (Colapsável) */}
      <div className="bg-white border-b border-gray-200 px-8 py-3 flex flex-col gap-3 shrink-0">
        <div className="flex justify-between items-center gap-4">
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input
                type="text"
                placeholder="Buscar cliente, pedido, resumo, observação..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-avivar-tiffany text-sm"
                />
            </div>
            <button onClick={() => setShowFiltros(!showFiltros)} className="flex items-center gap-2 text-sm text-gray-600 hover:text-avivar-tiffany font-medium border border-gray-200 px-3 py-2 rounded-lg transition-colors">
                <Filter size={16} /> Filtros {showFiltros ? 'Ocultar' : 'Avançados'}
            </button>
        </div>

        {showFiltros && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-2 border-t border-gray-100 animate-fadeIn">
                <input type="date" value={filtroDia} onChange={(e) => setFiltroDia(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none" title="Dia" />
                <select value={filtroMes} onChange={(e) => setFiltroMes(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none bg-white">
                    <option value="">Mês</option>
                    {['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'].map((mes, i) => <option key={i + 1} value={String(i + 1)}>{mes}</option>)}
                </select>
                <input type="number" placeholder="Ano" value={filtroAno} onChange={(e) => setFiltroAno(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none" />
                <input type="text" placeholder="Origem" value={filtroOrigem} onChange={(e) => setFiltroOrigem(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none" />
                <input type="date" value={filtroPrazoEnvio} onChange={(e) => setFiltroPrazoEnvio(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none" title="Prazo de Envio" />
                
                <div className="col-span-2 md:col-span-5 flex justify-end gap-2 mt-1">
                    <button onClick={limparFiltros} className="px-4 py-1.5 text-xs font-bold text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">Limpar</button>
                    <button onClick={aplicarFiltros} className="px-4 py-1.5 text-xs font-bold bg-avivar-tiffany text-white rounded-lg hover:bg-teal-600 shadow-sm">Aplicar</button>
                </div>
            </div>
        )}
      </div>

      {/* KANBAN BOARD */}`
);

// Map over filtered list instead of all orders
content = content.replace(
    'const pedidosDaFase = pedidos.filter(p => p.STATUS_PEDIDO === fase.id);',
    'const pedidosDaFase = pedidosFiltrados.filter(p => p.STATUS_PEDIDO === fase.id);'
);

// Card modifications (Click to open, red badge, OBS)
content = content.replace(
    /className=\{\`bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-all group relative flex flex-col gap-2 cursor-grab active:cursor-grabbing/g,
    `onClick={() => abrirDetalhes(pedido.ID_PEDIDO)}
                      className={\`bg-white p-4 rounded-lg shadow-sm border hover:shadow-md hover:border-avivar-tiffany transition-all group relative flex flex-col gap-2 cursor-grab active:cursor-grabbing`
);

// Red badge for PRAZO_ENVIO
content = content.replace(
    /\{pedido\.PRAZO_ENVIO && \(\s*<span className="text-\[10px\] font-bold text-red-500 bg-red-50 border border-red-100 px-1 rounded mt-1 leading-none py-0\.5">\s*Prazo: \{new Date\(pedido\.PRAZO_ENVIO\)\.toLocaleDateString\('pt-BR'\)\}\s*<\/span>\s*\)\}/g,
    `{pedido.PRAZO_ENVIO && (
                                <span className={\`text-[10px] font-bold px-1 rounded mt-1 leading-none py-0.5 border \${new Date(pedido.PRAZO_ENVIO) <= new Date() ? 'bg-red-500 text-white border-red-600 animate-pulse shadow-sm shadow-red-200' : 'text-orange-500 bg-orange-50 border-orange-100'}\`}>
                                    Prazo: {new Date(pedido.PRAZO_ENVIO).toLocaleDateString('pt-BR')}
                                </span>
                            )}`
);

// Observacoes inside card (after Resumo Itens)
content = content.replace(
    /<\/div>\s*\{\/\* Botões Ação \*\/\}/,
    `</div>

                      {/* Observações */}
                      {pedido.OBSERVACOES && (
                        <div className="bg-yellow-50/70 p-2 rounded border border-yellow-200/50 mt-1">
                          <p className="text-[10px] text-yellow-800 font-medium line-clamp-2 leading-tight">
                            <span className="font-bold mr-1">OBS:</span>
                            {pedido.OBSERVACOES}
                          </p>
                        </div>
                      )}

                      {/* Botões Ação */}`
);

// Modal details inclusion
content = content.replace(
    /<ModalNovoPedido \s*isOpen=\{modalNovoOpen\} \s*onClose=\{\(\) => setModalNovoOpen\(false\)\} \s*onSuccess=\{carregarPedidos\} \s*\/>/g,
    `<ModalNovoPedido 
        isOpen={modalNovoOpen} 
        onClose={() => setModalNovoOpen(false)}
        onSuccess={carregarPedidos} 
      />
      <ModalDetalhesPedido
        isOpen={modalDetalhesOpen}
        dados={pedidoSelecionado}
        onClose={() => setModalDetalhesOpen(false)}
      />`
);


fs.writeFileSync(file, content, 'utf8');
console.log('Dashboard replaced successfully');
