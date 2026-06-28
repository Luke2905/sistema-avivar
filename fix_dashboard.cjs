const fs = require('fs');

const file = 'src/pages/Dashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /async function atualizarStatus[\s\S]*?<RefreshCw size=\{20\} className=\{loading \? "animate-spin" : ""\} \/>/;

const fixedCode = `async function atualizarStatus(pedido: Pedido, novaFase: string, direcao: 'forward' | 'back') {
    try {
      await api.patch(\`/pedidos/\${pedido.ID_PEDIDO}/status\`, { novo_status: novaFase });
      
      setPedidos(antigos => antigos.map(p => 
        p.ID_PEDIDO === pedido.ID_PEDIDO ? { ...p, STATUS_PEDIDO: novaFase } : p
      ));
      
      if (direcao === 'back') showToast(\`Voltou para \${novaFase.replace('_', ' ')}\`);
      
    } catch (error) {
      showAlert('Erro', 'Não foi possível mover o pedido no servidor.', 'error');
    }
  }

  const pedidosFiltrados = pedidos.filter((p) => {
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
    <div className="flex flex-col h-full bg-gray-50">
      
      {/* CABEÇALHO */}
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Painel de Produção</h2>
          <p className="text-xs text-gray-500">Acompanhamento de chão de fábrica</p>
        </div>
        <div className="flex gap-2">
            <button onClick={carregarPedidos} className="p-2 text-gray-400 hover:text-avivar-tiffany hover:bg-gray-50 rounded-full transition-all">
              <RefreshCw size={20} className={loading ? "animate-spin" : ""} />`;

if (regex.test(content)) {
    content = content.replace(regex, fixedCode);
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed successfully');
} else {
    console.log('Broken code not found in file');
}
