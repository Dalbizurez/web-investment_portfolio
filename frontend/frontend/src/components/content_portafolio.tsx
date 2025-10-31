import { useState, useEffect } from "react";
import { useUser } from "./UserContext";
import axios from "axios";

const API_URL = "http://localhost:8000/api";

interface BalanceData {
  balance: number;
  last_updated: string;
}

interface PortfolioItem {
  symbol: string;
  company_name: string;
  quantity: number;
  average_price: number;
  current_price: number;
  total_value: number;
  profit_loss: number;
  profit_loss_percentage: number;
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

function Content_portafolio() {
  const [activeTab, setActiveTab] = useState("portafolio");
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
        console.error(" Error obteniendo datos:", err);
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
      currency: "USD",
    }).format(amount || 0);

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
        <p style={{ textAlign: "center", padding: "20px" }}>🔄 Cargando portafolio...</p>
      </div>
    );

  if (error)
    return (
      <div className="content-home">
        <p style={{ color: "red", textAlign: "center" }}>❌ Error: {error}</p>
      </div>
    );

  const totalBalance = balanceData?.balance || 0;
  const summary = portfolioData?.summary;
  const portfolio = portfolioData?.portfolio || [];

  return (
    <div className="content-home">
      <div className="sections">
        <div className="type">
          <p
            className={activeTab === "portafolio" ? "active" : ""}
            onClick={() => setActiveTab("portafolio")}
          >
            Portafolio
          </p>
          <p
            className={activeTab === "assets" ? "active" : ""}
            onClick={() => setActiveTab("assets")}
          >
            Assets
          </p>
        </div>

        <div className="content">
          {activeTab === "portafolio" && (
            <div className="container-portafolio">
              <h2>Total Balance</h2>
              <h1>{formatCurrency(totalBalance)}</h1>

              {summary && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "1rem",
                    marginTop: "1.5rem",
                    textAlign: "center",
                  }}
                >
                  <div>
                    <p style={{ color: "#616677", fontWeight: "600" }}>Total Invertido</p>
                    <h3>{formatCurrency(summary.total_invested)}</h3>
                  </div>
                  <div>
                    <p style={{ color: "#616677", fontWeight: "600" }}>Valor Actual</p>
                    <h3>{formatCurrency(summary.total_current_value)}</h3>
                  </div>
                  <div>
                    <p style={{ color: "#616677", fontWeight: "600" }}>Ganancia / Pérdida</p>
                    <h3
                      style={{
                        color: summary.total_profit_loss >= 0 ? "green" : "red",
                        fontWeight: "bold",
                      }}
                    >
                      {formatCurrency(summary.total_profit_loss)} (
                      {summary.total_profit_loss_percentage.toFixed(2)}%)
                    </h3>
                  </div>
                </div>
              )}

              <p style={{ marginTop: "1.5rem", color: "#616677" }}>
                Última actualización:{" "}
                {balanceData?.last_updated ? formatDateOnly(balanceData.last_updated) : "N/A"}
              </p>
            </div>
          )}

          {activeTab === "assets" && (
            <div className="container-portafolio">
              <h2>My Assets</h2>

              {portfolio.length === 0 ? (
                <p style={{ textAlign: "center", padding: "10px" }}>
                  ⚠️ Aún no tienes acciones compradas.
                </p>
              ) : (
                <table className="asset-table">
                  <thead>
                    <tr>
                      <th>Symbol</th>
                      <th>Company</th>
                      <th>Qty</th>
                      <th>Avg Price</th>
                      <th>Current</th>
                      <th>Value</th>
                      <th>P/L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolio.map((item) => (
                      <tr key={item.symbol}>
                        <td>{item.symbol}</td>
                        <td>{item.company_name}</td>
                        <td>{item.quantity}</td>
                        <td>{formatCurrency(item.average_price)}</td>
                        <td>{formatCurrency(item.current_price)}</td>
                        <td>{formatCurrency(item.total_value)}</td>
                        <td
                          style={{
                            color: item.profit_loss >= 0 ? "green" : "red",
                            fontWeight: "bold",
                          }}
                        >
                          {formatCurrency(item.profit_loss)} (
                          {item.profit_loss_percentage.toFixed(2)}%)
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Content_portafolio;