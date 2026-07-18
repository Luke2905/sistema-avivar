import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  DollarSign,
  BarChart3,
  X,
  Sparkles,
  Rocket,
  Shield,
  GitBranch,
  CheckCircle2,
  ChevronRight,
  Package,
  Boxes,
  ShoppingBag,
  Store,
  Zap
} from 'lucide-react';

const CHANGELOG = [
  {
    versao: 'v2.8 — Integração Shopee & Produtividade',
    data: 'Jul 2026',
    cor: 'from-orange-400 to-orange-600',
    icone: Store,
    items: [
      'Sincronização oficial bidirecional com API da Shopee (Dashboard de API e Histórico)',
      'Rotinas automáticas invisíveis (CRON) para importação de vendas e atualização de status',
      'Kanban: Destaque visual inteligente de quantidades e cores de alerta para Prazos de Envio',
      'Inserção manual de pedidos 100% remodelada com opção de Desconto (R$ ou %)'
    ]
  },
  {
    versao: 'v2.7 — Shopee SKUs e Produtividade',
    data: 'Jun 2026',
    cor: 'from-blue-500 to-blue-700',
    icone: Zap,
    items: [
      'Sincronização de catálogo e SKUs da Shopee direto para o sistema',
      'Novos filtros avançados na tela de Kanban/Dashboard',
      'Abertura de detalhes do pedido diretamente pelos cards do Kanban',
      'Alteração rápida de status diretamente na tabela de Pedidos'
    ]
  },
  {
    versao: 'v2.6 — Precificação e Estoque (Fechamento MVP)',
    data: 'Jun 2026',
    cor: 'from-pink-400 to-pink-600',
    icone: Sparkles,
    items: [
      'Simulador inteligente de preços na Ficha Técnica de Produtos',
      'Análise automática de margem de lucro real x margem desejada',
      'Sinalização visual (vermelha) para insumos abaixo do Estoque Mínimo',
      'Faixa de alerta global na Dashboard avisando sobre estoques críticos',
    ]
  },
  {
    versao: 'v2.5 — Integração Shopee',
    data: 'Abr 2025',
    cor: 'from-orange-400 to-orange-600',
    icone: Store,
    items: [
      'Tela de Configuração da Integração Shopee (somente ADMIN)',
      'Autorização OAuth2 com a API Shopee',
      'Sincronização manual de pedidos da Shopee para o banco',
      'Tabela CONFIGURACAO_SHOPEE para persistência segura das credenciais',
    ]
  },
  {
    versao: 'v2.4 — Fluxo de Caixa',
    data: 'Abr 2025',
    cor: 'from-teal-400 to-teal-600',
    icone: BarChart3,
    items: [
      'Tela de Fluxo de Caixa com 8 KPIs em tempo real',
      'Extrato de lançamentos (despesas + compras de matéria-prima)',
      'Toggle de pagamento diretamente na tabela de extrato',
      'Modal de nova despesa com categorias e status',
    ]
  },
  {
    versao: 'v2.3 — DRE Consolidado',
    data: 'Abr 2025',
    cor: 'from-indigo-400 to-indigo-600',
    icone: DollarSign,
    items: [
      'Painel de DRE com cálculo automático de margens',
      'Gráfico de evolução diária de faturamento',
      'Gráfico de distribuição de vendas por plataforma',
      'Modal de metas e custos mensais (ADS, máquinas, custos fixos)',
      'Exportação do DRE em Excel e PDF',
    ]
  },
  {
    versao: 'v2.2 — Exportação de Dados',
    data: 'Abr 2025',
    cor: 'from-green-400 to-green-600',
    icone: ShoppingCart,
    items: [
      'Exportação de pedidos em Excel (.xlsx)',
      'Exportação de pedidos em PDF formatado',
      'Exportação do DRE financeiro em Excel e PDF',
      'Dados financeiros ocultados na exportação para perfis restritos',
    ]
  },
  {
    versao: 'v2.1 — Segurança e Perfis (LGPD)',
    data: 'Abr 2025',
    cor: 'from-purple-400 to-purple-600',
    icone: Shield,
    items: [
      'Controle de acesso por perfil (ADMIN, PRODUCAO, ARTES, FINANCEIRO)',
      'Ocultação automática de dados financeiros para Produção e Artes',
      'Sistema de logs de auditoria (LOGS_SISTEMA)',
      'Registro automático de logins, criações e exclusões de pedidos',
    ]
  },
  {
    versao: 'v2.0 — Campos Operacionais',
    data: 'Abr 2025',
    cor: 'from-blue-400 to-blue-600',
    icone: Package,
    items: [
      'Campo Prazo de Envio nos pedidos com alerta visual no Kanban',
      'Campo Link de Arte (Google Drive) com acesso rápido no Kanban',
      'Badge de prazo em vermelho para pedidos com data próxima',
      'Ícone de link externo no card do Kanban',
    ]
  },
  {
    versao: 'v1.5 — Módulo de Compras e Estoque',
    data: 'Mar 2025',
    cor: 'from-amber-400 to-amber-600',
    icone: Boxes,
    items: [
      'Registro de compras de matéria-prima com atualização de estoque',
      'Histórico de compras com filtros por período',
      'Resumo e ranking de custos de insumos',
      'Movimentação automática de estoque (ENTRADA)',
    ]
  },
  {
    versao: 'v1.0 — MVP Inicial',
    data: 'Mar 2025',
    cor: 'from-gray-400 to-gray-600',
    icone: Rocket,
    items: [
      'Kanban com drag & drop de pedidos entre fases',
      'Cadastro de produtos com SKU e preço',
      'Ficha técnica de matéria-prima por produto',
      'Autenticação JWT com bcrypt',
      'API REST com Express + TypeScript',
      'Banco de dados MySQL com todas as tabelas do sistema',
    ]
  },
];

