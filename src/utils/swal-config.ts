// src/utils/swal-config.ts
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

// Cores da marca 
const COLORS = {
  tiffany: '#0ABAB5',
  pink: '#FF69B4',
  danger: '#ef4444', // Vermelho para erros
};

// Configuração padrão para Alertas de Sucesso/Erro
export const showAlert = (title: string, text: string, icon: 'success' | 'error' | 'warning') => {
  return MySwal.fire({
    title: title,
    text: text,
    icon: icon,
    confirmButtonColor: COLORS.tiffany, // Botão principal na cor da marca
    cancelButtonColor: COLORS.pink,
    confirmButtonText: 'Entendido',
    backdrop: `rgba(10, 186, 181, 0.1)` // Um fundo tiffany bem clarinho
  });
};

// Configuração para "Toasts" (Aquelas notificações rápidas no canto que somem sozinhas)
// Perfeito para avisar "Login realizado" sem travar a tela
export const showToast = (title: string, icon: 'success' | 'error' = 'success') => {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
  });

  Toast.fire({
    icon: icon,
    title: title
  });
};

export default MySwal;