const fs = require('fs');

const path = 'src/pages/Dashboard.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
    /RESPONSAVEL_PRODUCAO\?: string;\s*resumo_itens\?: string;\s*}/,
    `RESPONSAVEL_PRODUCAO?: string;
  resumo_itens?: string;
  PRAZO_ENVIO?: string;
  LINK_ARTE?: string;
}`
);

content = content.replace(
    /{\/\* Topo Card \*\/}\s*<div className="flex justify-between items-start">\s*<span className="text-\[10px\] font-bold bg-gray-50 text-gray-500 px-2 py-1 rounded border border-gray-200">\s*#\{pedido\.NUM_PEDIDO_PLATAFORMA \|\| 'BALCÃO'\}\s*<\/span>\s*<span className="text-\[10px\] text-gray-400 font-medium">\s*\{new Date\(pedido\.DATA_PEDIDO\)\.toLocaleDateString\('pt-BR'\)\}\s*<\/span>\s*<\/div>/,
    `{/* Topo Card */}
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] font-bold bg-gray-50 text-gray-500 px-2 py-1 rounded border border-gray-200">
                          #{pedido.NUM_PEDIDO_PLATAFORMA || 'BALCÃO'}
                        </span>
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] text-gray-400 font-medium leading-none">
                                Pedido: {new Date(pedido.DATA_PEDIDO).toLocaleDateString('pt-BR')}
                            </span>
                            {pedido.PRAZO_ENVIO && (
                                <span className="text-[10px] font-bold text-red-500 bg-red-50 border border-red-100 px-1 rounded mt-1 leading-none py-0.5">
                                    Prazo: {new Date(pedido.PRAZO_ENVIO).toLocaleDateString('pt-BR')}
                                </span>
                            )}
                        </div>
                      </div>`
);

content = content.replace(
    /{\/\* Cliente \*\/}\s*<div className="flex items-center gap-2">\s*<User size=\{14\} className="text-gray-400" \/>\s*<h4 className="font-bold text-gray-800 text-sm line-clamp-1" title=\{pedido\.NOME_CLIENTE\}>\s*\{pedido\.NOME_CLIENTE\}\s*<\/h4>\s*<\/div>/,
    `{/* Cliente */}
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-gray-400" />
                        <h4 className="font-bold text-gray-800 text-sm line-clamp-1 flex-1" title={pedido.NOME_CLIENTE}>
                          {pedido.NOME_CLIENTE}
                        </h4>
                        {pedido.LINK_ARTE && (
                            <a href={pedido.LINK_ARTE} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 bg-blue-50 p-1 rounded-md border border-blue-100 shadow-sm" title="Abrir Arte no Drive" onClick={e => e.stopPropagation()}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
                            </a>
                        )}
                      </div>`
);

fs.writeFileSync(path, content);
console.log('Done replacing in Dashboard.tsx');
