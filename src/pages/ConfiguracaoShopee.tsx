import { useEffect, useState } from 'react';
import {
  ShoppingBag,
  Settings,
  Zap,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Save,
  Eye,
  EyeOff,
  Loader2,
  Info,
  PackageSearch
} from 'lucide-react';
import api from '../services/api';
import { showToast } from '../utils/swal-config';

interface ShopeeStatus {
  integracaoAtiva: boolean;
  configurada: boolean;
  temToken: boolean;
  ultimaSincronizacao: string | null;
  totalPedidosShopee: number;
  shopeeHost: string;
  redirectUrl: string;
  partnerId: string;
  shopId: string;
  partnerKeyConfigurada: boolean;
  accessTokenConfigurado: boolean;
}

export default function ConfiguracaoShopee() {
  const [status, setStatus] = useState<ShopeeStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [sincronizando, setSincronizando] = useState(false);
  const [sincronizandoProdutos, setSincronizandoProdutos] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [showKey, setShowKey] = useState(false);

  const [form, setForm] = useState({
    partner_id: '',
    partner_key: '',
    shop_id: '',
    shopee_host: 'https://partner.shopeemobile.com',
    redirect_url: 'http://localhost:3000/api/shopee/callback',
    integracao_ativa: false,
    dias_sync: '15'
  });

  useEffect(() => { carregarStatus(); }, []);

  async function carregarStatus() {
    try {
      setLoading(true);
      const res = await api.get('/shopee/status');
      setStatus(res.data);
      setForm(prev => ({
        ...prev,
        partner_id: res.data.partnerId || '',
        shop_id: res.data.shopId || '',
        shopee_host: res.data.shopeeHost || 'https://partner.shopeemobile.com',
        redirect_url: res.data.redirectUrl || 'http://localhost:3000/api/shopee/callback',
        integracao_ativa: res.data.integracaoAtiva || false,
      }));
    } catch (error) {
      showToast('Erro ao carregar status da Shopee', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function salvarConfig(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSalvando(true);
      await api.post('/shopee/config', {
        partner_id: form.partner_id,
        partner_key: form.partner_key || undefined, // Só envia se preenchido
        shop_id: form.shop_id,
        shopee_host: form.shopee_host,
        redirect_url: form.redirect_url,
        integracao_ativa: form.integracao_ativa
      });
      showToast('Configurações salvas!', 'success');
      setForm(prev => ({ ...prev, partner_key: '' })); // Limpa a chave após salvar
      carregarStatus();
    } catch (error: any) {
      showToast(error?.response?.data?.mensagem || 'Erro ao salvar', 'error');
    } finally {
      setSalvando(false);
    }
  }

  async function abrirAutorizacao() {
    try {
      const res = await api.get('/shopee/autorizar');
      window.open(res.data.url, '_blank', 'width=800,height=600');
      showToast('Janela de autorização aberta! Após concluir, atualize o status.', 'info');
    } catch (error: any) {
      showToast(error?.response?.data?.mensagem || 'Erro ao gerar link de autorização', 'error');
    }
  }

  async function sincronizar() {
    try {
      setSincronizando(true);
      const res = await api.post('/shopee/sincronizar', { dias: Number(form.dias_sync) });
      showToast(`✅ ${res.data.mensagem} — ${res.data.criados} novos, ${res.data.ignorados} já existiam.`, 'success');
      carregarStatus();
    } catch (error: any) {
      const msg = error?.response?.data?.mensagem || 'Erro ao sincronizar';
      showToast(msg, 'error');
    } finally {
      setSincronizando(false);
    }
  }

  async function sincronizarProdutos() {
    try {
      setSincronizandoProdutos(true);
      const res = await api.post('/shopee/sincronizar-produtos');
      showToast(`✅ ${res.data.mensagem} — ${res.data.criados} novos, ${res.data.ignorados} já existiam.`, 'success');
    } catch (error: any) {
      const msg = error?.response?.data?.mensagem || 'Erro ao sincronizar catálogo';
      showToast(msg, 'error');
    } finally {
      setSincronizandoProdutos(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="animate-spin text-avivar-tiffany" size={40} />
      </div>
    );
  }

  const isReady = status?.configurada && status?.temToken;

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* Header */}
        <header className="flex items-center gap-4 bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center">
            <ShoppingBag className="text-orange-500" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Integração Shopee</h1>
            <p className="text-sm text-gray-500">Configure a conexão com sua loja Shopee para importação automática de pedidos</p>
          </div>
          <div className="ml-auto">
            {isReady ? (
              <span className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 font-bold rounded-full text-sm border border-green-200">
                <CheckCircle size={16} /> Integração Pronta
              </span>
            ) : status?.configurada ? (
              <span className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 font-bold rounded-full text-sm border border-amber-200">
                <AlertTriangle size={16} /> Aguardando Autorização
              </span>
            ) : (
              <span className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-500 font-bold rounded-full text-sm border border-gray-200">
                <XCircle size={16} /> Não Configurada
              </span>
            )}
          </div>
        </header>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-400 uppercase font-bold mb-1">Status</p>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${form.integracao_ativa ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
              <span className="font-bold text-gray-700">{form.integracao_ativa ? 'Ativa' : 'Inativa'}</span>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-400 uppercase font-bold mb-1">Pedidos Importados</p>
            <p className="text-2xl font-bold text-orange-500">{status?.totalPedidosShopee || 0}</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-400 uppercase font-bold mb-1">Última Sincronização</p>
            <p className="font-bold text-gray-700">
              {status?.ultimaSincronizacao
                ? new Date(status.ultimaSincronizacao).toLocaleString('pt-BR')
                : 'Nunca realizada'}
            </p>
          </div>
        </div>

        {/* Seção Sincronização */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2 text-lg">
            <Zap className="text-orange-500" size={20} /> Sincronização de Dados
          </h3>

          {!isReady && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4 flex gap-3">
              <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={18} />
              <div>
                <p className="text-sm font-bold text-amber-700">Integração não autorizada</p>
                <p className="text-xs text-amber-600 mt-1">Configure as credenciais e clique em "Autorizar Loja" antes de sincronizar.</p>
              </div>
            </div>
          )}

          <div className="flex flex-col md:flex-row md:items-end gap-6 mt-4">
            
            {/* Sincronizar Pedidos */}
            <div className="flex-1 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <ShoppingBag size={16} className="text-orange-500" /> Pedidos
                </h4>
                <div className="flex flex-wrap items-end gap-4">
                    <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Buscar dos últimos</label>
                    <div className="flex items-center gap-2">
                        <input
                        type="number"
                        min={1}
                        max={15}
                        value={form.dias_sync}
                        onChange={e => setForm({ ...form, dias_sync: e.target.value })}
                        className="w-20 border p-2 rounded-lg outline-none focus:border-orange-400 text-center font-bold"
                        />
                        <span className="text-gray-500 font-medium">dias</span>
                    </div>
                    </div>
                    <button
                    onClick={sincronizar}
                    disabled={sincronizando || !isReady}
                    className="px-6 py-2 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-colors shadow flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                    {sincronizando ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                    {sincronizando ? 'Sincronizando...' : 'Sincronizar Pedidos'}
                    </button>
                </div>
            </div>

            {/* Sincronizar Catálogo */}
            <div className="flex-1 bg-gray-50 p-4 rounded-lg border border-gray-200">
                 <h4 className="font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <PackageSearch size={16} className="text-orange-500" /> Catálogo de Produtos
                </h4>
                <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                    Importa SKUs e nomes de produtos cadastrados na Shopee para o sistema Avivar (sem duplicar os existentes).
                </p>
                <button
                    onClick={sincronizarProdutos}
                    disabled={sincronizandoProdutos || !isReady}
                    className="px-6 py-2 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-900 transition-colors shadow flex items-center justify-center gap-2 w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {sincronizandoProdutos ? <Loader2 size={18} className="animate-spin" /> : <PackageSearch size={18} />}
                    {sincronizandoProdutos ? 'Buscando Produtos...' : 'Sincronizar SKUs da Shopee'}
                </button>
            </div>
            
          </div>
        </div>

        {/* Formulário de Configuração */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-700 mb-6 flex items-center gap-2 text-lg">
            <Settings className="text-gray-500" size={20} /> Credenciais da API Shopee
          </h3>

          <form onSubmit={salvarConfig} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Partner ID *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 123456"
                  value={form.partner_id}
                  onChange={e => setForm({ ...form, partner_id: e.target.value })}
                  className="w-full border p-2.5 rounded-lg outline-none focus:border-orange-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Partner Key {status?.partnerKeyConfigurada && <span className="text-green-600 normal-case font-normal">(já configurada)</span>}
                </label>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    placeholder={status?.partnerKeyConfigurada ? '••••••••• (deixe vazio para manter)' : 'Cole a chave da API aqui'}
                    value={form.partner_key}
                    onChange={e => setForm({ ...form, partner_key: e.target.value })}
                    className="w-full border p-2.5 rounded-lg outline-none focus:border-orange-400 pr-10"
                  />
                  <button type="button" onClick={() => setShowKey(!showKey)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                    {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Shop ID {status?.accessTokenConfigurado && <span className="text-green-600 normal-case font-normal">(com token ativo)</span>}</label>
                <input
                  type="text"
                  placeholder="Preenchido automaticamente após autorização"
                  value={form.shop_id}
                  onChange={e => setForm({ ...form, shop_id: e.target.value })}
                  className="w-full border p-2.5 rounded-lg outline-none focus:border-orange-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ambiente</label>
                <select
                  value={form.shopee_host}
                  onChange={e => setForm({ ...form, shopee_host: e.target.value })}
                  className="w-full border p-2.5 rounded-lg outline-none focus:border-orange-400 bg-white"
                >
                  <option value="https://partner.shopeemobile.com">Produção</option>
                  <option value="https://partner.test-stable.shopeemobile.com">Teste (Sandbox)</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">URL de Callback (Redirect)</label>
                <input
                  type="url"
                  value={form.redirect_url}
                  onChange={e => setForm({ ...form, redirect_url: e.target.value })}
                  className="w-full border p-2.5 rounded-lg outline-none focus:border-orange-400 font-mono text-sm"
                />
                <p className="text-[10px] text-gray-400 mt-1">Esta URL deve ser registrada no Painel de Parceiros da Shopee.</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border">
              <input
                type="checkbox"
                id="integracao_ativa"
                checked={form.integracao_ativa}
                onChange={e => setForm({ ...form, integracao_ativa: e.target.checked })}
                className="w-5 h-5 text-orange-500 rounded"
              />
              <label htmlFor="integracao_ativa" className="cursor-pointer">
                <p className="font-bold text-gray-700">Ativar Integração Shopee</p>
                <p className="text-xs text-gray-400">Quando ativo, permite sincronizar pedidos da Shopee para o sistema.</p>
              </label>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button type="submit" disabled={salvando} className="px-6 py-2 bg-gray-800 text-white font-bold rounded-lg hover:bg-black transition-colors shadow flex items-center gap-2 disabled:opacity-50">
                {salvando ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Salvar Configurações
              </button>

              <button
                type="button"
                onClick={abrirAutorizacao}
                disabled={!form.partner_id}
                className="px-6 py-2 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-colors shadow flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ExternalLink size={16} /> Autorizar Loja na Shopee
              </button>
            </div>
          </form>
        </div>

        {/* Guia de Ajuda */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-bold text-blue-800 mb-4 flex items-center gap-2">
            <Info size={18} /> Como configurar a integração
          </h3>
          <ol className="space-y-3 text-sm text-blue-700">
            <li className="flex gap-3">
              <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</span>
              <p>Acesse o <strong>Painel de Parceiros da Shopee</strong> em <a href="https://partner.shopeemobile.com" target="_blank" rel="noopener" className="underline">partner.shopeemobile.com</a> e crie um App.</p>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</span>
              <p>Copie o <strong>Partner ID</strong> e a <strong>Partner Key</strong> do seu App e cole nos campos acima.</p>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</span>
              <p>Registre a <strong>URL de Callback</strong> acima no seu App da Shopee (campo "Redirect URL").</p>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">4</span>
              <p><strong>Salve as configurações</strong> e clique em <strong>"Autorizar Loja"</strong> para concluir o OAuth2.</p>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">5</span>
              <p>Com a loja autorizada, <strong>ative a integração</strong> e clique em <strong>"Sincronizar Agora"</strong>!</p>
            </li>
          </ol>
        </div>

      </div>
    </div>
  );
}
