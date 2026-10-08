import React, { useState, useEffect } from 'react';
import {
  X,
  Cloud,
  CloudCheck,
  CloudOff,
  RefreshCw,
  Smartphone,
  Monitor,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Save,
  Trash2,
  ShieldCheck,
  ArrowRight,
  Wifi,
  WifiOff,
} from 'lucide-react';
import {
  FirebaseClientConfig,
  getStoredFirebaseConfig,
  saveStoredFirebaseConfig,
  clearStoredFirebaseConfig,
  initializeFirebase,
} from '../services/firebaseConfig';
import { SyncService, SyncStatus } from '../services/syncService';

interface NuvemSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncCompleted?: () => void;
}

export const NuvemSyncModal: React.FC<NuvemSyncModalProps> = ({
  isOpen,
  onClose,
  onSyncCompleted,
}) => {
  const [activeTab, setActiveTab] = useState<'status' | 'config' | 'pwa' | 'desktop'>('status');
  const [status, setStatus] = useState<SyncStatus>('not_configured');
  const [isUploading, setIsUploading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Form State
  const [apiKey, setApiKey] = useState('');
  const [authDomain, setAuthDomain] = useState('');
  const [projectId, setProjectId] = useState('');
  const [storageBucket, setStorageBucket] = useState('');
  const [appId, setAppId] = useState('');

  useEffect(() => {
    if (isOpen) {
      const cfg = getStoredFirebaseConfig();
      if (cfg) {
        setApiKey(cfg.apiKey || '');
        setAuthDomain(cfg.authDomain || '');
        setProjectId(cfg.projectId || '');
        setStorageBucket(cfg.storageBucket || '');
        setAppId(cfg.appId || '');
      }
      setStatus(SyncService.getStatus());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId.trim() || !apiKey.trim()) {
      setFeedbackMsg({
        type: 'error',
        text: 'Por favor, preencha ao menos o Project ID e a API Key do seu projeto Firebase.',
      });
      return;
    }

    const newConfig: FirebaseClientConfig = {
      apiKey: apiKey.trim(),
      authDomain: authDomain.trim() || `${projectId.trim()}.firebaseapp.com`,
      projectId: projectId.trim(),
      storageBucket: storageBucket.trim() || `${projectId.trim()}.appspot.com`,
      appId: appId.trim(),
    };

    saveStoredFirebaseConfig(newConfig);
    const { isReady } = initializeFirebase();

    if (isReady) {
      setFeedbackMsg({
        type: 'success',
        text: 'Configuração salva! Conexão com Firebase Firestore estabelecida com sucesso.',
      });
      setStatus(navigator.onLine ? 'online' : 'offline_cache');
      if (onSyncCompleted) {
        SyncService.startRealtimeSync(onSyncCompleted);
      }
    } else {
      setFeedbackMsg({
        type: 'error',
        text: 'Configuração salva, mas as credenciais parecem incompletas. Verifique a API Key e Project ID.',
      });
    }
  };

  const handleClearConfig = () => {
    if (window.confirm('Deseja desconectar o Firebase? Seus dados locais serão mantidos intactos no dispositivo.')) {
      clearStoredFirebaseConfig();
      SyncService.stopRealtimeSync();
      setApiKey('');
      setAuthDomain('');
      setProjectId('');
      setStorageBucket('');
      setAppId('');
      setStatus('not_configured');
      setFeedbackMsg({
        type: 'info',
        text: 'Firebase desconectado. O sistema continua operando em modo local no navegador.',
      });
    }
  };

  const handleUploadLocalData = async () => {
    setIsUploading(true);
    setFeedbackMsg(null);
    const result = await SyncService.uploadLocalDataToCloud();
    setIsUploading(false);
    setFeedbackMsg({
      type: result.success ? 'success' : 'error',
      text: result.message,
    });
    if (result.success && onSyncCompleted) {
      onSyncCompleted();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-2xl w-full max-h-[92vh] sm:max-h-[88vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden my-auto sm:my-8 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 p-4 sm:p-5 shrink-0 bg-white">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-recreio-espresso-950 text-recreio-gold-400 flex items-center justify-center shadow-md">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-stone-900 font-playfair">
                Sincronização & Nuvem (Multi-Dispositivos)
              </h3>
              <p className="text-[11px] text-stone-500">
                Firebase Firestore • iPhone (PWA) • Computador (.exe Tauri)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1.5 rounded-xl hover:bg-stone-100 min-h-[38px] min-w-[38px] flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-tabs */}
        <div className="flex border-b border-stone-200 bg-stone-50/80 px-4 pt-2 gap-1 overflow-x-auto no-scrollbar text-xs font-bold">
          <button
            onClick={() => setActiveTab('pwa')}
            className={`px-3 py-2 rounded-t-xl transition-all flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'pwa'
                ? 'bg-white text-stone-900 border-t border-x border-stone-200 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-blue-600" />
            <span>📱 Conectar iPhone (QR Code)</span>
          </button>
          <button
            onClick={() => setActiveTab('status')}
            className={`px-3 py-2 rounded-t-xl transition-all flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'status'
                ? 'bg-white text-stone-900 border-t border-x border-stone-200 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5 text-folha-600" />
            <span>Status da Sincronização</span>
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`px-3 py-2 rounded-t-xl transition-all flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'config'
                ? 'bg-white text-stone-900 border-t border-x border-stone-200 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Cloud className="w-3.5 h-3.5 text-recreio-gold-600" />
            <span>Configurações Nuvem</span>
          </button>
          <button
            onClick={() => setActiveTab('desktop')}
            className={`px-3 py-2 rounded-t-xl transition-all flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'desktop'
                ? 'bg-white text-stone-900 border-t border-x border-stone-200 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Monitor className="w-3.5 h-3.5 text-purple-600" />
            <span>Computador (.exe)</span>
          </button>
        </div>

        {/* Feedback message toast */}
        {feedbackMsg && (
          <div
            className={`mx-4 mt-3 p-3 rounded-xl text-xs flex items-center space-x-2 border ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : feedbackMsg.type === 'error'
                ? 'bg-rose-50 text-rose-900 border-rose-200'
                : 'bg-stone-100 text-stone-800 border-stone-200'
            }`}
          >
            {feedbackMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : feedbackMsg.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            ) : (
              <HelpCircle className="w-4 h-4 text-stone-600 shrink-0" />
            )}
            <span className="flex-1">{feedbackMsg.text}</span>
          </div>
        )}

        {/* Tab 1: Status & Architecture */}
        {activeTab === 'status' && (
          <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs touch-scroll">
            {/* Live Connection Card */}
            <div className="bg-[#fcfaf6] rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                  Estado da Conexão Nuvem
                </span>
                {status === 'online' ? (
                  <span className="inline-flex items-center space-x-1.5 bg-emerald-100 text-emerald-900 px-2.5 py-1 rounded-full font-extrabold text-[11px]">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Nuvem Conectada (Tempo Real)</span>
                  </span>
                ) : status === 'offline_cache' ? (
                  <span className="inline-flex items-center space-x-1.5 bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full font-extrabold text-[11px]">
                    <WifiOff className="w-3 h-3 text-amber-700" />
                    <span>Modo Campo (Cache Offline Ativo)</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1.5 bg-stone-100 text-stone-700 px-2.5 py-1 rounded-full font-bold text-[11px]">
                    <CloudOff className="w-3 h-3 text-stone-500" />
                    <span>Armazenamento Local (Desconectado)</span>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="bg-white p-3 rounded-xl border border-stone-200">
                  <div className="flex items-center space-x-2 text-stone-800 font-bold mb-1">
                    <Wifi className="w-4 h-4 text-folha-600" />
                    <span>Rede do Aparelho:</span>
                  </div>
                  <span className="text-stone-600">
                    {navigator.onLine ? '🟢 Conexão com a Internet ativa' : '🔴 Sem sinal de internet no momento'}
                  </span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-stone-200">
                  <div className="flex items-center space-x-2 text-stone-800 font-bold mb-1">
                    <ShieldCheck className="w-4 h-4 text-recreio-gold-600" />
                    <span>Cache no Campo:</span>
                  </div>
                  <span className="text-stone-600">
                    Habilitado (IndexedDB persistente seguro)
                  </span>
                </div>
              </div>
            </div>

            {/* Architecture Architecture Diagram */}
            <div className="bg-recreio-espresso-950 text-white p-4 sm:p-5 rounded-2xl shadow-inner space-y-3">
              <span className="text-[10px] uppercase font-bold text-recreio-gold-400 tracking-wider">
                Topologia da Solução
              </span>
              <div className="flex flex-col items-center space-y-2 text-center text-xs font-mono">
                <div className="bg-stone-800 border border-recreio-gold-500/40 px-4 py-2 rounded-xl text-recreio-gold-300 font-bold">
                  ☁️ Nuvem: Firebase Firestore & Auth
                  <div className="text-[10px] text-stone-400 font-normal">
                    Sync Bidirecional em Tempo Real + Cache Offline
                  </div>
                </div>
                <div className="text-recreio-gold-500 text-sm">⇅ Sincronização Automática ⇅</div>
                <div className="grid grid-cols-2 gap-3 w-full">
                  <div className="bg-stone-900/90 border border-stone-700 p-2.5 rounded-xl">
                    <div className="font-bold text-white flex items-center justify-center space-x-1">
                      <Monitor className="w-3.5 h-3.5 text-purple-400" />
                      <span>Computador</span>
                    </div>
                    <div className="text-[10px] text-stone-400">App .exe via Tauri v2</div>
                  </div>
                  <div className="bg-stone-900/90 border border-stone-700 p-2.5 rounded-xl">
                    <div className="font-bold text-white flex items-center justify-center space-x-1">
                      <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                      <span>iPhone (iOS)</span>
                    </div>
                    <div className="text-[10px] text-stone-400">PWA em Tela Cheia (Safari)</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-1">
              <button
                onClick={handleUploadLocalData}
                disabled={isUploading}
                className="w-full inline-flex items-center justify-center space-x-2 bg-recreio-gold-700 hover:bg-recreio-gold-800 disabled:opacity-50 text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition-all min-h-[44px]"
              >
                <RefreshCw className={`w-4 h-4 ${isUploading ? 'animate-spin' : ''}`} />
                <span>
                  {isUploading
                    ? 'Sincronizando com a Nuvem...'
                    : 'Enviar / Sincronizar Todos os Dados Locais para a Nuvem'}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Firebase Configuration Form */}
        {activeTab === 'config' && (
          <form onSubmit={handleSaveConfig} className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs touch-scroll">
            <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-amber-900 space-y-1">
              <span className="font-bold block">Como conectar seu Firebase:</span>
              <p className="text-[11px] leading-relaxed">
                Crie um projeto gratuito no <strong>Firebase Console</strong> (firebase.google.com), ative o <strong>Firestore Database</strong> no modo de teste ou produção e o <strong>Authentication</strong> (Anônimo ou Email). Em seguida, cole as chaves do seu Web App abaixo:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Project ID *</label>
                <input
                  type="text"
                  required
                  placeholder="ex: recreio-do-morro-gestao"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full border border-stone-300 rounded-xl px-3 py-2 bg-stone-50 font-mono min-h-[40px]"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">API Key *</label>
                <input
                  type="text"
                  required
                  placeholder="AIzaSy..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full border border-stone-300 rounded-xl px-3 py-2 bg-stone-50 font-mono min-h-[40px]"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Auth Domain</label>
                <input
                  type="text"
                  placeholder="ex: recreio-do-morro.firebaseapp.com"
                  value={authDomain}
                  onChange={(e) => setAuthDomain(e.target.value)}
                  className="w-full border border-stone-300 rounded-xl px-3 py-2 bg-stone-50 font-mono min-h-[40px]"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">App ID</label>
                <input
                  type="text"
                  placeholder="1:123456789:web:abcdef..."
                  value={appId}
                  onChange={(e) => setAppId(e.target.value)}
                  className="w-full border border-stone-300 rounded-xl px-3 py-2 bg-stone-50 font-mono min-h-[40px]"
                />
              </div>
            </div>

            <div className="pt-3 flex flex-wrap gap-2 justify-between">
              <button
                type="submit"
                className="inline-flex items-center space-x-1.5 bg-folha-800 hover:bg-folha-900 text-white font-bold px-4 py-2.5 rounded-xl shadow-md min-h-[42px]"
              >
                <Save className="w-4 h-4" />
                <span>Salvar & Conectar Nuvem</span>
              </button>

              <button
                type="button"
                onClick={handleClearConfig}
                className="inline-flex items-center space-x-1.5 bg-stone-100 hover:bg-stone-200 text-rose-700 font-bold px-3.5 py-2.5 rounded-xl border border-stone-300 min-h-[42px]"
              >
                <Trash2 className="w-4 h-4" />
                <span>Desconectar</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: iPhone PWA Instructions */}
        {activeTab === 'pwa' && (
          <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs touch-scroll">
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-2 text-blue-950">
              <div className="flex items-center space-x-2 font-bold text-sm text-blue-900">
                <Smartphone className="w-4 h-4" />
                <span>Conexão Imediata do iPhone • Aponte a Câmera</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                A sincronização entre o Computador e o iPhone é <strong>100% automática</strong>. Qualquer lançamento feito em qualquer um dos dois aparelhos é sincronizado assim que a internet for detectada. No meio da lavoura sem sinal, o cache salva tudo e envia sozinho quando o sinal voltar.
              </p>
            </div>

            {/* QR Code Card */}
            <div className="bg-white border-2 border-dashed border-recreio-gold-300 rounded-2xl p-4 text-center space-y-3 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block">
                Escaneie com a Câmera do seu iPhone:
              </span>
              <div className="inline-block p-2 bg-white rounded-2xl border border-stone-200 shadow-md">
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https%3A%2F%2Furnaricardo55777.web.app"
                  alt="QR Code para Acesso no iPhone"
                  className="w-44 h-44 rounded-xl object-contain mx-auto"
                />
              </div>
              <div className="space-y-1">
                <div className="text-[11px] font-mono text-stone-700 bg-stone-100 py-1.5 px-3 rounded-lg inline-block border border-stone-200 select-all">
                  https://urnaricardo55777.web.app
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText('https://urnaricardo55777.web.app');
                      alert('Link copiado para a área de transferência!');
                    }}
                    className="text-xs font-bold text-recreio-gold-700 hover:text-recreio-gold-800 underline ml-2"
                  >
                    Copiar Link
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-2.5 pt-1">
              <h4 className="font-bold text-stone-900">Como deixar em Tela Cheia no iPhone (2 toques):</h4>
              <div className="flex items-start space-x-3 bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                  1
                </div>
                <div>
                  <strong className="block text-stone-900">Aponte a Câmera</strong>
                  <p className="text-stone-500 text-[11px]">
                    Abra a câmera do iPhone, aponte para o QR Code acima e toque no link amarelo para abrir no Safari.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                  2
                </div>
                <div>
                  <strong className="block text-stone-900">Compartilhar &gt; Adicionar à Tela de Início</strong>
                  <p className="text-stone-500 text-[11px]">
                    No Safari, toque no ícone de <strong>Compartilhar</strong> (quadrado com seta ⎋) e selecione <strong>"Adicionar à Tela de Início"</strong> (+).
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-[11px] flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span><strong>Conexão Pronta:</strong> Os dados do computador e do iPhone já utilizam o mesmo banco na nuvem e sincronizam sozinhos!</span>
            </div>
          </div>
        )}

        {/* Tab 4: Desktop (.exe Tauri) Instructions */}
        {activeTab === 'desktop' && (
          <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs touch-scroll">
            <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 space-y-2 text-purple-950">
              <div className="flex items-center space-x-2 font-bold text-sm text-purple-900">
                <Monitor className="w-4 h-4" />
                <span>Aplicativo .exe para Windows (via Tauri v2)</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Tauri v2 empacota o sistema em um executável nativo do Windows (.exe) ultraleve (menos de 15MB) que consome pouca memória RAM e utiliza o motor WebView2 nativo do sistema operacional.
              </p>
            </div>

            <div className="space-y-2.5">
              <h4 className="font-bold text-stone-900">Opções para rodar no Computador:</h4>
              <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 space-y-1">
                <strong className="text-stone-900 block">Opção A: Executar Rápido (.bat)</strong>
                <p className="text-stone-500 text-[11px]">
                  Dê um duplo clique no arquivo <code>iniciar_sistema.bat</code> incluído na raiz do projeto para iniciar imediatamente no seu PC.
                </p>
              </div>

              <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 space-y-1">
                <strong className="text-stone-900 block">Opção B: Compilar o .exe nativo com Tauri v2</strong>
                <p className="text-stone-500 text-[11px]">
                  Com o Rust instalado, basta executar no terminal:
                </p>
                <pre className="bg-stone-900 text-stone-100 p-2 rounded-lg font-mono text-[11px]">
                  npm run tauri:build
                </pre>
                <p className="text-stone-500 text-[11px]">
                  O instalador executável será gerado em <code>src-tauri/target/release/bundle/msi/</code>.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-stone-100 bg-stone-50 flex items-center justify-between">
          <div className="text-[11px] text-stone-500">
            Fazenda Recreio do Morro • Nuvem & Multi-Plataforma
          </div>
          <button
            onClick={onClose}
            className="bg-stone-800 hover:bg-stone-900 text-white font-bold text-xs px-4 py-2 rounded-xl"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
