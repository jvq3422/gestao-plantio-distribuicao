import React, { useState } from 'react';
import { RecommendationPlan, Plot } from '../types';
import { exportCalculoExcel, generateCalculoTxt, copyToClipboard } from '../services/exportService';
import { Printer, X, FileSpreadsheet, Copy, Check } from 'lucide-react';

interface OrdemCampoModalProps {
  plan: RecommendationPlan | null;
  plot: Plot | null;
  onClose: () => void;
}

export const OrdemCampoModal: React.FC<OrdemCampoModalProps> = ({ plan, plot, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!plan || !plot) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    exportCalculoExcel(plan, plot);
  };

  const handleCopyTxt = async () => {
    const text = generateCalculoTxt(plan, plot);
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-4xl w-full max-h-[92vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200 p-4 sm:p-8 space-y-6 relative touch-scroll my-auto sm:my-8">
        {/* Modal Controls (No Print) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print border-b border-stone-100 pb-4">
          <div className="flex items-center space-x-2">
            <span className="bg-recreio-gold-100 text-recreio-gold-900 border border-recreio-gold-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Recreio do Morro • Ordem de Campo
            </span>
            <span className="text-stone-400 text-xs hidden sm:inline">Calibração de trator e aplicação</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handlePrint}
              style={{ backgroundColor: '#964f0b', color: '#ffffff' }}
              className="inline-flex items-center space-x-1.5 bg-recreio-gold-700 hover:bg-recreio-gold-800 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all shadow-sm min-h-[40px] active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / PDF</span>
            </button>

            <button
              onClick={handleExportExcel}
              className="inline-flex items-center space-x-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all shadow-sm min-h-[40px]"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Excel (.csv)</span>
            </button>

            <button
              onClick={handleCopyTxt}
              className={`inline-flex items-center space-x-1.5 text-xs font-bold px-3.5 py-2.5 rounded-xl border transition-all min-h-[40px] ${
                copied
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-300'
              }`}
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-stone-600" />}
              <span>{copied ? 'Copiado!' : 'Copiar TXT'}</span>
            </button>

            <button
              onClick={onClose}
              className="text-stone-400 hover:text-stone-700 p-2 rounded-xl hover:bg-stone-100 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="space-y-6 text-stone-900 printable-area">
          {/* Header with Company Logo */}
          <div className="border-b-2 border-stone-800 pb-4 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <img
                src="/logo-principal.png"
                alt="Recreio do Morro"
                className="h-20 w-auto object-contain bg-white"
              />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-stone-600">
                  Chapada Diamantina • Bahia | Cafés Especiais & Hortifrúti
                </p>
                <p className="text-[11px] text-stone-500">
                  Ficha de Recomendação de Adubação e Regulagem de Maquinário
                </p>
              </div>
            </div>

            <div className="text-right text-xs">
              <span className="font-bold block text-sm">Safra: {plan.safra}</span>
              <span className="text-stone-500">Emissão: {plan.dataCalculo}</span>
            </div>
          </div>

          {/* Dados do Talhão */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-stone-50 p-4 rounded-xl border border-stone-200 text-xs">
            <div>
              <span className="text-stone-400 font-bold block uppercase text-[10px]">Talhão:</span>
              <strong className="text-sm text-stone-900">{plot.nome}</strong>
            </div>
            <div>
              <span className="text-stone-400 font-bold block uppercase text-[10px]">Variedade / Altitude:</span>
              <strong className="text-stone-900">{plot.variedade} ({plot.altitudeM}m)</strong>
            </div>
            <div>
              <span className="text-stone-400 font-bold block uppercase text-[10px]">Área e População:</span>
              <strong className="text-stone-900">
                {plot.areaHa} ha • {plan.densidadePlantasHa} plantas/ha
              </strong>
            </div>
            <div>
              <span className="text-stone-400 font-bold block uppercase text-[10px]">Espaçamento:</span>
              <strong className="text-stone-900">
                {plot.espacamentoRuaM}m x {plot.espacamentoPlantaM}m
              </strong>
            </div>
          </div>

          {/* Calagem e Gessagem (Se aplicáveis) */}
          {(plan.calagem.necessario || plan.gessagem.necessario) && (
            <div className="border border-stone-200 rounded-xl p-4 space-y-3 bg-stone-50/50">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-stone-700">
                1. Correção Prévia do Solo (Calagem e Gessagem)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {plan.calagem.necessario && (
                  <div className="bg-white p-3 rounded-lg border border-stone-200 space-y-1">
                    <span className="font-bold text-amber-800 block">Calcário ({plan.calagem.tipoCalcario}):</span>
                    <p>
                      Dose na saia do cafeeiro: <strong>{plan.calagem.doseFaixaHa} t/ha</strong>
                    </p>
                    <p>
                      Total Talhão: <strong>{(plan.calagem.totalKgTalhao / 1000).toFixed(1)} toneladas</strong>
                    </p>
                  </div>
                )}
                {plan.gessagem.necessario && (
                  <div className="bg-white p-3 rounded-lg border border-stone-200 space-y-1">
                    <span className="font-bold text-blue-800 block">Gesso Agrícola (Subsolo):</span>
                    <p>
                      Dose por hectare: <strong>{plan.gessagem.doseKgHa} kg/ha</strong>
                    </p>
                    <p>
                      Total Talhão: <strong>{(plan.gessagem.totalKgTalhao / 1000).toFixed(1)} toneladas</strong>
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Doses de Insumos e Calibração de Máquinas */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-stone-700">
              2. Quantidades de Adubos e Calibração para Operação
            </h3>

            <div className="border border-stone-200 rounded-xl overflow-x-auto touch-scroll">
              <table className="w-full text-xs text-left">
                <thead className="bg-stone-100 text-stone-700 uppercase font-bold text-[10px]">
                  <tr>
                    <th className="p-2.5">Adubo Comercial</th>
                    <th className="p-2.5 text-right">Dose (kg/ha)</th>
                    <th className="p-2.5 text-right">Total Talhão</th>
                    <th className="p-2.5 text-right">Sacos (50 kg)</th>
                    <th className="p-2.5 text-right font-extrabold text-recreio-gold-950 bg-recreio-gold-100/60">
                      g / Planta
                    </th>
                    <th className="p-2.5 text-right font-extrabold text-recreio-espresso-950 bg-[#ebdcc8]">
                      g / Metro (Trator)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {plan.opcaoRecomendada.adubos.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-2.5 font-bold text-stone-900">{item.nome}</td>
                      <td className="p-2.5 text-right font-mono">{item.doseKgHa} kg</td>
                      <td className="p-2.5 text-right font-mono">{item.totalKgTalhao.toLocaleString()} kg</td>
                      <td className="p-2.5 text-right font-mono font-bold">{item.sacas50kg} scs</td>
                      <td className="p-2.5 text-right font-mono font-black text-recreio-gold-900 bg-recreio-gold-50/50">
                        {item.gramasPorPlanta} g
                      </td>
                      <td className="p-2.5 text-right font-mono font-black text-recreio-espresso-950 bg-[#ebdcc8]/50">
                        {item.gramasPorMetroLinear} g/m
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-stone-500 italic">
              * Calibração do trator: Colete a saída da carreta adubadeira em 10 metros lineares da rua; a massa coletada deve ser exatamente 10x o valor de "g/m".
            </p>
          </div>

          {/* Cronograma Fenológico das Parcelas */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-stone-700">
              3. Cronograma de Aplicação Parcelada
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {plan.cronogramaParcelamento.map((p) => (
                <div key={p.numero} className="border border-stone-200 rounded-xl p-3 text-xs bg-stone-50/50 space-y-1.5">
                  <div className="flex justify-between font-bold text-stone-900 border-b border-stone-200 pb-1">
                    <span>{p.numero}ª Parcela ({p.mesReferencia})</span>
                  </div>
                  <p className="font-semibold text-stone-800">{p.faseFenologica}</p>
                  <ul className="space-y-1 text-stone-600">
                    {p.adubos.map((a, i) => (
                      <li key={i} className="flex justify-between">
                        <span>{a.nome}:</span>
                        <strong className="font-mono">{a.doseKgHa} kg/ha ({a.gramasPorMetro} g/m)</strong>
                      </li>
                    ))}
                  </ul>
                  <p className="text-[10px] text-amber-900 bg-amber-50 p-1.5 rounded border border-amber-200/50">
                    {p.condicoesClimaticasEAlerta}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Campo de Assinatura e Registro */}
          <div className="border-t border-stone-200 pt-6 grid grid-cols-2 gap-8 text-center text-xs">
            <div>
              <div className="border-b border-stone-300 h-8 mb-1"></div>
              <span className="text-stone-600 font-medium">Responsável Técnico / Engenheiro Agrônomo</span>
            </div>
            <div>
              <div className="border-b border-stone-300 h-8 mb-1"></div>
              <span className="text-stone-600 font-medium">Operador Rural / Fazenda Recreio do Morro</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
