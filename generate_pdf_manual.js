import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const baseDir = path.resolve('C:/Users/JV/Documents/antigravity/Gestao Plantio-distribuiçao');
const logoPngPath = path.join(baseDir, 'cafe-gestao/public/logo-recreio.png');
const logoJpgPath = path.join(baseDir, 'cafe-gestao/public/logo-recreio.jpg');

let logoBase64 = '';
if (fs.existsSync(logoPngPath)) {
  const logoBuffer = fs.readFileSync(logoPngPath);
  logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
} else if (fs.existsSync(logoJpgPath)) {
  const logoBuffer = fs.readFileSync(logoJpgPath);
  logoBase64 = `data:image/jpeg;base64,${logoBuffer.toString('base64')}`;
}

const logoPrincipalPath = path.join(baseDir, 'cafe-gestao/public/logo-principal.png');
let logoPrincipalBase64 = '';
if (fs.existsSync(logoPrincipalPath)) {
  const logoPrincipalBuffer = fs.readFileSync(logoPrincipalPath);
  logoPrincipalBase64 = `data:image/png;base64,${logoPrincipalBuffer.toString('base64')}`;
}

const logoNomePath = path.join(baseDir, 'cafe-gestao/public/logo-nome.png');
let logoNomeBase64 = '';
if (fs.existsSync(logoNomePath)) {
  const logoNomeBuffer = fs.readFileSync(logoNomePath);
  logoNomeBase64 = `data:image/png;base64,${logoNomeBuffer.toString('base64')}`;
}

const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Manual Técnico de Fórmulas e Cálculos Agronômicos - Fazenda Recreio do Morro</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,800;0,900;1,600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');

    @page {
      size: A4;
      margin: 14mm 12mm 16mm 12mm;
      @bottom-right {
        content: counter(page);
      }
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #27211c;
      background-color: #ffffff;
      font-size: 9.5pt;
      line-height: 1.5;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* CAPA */
    .cover-page {
      page-break-after: always;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 100vh;
      min-height: 260mm;
      padding: 30mm 15mm 20mm 15mm;
      background: radial-gradient(circle at top right, #faf4ec 0%, #ffffff 70%);
      border: 1px solid #eee1d0;
      border-radius: 8px;
      position: relative;
    }

    .cover-header {
      text-align: center;
    }

    .cover-logo-principal {
      max-width: 210px;
      max-height: 220px;
      width: auto;
      height: auto;
      object-fit: contain;
      background-color: #ffffff;
      padding: 10px 14px;
      border-radius: 12px;
      box-shadow: 0 4px 16px rgba(61, 32, 18, 0.08);
      border: 1px solid #ebd9c3;
      margin: 0 auto 15px auto;
      display: block;
    }

    .cover-logo {
      width: 120px;
      height: 120px;
      object-fit: contain;
      border-radius: 50%;
      border: 3px solid #b88628;
      background-color: #ffffff;
      padding: 3px;
      box-shadow: 0 4px 14px rgba(61, 32, 18, 0.15);
      margin: 0 auto 15px auto;
      display: block;
    }

    .cover-brand {
      font-family: 'Playfair Display', serif;
      font-size: 26pt;
      font-weight: 900;
      letter-spacing: 2px;
      color: #2a170d;
      text-transform: uppercase;
    }

    .cover-brand span {
      font-weight: 400;
      font-style: italic;
      color: #b88628;
    }

    .cover-subbrand {
      font-size: 10pt;
      font-weight: 700;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: #7d5e46;
      margin-top: 4px;
    }

    .cover-divider {
      width: 80px;
      height: 3px;
      background: #b88628;
      margin: 18px auto;
      border-radius: 2px;
    }

    .cover-main-title {
      margin-top: 40px;
      text-align: center;
    }

    .cover-tag {
      display: inline-block;
      background: #f7ecd7;
      color: #694406;
      border: 1px solid #dfbe7e;
      padding: 5px 14px;
      border-radius: 20px;
      font-size: 8.5pt;
      font-weight: 800;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 15px;
    }

    .cover-h1 {
      font-family: 'Playfair Display', serif;
      font-size: 24pt;
      font-weight: 800;
      color: #1a0e07;
      line-height: 1.25;
      margin-bottom: 12px;
    }

    .cover-desc {
      font-size: 11pt;
      color: #574b42;
      max-width: 580px;
      margin: 0 auto;
      line-height: 1.5;
    }

    .cover-footer {
      border-top: 1px solid #e8dbcb;
      padding-top: 15px;
      display: flex;
      justify-content: space-between;
      font-size: 8.5pt;
      color: #736458;
    }

    /* CABEÇALHOS DE SEÇÃO */
    .section-title {
      font-family: 'Playfair Display', serif;
      font-size: 16pt;
      font-weight: 800;
      color: #2a170d;
      border-bottom: 2px solid #b88628;
      padding-bottom: 6px;
      margin: 24px 0 14px 0;
      display: flex;
      align-items: center;
      gap: 10px;
      page-break-after: avoid;
    }

    .section-title .badge {
      background: #b88628;
      color: white;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 9pt;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 6px;
    }

    .subsection-title {
      font-family: 'Playfair Display', serif;
      font-size: 12.5pt;
      font-weight: 700;
      color: #3b2213;
      margin: 16px 0 6px 0;
      page-break-after: avoid;
    }

    /* CARD DE FÓRMULA */
    .formula-card {
      background: #faf8f5;
      border: 1px solid #e7ded0;
      border-left: 4px solid #b88628;
      border-radius: 8px;
      padding: 12px 14px;
      margin-bottom: 14px;
      page-break-inside: avoid;
      box-shadow: 0 1px 3px rgba(0,0,0,0.03);
    }

    .formula-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 6px;
    }

    .formula-name {
      font-weight: 800;
      font-size: 10.5pt;
      color: #24140b;
    }

    .formula-tag {
      font-size: 7.5pt;
      font-weight: 800;
      text-transform: uppercase;
      background: #efe4d3;
      color: #63431f;
      padding: 2px 7px;
      border-radius: 4px;
    }

    .formula-box {
      background: #ffffff;
      border: 1px solid #dfd3c0;
      border-radius: 6px;
      padding: 8px 12px;
      margin: 6px 0 10px 0;
      text-align: center;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11pt;
      font-weight: 700;
      color: #754805;
      box-shadow: inset 0 1px 2px rgba(0,0,0,0.02);
    }

    .variables-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 5px 12px;
      margin: 8px 0;
      font-size: 8.5pt;
      background: #ffffff;
      padding: 8px 10px;
      border-radius: 6px;
      border: 1px solid #ebd9c3;
    }

    .var-item {
      display: flex;
      align-items: baseline;
      gap: 6px;
    }

    .var-symbol {
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      color: #8c5806;
      background: #fbf3e8;
      padding: 1px 5px;
      border-radius: 4px;
      border: 1px solid #efdfc7;
      font-size: 8pt;
      white-space: nowrap;
    }

    .var-desc {
      color: #493f37;
    }

    .use-block {
      margin-top: 8px;
      font-size: 8.5pt;
      color: #3f3630;
      line-height: 1.45;
    }

    .use-label {
      font-weight: 800;
      color: #613c1a;
      text-transform: uppercase;
      font-size: 7.5pt;
      letter-spacing: 0.5px;
      margin-bottom: 2px;
      display: block;
    }

    .example-box {
      background: #f1f7ed;
      border: 1px solid #cfdfc8;
      border-left: 3px solid #3c7333;
      border-radius: 5px;
      padding: 7px 10px;
      margin-top: 8px;
      font-size: 8.5pt;
      color: #213c1c;
    }

    .example-title {
      font-weight: 800;
      font-size: 7.8pt;
      text-transform: uppercase;
      color: #2b5624;
      margin-bottom: 2px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .example-calc {
      font-family: 'JetBrains Mono', monospace;
      font-weight: 600;
      color: #174213;
      margin-top: 3px;
      font-size: 8.5pt;
    }

    /* TABELAS */
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0 16px 0;
      font-size: 8.5pt;
      page-break-inside: avoid;
    }

    table.data-table th {
      background: #3d2214;
      color: #ffffff;
      font-weight: 700;
      text-align: left;
      padding: 6px 9px;
      border: 1px solid #573724;
      font-size: 8pt;
      text-transform: uppercase;
    }

    table.data-table td {
      padding: 5px 9px;
      border: 1px solid #e0d5c5;
      background: #ffffff;
    }

    table.data-table tr:nth-child(even) td {
      background: #faf6f0;
    }

    .highlight-cell {
      font-weight: 700;
      color: #8c5806;
      font-family: 'JetBrains Mono', monospace;
    }

    .page-break {
      page-break-after: always;
    }

    p.intro-text {
      font-size: 9pt;
      color: #55483e;
      margin-bottom: 10px;
      line-height: 1.45;
    }
  </style>