const ATALHOS = [
  { label: 'Kanban', sub: 'Gerenciar pedidos', path: '/dashboard', icon: LayoutDashboard, cor: 'from-avivar-tiffany to-teal-500', bg: 'bg-teal-50', text: 'text-avivar-tiffany' },
  { label: 'Pedidos', sub: 'Lista completa', path: '/pedidos-lista', icon: ShoppingCart, cor: 'from-blue-400 to-blue-600', bg: 'bg-blue-50', text: 'text-blue-500' },
  { label: 'DRE Financeiro', sub: 'Demonstrativo de resultado', path: '/financeiro', icon: DollarSign, cor: 'from-indigo-400 to-indigo-600', bg: 'bg-indigo-50', text: 'text-indigo-500' },
  { label: 'Fluxo de Caixa', sub: 'Entradas e saídas', path: '/fluxo-caixa', icon: BarChart3, cor: 'from-teal-400 to-teal-600', bg: 'bg-teal-50', text: 'text-teal-500' },
  { label: 'Produtos', sub: 'Catálogo e SKUs', path: '/produtos', icon: Package, cor: 'from-purple-400 to-purple-600', bg: 'bg-purple-50', text: 'text-purple-500' },
  { label: 'Estoque', sub: 'Matérias-primas', path: '/estoque', icon: Boxes, cor: 'from-amber-400 to-amber-600', bg: 'bg-amber-50', text: 'text-amber-500' },
  { label: 'Compras', sub: 'Histórico de compras', path: '/compras', icon: ShoppingBag, cor: 'from-green-400 to-green-600', bg: 'bg-green-50', text: 'text-green-500' },
  { label: 'Integração Shopee', sub: 'Configurações da API', path: '/configuracoes/shopee', icon: Store, cor: 'from-orange-400 to-orange-600', bg: 'bg-orange-50', text: 'text-orange-500' },
];

