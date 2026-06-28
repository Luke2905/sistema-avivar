const fs = require('fs');

const file = 'src/pages/Dashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /<ModalNovoPedido[\s\S]*?\/>/;

const replacement = `<ModalNovoPedido 
        isOpen={modalNovoOpen} 
        onClose={() => setModalNovoOpen(false)}
        onSuccess={carregarPedidos} 
      />
      <ModalDetalhesPedido
        isOpen={modalDetalhesOpen}
        dados={pedidoSelecionado}
        onClose={() => setModalDetalhesOpen(false)}
      />`;

if (regex.test(content) && !content.includes('<ModalDetalhesPedido')) {
    content = content.replace(regex, replacement);
    fs.writeFileSync(file, content, 'utf8');
    console.log('Injected ModalDetalhesPedido successfully');
} else if (content.includes('<ModalDetalhesPedido')) {
    console.log('ModalDetalhesPedido already exists in the file');
} else {
    console.log('Could not find ModalNovoPedido block');
}