</head>
<body>

  <!-- ========================================== -->
  <!-- CAPA -->
  <!-- ========================================== -->
  <div class="cover-page">
    <div class="cover-header">
      \${logoPrincipalBase64 ? \`<img src="\${logoPrincipalBase64}" class="cover-logo-principal" alt="Recreio do Morro - Chapada Diamantina" />\` : ''}
      <div class="cover-divider"></div>
    </div>

    <div class="cover-main-title">
      <span class="cover-tag">Documentação Técnica Agronômica & Comercial</span>
      <h1 class="cover-h1">Manual de Fórmulas Químicas, Nutrição de Precisão & Distribuição</h1>
      <p class="cover-desc">
        Memorial analítico contendo todas as formulações, modelos matemáticos de calagem e gessagem, curvas de demanda nutricional por saca colhida, regulagem de maquinário por metro linear e matriz de precificação por canal de venda.
      </p>
    </div>

    <div class="cover-footer">
      <div><strong>Emissão:</strong> Setembro / 2026 • Sistema Sob Medida</div>
      <div><strong>Metodologias:</strong> Boletim 100 IAC • 5ª Aproximação CFSEMG • Demattê</div>
      <div><strong>Propriedade:</strong> Fazenda Recreio do Morro</div>
    </div>
  </div>

  <!-- ========================================== -->
  <!-- SEÇÃO 1: FERTILIDADE E ÍNDICES DO SOLO -->
  <!-- ========================================== -->
  <h2 class="section-title">
    <span class="badge">MÓDULO 1</span>
    Fertilidade Química e Interpretação do Laudo de Solo
  </h2>
  <p class="intro-text">
    As rotinas de cálculo inicial processam os teores brutos do laboratório e geram os índices de fertilidade, saturação de bases e balanço iônico que fundamentam todas as tomadas de decisão.
  </p>

  <!-- 1.1 Conversão de Potássio -->
  <div class="formula-card">
    <div class="formula-header">
      <span class="formula-name">1. Conversão de Potássio (mg/dm³ para cmol_c/dm³)</span>
      <span class="formula-tag">Estequiometria</span>
    </div>
    <div class="formula-box">
      K (cmol_c/dm³) = K (mg/dm³) ÷ 391
    </div>
    <div class="variables-grid">
      <div class="var-item"><span class="var-symbol">K (mg/dm³)</span><span class="var-desc">Teor de Potássio trocável reportado no laudo</span></div>
      <div class="var-item"><span class="var-symbol">391</span><span class="var-desc">Fator de conversão (Massa atômica 39,1 g/mol × 10)</span></div>
      <div class="var-item"><span class="var-symbol">K (cmol_c/dm³)</span><span class="var-desc">Carga de potássio na CTC do solo</span></div>
    </div>
    <div class="use-block">
      <span class="use-label">Uso Agronômico:</span>
      O laudo de laboratório frequentemente expressa o potássio em mg/dm³ (Mehlich-1), enquanto a CTC e a calagem operam em cmol_c/dm³. Essa conversão é pré-requisito mandatório para calcular a Soma de Bases sem erros de escala.
    </div>
    <div class="example-box">
      <div class="example-title">Exemplo Prático:</div>
      Laudo do Talhão com K = 78,2 mg/dm³:
      <div class="example-calc">K (cmol_c/dm³) = 78,2 ÷ 391 = 0,20 cmol_c/dm³</div>
    </div>
  </div>

  <!-- 1.2 Soma de Bases -->
  <div class="formula-card">
    <div class="formula-header">
      <span class="formula-name">2. Soma de Bases Trocáveis (SB)</span>
      <span class="formula-tag">Fertilidade</span>
    </div>
    <div class="formula-box">
      SB = Ca²⁺ + Mg²⁺ + K⁺
    </div>
    <div class="variables-grid">
      <div class="var-item"><span class="var-symbol">SB</span><span class="var-desc">Soma de Bases em cmol_c/dm³</span></div>
      <div class="var-item"><span class="var-symbol">Ca²⁺</span><span class="var-desc">Cálcio trocável (cmol_c/dm³)</span></div>
      <div class="var-item"><span class="var-symbol">Mg²⁺</span><span class="var-desc">Magnésio trocável (cmol_c/dm³)</span></div>
      <div class="var-item"><span class="var-symbol">K⁺</span><span class="var-desc">Potássio trocável (cmol_c/dm³)</span></div>
    </div>
    <div class="use-block">
      <span class="use-label">Uso Agronômico:</span>
      Representa o estoque total de cátions nutritivos disponíveis imediatamente para o cafeeiro. Valores de SB abaixo de 2,0 indicam solos pobres, enquanto valores acima de 4,0 indicam ótima fertilidade química.
    </div>
    <div class="example-box">
      <div class="example-title">Exemplo Prático:</div>
      Com Ca = 2,10 cmol_c/dm³, Mg = 0,50 cmol_c/dm³ e K = 0,20 cmol_c/dm³:
      <div class="example-calc">SB = 2,10 + 0,50 + 0,20 = 2,80 cmol_c/dm³</div>
    </div>
  </div>

  <!-- 1.3 CTC Efetiva -->
  <div class="formula-card">
    <div class="formula-header">
      <span class="formula-name">3. Capacidade de Troca Catiônica Efetiva (t)</span>
      <span class="formula-tag">Complexo de Troca</span>
    </div>
    <div class="formula-box">
      t = SB + Al³⁺
    </div>
    <div class="variables-grid">
      <div class="var-item"><span class="var-symbol">t</span><span class="var-desc">CTC efetiva no pH de campo (cmol_c/dm³)</span></div>
      <div class="var-item"><span class="var-symbol">SB</span><span class="var-desc">Soma de Bases (cmol_c/dm³)</span></div>
      <div class="var-item"><span class="var-symbol">Al³⁺</span><span class="var-desc">Alumínio trocável / acidez trocável (cmol_c/dm³)</span></div>
    </div>
    <div class="use-block">
      <span class="use-label">Uso Agronômico:</span>
      Expressa a retenção de cátions no pH atual. Usada primordialmente para mensurar a saturação de alumínio (m%), identificando se o alumínio está aprisionando as cargas elétricas do solo e intoxicando as raízes.
    </div>
    <div class="example-box">
      <div class="example-title">Exemplo Prático:</div>
      Com SB = 2,80 cmol_c/dm³ e Al = 0,30 cmol_c/dm³:
      <div class="example-calc">t = 2,80 + 0,30 = 3,10 cmol_c/dm³</div>
    </div>
  </div>

  <!-- 1.4 CTC Total (T) -->
  <div class="formula-card">
    <div class="formula-header">
      <span class="formula-name">4. Capacidade de Troca Catiônica a pH 7,0 (T)</span>
      <span class="formula-tag">Capacidade Máxima</span>
    </div>
    <div class="formula-box">
      T = SB + (H + Al)
    </div>
    <div class="variables-grid">
      <div class="var-item"><span class="var-symbol">T</span><span class="var-desc">CTC potencial máxima (cmol_c/dm³)</span></div>
      <div class="var-item"><span class="var-symbol">SB</span><span class="var-desc">Soma de bases (cmol_c/dm³)</span></div>
      <div class="var-item"><span class="var-symbol">H + Al</span><span class="var-desc">Acidez potencial determinada por acetato de cálcio</span></div>
    </div>
    <div class="use-block">
      <span class="use-label">Uso Agronômico:</span>
      Indica o "tamanho do tanque" do solo, refletindo seu teor de argila e matéria orgânica. Quanto maior o valor de T, maior a capacidade de reter adubos sem lixiviação e maior a dose de calcário requerida para alterar o pH.
    </div>
    <div class="example-box">
      <div class="example-title">Exemplo Prático:</div>
      Com SB = 2,80 cmol_c/dm³ e H + Al = 4,20 cmol_c/dm³:
      <div class="example-calc">T = 2,80 + 4,20 = 7,00 cmol_c/dm³</div>
    </div>
  </div>

  <div class="page-break"></div>

  <!-- 1.5 Saturação por Bases (V%) -->
  <div class="formula-card">
    <div class="formula-header">
      <span class="formula-name">5. Saturação por Bases (V%)</span>
      <span class="formula-tag">Principal Indicador de Calagem</span>
    </div>
    <div class="formula-box">
      V% = (SB ÷ T) × 100
    </div>
    <div class="variables-grid">
      <div class="var-item"><span class="var-symbol">V%</span><span class="var-desc">Porcentagem de saturação por bases atual</span></div>
      <div class="var-item"><span class="var-symbol">SB</span><span class="var-desc">Soma de bases trocáveis (cmol_c/dm³)</span></div>
      <div class="var-item"><span class="var-symbol">T</span><span class="var-desc">CTC a pH 7,0 (cmol_c/dm³)</span></div>
      <div class="var-item"><span class="var-symbol">Meta Café</span><span class="var-desc">60% a 70% (recomendado 65% para grãos pesados)</span></div>
    </div>
    <div class="use-block">
      <span class="use-label">Uso Agronômico:</span>
      O V% quantifica qual fração da capacidade do solo está ocupada por nutrientes bons em vez de acidez. O cafeeiro expressa pleno potencial vegetativo e formação de grãos densos quando o V% está na faixa de 60% a 70%.
    </div>
    <div class="example-box">
      <div class="example-title">Exemplo Prático:</div>
      Com SB = 2,80 e T = 7,00 cmol_c/dm³:
      <div class="example-calc">V% = (2,80 ÷ 7,00) × 100 = 40,0%  (Abaixo da meta de 65% → Calagem necessária)</div>
    </div>
  </div>

  <!-- 1.6 Saturação por Alumínio (m%) -->
  <div class="formula-card">
    <div class="formula-header">
      <span class="formula-name">6. Saturação por Alumínio (m%)</span>
      <span class="formula-tag">Toxidez</span>
    </div>
    <div class="formula-box">
      m% = (Al³⁺ ÷ t) × 100
    </div>
    <div class="variables-grid">
      <div class="var-item"><span class="var-symbol">m%</span><span class="var-desc">Saturação por alumínio em percentual</span></div>
      <div class="var-item"><span class="var-symbol">Al³⁺</span><span class="var-desc">Alumínio trocável (cmol_c/dm³)</span></div>
      <div class="var-item"><span class="var-symbol">t</span><span class="var-desc">CTC efetiva (cmol_c/dm³)</span></div>
    </div>
    <div class="use-block">
      <span class="use-label">Uso Agronômico:</span>
      O alumínio é fitotóxico e queima as pontas das raízes novas. Valores de m% acima de 15% na superfície exigem calagem imediata; na subsuperfície (20-40cm), valores acima de 20% acionam a recomendação de gessagem.
    </div>
    <div class="example-box">
      <div class="example-title">Exemplo Prático:</div>
      Com Al = 0,30 e t = 3,10 cmol_c/dm³:
      <div class="example-calc">m% = (0,30 ÷ 3,10) × 100 = 9,7%  (Tolerável na camada 0-20cm, mas monitorar)</div>
    </div>
  </div>

  <!-- 1.7 Relação Ca:Mg -->
  <div class="formula-card">
    <div class="formula-header">
      <span class="formula-name">7. Relação Catiônica Cálcio / Magnésio (Ca:Mg)</span>
      <span class="formula-tag">Balanço Iônico</span>
    </div>
    <div class="formula-box">
      Relação Ca:Mg = Ca (cmol_c/dm³) ÷ Mg (cmol_c/dm³)
    </div>
    <div class="variables-grid">
      <div class="var-item"><span class="var-symbol">Ca</span><span class="var-desc">Cálcio trocável (cmol_c/dm³)</span></div>
      <div class="var-item"><span class="var-symbol">Mg</span><span class="var-desc">Magnésio trocável (cmol_c/dm³)</span></div>
      <div class="var-item"><span class="var-symbol">Faixa Ideal</span><span class="var-desc">3,0 : 1 a 4,5 : 1 no cafeeiro</span></div>
    </div>
    <div class="use-block">
      <span class="use-label">Uso Agronômico:</span>
      Define a escolha do tipo de calcário. Se Ca:Mg for superior a 4,5:1, há deficiência relativa de magnésio (comprometendo a clorofila e a fotossíntese), exigindo calcário Dolomítico rico em magnésio.
    </div>
    <div class="example-box">
      <div class="example-title">Exemplo Prático:</div>
      Com Ca = 2,10 e Mg = 0,50 cmol_c/dm³:
      <div class="example-calc">Ca:Mg = 2,10 ÷ 0,50 = 4,20 : 1  (Equilibrado → Calcário Magnesiano ou Dolomítico)</div>
    </div>
  </div>

  <!-- ========================================== -->
  <!-- SEÇÃO 2: CORREÇÃO DO SOLO -->
  <!-- ========================================== -->
  <h2 class="section-title">
    <span class="badge">MÓDULO 2</span>
    Correção do Perfil do Solo: Calagem e Gessagem
  </h2>
  <p class="intro-text">
    Corrige a acidez e neutraliza o alumínio tóxico tanto na camada arável (0-20cm) quanto em profundidade (20-40cm), criando condições para que as raízes busquem água nas secas.
  </p>

  <!-- 2.1 Necessidade de Calagem em Área Total -->
  <div class="formula-card">
    <div class="formula-header">
      <span class="formula-name">8. Necessidade de Calagem em Área Total (NC_total)</span>
      <span class="formula-tag">Método da Saturação por Bases</span>
    </div>
    <div class="formula-box">
      NC_total (t/ha) = [ (V_desejado - V_atual) × T ] ÷ PRNT
    </div>
    <div class="variables-grid">
      <div class="var-item"><span class="var-symbol">NC_total</span><span class="var-desc">Dose em área total (toneladas/hectare)</span></div>
      <div class="var-item"><span class="var-symbol">V_desejado</span><span class="var-desc">Meta de saturação (ex: 65% configurável)</span></div>
      <div class="var-item"><span class="var-symbol">V_atual</span><span class="var-desc">Saturação por bases atual do laudo (%)</span></div>
      <div class="var-item"><span class="var-symbol">T</span><span class="var-desc">CTC total a pH 7,0 (cmol_c/dm³)</span></div>
      <div class="var-item"><span class="var-symbol">PRNT</span><span class="var-desc">Poder Relativo de Neutralização Total do calcário (%)</span></div>
    </div>
    <div class="use-block">
      <span class="use-label">Uso Agronômico:</span>
      Fórmula oficial da 5ª Aproximação e Boletim 100 IAC. Ajusta a quantidade exata de corretivo em função do poder de neutralização real do produto comercial adquirido.
    </div>
    <div class="example-box">
      <div class="example-title">Exemplo Prático:</div>
      V_atual = 40%, Meta = 65%, T = 7,00 cmol_c/dm³, Calcário com PRNT = 85%:
      <div class="example-calc">NC_total = [ (65 - 40) × 7,00 ] ÷ 85 = [ 25 × 7,00 ] ÷ 85 = 2,06 t/ha em área total</div>
    </div>
  </div>

  <div class="page-break"></div>

  <!-- 2.2 Calagem em Faixa sob a Saia -->
  <div class="formula-card">
    <div class="formula-header">
      <span class="formula-name">9. Fator de Faixa e Calagem Localizada na Saia (NC_faixa)</span>
      <span class="formula-tag">Economia & Eficiência de Aplicação</span>
    </div>
    <div class="formula-box">
      Fator_faixa = 1,5m ÷ Espaçamento_Rua (m)
      <br>
      NC_faixa (t/ha) = NC_total × Fator_faixa
      <br>
      Total_Talhão (kg) = NC_faixa × 1.000 × Área (ha)
    </div>
    <div class="variables-grid">
      <div class="var-item"><span class="var-symbol">1,5m</span><span class="var-desc">Largura da faixa sob a saia onde concentram-se as raízes ativas</span></div>
      <div class="var-item"><span class="var-symbol">Espaçamento_Rua</span><span class="var-desc">Distância entre fileiras de café (ex: 3,5m)</span></div>
      <div class="var-item"><span class="var-symbol">Fator_faixa</span><span class="var-desc">Proporção da área efetivamente corrigida (~0,35 a 0,50)</span></div>
      <div class="var-item"><span class="var-symbol">NC_faixa</span><span class="var-desc">Dose real por hectare de lavoura (t/ha)</span></div>
    </div>
    <div class="use-block">
      <span class="use-label">Uso Agronômico:</span>
      Em lavouras de café implantadas, aplicar calcário no meio da rua é desperdício financeiro, pois o rodado das máquinas compacta o solo e as raízes ativas estão na projeção da copa. A aplicação em faixa reduz a quantidade de calcário necessária em 50% a 60%, concentrando a neutralização onde ela é vital.
    </div>
    <div class="example-box">
      <div class="example-title">Exemplo Prático:</div>
      NC_total = 2,06 t/ha, Rua de 3,5 metros, Talhão de 4,0 hectares:
      <div class="example-calc">Fator_faixa = 1,5 ÷ 3,5 = 0,429 (42,9% da área)</div>
      <div class="example-calc">NC_faixa = 2,06 × 0,429 = 0,88 t/ha</div>
      <div class="example-calc">Total Talhão = 0,88 × 1.000 × 4,0 = 3.520 kg de Calcário</div>
    </div>
  </div>

  <!-- 2.3 Gessagem -->
  <div class="formula-card">
    <div class="formula-header">
      <span class="formula-name">10. Gessagem Agrícola em Subsuperfície (Dose Demattê)</span>
      <span class="formula-tag">Aprofundamento Radicular</span>
    </div>
    <div class="formula-box">
      Gatilho: Se m% (20-40cm) > 20% OU Ca (20-40cm) < 0,40 cmol_c/dm³
      <br>
      Dose_Gesso (kg/ha) = 50 × Argila (%)
      <br>
      Total_Gesso_Talhão (kg) = Dose_Gesso × Área (ha)
    </div>
    <div class="variables-grid">
      <div class="var-item"><span class="var-symbol">Argila (%)</span><span class="var-desc">Teor de argila do solo determinado na análise física</span></div>
      <div class="var-item"><span class="var-symbol">50</span><span class="var-desc">Constante de Demattê para cafeeiro</span></div>
      <div class="var-item"><span class="var-symbol">Dose_Gesso</span><span class="var-desc">Quilogramas de gesso agrícola por hectare</span></div>
    </div>
    <div class="use-block">
      <span class="use-label">Uso Agronômico:</span>
      O calcário não desce além dos primeiros 20 cm devido à sua baixa solubilidade. O gesso agrícola (sulfato de cálcio) é 150 vezes mais solúvel: ele carrega cálcio para o subsolo e precipita o alumínio tóxico como sulfato de alumínio não tóxico. Isso permite que as raízes do café desçam a mais de 1,5 m de profundidade, sobrevivendo aos veranicos da Chapada Diamantina.
    </div>
    <div class="example-box">
      <div class="example-title">Exemplo Prático:</div>
      Subsolo com m% = 26% (toxidez) e Argila = 35% em talhão de 4,0 ha:
      <div class="example-calc">Dose_Gesso = 50 × 35 = 1.750 kg/ha</div>
      <div class="example-calc">Total Talhão = 1.750 × 4,0 = 7.000 kg (7,0 toneladas) de Gesso Agrícola</div>
    </div>
  </div>

  <!-- ========================================== -->
  <!-- SEÇÃO 3: DEMANDA E BALANÇO DE NUTRIENTES -->
  <!-- ========================================== -->
  <h2 class="section-title">
    <span class="badge">MÓDULO 3</span>
    Demanda, Balanço e Créditos de Nutrientes (N, P, K)
  </h2>
  <p class="intro-text">
    Modela os quilogramas de nutrientes puros necessários para cumprir a meta de produtividade sem gerar excessos ou carências.
  </p>

  <!-- 3.1 Demanda de Nitrogênio -->
  <div class="formula-card">
    <div class="formula-header">
      <span class="formula-name">11. Demanda de Nitrogênio Puro (N_bruto)</span>
      <span class="formula-tag">Vigor Vegetativo Equilibrado</span>
    </div>
    <div class="formula-box">
      N_bruto (kg/ha) = Meta_Sacas × Taxa_N × [ 1 + (Ajuste_histN ÷ 100) ]
    </div>
    <div class="variables-grid">
      <div class="var-item"><span class="var-symbol">Meta_Sacas</span><span class="var-desc">Produtividade planejada (sacas beneficiadas de 60kg por ha)</span></div>
      <div class="var-item"><span class="var-symbol">Taxa_N</span><span class="var-desc">kg de N por saca esperada (padrão do sistema: 3,0 kg N/sc)</span></div>
      <div class="var-item"><span class="var-symbol">Ajuste_histN</span><span class="var-desc">Ajuste retroalimentado (+15% pós-safra recorde, etc.)</span></div>
    </div>
    <div class="use-block">
      <span class="use-label">Uso Agronômico:</span>
      No café, a taxa padrão de 3,0 kg N/sc supre a formação das folhas e ramos produtivos do ano seguinte. Taxas excessivas (>3,5 kg) induzem vegetativismo descontrolado, auto-sombreamento e abortamento floral.
    </div>
    <div class="example-box">
      <div class="example-title">Exemplo Prático:</div>
      Meta = 40 scs/ha, Taxa = 3,0 kg N/sc, sem desvio histórico:
      <div class="example-calc">N_bruto = 40 × 3,0 = 120 kg N/ha</div>
    </div>
  </div>

  <div class="page-break"></div>

  <!-- 3.2 Demanda de Fósforo -->
  <div class="formula-card">
    <div class="formula-header">
      <span class="formula-name">12. Demanda de Fósforo (P₂O₅) em Curva de Resposta ao Solo</span>
      <span class="formula-tag">Curva de Calibração</span>
    </div>
    <div class="formula-box">
      Se P_solo &lt; 10 mg/dm³: P₂O₅ = max(90, Meta_Sacas × 2,2)
      <br>
      Se 10 ≤ P_solo &lt; 20 mg/dm³: P₂O₅ = max(60, Meta_Sacas × 1,5)
      <br>
      Se 20 ≤ P_solo &lt; 40 mg/dm³: P₂O₅ = max(30, Meta_Sacas × 0,9)
      <br>
      Se P_solo ≥ 40 mg/dm³: P₂O₅ = 20 kg/ha (Manutenção mínima)
    </div>
    <div class="variables-grid">
      <div class="var-item"><span class="var-symbol">P_solo</span><span class="var-desc">Teor de Fósforo Mehlich-1 na camada 0-20cm (mg/dm³)</span></div>
      <div class="var-item"><span class="var-symbol">Meta_Sacas</span><span class="var-desc">Sacas/ha de meta</span></div>
      <div class="var-item"><span class="var-symbol">P₂O₅</span><span class="var-desc">Quilogramas de pentóxido de fósforo por hectare</span></div>
    </div>
    <div class="use-block">
      <span class="use-label">Uso Agronômico:</span>
      O fósforo tem baixa mobilidade em solos tropicais devido à forte fixação por óxidos de ferro e alumínio. A fórmula garante dose de segurança caso o teor no solo seja baixo e reduz drasticamente a dose quando o solo já possui acúmulo residual, economizando insumos caros como o MAP.
    </div>
    <div class="example-box">
      <div class="example-title">Exemplo Prático:</div>
      Solo com P = 14 mg/dm³ (Médio) e Meta de 40 scs/ha:
      <div class="example-calc">P₂O₅ = max(60, 40 × 1,5) = max(60, 60) = 60 kg P₂O₅/ha</div>
    </div>
  </div>

  <!-- 3.3 Demanda de Potássio -->
  <div class="formula-card">
    <div class="formula-header">
      <span class="formula-name">13. Demanda de Potássio (K₂O) e Densidade de Grão</span>
      <span class="formula-tag">Enchimento e Peso dos Frutos</span>
    </div>
    <div class="formula-box">
      Fator_K = 3,8 (se K ≤ 0,15) | 2,8 (se 0,15 &lt; K ≤ 0,30) | 2,0 (se 0,30 &lt; K ≤ 0,50) | 1,4 (se K &gt; 0,50)
      <br>
      K₂O_bruto (kg/ha) = Meta_Sacas × Fator_K × [ 1 + (Ajuste_histK ÷ 100) ]
    </div>
    <div class="variables-grid">
      <div class="var-item"><span class="var-symbol">K_solo</span><span class="var-desc">Potássio trocável no solo (cmol_c/dm³)</span></div>
      <div class="var-item"><span class="var-symbol">Fator_K</span><span class="var-desc">Taxa de consumo (kg K₂O/saca) ajustada pelo estoque do solo</span></div>
    </div>
    <div class="use-block">
      <span class="use-label">Uso Agronômico:</span>
      O potássio é responsável pelo transporte de açúcares das folhas para os frutos e pela retenção osmótica de água. É o elemento-chave para evitar "grãos chochos", aumentar o peso específico da saca e conferir corpo à bebida.
    </div>
    <div class="example-box">
      <div class="example-title">Exemplo Prático:</div>
      Solo com K = 0,22 cmol_c/dm³ (Médio → Fator 2,8), Meta = 40 scs/ha:
      <div class="example-calc">K₂O_bruto = 40 × 2,8 = 112 kg K₂O/ha</div>
    </div>
  </div>

  <!-- 3.4 Crédito de Palha de Café -->
  <div class="formula-card">
    <div class="formula-header">
      <span class="formula-name">14. Desconto Orgânico da Reciclagem de Palha do Terreiro</span>
      <span class="formula-tag">Economia Circular & Manejo Regenerativo</span>
    </div>
    <div class="formula-box">
      K₂O_abatido (kg/ha) = Palha (t/ha) × 25 kg/t × 0,50
      <br>
      N_abatido (kg/ha) = Palha (t/ha) × 15 kg/t × 0,30
      <br>
      K₂O_líquido = max(30, K₂O_bruto - K₂O_abatido)
      <br>
      N_líquido = max(20, N_bruto - N_abatido)
    </div>
    <div class="variables-grid">
      <div class="var-item"><span class="var-symbol">25 kg/t</span><span class="var-desc">Teor médio de K₂O em 1 tonelada de palha seca de café</span></div>
      <div class="var-item"><span class="var-symbol">0,50</span><span class="var-desc">Coeficiente de mineralização do K no primeiro ano (50%)</span></div>
      <div class="var-item"><span class="var-symbol">15 kg/t</span><span class="var-desc">Teor médio de N em 1 tonelada de palha</span></div>
      <div class="var-item"><span class="var-symbol">0,30</span><span class="var-desc">Coeficiente de liberação de N no primeiro ano (30%)</span></div>
    </div>
    <div class="use-block">
      <span class="use-label">Uso Agronômico:</span>
      A casca residual do benefício do café é riquíssima em potássio retirado pela safra. Ao retornar à lavoura, além de suprir adubação orgânica gratuita, retém umidade do solo e abriga micorrizas benéficas.
    </div>
    <div class="example-box">
      <div class="example-title">Exemplo Prático:</div>
      Aplicação de 4,0 t/ha de palha de café sob a saia:
      <div class="example-calc">K₂O_abatido = 4,0 × 25 × 0,50 = 50 kg K₂O/ha economizados</div>
      <div class="example-calc">K₂O_líquido mineral a comprar = 112 - 50 = 62 kg K₂O/ha</div>
    </div>
  </div>

  <div class="page-break"></div>

  <!-- ========================================== -->
  <!-- SEÇÃO 4: CONVERSÃO OPERACIONAL DE CAMPO -->
  <!-- ========================================== -->
  <h2 class="section-title">
    <span class="badge">MÓDULO 4</span>
    Conversão Operacional de Campo e Regulagem de Máquinas
  </h2>
  <p class="intro-text">
    Traduz os quilos de nutrientes químicos por hectare em medidas práticas para o tratorista e para os trabalhadores rurais: gramas por metro linear e gramas por planta.
  </p>

  <!-- 4.1 População e Metros Lineares -->
  <div class="formula-card">
    <div class="formula-header">
      <span class="formula-name">15. Densidade de Plantas e Metros Lineares por Hectare</span>
      <span class="formula-tag">Geometria do Plantio</span>
    </div>
    <div class="formula-box">
      Densidade_Plantas (plantas/ha) = 10.000 m² ÷ [ Espaçamento_Rua (m) × Espaçamento_Planta (m) ]
      <br>
      Metros_Lineares (m/ha) = 10.000 m² ÷ Espaçamento_Rua (m)
    </div>
    <div class="variables-grid">
      <div class="var-item"><span class="var-symbol">10.000 m²</span><span class="var-desc">Área de 1 hectare</span></div>
      <div class="var-item"><span class="var-symbol">Espaçamento_Rua</span><span class="var-desc">Distância entre ruas em metros (ex: 3,5m)</span></div>
      <div class="var-item"><span class="var-symbol">Espaçamento_Planta</span><span class="var-desc">Distância entre pés na linha (ex: 0,7m)</span></div>
    </div>
    <div class="use-block">
      <span class="use-label">Uso Agronômico:</span>
      Padroniza a contabilidade da lavoura. Permite fracionar o adubo por cova e regular as esteiras das carretas adubadeiras de fluxo contínuo.
    </div>
    <div class="example-box">
      <div class="example-title">Exemplo Prático:</div>
      Plantio com rua de 3,5 m e espaçamento de 0,7 m entre covas:
      <div class="example-calc">Densidade = 10.000 ÷ (3,5 × 0,7) = 10.000 ÷ 2,45 = 4.082 plantas/ha</div>
      <div class="example-calc">Metros Lineares = 10.000 ÷ 3,5 = 2.857 metros de linha por hectare</div>
    </div>
  </div>

  <!-- 4.2 Matérias-Primas Comerciais -->
  <div class="formula-card">
    <div class="formula-header">
      <span class="formula-name">16. Dimensionamento dos Fertilizantes Comerciais Simples</span>
      <span class="formula-tag">Garantia Nutricional dos Insumos</span>
    </div>
    <div class="formula-box">
      Dose_MAP (kg/ha) = P₂O₅_líquido ÷ 0,52
      <br>
      Dose_KCl (kg/ha) = K₂O_líquido ÷ 0,60
      <br>
      Dose_SulfatoAmonio (kg/ha) = (N_líquido × 0,15) ÷ 0,24
      <br>
      Dose_Ureia (kg/ha) = Saldo_N ÷ 0,45
    </div>
    <div class="variables-grid">
      <div class="var-item"><span class="var-symbol">MAP</span><span class="var-desc">Fosfato Monoamônico (11% N + 52% P₂O₅)</span></div>
      <div class="var-item"><span class="var-symbol">KCl</span><span class="var-desc">Cloreto de Potássio (60% K₂O)</span></div>
      <div class="var-item"><span class="var-symbol">Sulfato Amônio</span><span class="var-desc">21% N + 24% S (atende a relação estequiométrica N:S de 10:1 a 8:1)</span></div>
      <div class="var-item"><span class="var-symbol">Ureia</span><span class="var-desc">45% N (complementa o nitrogênio restante de menor custo)</span></div>
    </div>
    <div class="use-block">
      <span class="use-label">Uso Agronômico:</span>
      O sistema prioriza a mistura de matérias-primas nobres simples em vez de NPK formulado genérico, economizando até 35% no custo por quilo de nutriente aplicado e fornecendo enxofre e fósforo concentrados na época certa.
    </div>
    <div class="example-box">
      <div class="example-title">Exemplo Prático:</div>
      Para suprir 60 kg P₂O₅, 62 kg K₂O e 120 kg N:
      <div class="example-calc">Dose MAP = 60 ÷ 0,52 = 115 kg MAP/ha (fornece 115 × 0,11 = 13 kg N)</div>
      <div class="example-calc">Dose KCl = 62 ÷ 0,60 = 103 kg KCl/ha</div>
    </div>
  </div>

  <!-- 4.3 Gramas por Planta e por Metro Linear -->
  <div class="formula-card">
    <div class="formula-header">
      <span class="formula-name">17. Regulagem Operacional: Gramas por Planta e por Metro Linear</span>
      <span class="formula-tag">Ficha de Regulagem</span>
    </div>
    <div class="formula-box">
      Gramas_por_Planta (g/planta) = [ Dose_Adubo (kg/ha) × 1.000 ] ÷ Densidade_Plantas
      <br>
      Gramas_por_Metro (g/m) = [ Dose_Adubo (kg/ha) × Espaçamento_Rua (m) ] ÷ 10
    </div>
    <div class="variables-grid">
      <div class="var-item"><span class="var-symbol">g/planta</span><span class="var-desc">Para calibração de copo dosador manual na aplicação a pé</span></div>
      <div class="var-item"><span class="var-symbol">g/m linear</span><span class="var-desc">Para calibração da esteira/adubadeira acoplada ao trator</span></div>
    </div>
    <div class="use-block">
      <span class="use-label">Uso Agronômico:</span>
      Elimina o erro humano no campo. O tratorista calibra a máquina colocando uma lona de 10 metros sob a bica e conferindo a pesagem em balança digital antes de iniciar o talhão.
    </div>
    <div class="example-box">
      <div class="example-title">Exemplo Prático:</div>
      Dose de 208 kg/ha de KCl em lavoura com rua de 3,5m e 4.082 plantas/ha:
      <div class="example-calc">g/planta = (208 × 1.000) ÷ 4.082 = 51 g por pé de café</div>
      <div class="example-calc">g/m linear = (208 × 3,5) ÷ 10 = 72,8 g por metro linear de saia</div>
    </div>
  </div>

  <div class="page-break"></div>

  <!-- ========================================== -->
  <!-- SEÇÃO 5: RETROALIMENTAÇÃO HISTÓRICA -->
  <!-- ========================================== -->
  <h2 class="section-title">
    <span class="badge">MÓDULO 5</span>
    Retroalimentação Histórica & Exportação de Nutrientes
  </h2>
  <p class="intro-text">
    Aprende com os resultados das safras anteriores e calibra os planos futuros em função do balanço nutricional e da bienalidade da cultura.
  </p>

  <!-- 5.1 Exportação na Colheita -->
  <div class="formula-card">
    <div class="formula-header">
      <span class="formula-name">18. Extração e Exportação de Nutrientes na Colheita</span>
      <span class="formula-tag">Balanço de Saída</span>
    </div>
    <div class="formula-box">
      N_exportado (kg/ha) = Sacas_Colhidas × 2,4 kg/sc
      <br>
      P₂O₅_exportado (kg/ha) = Sacas_Colhidas × 0,4 kg/sc
      <br>
      K₂O_exportado (kg/ha) = Sacas_Colhidas × 2,8 kg/sc
    </div>
    <div class="variables-grid">
      <div class="var-item"><span class="var-symbol">Sacas_Colhidas</span><span class="var-desc">Produtividade real colhida (sacas de 60kg beneficiadas/ha)</span></div>
      <div class="var-item"><span class="var-symbol">2,4 / 0,4 / 2,8</span><span class="var-desc">Constantes médias de exportação por saca (Embrapa/IAC)</span></div>
    </div>
    <div class="use-block">
      <span class="use-label">Uso Agronômico:</span>
      Quantifica exatamente quanto nutriente foi retirado do solo e ensacado nos grãos. Se a adubação aplicada for menor que a exportada, o solo empobrece e o cafeeiro entra em ciclo bienal depressivo na safra seguinte.
    </div>
    <div class="example-box">
      <div class="example-title">Exemplo Prático:</div>
      Safra colhida de 50 sacas/ha no Talhão Recreio 1:
      <div class="example-calc">N Exportado = 50 × 2,4 = 120 kg N/ha retirados</div>
      <div class="example-calc">P₂O₅ Exportado = 50 × 0,4 = 20 kg P₂O₅/ha retirados</div>
      <div class="example-calc">K₂O Exportado = 50 × 2,8 = 140 kg K₂O/ha retirados do solo</div>
    </div>
  </div>

  <!-- 5.2 Ajuste de Bienalidade -->
  <div class="formula-card">
    <div class="formula-header">
      <span class="formula-name">19. Ajuste Retroalimentado de Safra (Bienalidade)</span>
      <span class="formula-tag">Machine Feedback</span>
    </div>
    <div class="formula-box">
      Se Safra_Anterior ≥ 50 scs/ha (Ano de Alta):
      <br>
      Ajuste_N = +15% &nbsp;|&nbsp; Ajuste_K = +10% (Reposição de reservas de carboidratos)
      <br><br>
      Se Saldo_Solo_P &gt; 30 mg/dm³ e Subiu &gt; 5 mg/dm³:
      <br>
      Ajuste_P = -25% (Economia de insumo devido a acúmulo residual)
    </div>
    <div class="use-block">
      <span class="use-label">Uso Agronômico:</span>
      Uma colheita recorde drena os açúcares e aminoácidos dos ramos do café, causando desfolha no inverno. O algoritmo detecta essa sobrecarga e injeta automaticamente +15% de Nitrogênio e +10% de Potássio no plano da safra seguinte para reconstruir a copa da planta sem abortar gemas florais.
    </div>
  </div>

  <!-- ========================================== -->
  <!-- SEÇÃO 6: DISTRIBUIÇÃO E VENDAS -->
  <!-- ========================================== -->
  <h2 class="section-title">
    <span class="badge">MÓDULO 6</span>
    Módulo Comercial: Preços por PDV, Estoque e Receitas
  </h2>
  <p class="intro-text">
    Permite gerenciar a saída dos produtos acabados (cafés empacotados e tomates de mesa) com políticas de preço customizadas por cliente/PDV e controle de faturamento.
  </p>

  <!-- 6.1 Matriz de Preço por PDV -->
  <div class="formula-card">
    <div class="formula-header">
      <span class="formula-name">20. Matriz de Preço Efetivo por Ponto de Venda</span>
      <span class="formula-tag">Gestão de Canais B2B</span>
    </div>
    <div class="formula-box">
      Preço_Efetivo = Preço_Negociado(PDV, Produto) &nbsp;[Se cadastrado]
      <br>
      Preço_Efetivo = Preço_Padrão(Produto) &nbsp;[Caso contrário - Fallback]
    </div>
    <div class="use-block">
      <span class="use-label">Uso Comercial:</span>
      Cafeterias parceiras, empórios gourmet, supermercados e venda direta ao consumidor final praticam margens diferentes. A matriz assegura que o sistema puxe automaticamente o valor negociado específico para aquele comprador sem risco de cobrança errônea.
    </div>
  </div>

  <!-- 6.2 Faturamento e Baixa de Estoque -->
  <div class="formula-card">
    <div class="formula-header">
      <span class="formula-name">21. Faturamento da Saída e Baixa de Estoque</span>
      <span class="formula-tag">Controle de Saídas</span>
    </div>
    <div class="formula-box">
      Valor_Item = Quantidade × Preço_Efetivo
      <br>
      Total_Faturado_Saída = ∑ (Valor_Item_1 + Valor_Item_2 + ... + Valor_Item_n)
      <br>
      Estoque_Atualizado = max(0, Estoque_Anterior - Quantidade)
    </div>
    <div class="example-box">
      <div class="example-title">Exemplo Prático:</div>
      Venda para cafeteria de Salvador: 20 pacotes Bourbon (Negociado a R$ 32,00) e 10 caixas Tomate Rasteiro (Negociado a R$ 70,00):
      <div class="example-calc">Bourbon = 20 × 32,00 = R$ 640,00 | Tomate = 10 × 70,00 = R$ 700,00</div>
      <div class="example-calc">Total Faturado = R$ 640,00 + R$ 700,00 = R$ 1.340,00</div>
      <div class="example-calc">Estoque de Bourbon: Baixa automática de 20 unidades.</div>
    </div>
  </div>

  <!-- ========================================== -->
  <!-- TABELA RESUMO DE CONSULTA RÁPIDA -->
  <!-- ========================================== -->
  <h2 class="section-title">
    <span class="badge">RESUMO</span>
    Tabela Sintética de Consulta Rápida de Campo
  </h2>
  <table class="data-table">
    <thead>
      <tr>
        <th style="width: 25%;">Fórmula / Índice</th>
        <th style="width: 35%;">Equação Matemática</th>
        <th style="width: 20%;">Faixa Ideal no Café</th>
        <th style="width: 20%;">Ação Agronômica</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Conversão Potássio</strong></td>
        <td><code>K (cmol_c) = K (mg/dm³) ÷ 391</code></td>
        <td>&gt; 0,25 cmol_c/dm³</td>
        <td>Harmonizar unidades do laudo</td>
      </tr>
      <tr>
        <td><strong>Soma de Bases (SB)</strong></td>
        <td><code>SB = Ca + Mg + K</code></td>
        <td>&gt; 3,50 cmol_c/dm³</td>
        <td>Fertilidade química da camada</td>
      </tr>
      <tr>
        <td><strong>Saturação por Bases (V%)</strong></td>
        <td><code>V% = (SB ÷ T) × 100</code></td>
        <td><span class="highlight-cell">60% a 70%</span></td>
        <td>Gatilho para Calagem</td>
      </tr>
      <tr>
        <td><strong>Necessidade Calagem (NC)</strong></td>
        <td><code>NC = [ (V₂ - V₁) × T ] ÷ PRNT</code></td>
        <td>Elevar para 65% V</td>
        <td>Aplicar na saia (fator ~0,43)</td>
      </tr>
      <tr>
        <td><strong>Gessagem Demattê</strong></td>
        <td><code>Dose = 50 × Argila (%)</code></td>
        <td>Se m% &gt; 20% em subsolo</td>
        <td>Neutralizar alumínio profundo</td>
      </tr>
      <tr>
        <td><strong>Demanda de N</strong></td>
        <td><code>N = Meta × 3,0 kg/sc</code></td>
        <td>3,0 a 3,2 kg N/sc</td>
        <td>Equilíbrio vegetativo / floral</td>
      </tr>
      <tr>
        <td><strong>Crédito de Palha</strong></td>
        <td><code>K₂O abatido = Palha × 25 × 0,5</code></td>
        <td>2 a 5 t/ha de palha</td>
        <td>Economizar KCl mineral</td>
      </tr>
      <tr>
        <td><strong>Exportação na Colheita</strong></td>
        <td><code>2,4 kg N | 0,4 kg P | 2,8 kg K por sc</code></td>
        <td>Balanço de reposição</td>
        <td>Evitar desfolha pós-safra</td>
      </tr>
      <tr>
        <td><strong>Dose por Metro Linear</strong></td>
        <td><code>(kg/ha × Espaçamento_Rua) ÷ 10</code></td>
        <td>g/m para maquinário</td>
        <td>Regulagem da adubadeira</td>
      </tr>
    </tbody>
  </table>

</body>
</html>
`;

const htmlFilePath = path.join(baseDir, 'manual_formulas.html');
const pdfFilePath = path.join(baseDir, 'Manual_Formulas_Agronomicas_Recreio_do_Morro.pdf');

fs.writeFileSync(htmlFilePath, htmlContent, 'utf-8');
console.log(`HTML gerado com sucesso em: ${htmlFilePath}`);

// Executar Edge headless para gerar o PDF
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const command = `"${edgePath}" --headless=new --disable-gpu --run-all-compositor-stages-before-draw --print-to-pdf="${pdfFilePath}" --no-pdf-header-footer "${htmlFilePath}"`;

console.log('Compilando PDF via Microsoft Edge...');
try {
  execSync(command, { stdio: 'inherit' });
  console.log(`PDF compilado com sucesso em: ${pdfFilePath}`);
} catch (err) {
  console.error('Erro na compilação do PDF:', err);
}
