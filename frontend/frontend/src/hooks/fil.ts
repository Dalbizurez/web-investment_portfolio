// src/data/stock_filters.ts

// src/data/stock_filters.ts

export interface StockThematicFilter {
  category: string;
  examples: string[];
}

// ⚙️ Categorías oficiales (API Finnhub)
export const STOCK_CATEGORIES = [
  { code: "EQS", name: "Acción común (Common Stock)" },
  { code: "ETF", name: "Fondo cotizado en bolsa (ETF)" },
  { code: "INDEX", name: "Índice de mercado (Market Index)" },
  { code: "MUTUAL", name: "Fondo mutuo (Mutual Fund)" },
  { code: "REIT", name: "Fideicomiso de inversión inmobiliaria (REIT)" },
  { code: "PREF", name: "Acción preferente (Preferred Stock)" },
  { code: "ADR", name: "Recibo de depósito estadounidense (ADR)" },
  { code: "CRYPTO", name: "Criptomoneda (Cryptocurrency)" },
  { code: "FX", name: "Divisa extranjera (Foreign Exchange)" },
  { code: "BOND", name: "Bono (Bond)" },
];

export interface StockThematicFilter {
  category: string;
  examples: string[];
}

// 🎯 Filtros temáticos principales
export const STOCK_THEMATIC_FILTERS: StockThematicFilter[] = [
  {
    category: "Empresas tecnológicas",
    examples: [
      "AAPL - Apple Inc.",
      "MSFT - Microsoft Corporation",
      "GOOGL - Alphabet Inc.",
      "NVDA - NVIDIA Corporation",
      "AMD - Advanced Micro Devices Inc.",
      "INTC - Intel Corporation",
      "META - Meta Platforms Inc.",
      "CRM - Salesforce Inc.",
      "ADBE - Adobe Inc.",
      "ORCL - Oracle Corporation",
    ],
  },
  {
    category: "Empresas de streaming y entretenimiento",
    examples: [
      "NFLX - Netflix Inc.",
      "DIS - Walt Disney Company",
      "WBD - Warner Bros. Discovery Inc.",
      "PARA - Paramount Global",
      "SPOT - Spotify Technology S.A.",
      "ROKU - Roku Inc.",
      "SIRI - Sirius XM Holdings Inc.",
      "LYV - Live Nation Entertainment Inc.",
      "CMCSA - Comcast Corporation",
      "SONY - Sony Group Corporation",
    ],
  },
  {
    category: "Empresas automotrices y energía",
    examples: [
      "TSLA - Tesla Inc.",
      "GM - General Motors Company",
      "F - Ford Motor Company",
      "NIO - NIO Inc.",
      "LI - Li Auto Inc.",
      "XOM - Exxon Mobil Corporation",
      "CVX - Chevron Corporation",
      "BP - BP p.l.c.",
      "RIVN - Rivian Automotive Inc.",
      "TM - Toyota Motor Corporation",
    ],
  },
  {
    category: "Fondos más populares (ETFs)",
    examples: [
      "SPY - SPDR S&P 500 ETF Trust",
      "QQQ - Invesco QQQ Trust",
      "VTI - Vanguard Total Stock Market ETF",
      "VOO - Vanguard S&P 500 ETF",
      "IWM - iShares Russell 2000 ETF",
      "ARKK - ARK Innovation ETF",
      "EFA - iShares MSCI EAFE ETF",
      "XLF - Financial Select Sector SPDR Fund",
      "XLK - Technology Select Sector SPDR Fund",
      "GLD - SPDR Gold Shares",
    ],
  },
  {
    category: "Empresas financieras y bancos",
    examples: [
      "JPM - JPMorgan Chase & Co.",
      "BAC - Bank of America Corporation",
      "GS - Goldman Sachs Group Inc.",
      "C - Citigroup Inc.",
      "MS - Morgan Stanley",
      "WFC - Wells Fargo & Company",
      "AXP - American Express Company",
      "BLK - BlackRock Inc.",
      "SCHW - Charles Schwab Corporation",
      "COIN - Coinbase Global Inc.",
    ],
  },
  {
    category: "Empresas de salud y farmacéuticas",
    examples: [
      "JNJ - Johnson & Johnson",
      "PFE - Pfizer Inc.",
      "MRNA - Moderna Inc.",
      "UNH - UnitedHealth Group Inc.",
      "LLY - Eli Lilly and Company",
      "ABBV - AbbVie Inc.",
      "BMY - Bristol-Myers Squibb Company",
      "CVS - CVS Health Corporation",
      "GILD - Gilead Sciences Inc.",
      "AMGN - Amgen Inc.",
    ],
  },
  {
    category: "Empresas de comercio electrónico",
    examples: [
      "AMZN - Amazon.com Inc.",
      "BABA - Alibaba Group Holding Ltd.",
      "SHOP - Shopify Inc.",
      "MELI - MercadoLibre Inc.",
      "EBAY - eBay Inc.",
      "ETSY - Etsy Inc.",
      "JD - JD.com Inc.",
      "SE - Sea Limited",
      "PDD - PDD Holdings Inc.",
      "W - Wayfair Inc.",
    ],
  },
  {
    category: "Empresas de telecomunicaciones y redes",
    examples: [
      "T - AT&T Inc.",
      "VZ - Verizon Communications Inc.",
      "TMUS - T-Mobile US Inc.",
      "CSCO - Cisco Systems Inc.",
      "QCOM - Qualcomm Inc.",
      "ERIC - Ericsson",
      "NOK - Nokia Corporation",
      "VOD - Vodafone Group PLC",
      "NTDOY - Nintendo Co. Ltd.",
      "DELL - Dell Technologies Inc.",
    ],
  },
  {
    category: "Empresas de bienes de consumo",
    examples: [
      "PG - Procter & Gamble Co.",
      "KO - Coca-Cola Co.",
      "PEP - PepsiCo Inc.",
      "UL - Unilever PLC",
      "CL - Colgate-Palmolive Co.",
      "KMB - Kimberly-Clark Corporation",
      "MDLZ - Mondelez International Inc.",
      "NKE - Nike Inc.",
      "MCD - McDonald’s Corporation",
      "SBUX - Starbucks Corporation",
    ],
  },
  {
    category: "Empresas de energía renovable y sostenibilidad",
    examples: [
      "ENPH - Enphase Energy Inc.",
      "FSLR - First Solar Inc.",
      "PLUG - Plug Power Inc.",
      "RUN - Sunrun Inc.",
      "NEE - NextEra Energy Inc.",
      "SEDG - SolarEdge Technologies Inc.",
      "BLDP - Ballard Power Systems Inc.",
      "BE - Bloom Energy Corp.",
      "TSLA - Tesla Inc.",
      "ORA - Ormat Technologies Inc.",
    ],
  },
  {
    category: "Empresas de inteligencia artificial y datos",
    examples: [
      "NVDA - NVIDIA Corporation",
      "GOOGL - Alphabet Inc.",
      "MSFT - Microsoft Corporation",
      "AMD - Advanced Micro Devices Inc.",
      "SMCI - Super Micro Computer Inc.",
      "CRWD - CrowdStrike Holdings Inc.",
      "SNOW - Snowflake Inc.",
      "DDOG - Datadog Inc.",
      "PLTR - Palantir Technologies Inc.",
      "AI - C3.ai Inc.",
    ],
  },
  {
    category: "Empresas inmobiliarias (REITs)",
    examples: [
      "O - Realty Income Corp.",
      "AMT - American Tower Corp.",
      "PLD - Prologis Inc.",
      "DLR - Digital Realty Trust Inc.",
      "EQIX - Equinix Inc.",
      "SPG - Simon Property Group Inc.",
      "VICI - VICI Properties Inc.",
      "PSA - Public Storage",
      "WELL - Welltower Inc.",
      "IRM - Iron Mountain Inc.",
    ],
  },
  {
    category: "Criptomonedas populares",
    examples: [
      "BTC/USD - Bitcoin",
      "ETH/USD - Ethereum",
      "SOL/USD - Solana",
      "XRP/USD - Ripple",
      "DOGE/USD - Dogecoin",
      "ADA/USD - Cardano",
      "BNB/USD - Binance Coin",
      "AVAX/USD - Avalanche",
      "DOT/USD - Polkadot",
      "MATIC/USD - Polygon",
    ],
  },
];
