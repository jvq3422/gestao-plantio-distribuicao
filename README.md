# 🌿 Fazenda Recreio do Morro • Gestão Integrada de Plantio, Adubação & Distribuição
**Chapada Diamantina • Bahia • Terroir de Altitude (1.200m - 1.350m)**  
*Especializada em Cafés Nobres (90+ SCA), Viticultura (Uvas & Vinhos Artesanais) e Hortifrúti Especial (Tomates Cereja e Rasteiro)*

---

## 🚀 Como Executar o Sistema (Download & Execução Rápida)

### Opção 1: Execução Automática (Windows)
Basta dar um duplo clique no arquivo executável na raiz do projeto:
```cmd
iniciar_sistema.bat
```
> *Nota: O script detecta automaticamente se é a primeira vez que você está executando e instala todas as dependências do Node.js necessárias antes de iniciar o servidor local.*

### Opção 2: Pelo Terminal / Linha de Comando
```bash
# 1. Acesse o diretório da aplicação
cd cafe-gestao

# 2. Instale as dependências (necessário apenas na 1ª vez)
npm install

# 3. Inicie o servidor de desenvolvimento
npm run dev
```
Após iniciar, abra seu navegador no endereço: **`http://localhost:5173`**

### Opção 3: Gerar Versão Estática para Hospedagem / Produção
```bash
cd cafe-gestao
npm run build
```
Os arquivos prontos e otimizados para produção serão gerados na pasta `cafe-gestao/dist`.

---

## 🏛️ Estrutura em Dois Módulos Operacionais

O sistema é dividido em dois núcleos complementares, acessíveis instantaneamente através do alternador no topo da interface:

```
                    ┌────────────────────────────────────────────────────────┐
                    │      FAZENDA RECREIO DO MORRO • CHAPADA DIAMANTINA     │
                    └───────────────────────────┬────────────────────────────┘
                                                │
                 ┌──────────────────────────────┴──────────────────────────────┐
                 ▼                                                             ▼
┌─────────────────────────────────────────┐   ┌─────────────────────────────────────────┐
│     MÓDULO 1: NUTRIÇÃO & ADUBAÇÃO       │   │    MÓDULO 2: DISTRIBUIÇÃO & VENDAS      │
│     (Lavoura, Solo & Cafés 90+ SCA)     │   │    (Saídas, Estoque, PDVs & Receita)    │
├─────────────────────────────────────────┤   ├─────────────────────────────────────────┤
│ • Cadastro Dinâmico de Talhões/Variedade│   │ • Catálogo de Produtos & Estoque Pronto │
│ • Diagnóstico Completo de Solo (SB, CTC)│   │   (Cafés, Tomates, Uvas e Vinhos)       │
│ • Calagem em Faixa e Gessagem Subsuperf.│   │ • Cadastro de Pontos de Venda (PDVs)    │
│ • Doses NPK, Enxofre e Micronutrientes  │   │ • Tabela de Preços Negociados por PDV   │
│ • Calibração: g/planta e g/metro linear │   │ • Lançamento de Saídas e Romaneio       │
│ • Retroalimentação Histórica de Safras  │   │ • Painel Financeiro (Recebido vs Fatur.)│
│ • Fórmulas Químicas Dinâmicas           │   │ • Exportação em PDF, Excel (.csv) e TXT │
└─────────────────────────────────────────┘   └─────────────────────────────────────────┘
```

---

## 📦 1. Módulo de Distribuição, Catálogo, PDVs & Receitas

### A. Catálogo de Produtos da Fazenda
* ☕ **Cafés Especiais:** Lotes Arara, Bourbon Amarelo, Geisha, Cafés Tradicionais e Drip Coffees em pacotes.
* 🍅 **Tomates Selecionados:** Bandejas de Sweet Grape e caixas de tomate rasteiro/italiano.
* 🍇 **Uvas de Altitude:** Uvas de mesa e viníferas colhidas na Chapada Diamantina.
* 🍷 **Vinhos Finos & Artesanais:** Garrafas de 750ml e 500ml numeradas e com indicação de talhão de colheita.

### B. Matriz de Preços Negociados por Ponto de Venda (PDV)
* Permite cadastrar condições comerciais customizadas para cada cliente (Cafeterias, Empórios, Supermercados, Restaurantes/Pizzarias e Venda Direta/Porteira).
* No lançamento de saída, os preços negociados com o PDV são carregados automaticamente.

### C. Fluxo de Receitas & Painel Financeiro
* **Status de Liquidação:** Acompanhamento de entregas *Recebidas* (PIX / Dinheiro em caixa) vs *A Receber* (faturadas a prazo com data de vencimento).
* **Baixa Automática:** O estoque de produtos prontos é decrementado imediatamente a cada remessa despachada.

### D. Exportações e Relatórios Executivos
* 📄 **Relatório PDF Oficial:** Documento formatado com o logotipo da Fazenda Recreio do Morro, indicadores de faturamento, volumes entregues e extrato de remessas para impressão (`window.print()`).
* 📊 **Planilha Excel (.csv):** Compatível diretamente com o Microsoft Excel (delimitador `;` e codificação UTF-8 BOM), separando volumes, produtos e valores.
* 💬 **Resumo TXT (WhatsApp):** Cópia rápida com emojis e indicadores para envio direto à diretoria ou equipe de logística.

---

## 🌱 2. Módulo de Gestão de Nutrição & Solo (Foco 90+ SCA)

* **Diretrizes para Altas Pontuações:** Calibração estrita de Nitrogênio ($3,0\text{ kg } N/\text{saca}$), Saturação por Bases ($V\% = 65\%$) e teores de Potássio e Boro para elevar brix e densidade dos grãos.
* **Calagem em Faixa:** Cálculo da dose na área sob a saia do cafeeiro, reduzindo custos e concentrando o corretivo na zona radicular ativa.
* **Gessagem de Subsuperfície:** Correção de alumínio tóxico e suprimento de cálcio em profundidade (20 a 40 cm).
* **Calibração de Aplicação:** Conversão imediata de doses para sacos de 50kg, **gramas por planta ($g/\text{planta}$)** e **gramas por metro linear ($g/m$)**.
* **Créditos Orgânicos:** Dedução de nutrientes da palha de café e biomassa de braquiária na entrelinha.

---

## 📖 Documentação Agronômica Inclusa

O repositório inclui o manual técnico completo em PDF:
* 📄 **`Manual_Formulas_Agronomicas_Recreio_do_Morro.pdf`**: Explicação teórica e passo a passo de todas as fórmulas matemáticas e agronômicas empregadas no sistema.

---

## 🧪 Validação dos Cálculos e Regras de Negócio

Para rodar os testes automatizados da lógica de adubação e distribuição:
```bash
cd cafe-gestao
npx tsx verify_calculations.ts
npx tsx verify_distribution.ts
```

---

## 🔒 Licença & Propriedade
Desenvolvido sob medida para a **Fazenda Recreio do Morro** • Chapada Diamantina - Bahia.
