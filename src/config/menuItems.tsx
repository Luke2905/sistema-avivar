// src/config/menuItems.tsx
import { 
  LayoutDashboard, ShoppingCart, Package, Boxes, ShoppingBag, 
  BrainCircuit, DollarSign, Users, HandCoins, Store, BarChart3, Home
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
    section: 'Principal',
    label: 'Home', 
    path: '/home', 
    icon: Home, 
    roles: ['ADMIN', 'PRODUCAO', 'ARTES', 'FINANCEIRO'] 
  },
  { 
    section: 'Operacional',
    label: 'Kanban', 
    path: '/dashboard', 
    icon: LayoutDashboard, 
    roles: ['ADMIN', 'PRODUCAO', 'ARTES', 'FINANCEIRO'] 
  },
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
    label: 'DRE Financeiro', 
    path: '/financeiro', 
    icon: DollarSign, 
    roles: ['ADMIN', 'FINANCEIRO'] 
  },
  { 
    label: 'Fluxo de Caixa', 
    path: '/fluxo-caixa', 
    icon: BarChart3, 
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
    icon: Users,
    roles: ['ADMIN'] 
  },
  { 
    label: 'Integração Shopee', 
    path: '/configuracoes/shopee', 
    icon: Store,
    roles: ['ADMIN'] 
  },
];
