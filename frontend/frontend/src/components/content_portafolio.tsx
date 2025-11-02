import { useState, useEffect } from "react";
import { useUser } from "./UserContext";
import axios from "axios";
import { VictoryPie } from "victory";

const API_URL = "http://localhost:8000/api";

// Interfaces
interface BalanceData {
  balance: number;
  last_updated: string;
}

interface PortfolioItem {
  symbol: string;
  quantity: number;
  average_price: number;
  current_price: number;
  total_value: number;
  profit_loss: number;
  profit_loss_percentage: number;
}

interface PortfolioSummary {
  total_invested: number;
  total_current_value: number;
  total_profit_loss: number;
  total_profit_loss_percentage: number;
}

interface PortfolioResponse {
  summary: PortfolioSummary;
  portfolio: PortfolioItem[];
}

function ContentPortfolio() {
  const [activeTab, setActiveTab] = useState("portfolio");
  const { token, isLoadingProfile } = useUser();
  const [balanceData, setBalanceData] = useState<BalanceData | null>(null);
  const [portfolioData, setPortfolioData] = useState<PortfolioResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPortfolio = async () => {
      if (!token) return;
      try {
        setIsLoading(true);
        setError(null);

        const [balanceRes, portfolioRes] = await Promise.all([
          axios.get(`${API_URL}/stocks/balance/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/stocks/portfolio/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        console.log("Balance:", balanceRes.data);
        console.log("Portfolio:", portfolioRes.data);


        setBalanceData(balanceRes.data);
        setPortfolioData(portfolioRes.data);
      } catch (err: any) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPortfolio();
  }, [token]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { 
      style: "currency", 
      currency: "USD" 
    }).format(amount || 0);

  const formatDateOnly = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "long", 
      day: "numeric" 
    });
  };

  if (isLoadingProfile || isLoading) {
    return (
      <div className="content-home">
        <p style={{ textAlign: "center", padding: "30px" }}>
          Loading portfolio...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="content-home">
        <p style={{ color: "red", textAlign: "center" }}>
          Error: {error}
        </p>
      </div>
    );
  }

  const totalBalance = balanceData?.balance || 0;
  const summary = portfolioData?.summary;
  const portfolio = portfolioData?.portfolio || [];

  // Prepara los datos para Victory
  const chartData = portfolio.map((item) => ({
    x: item.symbol,
    y: item.total_value,
  }));

  const COLORS = [
    "#4CAF50", 
    "#2196F3", 
    "#FFC107", 
    "#FF5722", 
    "#9C27B0", 
    "#00BCD4"
  ];

  return (
    <div className="content-home">
      <div className="sections">
        <div className="type">
          <p 
            className={activeTab === "portfolio" ? "active" : ""} 
            onClick={() => setActiveTab("portfolio")}
          >
            Portfolio
          </p>
          <p 
            className={activeTab === "assets" ? "active" : ""} 
            onClick={() => setActiveTab("assets")}
          >
            Assets
          </p>
        </div>

        <div className="content">
          {activeTab === "portfolio" && (
            <div className="container-portfolio">
              <div style={{ textAlign: "center" }}>
                <h2>Total Balance</h2>
                <h1 style={{ color: "#2196F3" }}>
                  {formatCurrency(totalBalance)}
                </h1>
              </div>

              {summary && (
                <div 
                  style={{ 
                    display: "grid", 
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
                    gap: "1rem", 
                    marginBottom: "2rem", 
                    textAlign: "center" 
                  }}
                >
                  <div 
                    style={{ 
                      padding: "1rem", 
                      backgroundColor: "#f5f5f5", 
                      borderRadius: "8px" 
                    }}
                  >
                    <p>Total Invested</p>
                    <h3>{formatCurrency(summary.total_invested)}</h3>
                  </div>
                  <div 
                    style={{ 
                      padding: "1rem", 
                      backgroundColor: "#f5f5f5", 
                      borderRadius: "8px" 
                    }}
                  >
                    <p>Current Value</p>
                    <h3>{formatCurrency(summary.total_current_value)}</h3>
                  </div>
                  <div 
                    style={{ 
                      padding: "1rem", 
                      backgroundColor: "#f5f5f5", 
                      borderRadius: "8px" 
                    }}
                  >
                    <p>Profit / Loss</p>
                    <h3 
                      style={{ 
                        color: summary.total_profit_loss >= 0 
                          ? "#4CAF50" 
                          : "#F44336" 
                      }}
                    >
                      {formatCurrency(summary.total_profit_loss)} (
                      {summary.total_profit_loss_percentage.toFixed(2)}%)
                    </h3>
                  </div>
                </div>
              )}

              {/* Gráfica circular con Victory */}
              {portfolio.length > 0 ? (
                <div 
                  style={{ 
                    marginTop: "2rem", 
                    padding: "2rem", 
                    backgroundColor: "#fff", 
                    borderRadius: "12px" 
                  }}
                >
                  <h3 style={{ textAlign: "center" }}>
                    Portfolio Distribution
                  </h3>
                  <VictoryPie
                    data={chartData}
                    colorScale={COLORS}
                    innerRadius={50}
                    labels={({ datum }) => `${datum.x}: ${formatCurrency(datum.y)}`}
                    style={{ 
                      labels: { fontSize: 12 } 
                    }}
                  />
                  <p style={{ textAlign: "center", color: "#999" }}>
                    📊 Displaying {portfolio.length} asset
                    {portfolio.length > 1 ? 's' : ''}
                  </p>
                </div>
              ) : (
                <p>No portfolio data available yet.</p>
              )}

              <p style={{ textAlign: "center", color: "#999" }}>
                Last updated: {balanceData?.last_updated 
                  ? formatDateOnly(balanceData.last_updated) 
                  : "N/A"}
              </p>
            </div>
          )}

          {activeTab === "assets" && (
            <div className="container-assets">
              {portfolio.length > 0 ? (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f5f5f5" }}>
                      <th style={{ padding: "1rem", textAlign: "left" }}>Symbol</th>
                      <th style={{ padding: "1rem", textAlign: "right" }}>Quantity</th>
                      <th style={{ padding: "1rem", textAlign: "right" }}>Avg Price</th>
                      <th style={{ padding: "1rem", textAlign: "right" }}>Current Price</th>
                      <th style={{ padding: "1rem", textAlign: "right" }}>Total Value</th>
                      <th style={{ padding: "1rem", textAlign: "right" }}>P/L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolio.map((item, index) => (
                      <tr 
                        key={item.symbol} 
                        style={{ 
                          borderBottom: "1px solid #eee",
                          backgroundColor: index % 2 === 0 ? "#fff" : "#fafafa"
                        }}
                      >
                        <td style={{ padding: "1rem", fontWeight: "bold" }}>
                          {item.symbol}
                        </td>
                        <td style={{ padding: "1rem", textAlign: "right" }}>
                          {item.quantity}
                        </td>
                        <td style={{ padding: "1rem", textAlign: "right" }}>
                          {formatCurrency(item.average_price)}
                        </td>
                        <td style={{ padding: "1rem", textAlign: "right" }}>
                          {formatCurrency(item.current_price)}
                        </td>
                        <td style={{ padding: "1rem", textAlign: "right" }}>
                          {formatCurrency(item.total_value)}
                        </td>
                        <td 
                          style={{ 
                            padding: "1rem", 
                            textAlign: "right",
                            color: item.profit_loss >= 0 ? "#4CAF50" : "#F44336",
                            fontWeight: "bold"
                          }}
                        >
                          {formatCurrency(item.profit_loss)} (
                          {item.profit_loss_percentage.toFixed(2)}%)
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ textAlign: "center", padding: "2rem" }}>
                  No assets in your portfolio yet.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ContentPortfolio;