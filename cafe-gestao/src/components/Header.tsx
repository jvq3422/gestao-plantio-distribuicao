import React from 'react';
import { Beaker, Calculator, History, Sprout, Printer, RotateCcw, Truck, Award, Cloud, WifiOff } from 'lucide-react';
import { SyncStatus } from '../services/syncService';

interface HeaderProps {
  ambiente: 'adubacao' | 'distribuicao';
  setAmbiente: (amb: 'adubacao' | 'distribuicao') => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onResetData: () => void;
  onPrint: () => void;
  onOpenNuvemModal?: () => void;
  syncStatus?: SyncStatus;
}

export const Header: React.FC<HeaderProps> = ({
  ambiente,
  setAmbiente,
  activeTab,
  setActiveTab,
  onResetData,
  onPrint,
  onOpenNuvemModal,
  syncStatus = 'not_configured',
}) => {
  // Nota: Aba de insights da comunidade removida conforme solicitação expressa
  const tabsAdubacao = [
    { id: 'calculadora', label: 'Cálculo de Adubação & Fórmulas', icon: Calculator },
    { id: 'talhoes', label: 'Talhões & Terroir (Chapada)', icon: Sprout },
    { id: 'analise', label: 'Laudo de Solo & Subsolo', icon: Beaker },
    { id: 'historico', label: 'Histórico & Safras Anteriores', icon: History },
  ];

  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-30 shadow-sm no-print">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Top Brand Bar */}
        <div className="flex items-center justify-between py-3 md:py-0 md:h-20 gap-2">
          {/* Logo & Brand Identity */}
          <div className="flex items-center space-x-2.5 sm:space-x-3.5 min-w-0">
            <div className="relative group shrink-0">
              <img
                src="/logo-recreio.jpg"
                alt="Recreio do Morro - Chapada Diamantina"
                className="h-10 w-10 sm:h-14 sm:w-14 object-cover rounded-full border-2 border-recreio-gold-500 shadow-md transition-transform group-hover:scale-105 bg-white"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>

            <div className="min-w-0 flex items-center">
              <img
                src="/logo-nome.png"
                alt="Recreio do Morro"
                className="h-8 sm:h-11 md:h-12 w-auto object-contain"
              />
            </div>
          </div>

          {/* Desktop Module Switcher (Lavoura vs Distribuição) */}
          <div className="hidden md:flex items-center bg-[#f5efe4] p-1.5 rounded-2xl border border-recreio-gold-200 shadow-inner">
            <button
              onClick={() => setAmbiente('adubacao')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                ambiente === 'adubacao'
                  ? 'bg-recreio-gold-700 text-white shadow-md'
                  : 'text-stone-700 hover:text-stone-900 hover:bg-white/60'
              }`}
            >
              <Sprout className="w-4 h-4" />
              <span>Gestão de Adubação</span>
            </button>
            <button
              onClick={() => setAmbiente('distribuicao')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                ambiente === 'distribuicao'
                  ? 'bg-recreio-espresso-950 text-white shadow-md'
                  : 'text-stone-700 hover:text-stone-900 hover:bg-white/60'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>Saídas & Receitas</span>
            </button>
          </div>

          {/* Quick Actions & Cloud Sync */}
          <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
            {onOpenNuvemModal && (
              <button
                onClick={onOpenNuvemModal}
                title="Sincronização em Tempo Real com a Nuvem e Cache Offline no Campo"
                className={`inline-flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-xl transition-all border min-h-[36px] ${
                  syncStatus === 'online'
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                    : syncStatus === 'offline_cache'
                    ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                {syncStatus === 'online' ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <Cloud className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="hidden sm:inline">Nuvem Sync</span>
                  </>
                ) : syncStatus === 'offline_cache' ? (
                  <>
                    <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                    <span className="hidden sm:inline">Modo Campo</span>
                  </>
                ) : (
                  <>
                    <Cloud className="w-3.5 h-3.5 text-stone-500" />
                    <span className="hidden sm:inline">Conectar Nuvem</span>
                  </>
                )}
              </button>
            )}

            {ambiente === 'adubacao' && (
              <button
                onClick={onPrint}
                title="Imprimir Ficha de Aplicação para o Campo"
                className="inline-flex items-center space-x-1 sm:space-x-1.5 px-2.5 py-1.5 text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 active:bg-stone-300 rounded-xl transition-colors border border-stone-200 min-h-[36px]"
              >
                <Printer className="w-3.5 h-3.5 text-stone-600" />
                <span className="hidden sm:inline">Imprimir Ficha</span>
              </button>
            )}
            <button
              onClick={onResetData}
              title="Zerar todos os dados e manter o sistema limpo"
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 text-xs font-semibold text-stone-500 hover:text-rose-700 hover:bg-rose-50 active:bg-rose-100 rounded-xl transition-colors min-h-[36px]"
            >
              <RotateCcw className="w-3 h-3 text-stone-400 hover:text-rose-600" />
              <span className="hidden xl:inline">Zerar Dados</span>
            </button>
          </div>
        </div>

        {/* Mobile Module Switcher (Full-width segmented control for thumb access) */}
        <div className="md:hidden pb-2.5 pt-1">
          <div className="grid grid-cols-2 gap-1.5 bg-[#f5efe4] p-1 rounded-2xl border border-recreio-gold-200 shadow-inner">
            <button
              onClick={() => setAmbiente('adubacao')}
              className={`flex items-center justify-center space-x-2 py-2.5 px-2 rounded-xl text-xs font-bold transition-all min-h-[42px] ${
                ambiente === 'adubacao'
                  ? 'bg-recreio-gold-700 text-white shadow-md'
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              <Sprout className="w-4 h-4 shrink-0" />
              <span className="truncate">Adubação & Solo</span>
            </button>
            <button
              onClick={() => setAmbiente('distribuicao')}
              className={`flex items-center justify-center space-x-2 py-2.5 px-2 rounded-xl text-xs font-bold transition-all min-h-[42px] ${
                ambiente === 'distribuicao'
                  ? 'bg-recreio-espresso-950 text-white shadow-md'
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              <Truck className="w-4 h-4 shrink-0" />
              <span className="truncate">Saídas & Vendas</span>
            </button>
          </div>
        </div>

        {/* Sub-navigation Tabs (Somente para o Módulo de Adubação) */}
        {ambiente === 'adubacao' && (
          <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-none no-scrollbar touch-scroll border-t border-stone-100 -mx-3 px-3 sm:mx-0 sm:px-0">
            {tabsAdubacao.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all whitespace-nowrap min-h-[38px] ${
                    isActive
                      ? 'bg-recreio-gold-50 text-recreio-gold-900 border border-recreio-gold-300 shadow-xs'
                      : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? 'text-recreio-gold-700' : 'text-stone-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
};
