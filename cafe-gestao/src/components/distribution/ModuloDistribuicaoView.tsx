import React, { useState } from 'react';
import { Produto, PontoVenda, PrecoNegociado, SaidaVenda, Plot } from '../../types';
import { StorageService } from '../../services/storageService';
import { LancamentoSaidasTab } from './LancamentoSaidasTab';
import { PontosVendaPrecosTab } from './PontosVendaPrecosTab';
import { ProdutosEstoqueTab } from './ProdutosEstoqueTab';
import { ReceitasFinanceiroTab } from './ReceitasFinanceiroTab';
import { ModalNovaSaida } from './ModalNovaSaida';
import { ModalNovoPontoVenda } from './ModalNovoPontoVenda';
import { ModalNovoProduto } from './ModalNovoProduto';
import { RelatorioVendasModal } from './RelatorioVendasModal';
import { ShoppingCart, Tag, Package, DollarSign } from 'lucide-react';

interface ModuloDistribuicaoViewProps {
  produtos: Produto[];
  pontosVenda: PontoVenda[];
  precosNegociados: PrecoNegociado[];
  saidas: SaidaVenda[];
  plots: Plot[];
  onRefreshData: () => void;
}

export const ModuloDistribuicaoView: React.FC<ModuloDistribuicaoViewProps> = ({
  produtos,
  pontosVenda,
  precosNegociados,
  saidas,
  plots,
  onRefreshData,
}) => {
  const [subTab, setSubTab] = useState<'saidas' | 'precos' | 'produtos' | 'receitas'>('saidas');

  // Modals
  const [isNovaSaidaOpen, setIsNovaSaidaOpen] = useState(false);
  const [isNovoPdvOpen, setIsNovoPdvOpen] = useState(false);
  const [isNovoProdutoOpen, setIsNovoProdutoOpen] = useState(false);
  const [isRelatorioVendasOpen, setIsRelatorioVendasOpen] = useState(false);

  const handleSaveSaida = (novaSaida: SaidaVenda) => {
    StorageService.addSaida(novaSaida);
    onRefreshData();
  };

  const handleSavePdv = (novoPdv: PontoVenda) => {
    const pdvs = StorageService.getPontosVenda();
    pdvs.push(novoPdv);
    StorageService.savePontosVenda(pdvs);
    onRefreshData();
  };

  const handleSaveProduto = (novoProd: Produto) => {
    const prods = StorageService.getProdutos();
    prods.push(novoProd);
    StorageService.saveProdutos(prods);
    onRefreshData();
  };

  const tabs = [
    { id: 'saidas', label: 'Saídas & Entregas', shortLabel: 'Saídas & Entregas', icon: ShoppingCart },
    { id: 'precos', label: 'Preços por Ponto de Venda', shortLabel: 'Preços por PDV', icon: Tag },
    { id: 'produtos', label: 'Produtos & Estoque', shortLabel: 'Catálogo & Estoque', icon: Package },
    { id: 'receitas', label: 'Fluxo de Receitas & Financeiro', shortLabel: 'Receitas & Caixa', icon: DollarSign },
  ];

  return (
    <div className="space-y-6">
      {/* Sub-navigation Menu */}
      <div className="flex space-x-2 overflow-x-auto pb-2 border-b border-stone-200 no-scrollbar touch-scroll -mx-3 px-3 sm:mx-0 sm:px-0 scroll-smooth">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = subTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id as any)}
              style={isActive ? { backgroundColor: '#231914', color: '#ffffff', borderColor: '#3c3029' } : { backgroundColor: '#ffffff', color: '#44403c' }}
              className={`flex items-center space-x-1.5 sm:space-x-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap min-h-[40px] shrink-0 border shadow-xs ${
                isActive
                  ? 'bg-recreio-espresso-950 text-white shadow-md border-recreio-espresso-900'
                  : 'bg-white text-stone-700 hover:bg-stone-100 hover:text-stone-900 border-stone-200/80'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? 'text-[#e0a442]' : 'text-stone-400'}`} />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.shortLabel}</span>
            </button>
          );
        })}
      </div>

      {/* Sub-view Content */}
      {subTab === 'saidas' && (
        <LancamentoSaidasTab
          saidas={saidas}
          pontosVenda={pontosVenda}
          produtos={produtos}
          onOpenNovaSaidaModal={() => setIsNovaSaidaOpen(true)}
          onOpenRelatorioVendas={() => setIsRelatorioVendasOpen(true)}
          onRefreshData={onRefreshData}
        />
      )}

      {subTab === 'precos' && (
        <PontosVendaPrecosTab
          pontosVenda={pontosVenda}
          produtos={produtos}
          precosNegociados={precosNegociados}
          onOpenNewPdvModal={() => setIsNovoPdvOpen(true)}
          onRefreshData={onRefreshData}
        />
      )}

      {subTab === 'produtos' && (
        <ProdutosEstoqueTab
          produtos={produtos}
          plots={plots}
          onOpenNovoProdutoModal={() => setIsNovoProdutoOpen(true)}
          onRefreshData={onRefreshData}
        />
      )}

      {subTab === 'receitas' && (
        <ReceitasFinanceiroTab
          saidas={saidas}
          pontosVenda={pontosVenda}
          produtos={produtos}
        />
      )}

      {/* Modals */}
      <ModalNovaSaida
        isOpen={isNovaSaidaOpen}
        produtos={produtos}
        pontosVenda={pontosVenda}
        onClose={() => setIsNovaSaidaOpen(false)}
        onSave={handleSaveSaida}
      />

      <ModalNovoPontoVenda
        isOpen={isNovoPdvOpen}
        onClose={() => setIsNovoPdvOpen(false)}
        onSave={handleSavePdv}
      />

      <ModalNovoProduto
        isOpen={isNovoProdutoOpen}
        plots={plots}
        onClose={() => setIsNovoProdutoOpen(false)}
        onSave={handleSaveProduto}
      />

      <RelatorioVendasModal
        isOpen={isRelatorioVendasOpen}
        saidas={saidas}
        pontosVenda={pontosVenda}
        produtos={produtos}
        onClose={() => setIsRelatorioVendasOpen(false)}
      />
    </div>
  );
};
