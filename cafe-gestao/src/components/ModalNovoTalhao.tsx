import React, { useState } from 'react';
import {
  Plot,
  CulturaTalhao,
  VariedadeCafe,
  VariedadeUva,
  SistemaConducaoUva,
  ExposicaoSolar,
  CoberturaSolo,
} from '../types';
import { X, Sprout, Wine } from 'lucide-react';
import { DecimalInput } from './DecimalInput';

interface ModalNovoTalhaoProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (plot: Plot) => void;
}

export const VARIEDADES_CAFE: VariedadeCafe[] = [
  'Catuaí Vermelho 144',
  'Catuaí Amarelo 2SL',
  'Bourbon Amarelo',
  'Arara',
  'Topázio MG 1190',
  'Mundo Novo IAC 379-19',
  'Catucaí 2SL',
  'Geisha',
  'Acauã',
  'Siriema',
  'Paraíso MG 419-1',
  'Outro Café',
];

export const VARIEDADES_UVA: VariedadeUva[] = [
  'Syrah (Shiraz)',
  'Cabernet Sauvignon',
  'Sauvignon Blanc',
  'Chardonnay',
  'Tempranillo',
  'Malbec',
  'Merlot',
  'Pinot Noir',
  'Touriga Nacional',
  'Cabernet Franc',
  'Petit Verdot',
  'Viognier',
  'Isabel',
  'Niágara Rosada',
  'BRS Vitória',
  'Outra Uva',
];

