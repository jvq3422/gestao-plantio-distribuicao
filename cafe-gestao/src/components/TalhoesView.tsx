import React from 'react';
import { Plot } from '../types';
import { Plus, Mountain, Sun, Compass, Ruler, ShieldCheck, ArrowRight, Award, Trash2, Sprout } from 'lucide-react';

interface TalhoesViewProps {
  plots: Plot[];
  onSelectPlotForCalc: (plotId: string) => void;
  onOpenNewPlotModal: () => void;
  onDeletePlot?: (plotId: string, plotNome: string) => void;
  onOpenManejo?: (plotId: string) => void;
}

export const TalhoesView: React.FC<TalhoesViewProps> = ({
  plots,
  onSelectPlotForCalc,
  onOpenNewPlotModal,
  onDeletePlot,
  onOpenManejo,
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
            Talhões, Vinhedos & Microclimas
          </h1>
          <p className="mt-2 text-stone-200 text-xs sm:text-sm leading-relaxed">
            Altitudes de 1.190m a 1.350m com noites frias e alta insolação. O manejo individualizado de café especial e vinhedos é o segredo para equilíbrio mineral, acidez viva e compostos fenólicos nobres.
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
              Cadastre o primeiro talhão da sua fazenda informando cultura (Café ou Uva), área, variedade, altitude e espaçamento para iniciar o manejo nutricional e o caderno de campo.
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
            const isUva = plot.cultura === 'Uva';

            return (
              <div
                key={plot.id}
                className="bg-white rounded-2xl border border-stone-200 hover:border-recreio-gold-500 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-5 sm:p-6 space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                            isUva
                              ? 'bg-purple-50 text-purple-900 border-purple-200'
                              : 'bg-amber-50 text-amber-900 border-amber-200'
                          }`}
                        >
                          {isUva ? '🍇 Uva / Vinhedo' : '☕ Café Especial'}
                        </span>
                        <span className="text-[10px] font-bold text-stone-700 bg-stone-100 px-2 py-0.5 rounded-md">
                          {plot.variedade}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-stone-900 mt-1.5 group-hover:text-recreio-gold-700 transition-colors">
                        {plot.nome}
                      </h3>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-xs font-black text-recreio-espresso-950 bg-[#faf6ef] px-2.5 py-1 rounded-lg border border-recreio-gold-200">
                        {plot.areaHa.toFixed(1)} ha
                      </span>
                      {onDeletePlot && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeletePlot(plot.id, plot.nome);
                          }}
                          title={`Excluir talhão ${plot.nome}`}
                          className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
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

                  {/* Specific Details for Uva (Sistema de Condução e Porta-Enxerto) */}
                  {isUva && (
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {plot.sistemaConducao && (
                        <div className="bg-purple-50/60 p-2 rounded-lg border border-purple-100">
                          <span className="text-[10px] text-purple-700 font-bold block uppercase">
                            Condução:
                          </span>
                          <span className="font-bold text-purple-950">{plot.sistemaConducao}</span>
                        </div>
                      )}
                      {plot.portaEnxerto && (
                        <div className="bg-purple-50/60 p-2 rounded-lg border border-purple-100">
                          <span className="text-[10px] text-purple-700 font-bold block uppercase">
                            Porta-Enxerto:
                          </span>
                          <span className="font-bold text-purple-950">{plot.portaEnxerto}</span>
                        </div>
                      )}
                    </div>
                  )}

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

                {/* Action Buttons */}
                <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-500 font-medium">
                      {totalPlantas.toLocaleString()} {isUva ? 'videiras' : 'cafeeiros'}
                    </span>
                    {onOpenManejo && (
                      <button
                        onClick={() => onOpenManejo(plot.id)}
                        className="inline-flex items-center space-x-1 text-emerald-700 hover:text-emerald-900 text-xs font-bold px-2 py-1 rounded-lg hover:bg-emerald-50 transition-colors"
                        title="Ver ou registrar adubações e profilaxias deste talhão"
                      >
                        <Sprout className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Manejo</span>
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => onSelectPlotForCalc(plot.id)}
                    style={{ backgroundColor: '#964f0b', color: '#ffffff' }}
                    className="inline-flex items-center space-x-1.5 bg-recreio-gold-700 hover:bg-recreio-gold-800 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors shadow-sm active:scale-95 shrink-0"
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
