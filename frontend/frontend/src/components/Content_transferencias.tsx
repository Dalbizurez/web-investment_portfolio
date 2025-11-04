import { useState, useEffect } from "react";
import { useUser } from "./UserContext";
import axios from "axios";
import TransferOption from "./TransferOption";
import { FiArrowDownCircle, FiArrowUpCircle, FiChevronLeft } from "react-icons/fi";
import "../styles/transferencias.css";

const API_URL = "http://back.g4.atenea.lat/api";

type FormProps = {
  onBack: () => void;
  token: string;
  refresh: () => void;
};

type Transaction = {
  id: number;
  type: string; 
  amount: number;
  transfer_reference: string;
  timestamp: string;
};

function Content_transferencias() {
  const [currentView, setCurrentView] = useState<"main" | "toHapi" | "toBank">("main");
  const { token, isLoadingProfile } = useUser();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 8;

  const fetchTransactions = () => {
    if (!token) return;
    axios
      .get(`${API_URL}/stocks/transactions/history/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setTransactions(res.data.transactions);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchTransactions();
  }, [token]);

  if (isLoadingProfile)
    return <div className="content-home"><p>Loading...</p></div>;

  if (!token)
    return <div className="content-home"><p style={{ color: "red" }}>Auth error.</p></div>;

  return (
    <section className="content-home">
      <div className="sections">
        
        <div className="transfer-container">

          <div className="transfer-dinero">
            {currentView === "main" && (
              <>
                <h2>Transfers</h2>

                <div className="transfer-options">
                  <TransferOption
                    icon={FiArrowDownCircle}
                    titulo="Deposit"
                    descripcion="Add funds to your investment balance"
                    onClick={() => setCurrentView("toHapi")}
                  />

                  <TransferOption
                    icon={FiArrowUpCircle}
                    titulo="Withdraw"
                    descripcion="Send funds to your bank account"
                    onClick={() => setCurrentView("toBank")}
                  />
                </div>
              </>
            )}

            {currentView === "toHapi" && (
              <FormDeposit
                onBack={() => setCurrentView("main")}
                token={token}
                refresh={fetchTransactions}
              />
            )}

            {currentView === "toBank" && (
              <FormWithdraw
                onBack={() => setCurrentView("main")}
                token={token}
                refresh={fetchTransactions}
              />
            )}
          </div>
        </div>

        <h3 style={{ marginTop: "2rem" }}>Full Transfer History</h3>

        <div className="history-table-wrapper">
          <table className="history-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Amount</th>
                <th>Reference</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: "1rem" }}>
                    No transactions yet.
                  </td>
                </tr>
              )}

              {transactions
                .slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
                .map((tx) => (
                  <tr key={tx.id}>
                    {/* ✅ Fix final: backend sends DEPOSIT / WITHDRAWAL */}
                    <td style={{ fontWeight: 700 }}>
                      {tx.type === "DEPOSIT" ? (
                        <span style={{ color: "#4caf50" }}>⬆ Deposit</span>
                      ) : tx.type === "WITHDRAWAL" ? (
                        <span style={{ color: "#d32f2f" }}>⬇ Withdraw</span>
                      ) : (
                        tx.type
                      )}
                    </td>

                    <td>${tx.amount}</td>

                    {/* ✅ fix reference */}
                    <td>{tx.transfer_reference && tx.transfer_reference.trim() !== "" ? tx.transfer_reference : "-"}</td>

                    <td>{new Date(tx.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
            </tbody>
          </table>

          {transactions.length > rowsPerPage && (
            <div className="pagination-controls">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
              >
                Prev
              </button>

              <span>Page {currentPage}</span>

              <button
                disabled={currentPage * rowsPerPage >= transactions.length}
                onClick={() => setCurrentPage((prev) => prev + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- Deposit Form ----------------------------- */

const FormDeposit = ({ onBack, token, refresh }: FormProps) => {
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    if (!amount || !reference) return setMessage("Fill all fields.");

    setLoading(true);
    setMessage("");

    try {
      await axios.post(
        `${API_URL}/stocks/transactions/deposit/`,
        { amount: parseFloat(amount), transfer_reference: reference },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage("Deposit successful.");
      setAmount("");
      setReference("");
      refresh();
    } catch {
      setMessage("Error making deposit.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="transfer-form">
      <button className="back-button" onClick={onBack}><FiChevronLeft /> Back</button>
      <h2>Deposit funds</h2>

      <div className="form-group">
        <label>Amount</label>
        <div className="amount-input-wrapper">
          <span>$</span>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <span>USD</span>
        </div>
      </div>

      <div className="form-group">
        <label>Reference</label>
        <input
          type="text"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="Ex. Salary deposit"
        />
      </div>

      <button onClick={handleSubmit} disabled={loading}>
        {loading ? "Processing..." : "Deposit"}
      </button>

      {message && <p className="message">{message}</p>}
    </div>
  );
};

/* ----------------------------- Withdraw Form ----------------------------- */

const FormWithdraw = ({ onBack, token, refresh }: FormProps) => {
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    if (!amount || !reference) return setMessage("Fill all fields.");

    setLoading(true);
    setMessage("");

    try {
      await axios.post(
        `${API_URL}/stocks/transactions/withdraw/`,
        { amount: parseFloat(amount), transfer_reference: reference },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage("Withdrawal successful.");
      setAmount("");
      setReference("");
      refresh();
    } catch {
      setMessage("Error processing withdrawal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="transfer-form">
      <button className="back-button" onClick={onBack}><FiChevronLeft /> Back</button>
      <h2>Withdraw funds</h2>

      <div className="form-group">
        <label>Amount</label>
        <div className="amount-input-wrapper">
          <span>$</span>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <span>USD</span>
        </div>
      </div>

      <div className="form-group">
        <label>Reference</label>
        <input
          type="text"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="Ex. Cash out"
        />
      </div>

      <button onClick={handleSubmit} disabled={loading}>
        {loading ? "Processing..." : "Withdraw"}
      </button>

      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default Content_transferencias;
