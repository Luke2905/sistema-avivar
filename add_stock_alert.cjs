const fs = require('fs');

const file = 'src/pages/Dashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add AlertTriangle to imports if not there
if (!content.includes('AlertTriangle')) {
    content = content.replace(
        "import { Search, Filter, Calendar, Eye } from 'lucide-react';",
        "import { Search, Filter, Calendar, Eye, AlertTriangle } from 'lucide-react';"
    );
}

// 2. Add state
const stateBlock = `  // Estados Drag and Drop
  const [draggedPedidoId, setDraggedPedidoId] = useState<number | null>(null);
  const [dragOverFase, setDragOverFase] = useState<string | null>(null);

  // Estoque Crítico
  const [estoqueCritico, setEstoqueCritico] = useState<any[]>([]);

  useEffect(() => { carregarPedidos(); carregarEstoque(); }, []);

  async function carregarEstoque() {
    try {
      const res = await api.get('/estoque');
      setEstoqueCritico(res.data.filter((m: any) => m.alerta_baixo === 1));
    } catch (error) {
      console.error(error);
    }
  }`;

content = content.replace(
    /  \/\/ Estados Drag and Drop\s*const \[draggedPedidoId, setDraggedPedidoId\] = useState<number \| null>\(null\);\s*const \[dragOverFase, setDragOverFase\] = useState<string \| null>\(null\);\s*useEffect\(\(\) => \{ carregarPedidos\(\); \}, \[\]\);/,
    stateBlock
);

// 3. Add UI Alert
const uiBlock = `      {/* CABEÇALHO */}
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Painel de Produção</h2>
          <p className="text-xs text-gray-500">Acompanhamento de chão de fábrica</p>
        </div>
        <div className="flex gap-2">
            <button onClick={() => { carregarPedidos(); carregarEstoque(); }} className="p-2 text-gray-400 hover:text-avivar-tiffany hover:bg-gray-50 rounded-full transition-all">
              <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            </button>
        </div>
      </header>

      {/* ALERTA DE ESTOQUE CRÍTICO */}
      {estoqueCritico.length > 0 && (
          <div className="bg-red-50 border-b border-red-200 px-8 py-2 flex items-center gap-3 animate-fadeIn">
              <AlertTriangle size={18} className="text-red-500 shrink-0" />
              <div className="flex-1 overflow-x-auto custom-scrollbar flex items-center gap-4 py-1">
                  <span className="text-sm font-bold text-red-800 shrink-0">Estoque Baixo:</span>
                  {estoqueCritico.map(m => (
                      <span key={m.ID_MATERIA} className="text-xs bg-white text-red-600 px-2 py-0.5 rounded border border-red-100 whitespace-nowrap shadow-sm font-medium">
                          {m.NOME_MATERIA} ({Number(m.SALDO_ESTOQUE)} {m.UNIDADE_MEDIDA})
                      </span>
                  ))}
              </div>
          </div>
      )}`;

content = content.replace(
    /      \{\/\* CABEÇALHO \*\/\}[\s\S]*?<RefreshCw size=\{20\} className=\{loading \? "animate-spin" : ""\} \/>\s*<\/button>\s*<\/div>\s*<\/header>/,
    uiBlock
);

fs.writeFileSync(file, content, 'utf8');
console.log('Added Critical Stock Alert to Dashboard successfully');
