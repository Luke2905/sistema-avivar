// src/config/menuItems.tsx
import { 
  LayoutDashboard, ShoppingCart, Package, Boxes, ShoppingBag, 
  BarChart3, BrainCircuit, ScanBarcode, Printer, Palette, DollarSign, Users, HandCoins
} from 'lucide-react';

// USE SEM ACENTOS AQUI
export type UserRole = 'ADMIN' | 'PRODUCAO' | 'ARTES' | 'FINANCEIRO';

export interface MenuItem {
  label: string;
  path: string;
  icon: any;
  roles: UserRole[];
  section?: string;
}

export const MENU_ITEMS: MenuItem[] = [
  { 
    section: 'Operacional',
    label: 'Kanban', 
    path: '/dashboard', 
    icon: LayoutDashboard, 
    roles: ['ADMIN', 'PRODUCAO', 'ARTES', 'FINANCEIRO'] 
  },
  // { 
  //   label: 'Terminal (Bipe)', 
  //   path: '/scanner', 
  //   icon: ScanBarcode, 
  //   roles: ['ADMIN', 'PRODUCAO'] 
  // },
  // { 
  //   label: 'Central de OPs', 
  //   path: '/pcp', 
  //   icon: Printer, 
  //   roles: ['ADMIN', 'PRODUCAO'] 
  // },
  // { 
  //   section: 'Criação',
  //   label: 'Arquivos de Arte', 
  //   path: '/artes', 
  //   icon: Palette, 
  //   roles: ['ADMIN', 'ARTES'] 
  // },
  { 
    section: 'Gestão',
    label: 'Pedidos', 
    path: '/pedidos-lista', 
    icon: ShoppingCart, 
    roles: ['ADMIN', 'FINANCEIRO', 'ARTES'] 
  },
  { 
    label: 'Produtos', 
    path: '/produtos', 
    icon: Package, 
    roles: ['ADMIN', 'FINANCEIRO'] 
  },
  { 
    label: 'Estoque', 
    path: '/estoque', 
    icon: Boxes, 
    roles: ['ADMIN', 'FINANCEIRO', 'PRODUCAO'] 
  },
  { 
    label: 'Compras', 
    path: '/compras', 
    icon: ShoppingBag, 
    roles: ['ADMIN', 'FINANCEIRO'] 
  },
    { 
    label: 'Despesas', 
    path: '/despesa', 
    icon: HandCoins, 
    roles: ['ADMIN', 'FINANCEIRO'] 
  },
  { 
    section: 'Estratégia',
    label: 'Financeiro', 
    path: '/financeiro', 
    icon: DollarSign, 
    roles: ['ADMIN', 'FINANCEIRO'] 
  },
  { 
    label: 'Previsões IA', 
    path: '/ia', 
    icon: BrainCircuit, 
    roles: ['ADMIN', 'FINANCEIRO'] 
  },
  { 
  section: 'Configurações',
  label: 'Usuários', 
  path: '/usuarios', 
  icon: Users, // Importe o icone Users do lucide-react
  roles: ['ADMIN'] 
},
];