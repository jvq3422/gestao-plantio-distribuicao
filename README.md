# 🌿 Fazenda Recreio do Morro • Gestão Integrada
**Chapada Diamantina • Bahia • Terroir de Altitude (1.200m - 1.350m)**  
*Cafés Nobres (90+ SCA) • Viticultura (Uvas & Vinhos Artesanais) • Hortifrúti Especial (Tomates)*

---

## ⚡ Guia Rápido de Instalação e Uso

Escolha abaixo a forma mais conveniente para o seu uso:

---

### 💻 Opção 1: Aplicativo para Computador Windows (.exe)
Não requer conhecimentos técnicos nem instalação de dependências.

#### Método A: Download direto do GitHub (Recomendado)
1. Acesse a página de versões oficiais:  
   👉 **[Download da Versão Windows (Releases)](https://github.com/jvq3422/gestao-plantio-distribuicao/releases/tag/app-v1.0.0)**
2. Na seção **Assets**, escolha uma das opções:
   * **`Fazenda.Recreio.do.Morro.exe`** (Portátil): Baixe e dê dois cliques. Abre direto em janela nativa sem precisar instalar.
   * **`Fazenda.Recreio.do.Morro_1.0.0_x64-setup.exe`** (Instalador): Cria atalho na Área de Trabalho e no menu Iniciar.

#### Método B: Se você já clonou/baixou este repositório
Basta dar dois cliques em qualquer um dos arquivos na pasta raiz:
* `Fazenda Recreio do Morro.exe` (Executável nativo imediato)
* `iniciar_desktop.bat` (Inicializador automático em janela de aplicativo)

---

### 📱 Opção 2: iPhone (iOS) • App em Tela Cheia (PWA)
Permite usar o sistema no celular direto no campo, inclusive sem sinal de internet (offline).

1. Abra o link do sistema no navegador **Safari** do iPhone.
2. Toque no botão de **Compartilhar** (ícone do quadrado com a seta para cima, na barra inferior do Safari).
3. Role as opções e selecione **"Adicionar à Tela de Início"** (`+`).
4. Toque em **Adicionar** no canto superior direito.
5. Um ícone da **Fazenda Recreio do Morro** será criado na tela do seu iPhone. Ao abrir, ele roda em **tela cheia nativa** (sem barras de navegador) com cache offline ativo.

---

### ☁️ Opção 3: Sincronização em Nuvem (Firebase)
Para manter o computador e os celulares sincronizados em tempo real:

1. No topo da tela do sistema, clique no botão **"Nuvem Sync"** (ou **"Conectar Nuvem"**).
2. Insira as credenciais do seu projeto Firebase (`apiKey`, `projectId`, etc.).
3. Clique em **"Salvar e Conectar"**.
4. Clique em **"Subir Dados Locais para Nuvem"** para enviar os dados existentes da fazenda para o banco online.
5. Agora qualquer alteração feita no campo ou no escritório será sincronizada automaticamente entre todos os aparelhos.

---

### 🛠️ Opção 4: Executar via Código-Fonte (Desenvolvedores)
Se você for desenvolvedor e quiser rodar ou modificar o código-fonte:

#### Pré-requisitos
* [Node.js](https://nodejs.org/) (versão 18 ou superior)
* Git

#### Passo a Passo
```bash
# 1. Clone o repositório
git clone https://github.com/jvq3422/gestao-plantio-distribuicao.git

# 2. Acesse a pasta do projeto
cd gestao-plantio-distribuicao/cafe-gestao

# 3. Instale as dependências
npm install

# 4. Inicie o servidor local
npm run dev
```
Abra o navegador no endereço exibido no terminal (geralmente `http://localhost:5173`).

---

## 🏛️ Funcionalidades do Sistema

O sistema é dividido em dois módulos integrados:

### 1. 🌱 Módulo Nutrição & Adubação (Foco 90+ SCA)
* **Cadastro de Talhões e Variedades:** Áreas, espaçamento, estande de plantas e histórico.
* **Diagnóstico de Solo:** Soma de Bases (SB), CTC, Saturação por Bases (V%) e teores nutricionais.
* **Recomendações Agronômicas:** Calagem em faixa, gessagem subsuperficial, NPK, Enxofre e Micronutrientes.
* **Calibração Prática de Campo:** Doses convertidas diretamente para $g/\text{planta}$ e $g/\text{metro linear}$.
* **Exportação Completa:** Resumos em PDF oficial formatado, Excel (.csv) e texto pronto para WhatsApp.

### 2. 📦 Módulo Distribuição, Vendas & Financeiro
* **Catálogo de Produtos:** Cafés especiais, tomates (Sweet Grape e rasteiro), uvas e vinhos artesanais.
* **Gestão de PDVs:** Cadastro de clientes (cafeterias, empórios, restaurantes, etc.) e tabelas de preços personalizadas.
* **Lançamento de Saídas:** Baixa automática do estoque de produtos prontos e cálculo de receita.
* **Controle Financeiro:** Acompanhamento de entregas *Recebidas* vs *A Receber* (faturadas a prazo).
* **Relatórios e Romaneios:** Geração instantânea de romaneio de entrega em PDF, planilha Excel e resumo em TXT.

---

## 📄 Documentação Agronômica
O repositório inclui o manual técnico com todas as equações e fundamentos agronômicos:
* `Manual_Formulas_Agronomicas_Recreio_do_Morro.pdf`

---

## 🔒 Propriedade
Desenvolvido sob medida para a **Fazenda Recreio do Morro** • Chapada Diamantina - Bahia.
