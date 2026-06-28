const fs = require('fs');

const file = 'src/pages/Dashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add Eye to imports
if (!content.includes('Eye } from \'lucide-react\'')) {
    content = content.replace(
        "import { Search, Filter, Calendar } from 'lucide-react';",
        "import { Search, Filter, Calendar, Eye } from 'lucide-react';"
    );
}

// 2. Remove onClick from the main card container
content = content.replace(
    /onClick=\{\(\) => abrirDetalhes\(pedido\.ID_PEDIDO\)\}\s*className=\{\`bg-white p-4 rounded-lg shadow-sm border hover:shadow-md hover:border-avivar-tiffany transition-all group relative flex flex-col gap-2 cursor-grab active:cursor-grabbing/g,
    "className={`bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-all group relative flex flex-col gap-2 cursor-grab active:cursor-grabbing"
);

// 3. Add Eye button in Botões Ação
const botoesAcaoOriginal = `                        {/* Voltar */}
                        <div className="h-8 w-8">
                            {fase.id !== 'ENTRADA' && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); voltarFase(pedido); }}
                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                >
                                    <ArrowLeft size={18} />
                                </button>
                            )}
                        </div>

                        {/* Avançar (Com lógica de baixa ao sair da produção) */}
                        <div className="h-8 w-8">`;

const botoesAcaoNovo = `                        {/* Voltar */}
                        <div className="h-8 w-8">
                            {fase.id !== 'ENTRADA' && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); voltarFase(pedido); }}
                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                >
                                    <ArrowLeft size={18} />
                                </button>
                            )}
                        </div>

                        {/* Detalhes (Olho) */}
                        <button 
                            onClick={(e) => { e.stopPropagation(); abrirDetalhes(pedido.ID_PEDIDO); }}
                            className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors shadow-sm border border-transparent hover:border-blue-100"
                            title="Ver Detalhes do Pedido"
                        >
                            <Eye size={20} />
                        </button>

                        {/* Avançar (Com lógica de baixa ao sair da produção) */}
                        <div className="h-8 w-8">`;

if (content.includes('onClick={(e) => { e.stopPropagation(); abrirDetalhes(pedido.ID_PEDIDO); }}')) {
    console.log('Already has eye button');
} else {
    content = content.replace(botoesAcaoOriginal, botoesAcaoNovo);
    fs.writeFileSync(file, content, 'utf8');
    console.log('Added Eye icon successfully');
}
