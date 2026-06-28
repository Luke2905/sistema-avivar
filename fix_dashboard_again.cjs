const fs = require('fs');

const file = 'src/pages/Dashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /\{\/\* Observações \*\/\}[\s\S]*?\{pedido\.OBSERVACOES && \([\s\S]*?<\/div>\s*\)\}\s*>\s*<ArrowRight size=\{18\} \/>\s*<\/button>\s*\)\}\s*<\/div>\s*<\/div>/;

const fixedBlock = `{/* Observações */}
                      {pedido.OBSERVACOES && (
                        <div className="bg-yellow-50/70 p-2 rounded border border-yellow-200/50 mt-1">
                          <p className="text-[10px] text-yellow-800 font-medium line-clamp-2 leading-tight">
                            <span className="font-bold mr-1">OBS:</span>
                            {pedido.OBSERVACOES}
                          </p>
                        </div>
                      )}

                      {/* Botões Ação */}
                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-50">
                        
                        {/* Voltar */}
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
                        <div className="h-8 w-8">
                            {fase.id !== 'ENVIADO' && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); avancarFase(pedido); }}
                                    className="p-1.5 text-gray-400 hover:text-avivar-tiffany hover:bg-teal-50 rounded-full transition-colors"
                                    title={fase.id === 'PRODUCAO' ? 'Finalizar e Baixar Estoque' : 'Avançar fase'}
                                >
                                    <ArrowRight size={18} />
                                </button>
                            )}
                        </div>

                      </div>`;

if (regex.test(content)) {
    content = content.replace(regex, fixedBlock);
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed successfully');
} else {
    console.log('Broken code not found in file');
}
