# 🌿 Fazenda Recreio do Morro • Gestão Integrada
**Chapada Diamantina • Bahia • Terroir de Altitude (1.200m - 1.350m)**  
*Cafés Nobres (90+ SCA) • Viticultura (Uvas & Vinhos Artesanais) • Hortifrúti Especial (Tomates)*

---

## ⚡ Guia Rápido de Instalação e Uso

Escolha abaixo a forma mais conveniente para o seu uso:

---

### 💻 Opção 1: Aplicativo para Computador Windows (.exe) • Pronto para Uso
**Zero configuração manual**: O executável já vem pré-configurado com banco na nuvem e sincronização em tempo real.

1. Baixe o executável da versão mais recente:  
   👉 **[Download da Versão Windows (Releases)](https://github.com/jvq3422/gestao-plantio-distribuicao/releases/tag/app-v1.0.0)**  
   *(Ou se já clonou este repositório, basta dar dois cliques em `Fazenda Recreio do Morro.exe` na pasta raiz).*
2. Dê **dois cliques** no arquivo.
3. O sistema abre instantaneamente em janela nativa de desktop, com o status verde:  
   `🟢 Nuvem & iPhone (Online)`

---

### 📱 Opção 2: iPhone (iOS) • Conexão Automática Instantânea
A sincronia entre o computador e o iPhone ocorre de forma **100% automática**:

1. No computador, clique no botão verde do topo **"Nuvem & iPhone (Online)"** para abrir o QR Code.
2. Aponte a câmera do seu iPhone para o QR Code (ou abra diretamente no Safari: **`https://recreiodomorro-f7e1a.web.app`**).
3. No Safari, toque no ícone de **Compartilhar** (quadrado com seta ⎋) e escolha **"Adicionar à Tela de Início"** (`+`).
4. **Pronto!** O app fica instalado no seu iPhone com ícone oficial e acesso instantâneo.

---

### ⚡ Como Funciona a Sincronização Automática & Modo Campo
* **Com Internet:** Qualquer lançamento feito no computador ou no iPhone é transmitido e sincronizado em **tempo real** entre ambos os aparelhos.
* **Sem Internet (No meio da lavoura / Talhão):**
  * O sistema detecta a ausência de sinal e entra automaticamente no **Modo Campo (Cache Offline)**.
  * Você pode lançar adubações, colheitas e saídas normalmente.
  * Assim que o iPhone ou o computador detectarem conexão com a internet, todos os dados pendentes são enviados e sincronizados **automaticamente**, sem que você precise apertar nenhum botão.

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
