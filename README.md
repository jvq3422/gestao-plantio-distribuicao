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

### 📱 Opção 2: Acesso pelo Celular (Controle Total por Você)
Você tem total autonomia para conectar o celular da maneira que preferir, sem depender de serviços externos obrigatórios:

#### Método A: Conexão Direta na Rede Local (Wi-Fi da Fazenda / Escritório)
1. No computador, dê dois cliques em `iniciar_sistema.bat` (ou execute `npm run dev` no terminal).
2. O terminal mostrará o endereço da rede local, por exemplo:
   ```text
   ➜  Network: http://192.168.0.15:5173/
   ```
3. No celular (conectado ao mesmo Wi-Fi), abra o navegador e acerte o endereço mostrado (ex: `http://192.168.0.15:5173`).
4. **Para usar em Tela Cheia no iPhone (Safari):** Toque no botão de **Compartilhar** (quadrado com seta para cima) > **"Adicionar à Tela de Início"**. O ícone da fazenda será adicionado e abrirá em modo app nativo.

#### Método B: Hospedagem ou Servidor Próprio
Se você quiser hospedar o sistema no seu próprio servidor, Raspberry Pi, VPS ou serviço web:
1. Gere os arquivos estáticos otimizados executando `npm run build` na pasta `cafe-gestao`.
2. A pasta `dist` gerada é 100% autossuficiente e pode ser hospedada em qualquer servidor HTTP / Nginx / Apache ou serviço estático da sua preferência.

---

### ☁️ Opção 3: Sincronização em Nuvem (Opcional)
Caso queira sincronizar dados em tempo real entre o computador e celulares fora da rede local:
* No cabeçalho, use o botão **"Nuvem Sync"** para inserir suas credenciais do Firebase quando desejar.
* Se preferir trabalhar 100% offline e local, você não precisa configurar nada; todos os dados ficam salvos com segurança no próprio dispositivo.

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