export default function Home() {
  const navigate = useNavigate();
  const [showChangelog, setShowChangelog] = useState(false);

  const usuarioSalvo = localStorage.getItem('avivar_user');
  const user = usuarioSalvo ? JSON.parse(usuarioSalvo) : { nome: 'Usuário', perfil: 'ADMIN' };
  const perfil = (user.perfil || '').toUpperCase();

  const hora = new Date().getHours();
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';

  // Filtra atalhos por perfil
  const atalhosFiltrados = ATALHOS.filter(a => {
    if (perfil === 'ADMIN') return true;
    if (perfil === 'FINANCEIRO') return ['/dashboard', '/pedidos-lista', '/financeiro', '/fluxo-caixa', '/produtos', '/estoque', '/compras'].includes(a.path);
    if (perfil === 'PRODUCAO') return ['/dashboard', '/estoque'].includes(a.path);
    if (perfil === 'ARTES') return ['/dashboard', '/pedidos-lista'].includes(a.path);
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden">
      <div className="flex-1 overflow-y-auto">

        {/* Hero Banner */}
        <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
          {/* Decoração de fundo */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-avivar-tiffany rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-avivar-pink rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
          </div>

          <div className="relative z-10 px-8 py-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <p className="text-gray-400 text-sm font-medium mb-1">{saudacao},</p>
              <h1 className="text-3xl font-bold text-white mb-2">
                {user.nome?.split(' ')[0] || 'Usuário'} 👋
              </h1>
              <p className="text-gray-400 max-w-md">
                Bem-vindo ao <span className="text-avivar-tiffany font-bold">AvivarSys</span> — seu sistema de gestão integrado.
                O que vamos fazer hoje?
              </p>
            </div>

            <button
              onClick={() => setShowChangelog(true)}
              className="flex items-center gap-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-5 py-3 rounded-xl transition-all hover:scale-105 shrink-0 backdrop-blur-sm"
            >
              <div className="w-8 h-8 bg-avivar-tiffany rounded-lg flex items-center justify-center">
                <Sparkles size={16} className="text-white" />
              </div>
              <div className="text-left">
                <p className="font-bold text-sm">Atualizações do Sistema</p>
                <p className="text-xs text-gray-300">Ver o que há de novo</p>
              </div>
              <GitBranch size={16} className="text-gray-400 ml-1" />
            </button>
          </div>
        </div>

        {/* Atalho principal — Kanban em destaque */}
        <div className="px-8 py-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full group bg-gradient-to-r from-avivar-tiffany to-teal-500 text-white rounded-2xl p-6 flex items-center justify-between hover:shadow-xl hover:shadow-teal-500/20 transition-all hover:-translate-y-0.5 shadow-lg"
          >
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <LayoutDashboard size={28} className="text-white" />
              </div>
              <div className="text-left">
                <h2 className="text-xl font-bold">Abrir Kanban de Pedidos</h2>
                <p className="text-teal-100 text-sm mt-0.5">Visualize e gerencie todos os pedidos por fase de produção</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-xl group-hover:bg-white/30 transition-colors">
              <span className="font-bold text-sm">Acessar</span>
              <ChevronRight size={18} />
            </div>
          </button>
        </div>

        {/* Grid de Atalhos */}
        <div className="px-8 pb-8">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Acesso Rápido</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {atalhosFiltrados.filter(a => a.path !== '/dashboard').map((atalho) => {
              const Icon = atalho.icon;
              return (
                <button
                  key={atalho.path}
                  onClick={() => navigate(atalho.path)}
                  className="group bg-white border border-gray-100 rounded-xl p-4 text-left hover:border-gray-200 hover:shadow-md transition-all hover:-translate-y-0.5 flex items-center gap-3"
                >
                  <div className={`w-10 h-10 ${atalho.bg} rounded-lg flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                    <Icon className={atalho.text} size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm leading-tight">{atalho.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5 leading-tight">{atalho.sub}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Modal de Changelog */}
      {showChangelog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-avivar-tiffany rounded-xl flex items-center justify-center">
                  <Sparkles size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg">Atualizações do Sistema</h2>
                  <p className="text-gray-400 text-xs">Histórico completo de versões — AvivarSys</p>
                </div>
              </div>
              <button
                onClick={() => setShowChangelog(false)}
                className="text-gray-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>

            {/* Lista de versões */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {CHANGELOG.map((versao, idx) => {
                const Icon = versao.icone;
                return (
                  <div key={idx} className="relative">
                    {/* Linha vertical */}
                    {idx < CHANGELOG.length - 1 && (
                      <div className="absolute left-5 top-12 w-0.5 h-[calc(100%+1.5rem)] bg-gray-100" />
                    )}

                    <div className="flex gap-4">
                      {/* Ícone da versão */}
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${versao.cor} flex items-center justify-center shrink-0 shadow-md`}>
                        <Icon size={18} className="text-white" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="font-bold text-gray-800 text-sm">{versao.versao}</h3>
                          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{versao.data}</span>
                          {idx === 0 && (
                            <span className="text-xs font-bold text-avivar-tiffany bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
                              Mais recente
                            </span>
                          )}
                        </div>
                        <ul className="space-y-1.5">
                          {versao.items.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                              <CheckCircle2 size={14} className="text-teal-500 shrink-0 mt-0.5" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 p-4 flex justify-between items-center bg-gray-50 shrink-0">
              <p className="text-xs text-gray-400">AvivarSys © 2025 — Todos os direitos reservados</p>
              <button
                onClick={() => setShowChangelog(false)}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-bold hover:bg-black transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
