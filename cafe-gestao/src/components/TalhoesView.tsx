import React from 'react';
import { Plot } from '../types';
import { Plus, Mountain, Sun, Compass, Ruler, ShieldCheck, ArrowRight, Award } from 'lucide-react';

interface TalhoesViewProps {
  plots: Plot[];
  onSelectPlotForCalc: (plotId: string) => void;
  onOpenNewPlotModal: () => void;
}

export const TalhoesView: React.FC<TalhoesViewProps> = ({
  plots,
  onSelectPlotForCalc,
  onOpenNewPlotModal,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div
        className="rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden border border-[#643410]/50"
        style={{
          backgroundColor: '#231914',
          backgroundImage: 'linear-gradient(135deg, #231914 0%, #3c3029 60%, #3d2012 100%)',
        }}
      >
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center space-x-2 mb-3">
            <span
              className="text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center space-x-1 border"
              style={{ backgroundColor: 'rgba(200, 125, 19, 0.25)', color: '#ecc47b', borderColor: 'rgba(236, 196, 123, 0.4)' }}
            >
              <Award className="w-3.5 h-3.5 text-[#e0a442]" />
              <span>Terroir Chapada Diamantina • Alta Altitude</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-playfair font-serif-brand font-bold tracking-wide text-white">
            Talhões & Microclimas da Fazenda
          </h1>
          <p className="mt-2 text-stone-200 text-xs sm:text-sm leading-relaxed">
            Altitudes de 1.190m a 1.350m com amplitudes térmicas acentuadas. O manejo nutricional individualizado por talhão é o segredo para notas florais de jasmim, acidez fosfórica cristalina e corpo sedoso.
          </p>
        </div>
        <div className="mt-6 flex flex-wrap gap-4 relative z-10">
          <button
            onClick={onOpenNewPlotModal}
            style={{ backgroundColor: '#b4670c', color: '#ffffff' }}
            className="inline-flex items-center space-x-2 bg-recreio-gold-600 hover:bg-recreio-gold-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-md transition-all text-xs sm:text-sm active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Novo Talhão</span>
          </button>
        </div>
      </div>

      {/* Grid of Plots */}
      {plots.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-stone-300 p-12 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 bg-recreio-gold-100 text-recreio-gold-800 rounded-2xl flex items-center justify-center mx-auto shadow-inner border border-recreio-gold-200">
            <Mountain className="w-7 h-7 text-recreio-gold-700" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-stone-800 font-playfair font-serif-brand">Nenhum talhão cadastrado ainda</h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              Cadastre o primeiro talhão da sua fazenda informando área, variedade (Arara, Geisha, Bourbon, etc.), altitude e espaçamento para iniciar o manejo nutricional e a rastreabilidade.
            </p>
          </div>
          <button
            onClick={onOpenNewPlotModal}
            style={{ backgroundColor: '#964f0b', color: '#ffffff' }}
            className="inline-flex items-center space-x-2 bg-recreio-gold-700 hover:bg-recreio-gold-800 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Primeiro Talhão</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plots.map((plot) => {
            const densidade = Math.round(10000 / (plot.espacamentoRuaM * plot.espacamentoPlantaM));
            const totalPlantas = Math.round(densidade * plot.areaHa);

            return (
              <div
                key={plot.id}
                className="bg-white rounded-2xl border border-stone-200 hover:border-recreio-gold-500 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-5 sm:p-6 space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-black text-recreio-gold-900 uppercase tracking-wider bg-recreio-gold-50 border border-recreio-gold-200 px-2 py-0.5 rounded-md">
                        {plot.variedade}
                      </span>
                      <h3 className="text-lg font-bold text-stone-900 mt-1 group-hover:text-recreio-gold-700 transition-colors">
                        {plot.nome}
                      </h3>
                    </div>
                    <span className="text-xs font-black text-recreio-espresso-950 bg-[#faf6ef] px-2.5 py-1 rounded-lg border border-recreio-gold-200">
                      {plot.areaHa.toFixed(1)} ha
                    </span>
                  </div>

                  {/* Terroir Badges */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-stone-600 pt-1">
                    <div className="flex items-center space-x-1.5 bg-[#fcfaf6] p-2 rounded-lg border border-stone-100">
                      <Mountain className="w-4 h-4 text-recreio-gold-700 shrink-0" />
                      <span className="font-bold text-stone-800">{plot.altitudeM} m altitude</span>
                    </div>
                    <div className="flex items-center space-x-1.5 bg-[#fcfaf6] p-2 rounded-lg border border-stone-100">
                      <Sun className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="truncate">{plot.exposicaoSolar.split(' ')[0]}</span>
                    </div>
                    <div className="flex items-center space-x-1.5 bg-[#fcfaf6] p-2 rounded-lg border border-stone-100">
                      <Ruler className="w-4 h-4 text-stone-500 shrink-0" />
                      <span>{plot.espacamentoRuaM}m x {plot.espacamentoPlantaM}m</span>
                    </div>
                    <div className="flex items-center space-x-1.5 bg-[#fcfaf6] p-2 rounded-lg border border-stone-100">
                      <Compass className="w-4 h-4 text-stone-500 shrink-0" />
                      <span>{densidade.toLocaleString()} plantas/ha</span>
                    </div>
                  </div>

                  {/* Cobertura de Solo */}
                  <div className="bg-[#fcfaf6] border border-stone-200 rounded-xl p-3 text-xs space-y-1">
                    <div className="flex items-center space-x-1.5 font-bold text-stone-800">
                      <ShieldCheck className="w-3.5 h-3.5 text-recreio-gold-700" />
                      <span>Manejo de Entrelinha / Cobertura:</span>
                    </div>
                    <p className="text-stone-600">{plot.coberturaSolo}</p>
                  </div>

                  {/* Terroir / Notas Sensoriais */}
                  {plot.observacoesTerroir && (
                    <p className="text-xs text-stone-500 italic line-clamp-2">
                      "{plot.observacoesTerroir}"
                    </p>
                  )}
                </div>

                {/* Action Button */}
                <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-xs text-stone-500 font-medium">
                    {totalPlantas.toLocaleString()} cafeeiros
                  </span>
                  <button
                    onClick={() => onSelectPlotForCalc(plot.id)}
                    style={{ backgroundColor: '#964f0b', color: '#ffffff' }}
                    className="inline-flex items-center space-x-1.5 bg-recreio-gold-700 hover:bg-recreio-gold-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-colors shadow-sm"
                  >
                    <span>Calcular Nutrição</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
