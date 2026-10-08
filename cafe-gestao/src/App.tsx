import React, { useState, useEffect } from 'react';
import {
  Plot,
  SoilAnalysis,
  HarvestRecord,
  RecommendationPlan,
  Produto,
  PontoVenda,
  PrecoNegociado,
  SaidaVenda,
} from './types';
import { StorageService } from './services/storageService';
import { Header } from './components/Header';
import { TalhoesView } from './components/TalhoesView';
import { AnalisesSoloView } from './components/AnalisesSoloView';
import { CalculadoraNutricaoView } from './components/CalculadoraNutricaoView';
import { HistoricoFeedbackView } from './components/HistoricoFeedbackView';
import { OrdemCampoModal } from './components/OrdemCampoModal';
import { ModalNovoTalhao } from './components/ModalNovoTalhao';
import { ModalNovaAnalise } from './components/ModalNovaAnalise';
import { ModalNovaColheita } from './components/ModalNovaColheita';
import { ModuloDistribuicaoView } from './components/distribution/ModuloDistribuicaoView';
import { NuvemSyncModal } from './components/NuvemSyncModal';
import { SyncService, SyncStatus } from './services/syncService';

export function App() {
  // Ambiente ativo: 'adubacao' (Lavoura) vs 'distribuicao' (Saídas e Receitas)
  const [ambiente, setAmbiente] = useState<'adubacao' | 'distribuicao'>('adubacao');

  // Dados Agronômicos
  const [plots, setPlots] = useState<Plot[]>([]);
  const [analyses, setAnalyses] = useState<SoilAnalysis[]>([]);
  const [harvests, setHarvests] = useState<HarvestRecord[]>([]);
  const [activeTab, setActiveTab] = useState<string>('calculadora');
  const [calcPlotId, setCalcPlotId] = useState<string>('');

  // Dados Comerciais & Distribuição
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [pontosVenda, setPontosVenda] = useState<PontoVenda[]>([]);
  const [precosNegociados, setPrecosNegociados] = useState<PrecoNegociado[]>([]);
  const [saidas, setSaidas] = useState<SaidaVenda[]>([]);

  // Modais Agronômicos & Nuvem
  const [isPlotModalOpen, setIsPlotModalOpen] = useState(false);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [isHarvestModalOpen, setIsHarvestModalOpen] = useState(false);
  const [isNuvemModalOpen, setIsNuvemModalOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('not_configured');
  const [preselectedPlotId, setPreselectedPlotId] = useState<string>('');
  const [activeWorkOrderPlan, setActiveWorkOrderPlan] = useState<RecommendationPlan | null>(null);

  // Carregar dados na inicialização e ativar sincronização em tempo real
  useEffect(() => {
    loadAllData();
    const unsubStatus = SyncService.onStatusChange(setSyncStatus);
    SyncService.startRealtimeSync(() => {
      loadAllData();
    });

    return () => {
      unsubStatus();
      SyncService.stopRealtimeSync();
    };
  }, []);

  const loadAllData = () => {
    // Agronomia
    const loadedPlots = StorageService.getPlots();
    const loadedAnalyses = StorageService.getAnalyses();
    const loadedHarvests = StorageService.getHarvests();
    setPlots(loadedPlots);
    setAnalyses(loadedAnalyses);
    setHarvests(loadedHarvests);
    if (loadedPlots.length > 0 && !calcPlotId) {
      setCalcPlotId(loadedPlots[0].id);
    }

    // Comercialização & Distribuição
    setProdutos(StorageService.getProdutos());
    setPontosVenda(StorageService.getPontosVenda());
    setPrecosNegociados(StorageService.getPrecosNegociados());
    setSaidas(StorageService.getSaidas());
  };

  const handleResetData = () => {
    if (window.confirm('Deseja zerar e limpar todos os dados cadastrados no sistema?')) {
      StorageService.clearAllData();
      loadAllData();
    }
  };

  const handleSelectPlotForCalc = (plotId: string) => {
    setCalcPlotId(plotId);
    setAmbiente('adubacao');
    setActiveTab('calculadora');
  };

  const handleOpenAnalysisModal = (plotId?: string) => {
    setPreselectedPlotId(plotId || plots[0]?.id || '');
    setIsAnalysisModalOpen(true);
  };

  const handleOpenHarvestModal = (plotId?: string) => {
    setPreselectedPlotId(plotId || plots[0]?.id || '');
    setIsHarvestModalOpen(true);
  };

  const handleSavePlot = (newPlot: Plot) => {
    const updated = [...plots, newPlot];
    setPlots(updated);
    StorageService.savePlots(updated);
    setCalcPlotId(newPlot.id);
  };

  const handleSaveAnalysis = (newAnalysis: SoilAnalysis) => {
    const updated = [newAnalysis, ...analyses];
    setAnalyses(updated);
    StorageService.saveAnalyses(updated);
  };

  const handleSaveHarvest = (newHarvest: HarvestRecord) => {
    const updated = [newHarvest, ...harvests];
    setHarvests(updated);
    StorageService.saveHarvests(updated);
  };

  const currentWorkOrderPlot = activeWorkOrderPlan
    ? plots.find((p) => p.id === activeWorkOrderPlan.plotId) || null
    : null;

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <Header
        ambiente={ambiente}
        setAmbiente={setAmbiente}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onResetData={handleResetData}
        onOpenNuvemModal={() => setIsNuvemModalOpen(true)}
        syncStatus={syncStatus}
        onPrint={() => {
          if (activeWorkOrderPlan) {
            window.print();
          } else {
            setActiveTab('calculadora');
            alert('Acesse a calculadora de adubação e clique em "Gerar Ficha de Campo" para imprimir.');
          }
        }}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* AMBIENTE 1: GESTÃO DE ADUBAÇÃO & LAVOURA */}
        {ambiente === 'adubacao' && (
          <>
            {activeTab === 'talhoes' && (
              <TalhoesView
                plots={plots}
                onSelectPlotForCalc={handleSelectPlotForCalc}
                onOpenNewPlotModal={() => setIsPlotModalOpen(true)}
              />
            )}

            {activeTab === 'analise' && (
              <AnalisesSoloView
                plots={plots}
                analyses={analyses}
                onOpenNewAnalysisModal={handleOpenAnalysisModal}
              />
            )}

            {activeTab === 'calculadora' && (
              <CalculadoraNutricaoView
                plots={plots}
                analyses={analyses}
                harvests={harvests}
                initialPlotId={calcPlotId}
                onViewWorkOrder={(plan) => setActiveWorkOrderPlan(plan)}
              />
            )}

            {activeTab === 'historico' && (
              <HistoricoFeedbackView
                plots={plots}
                harvests={harvests}
                analyses={analyses}
                onOpenNewHarvestModal={handleOpenHarvestModal}
              />
            )}

          </>
        )}

        {/* AMBIENTE 2: GESTÃO DE SAÍDAS DE PRODUTOS, PREÇOS NEGOCIADOS & RECEITAS */}
        {ambiente === 'distribuicao' && (
          <ModuloDistribuicaoView
            produtos={produtos}
            pontosVenda={pontosVenda}
            precosNegociados={precosNegociados}
            saidas={saidas}
            plots={plots}
            onRefreshData={loadAllData}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 py-6 text-center text-xs text-stone-500 no-print mt-auto">
        <div className="max-w-7xl mx-auto px-4 space-y-1.5 flex flex-col items-center">
          <img
            src="/logo-footer.png"
            alt="Recreio do Morro"
            className="h-8 sm:h-10 w-auto object-contain mx-auto"
          />
          <p className="text-[11px] text-stone-400">
            Chapada Diamantina - Bahia • Sistema Sob Medida • Cafés Especiais & Hortifrúti
          </p>
        </div>
      </footer>

      {/* Modais Agronômicos */}
      <ModalNovoTalhao
        isOpen={isPlotModalOpen}
        onClose={() => setIsPlotModalOpen(false)}
        onSave={handleSavePlot}
      />

      <ModalNovaAnalise
        isOpen={isAnalysisModalOpen}
        plots={plots}
        preselectedPlotId={preselectedPlotId}
        onClose={() => setIsAnalysisModalOpen(false)}
        onSave={handleSaveAnalysis}
      />

      <ModalNovaColheita
        isOpen={isHarvestModalOpen}
        plots={plots}
        preselectedPlotId={preselectedPlotId}
        onClose={() => setIsHarvestModalOpen(false)}
        onSave={handleSaveHarvest}
      />

      <OrdemCampoModal
        plan={activeWorkOrderPlan}
        plot={currentWorkOrderPlot}
        onClose={() => setActiveWorkOrderPlan(null)}
      />

      <NuvemSyncModal
        isOpen={isNuvemModalOpen}
        onClose={() => setIsNuvemModalOpen(false)}
        onSyncCompleted={loadAllData}
      />
    </div>
  );
}

export default App;
