import { useEffect, useState } from 'react';
import api from '../services/api'; // Sua instância do Axios
import { UploadCloud, Trash2, FileText, Loader2, Eye, Image as ImageIcon } from 'lucide-react';
import { showToast } from '../utils/swal-config'; // Seu utilitário de Toast

// Interface alinhada com o que o Backend (MySQL) retorna
interface Arte {
    ID_ARQUIVO: number;
    NOME_ARQUIVO: string;
    URL_ARQUIVO: string;
    TIPO_ARQUIVO: string;
}

interface Props {
    idPedido: number;
}

export function GerenciadorArtes({ idPedido }: Props) {
    const [artes, setArtes] = useState<Arte[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    // 1. Carregar a lista de artes do pedido
    async function carregarGaleria() {
        try {
            setLoading(true);
            const res = await api.get(`/upload/arte/${idPedido}`);
            setArtes(res.data);
        } catch (error) {
            console.error("Erro ao carregar artes:", error);
            showToast('Erro ao carregar galeria.', 'error');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (idPedido) carregarGaleria();
    }, [idPedido]);

    // 2. Fazer Upload (Envia para seu Node.js -> Cloudinary)
    async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
        if (!e.target.files?.length) return;
        
        const arquivo = e.target.files[0];

        // Validação básica de tamanho (ex: 10MB)
        if (arquivo.size > 10 * 1024 * 1024) {
            return showToast('Arquivo muito grande! Máximo 10MB.', 'warning');
        }

        const formData = new FormData();
        // O nome 'arquivo' AQUI tem que ser igual ao upload.single('arquivo') no Backend
        formData.append('arquivo', arquivo); 

        try {
            setUploading(true);
            
            // AQUI O PULO DO GATO: Cabeçalho explicito
            await api.post(`/upload/arte/${idPedido}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            showToast('Arquivo anexado com sucesso!', 'success');
            
            // Limpa o input para permitir enviar o mesmo arquivo de novo se quiser
            e.target.value = ''; 
            
            await carregarGaleria(); // Atualiza a lista visualmente

        } catch (error) {
            console.error(error);
            showToast('Erro ao fazer upload.', 'error');
        } finally {
            setUploading(false);
        }
    }

    // 3. Deletar Arquivo
    async function handleDeletar(idArquivo: number) {
        if (!confirm('Tem certeza que deseja excluir esta arte?')) return;
        
        try {
            await api.delete(`/upload/arte/${idArquivo}`);
            // Remove da lista visualmente sem precisar recarregar tudo do servidor
            setArtes((prev) => prev.filter(a => a.ID_ARQUIVO !== idArquivo));
            showToast('Arquivo removido.', 'success');
        } catch (error) {
            console.error(error);
            showToast('Erro ao excluir arquivo.', 'error');
        }
    }

    return (
        <div className="space-y-4">
            {/* --- ÁREA DE UPLOAD --- */}
            <div>
                <label className={`
                    flex flex-col items-center justify-center w-full px-4 py-6 
                    border-2 border-dashed border-gray-300 rounded-lg cursor-pointer 
                    hover:bg-gray-50 hover:border-avivar-tiffany transition-all group
                    ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
                `}>
                    {uploading ? (
                        <>
                            <Loader2 className="w-8 h-8 animate-spin text-avivar-tiffany mb-2" />
                            <span className="text-sm font-medium text-gray-500">Enviando para a nuvem...</span>
                        </>
                    ) : (
                        <>
                            <div className="p-2 bg-gray-100 rounded-full group-hover:bg-blue-50 transition-colors mb-2">
                                <UploadCloud className="w-6 h-6 text-gray-400 group-hover:text-avivar-tiffany" />
                            </div>
                            <span className="text-sm font-bold text-gray-600">Clique para enviar a arte</span>
                            <span className="text-xs text-gray-400 mt-1">Imagens ou PDF (Máx 10MB)</span>
                        </>
                    )}
                    
                    <input 
                        type="file" 
                        className="hidden" 
                        onChange={handleUpload} 
                        accept="image/*,application/pdf" // Filtra na janela de seleção
                        disabled={uploading} 
                    />
                </label>
            </div>

            {/* --- LISTA DE ARQUIVOS --- */}
            <div className="space-y-3">
                {loading && <div className="text-center py-4"><Loader2 className="animate-spin mx-auto text-gray-400"/></div>}
                
                {!loading && artes.length === 0 && (
                    <p className="text-sm text-center text-gray-400 italic">Nenhuma arte anexada a este pedido.</p>
                )}

                {artes.map((arte) => (
                    <div key={arte.ID_ARQUIVO} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4 overflow-hidden">
                            {/* Preview: Se for imagem mostra miniatura, se não mostra ícone */}
                            <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center shrink-0 border border-gray-200 overflow-hidden">
                                {arte.TIPO_ARQUIVO && arte.TIPO_ARQUIVO.startsWith('image/') ? (
                                    <img src={arte.URL_ARQUIVO} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <FileText className="text-gray-400 w-6 h-6" />
                                )}
                            </div>
                            
                            <div className="min-w-0 flex flex-col">
                                <span className="text-sm font-semibold text-gray-700 truncate max-w-[200px]" title={arte.NOME_ARQUIVO}>
                                    {arte.NOME_ARQUIVO}
                                </span>
                                <a 
                                    href={arte.URL_ARQUIVO} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-xs text-avivar-tiffany hover:underline flex items-center gap-1 mt-0.5"
                                >
                                    <Eye size={12} /> Visualizar / Baixar
                                </a>
                            </div>
                        </div>

                        <button 
                            onClick={() => handleDeletar(arte.ID_ARQUIVO)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                            title="Excluir arte permanentemente"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}