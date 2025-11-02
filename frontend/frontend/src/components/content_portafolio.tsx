import { useState, useEffect } from "react";
import { useUser } from "./UserContext";
import axios from "axios";
import {
  PieChart,
  Pie,
  Tooltip,
  Cell,
  Legend,
  ResponsiveContainer,
} from "recharts";

const API_URL = "http://localhost:8000/api";

interface BalanceData {
  balance: number;
  last_updated: string;
}

interface PortfolioItem {
  symbol: string;
  name: string;
  quantity: number;
  average_price: number;
  current_price: number;
  current_value: number;
  invested_value: number;
  profit_loss: number;
  profit_loss_percentage: number;
  daily_change: number;
  daily_change_percentage: number;
}

interface PortfolioResponse {
  portfolio: PortfolioItem[];
  summary: {
    total_invested: number;
    total_current_value: number;
    total_profit_loss: number;
    total_profit_loss_percentage: number;
  };
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

  const formatCurrency = (amount: unknown): string => {
    const numAmount = typeof amount === 'number' ? amount : 
                     typeof amount === 'string' ? parseFloat(amount) : 0;
    
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(isNaN(numAmount) ? 0 : numAmount);
  };

  const formatDateOnly = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoadingProfile || isLoading)
    return (
      <div className="content-home">
        <p style={{ textAlign: "center", padding: "30px", color: "#616677" }}>Loading portfolio...</p>
      </div>
    );

  if (error)
    return (
      <div className="content-home">
        <p style={{ color: "#dc2626", textAlign: "center" }}>Error: {error}</p>
      </div>
    );

  const totalBalance = balanceData?.balance || 0;
  const summary = portfolioData?.summary;
  const portfolio = portfolioData?.portfolio || [];

  // Preparar datos para el gráfico
  const chartData = portfolio
    .filter(item => item && item.current_value > 0)
    .map((item) => ({
      name: item.symbol || 'Unknown',
      value: item.current_value || 0,
    }));

  // Colores azules de Hapi
  const COLORS = ["#4c58ed", "#6b73ff", "#3b43f1", "#5d67f5", "#8b95ff", "#2a32d9"];

  return (
    <div className="content-home">
      <div className="sections">
        {/* Navigation Tabs */}
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

        {/* Portfolio Summary */}
        <div className="content">
          {activeTab === "portfolio" && (
            <div className="container-portfolio">
              <div style={{ textAlign: "center" }}>
                <h2 style={{ fontSize: "1.5rem", color: "#1e2134", margin: "0 0 0.5rem 0", fontWeight: "600" }}>
                  Total Balance
                </h2>
                <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#4c58ed", margin: "0 0 2rem 0" }}>
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
                    textAlign: "center",
                  }}
                >
                  <div style={{ 
                    padding: "1.5rem", 
                    background: "linear-gradient(135deg, #f5f7ff 0%, #eef2ff 100%)", 
                    borderRadius: "12px",
                    border: "1px solid #e6ebfe"
                  }}>
                    <p style={{ color: "#616677", fontWeight: "600", margin: "0 0 0.5rem 0", fontSize: "0.9rem" }}>Total Invested</p>
                    <h3 style={{ margin: 0, color: "#1e2134", fontWeight: "700" }}>{formatCurrency(summary.total_invested)}</h3>
                  </div>
                  <div style={{ 
                    padding: "1.5rem", 
                    background: "linear-gradient(135deg, #f5f7ff 0%, #eef2ff 100%)", 
                    borderRadius: "12px",
                    border: "1px solid #e6ebfe"
                  }}>
                    <p style={{ color: "#616677", fontWeight: "600", margin: "0 0 0.5rem 0", fontSize: "0.9rem" }}>Current Value</p>
                    <h3 style={{ margin: 0, color: "#1e2134", fontWeight: "700" }}>{formatCurrency(summary.total_current_value)}</h3>
                  </div>
                  <div style={{ 
                    padding: "1.5rem", 
                    background: "linear-gradient(135deg, #f5f7ff 0%, #eef2ff 100%)", 
                    borderRadius: "12px",
                    border: "1px solid #e6ebfe"
                  }}>
                    <p style={{ color: "#616677", fontWeight: "600", margin: "0 0 0.5rem 0", fontSize: "0.9rem" }}>Profit / Loss</p>
                    <h3
                      style={{
                        margin: 0,
                        color: (summary.total_profit_loss || 0) >= 0 ? "#10b981" : "#ef4444",
                        fontWeight: "700",
                      }}
                    >
                      {formatCurrency(summary.total_profit_loss)} ({(summary.total_profit_loss_percentage || 0).toFixed(2)}%)
                    </h3>
                  </div>
                </div>
              )}

              {/* Chart Section */}
              {chartData.length > 0 ? (
                <div
                  style={{
                    marginTop: "2rem",
                    padding: "2rem",
                    background: "linear-gradient(135deg, #f5f7ff 0%, #eef2ff 100%)",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(76, 88, 237, 0.1)",
                    border: "1px solid #e6ebfe",
                    width: "100%",
                    maxWidth: "700px",
                    marginLeft: "auto",
                    marginRight: "auto"
                  }}
                >
                  <h3
                    style={{
                      textAlign: "center",
                      marginBottom: "2rem",
                      fontSize: "1.3rem",
                      color: "#1e2134",
                      fontWeight: "600"
                    }}
                  >
                    Portfolio Distribution
                  </h3>

                  <div style={{ width: "100%", height: "400px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          outerRadius={120}
                          fill="#4c58ed"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: unknown) => formatCurrency(value)}
                          contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #e6ebfe',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(76, 88, 237, 0.1)'
                          }}
                        />
                        <Legend verticalAlign="bottom" height={36}/>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <p style={{
                    textAlign: "center",
                    color: "#616677",
                    fontSize: "0.9rem",
                    marginTop: "1rem",
                    marginBottom: 0
                  }}>
                    Displaying {chartData.length} asset{chartData.length > 1 ? 's' : ''}
                  </p>
                </div>
              ) : (
                <div style={{
                  marginTop: "2rem",
                  padding: "3rem 2rem",
                  background: "linear-gradient(135deg, #f5f7ff 0%, #eef2ff 100%)",
                  borderRadius: "12px",
                  textAlign: "center",
                  border: "2px dashed #dde2f6"
                }}>
                  <p style={{ color: "#616677", fontSize: "1.1rem", margin: 0, fontWeight: "500" }}>
                    No portfolio data available for chart.<br />
                    <span style={{ fontSize: "0.95rem", color: "#9ca3af" }}>Start investing to see your distribution chart!</span>
                  </p>
                </div>
              )}

              <p style={{
                marginTop: "2rem",
                color: "#9ca3af",
                textAlign: "center",
                fontSize: "0.9rem"
              }}>
                Last updated: {balanceData?.last_updated ? formatDateOnly(balanceData.last_updated) : "N/A"}
              </p>
            </div>
          )}

          {/* Assets Table */}
          {activeTab === "assets" && (
            <div className="container-portfolio">
              <h2 style={{ 
                fontSize: "1.5rem", 
                marginBottom: "1.5rem", 
                textAlign: "center", 
                color: "#1e2134",
                fontWeight: "600"
              }}>
                My Assets
              </h2>

              {portfolio.length === 0 ? (
                <div style={{
                  textAlign: "center",
                  padding: "3rem 2rem",
                  background: "linear-gradient(135deg, #f5f7ff 0%, #eef2ff 100%)",
                  borderRadius: "12px",
                  border: "2px dashed #dde2f6"
                }}>
                  <p style={{ color: "#616677", fontSize: "1.1rem", margin: 0, fontWeight: "500" }}>
                    You don't own any stocks yet.
                  </p>
                </div>
              ) : (
                <div style={{
                  overflowX: "auto",
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(76, 88, 237, 0.1)",
                  border: "1px solid #e6ebfe"
                }}>
                  <table className="asset-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead style={{ 
                      background: "linear-gradient(135deg, #4c58ed 0%, #6b73ff 100%)", 
                      color: "white" 
                    }}>
                      <tr>
                        <th style={{ padding: "16px 12px", fontWeight: "600", fontSize: "0.9rem" }}>Symbol</th>
                        <th style={{ padding: "16px 12px", fontWeight: "600", fontSize: "0.9rem" }}>Company</th>
                        <th style={{ padding: "16px 12px", fontWeight: "600", fontSize: "0.9rem" }}>Qty</th>
                        <th style={{ padding: "16px 12px", fontWeight: "600", fontSize: "0.9rem" }}>Avg Price</th>
                        <th style={{ padding: "16px 12px", fontWeight: "600", fontSize: "0.9rem" }}>Current</th>
                        <th style={{ padding: "16px 12px", fontWeight: "600", fontSize: "0.9rem" }}>Value</th>
                        <th style={{ padding: "16px 12px", fontWeight: "600", fontSize: "0.9rem" }}>P/L</th>
                      </tr>
                    </thead>
                    <tbody>
                      {portfolio.map((item, index) => (
                        <tr
                          key={item.symbol}
                          style={{
                            textAlign: "center",
                            backgroundColor: index % 2 === 0 ? "#fafbff" : "#ffffff",
                            transition: "background-color 0.2s"
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f5f7ff"}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? "#fafbff" : "#ffffff"}
                        >
                          <td style={{ 
                            padding: "14px 12px", 
                            fontWeight: "600", 
                            color: "#4c58ed",
                            fontSize: "0.9rem"
                          }}>
                            {item.symbol}
                          </td>
                          <td style={{ padding: "14px 12px", color: "#1e2134", fontSize: "0.9rem" }}>{item.name}</td>
                          <td style={{ padding: "14px 12px", color: "#616677", fontSize: "0.9rem" }}>{item.quantity}</td>
                          <td style={{ padding: "14px 12px", color: "#616677", fontSize: "0.9rem" }}>{formatCurrency(item.average_price)}</td>
                          <td style={{ padding: "14px 12px", color: "#616677", fontSize: "0.9rem" }}>{formatCurrency(item.current_price)}</td>
                          <td style={{ 
                            padding: "14px 12px", 
                            fontWeight: "600", 
                            color: "#1e2134",
                            fontSize: "0.9rem"
                          }}>
                            {formatCurrency(item.current_value)}
                          </td>
                          <td style={{ 
                            padding: "14px 12px", 
                            color: (item.profit_loss || 0) >= 0 ? "#10b981" : "#ef4444", 
                            fontWeight: "700",
                            fontSize: "0.9rem"
                          }}>
                            {formatCurrency(item.profit_loss)} ({(item.profit_loss_percentage || 0).toFixed(2)}%)
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ContentPortfolio;