export const ModalNovoTalhao: React.FC<ModalNovoTalhaoProps> = ({ isOpen, onClose, onSave }) => {
  const [cultura, setCultura] = useState<CulturaTalhao>('Café');
  const [nome, setNome] = useState('');
  const [areaHa, setAreaHa] = useState<number>(3.5);
  const [variedadeCafe, setVariedadeCafe] = useState<VariedadeCafe>('Arara');
  const [variedadeUva, setVariedadeUva] = useState<VariedadeUva>('Syrah (Shiraz)');
  const [customVariedade, setCustomVariedade] = useState('');
  const [isCustomVariedade, setIsCustomVariedade] = useState(false);
  const [sistemaConducao, setSistemaConducao] = useState<SistemaConducaoUva>('Espaldeira');
  const [portaEnxerto, setPortaEnxerto] = useState('Paulsen 1103');
  const [altitudeM, setAltitudeM] = useState<number>(1050);
  const [exposicaoSolar, setExposicaoSolar] = useState<ExposicaoSolar>('Face Norte (Mais Sol)');
  const [espacamentoRuaM, setEspacamentoRuaM] = useState<number>(3.5);
  const [espacamentoPlantaM, setEspacamentoPlantaM] = useState<number>(0.7);
  const [anoPlantio, setAnoPlantio] = useState<number>(2021);
  const [coberturaSolo, setCoberturaSolo] = useState<CoberturaSolo>('Braquiária nas entrelinhas');
  const [observacoesTerroir, setObservacoesTerroir] = useState('');
  const [irrigado, setIrrigado] = useState(true);

  if (!isOpen) return null;

  const handleCulturaChange = (novaCultura: CulturaTalhao) => {
    setCultura(novaCultura);
    setIsCustomVariedade(false);
    if (novaCultura === 'Uva') {
      setEspacamentoRuaM(2.8);
      setEspacamentoPlantaM(1.2);
    } else {
      setEspacamentoRuaM(3.5);
      setEspacamentoPlantaM(0.7);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;

    let variedadeFinal = cultura === 'Uva' ? variedadeUva : variedadeCafe;
    if (isCustomVariedade && customVariedade.trim()) {
      variedadeFinal = customVariedade.trim() as any;
    }

    const newPlot: Plot = {
      id: `plot-${Date.now()}`,
      nome: nome.trim(),
      cultura,
      areaHa,
      variedade: variedadeFinal,
      sistemaConducao: cultura === 'Uva' ? sistemaConducao : undefined,
      portaEnxerto: cultura === 'Uva' ? portaEnxerto : undefined,
      altitudeM,
      exposicaoSolar,
      espacamentoRuaM,
      espacamentoPlantaM,
      anoPlantio,
      coberturaSolo,
      observacoesTerroir: observacoesTerroir.trim(),
      irrigado,
    };

    onSave(newPlot);
    onClose();
  };

  const densidade = Math.round(10000 / ((espacamentoRuaM || 1) * (espacamentoPlantaM || 1)));

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-xl w-full max-h-[92vh] sm:max-h-[88vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden my-auto sm:my-8 animate-fadeIn">
        {/* Fixed Header */}
        <div className="flex items-center justify-between border-b border-stone-100 p-4 sm:p-5 shrink-0 bg-white">
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
              cultura === 'Uva' ? 'bg-purple-100 text-purple-900 border border-purple-200' : 'bg-recreio-gold-100 text-recreio-gold-900 border border-recreio-gold-200'
            }`}>
              {cultura === 'Uva' ? <Wine className="w-5 h-5 text-purple-700" /> : <Sprout className="w-5 h-5 text-amber-800" />}
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-stone-900 font-playfair">
                {cultura === 'Uva' ? 'Novo Talhão de Uva / Vinhedo' : 'Novo Talhão de Café Especial'}
              </h3>
              <p className="text-[11px] text-stone-500">Chapada Diamantina • Gestão Agronômica Individual</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1.5 rounded-xl hover:bg-stone-100 active:bg-stone-200 min-h-[38px] min-w-[38px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden text-xs">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 touch-scroll overscroll-contain">
            {/* Seletor de Cultura: Café vs Uva */}
            <div>
              <label className="font-bold text-stone-700 block mb-1.5 text-xs">Tipo de Cultivo / Cultura:</label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-stone-100 rounded-xl border border-stone-200">
                <button
                  type="button"
                  onClick={() => handleCulturaChange('Café')}
                  className={`flex items-center justify-center space-x-2 py-2 px-3 rounded-lg font-bold text-xs transition-all ${
                    cultura === 'Café'
                      ? 'bg-recreio-gold-700 text-white shadow-sm'
                      : 'text-stone-700 hover:bg-stone-200'
                  }`}
                  style={cultura === 'Café' ? { backgroundColor: '#964f0b', color: '#ffffff' } : {}}
                >
                  <Sprout className="w-4 h-4" />
                  <span>Café Especial</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleCulturaChange('Uva')}
                  className={`flex items-center justify-center space-x-2 py-2 px-3 rounded-lg font-bold text-xs transition-all ${
                    cultura === 'Uva'
                      ? 'bg-purple-900 text-white shadow-sm'
                      : 'text-stone-700 hover:bg-stone-200'
                  }`}
                  style={cultura === 'Uva' ? { backgroundColor: '#581c87', color: '#ffffff' } : {}}
                >
                  <Wine className="w-4 h-4" />
                  <span>Uva / Vinhedo</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="sm:col-span-2">
                <label className="font-bold text-stone-700 block mb-1">Nome ou Identificação do Talhão:</label>
                <input
                  type="text"
                  required
                  placeholder={cultura === 'Uva' ? 'Ex: Vinhedo Syrah - Ponto Alto' : 'Ex: Talhão 04 - Morro Alto'}
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full text-base sm:text-xs border border-stone-300 rounded-xl px-3 py-2 bg-stone-50 focus:ring-2 focus:ring-recreio-gold-600 focus:outline-none min-h-[42px]"
                />
              </div>

              {/* Variedades conforme a cultura */}
              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  {cultura === 'Uva' ? 'Variedade de Uva:' : 'Variedade de Café:'}
                </label>
                {cultura === 'Uva' ? (
                  <select
                    value={isCustomVariedade ? 'Outra Uva' : variedadeUva}
                    onChange={(e) => {
                      if (e.target.value === 'Outra Uva') {
                        setIsCustomVariedade(true);
                      } else {
                        setIsCustomVariedade(false);
                        setVariedadeUva(e.target.value as VariedadeUva);
                      }
                    }}
                    className="w-full text-xs border border-stone-300 rounded-xl px-3 py-2 bg-stone-50 min-h-[40px]"
                  >
                    {VARIEDADES_UVA.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                ) : (
                  <select
                    value={isCustomVariedade ? 'Outro Café' : variedadeCafe}
                    onChange={(e) => {
                      if (e.target.value === 'Outro Café') {
                        setIsCustomVariedade(true);
                      } else {
                        setIsCustomVariedade(false);
                        setVariedadeCafe(e.target.value as VariedadeCafe);
                      }
                    }}
                    className="w-full text-xs border border-stone-300 rounded-xl px-3 py-2 bg-stone-50 min-h-[40px]"
                  >
                    {VARIEDADES_CAFE.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                )}

                {isCustomVariedade && (
                  <input
                    type="text"
                    required
                    placeholder="Digite o nome da variedade..."
                    value={customVariedade}
                    onChange={(e) => setCustomVariedade(e.target.value)}
                    className="mt-2 w-full text-xs border border-purple-300 rounded-xl px-3 py-1.5 bg-purple-50"
                  />
                )}
              </div>

              {/* Área com DecimalInput */}
              <div>
                <label className="font-bold text-stone-700 block mb-1">Área (hectares):</label>
                <DecimalInput
                  value={areaHa}
                  onChange={setAreaHa}
                  placeholder="Ex: 3.5 ou 3,5"
                  className="w-full text-xs font-mono border border-stone-300 rounded-xl px-3 py-2 bg-stone-50 min-h-[40px]"
                />
              </div>

              {/* Se for Uva: Sistema de Condução e Porta-Enxerto */}
              {cultura === 'Uva' && (
                <>
                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Sistema de Condução:</label>
                    <select
                      value={sistemaConducao}
                      onChange={(e) => setSistemaConducao(e.target.value as SistemaConducaoUva)}
                      className="w-full text-xs border border-stone-300 rounded-xl px-3 py-2 bg-stone-50 min-h-[40px]"
                    >
                      <option value="Espaldeira">Espaldeira (Recomendado para Vinhos Nobres)</option>
                      <option value="Latada / Pérgola">Latada / Pérgola (Mesa / Alta Produção)</option>
                      <option value="Ypsilon / Lira">Ypsilon / Lira</option>
                      <option value="Livre / Outro">Outro Sistema</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Porta-Enxerto (Cavalo):</label>
                    <input
                      type="text"
                      placeholder="Ex: Paulsen 1103, IAC 766, SO4"
                      value={portaEnxerto}
                      onChange={(e) => setPortaEnxerto(e.target.value)}
                      className="w-full text-xs border border-stone-300 rounded-xl px-3 py-2 bg-stone-50 min-h-[40px]"
                    />
                  </div>
                </>
              )}

              {/* Espaçamentos com DecimalInput */}
              <div>
                <label className="font-bold text-stone-700 block mb-1">Espaçamento Entre Ruas (m):</label>
                <DecimalInput
                  value={espacamentoRuaM}
                  onChange={setEspacamentoRuaM}
                  placeholder="Ex: 2.8 ou 3,5"
                  className="w-full text-xs font-mono border border-stone-300 rounded-xl px-3 py-2 bg-stone-50 min-h-[40px]"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Espaçamento Entre Plantas (m):</label>
                <DecimalInput
                  value={espacamentoPlantaM}
                  onChange={setEspacamentoPlantaM}
                  placeholder="Ex: 0.7 ou 1,2"
                  className="w-full text-xs font-mono border border-stone-300 rounded-xl px-3 py-2 bg-stone-50 min-h-[40px]"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Altitude Média (metros):</label>
                <DecimalInput
                  value={altitudeM}
                  onChange={setAltitudeM}
                  placeholder="Ex: 1050"
                  className="w-full text-xs font-mono border border-stone-300 rounded-xl px-3 py-2 bg-stone-50 min-h-[40px]"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Ano do Plantio:</label>
                <DecimalInput
                  value={anoPlantio}
                  onChange={setAnoPlantio}
                  placeholder="Ex: 2021"
                  className="w-full text-xs font-mono border border-stone-300 rounded-xl px-3 py-2 bg-stone-50 min-h-[40px]"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Exposição Solar:</label>
                <select
                  value={exposicaoSolar}
                  onChange={(e) => setExposicaoSolar(e.target.value as ExposicaoSolar)}
                  className="w-full text-xs border border-stone-300 rounded-xl px-3 py-2 bg-stone-50 min-h-[40px]"
                >
                  <option value="Face Norte (Mais Sol)">Face Norte (Mais Sol)</option>
                  <option value="Face Sul (Mais Ameno)">Face Sul (Mais Ameno)</option>
                  <option value="Face Leste">Face Leste (Sol da Manhã)</option>
                  <option value="Face Oeste">Face Oeste (Sol da Tarde)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Irrigação:</label>
                <select
                  value={irrigado ? 'sim' : 'nao'}
                  onChange={(e) => setIrrigado(e.target.value === 'sim')}
                  className="w-full text-xs border border-stone-300 rounded-xl px-3 py-2 bg-stone-50 min-h-[40px]"
                >
                  <option value="sim">Irrigado (Gotejamento / Microaspersão)</option>
                  <option value="nao">Sequeiro</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-stone-700 block mb-1">Manejo de Cobertura do Solo:</label>
                <select
                  value={coberturaSolo}
                  onChange={(e) => setCoberturaSolo(e.target.value as CoberturaSolo)}
                  className="w-full text-xs border border-stone-300 rounded-xl px-3 py-2 bg-stone-50 min-h-[40px]"
                >
                  <option value="Braquiária nas entrelinhas">Braquiária nas entrelinhas (Recomendado)</option>
                  <option value="Mato roçado / palhada espontânea">Mato roçado / palhada espontânea</option>
                  <option value="Leguminosa adubação verde (Crotalária/Guandu)">Leguminosa / Adubação verde</option>
                  <option value="Solo limpo / herbicida">Solo limpo / herbicida</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-stone-700 block mb-1">Notas de Terroir e Histórico:</label>
                <textarea
                  rows={2}
                  placeholder={cultura === 'Uva' ? 'Ex: Altitude de 1050m, noites frescas propícias para Syrah e Sauvignon Blanc com boa acidez natural.' : 'Ex: Face com boa ventilação, propício para cafés fermentados e colheita seletiva.'}
                  value={observacoesTerroir}
                  onChange={(e) => setObservacoesTerroir(e.target.value)}
                  className="w-full text-xs border border-stone-300 rounded-xl px-3 py-2 bg-stone-50"
                />
              </div>
            </div>

            <div className={`p-3 rounded-xl border flex justify-between items-center ${
              cultura === 'Uva' ? 'bg-purple-50 border-purple-200 text-purple-900' : 'bg-emerald-50 border-emerald-200 text-stone-800'
            }`}>
              <span className="font-medium">Densidade calculada de plantas:</span>
              <strong className="font-mono text-sm">
                {densidade.toLocaleString()} {cultura === 'Uva' ? 'videiras/ha' : 'pés de café/ha'}
              </strong>
            </div>
          </div>

          {/* Fixed Footer */}
          <div className="flex justify-end items-center space-x-3 p-3.5 sm:p-4 border-t border-stone-200 bg-stone-50 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-stone-600 hover:bg-stone-200 font-bold min-h-[44px] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={{ backgroundColor: cultura === 'Uva' ? '#581c87' : '#964f0b', color: '#ffffff' }}
              className="px-5 py-2.5 rounded-xl text-white font-bold transition-all shadow-md min-h-[44px] active:scale-95"
            >
              Salvar Talhão de {cultura}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
