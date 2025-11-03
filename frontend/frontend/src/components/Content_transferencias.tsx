import { useState } from "react";
import { useUser } from "./UserContext";
import axios from "axios";
import TransferOption from "./TransferOption";
import RecentTransfers from "./RecentTransfers";
import type { IconType } from "react-icons";
import {
  FiSend,
  FiArrowUpRight,
  FiChevronLeft,
  FiHome,
} from "react-icons/fi";
import "../styles/transferencias.css";

const API_URL = "http://localhost:8000/api";

// --- TIPOS ---
type Opcion = {
  id: "toHapi" | "toBank";
  icon: IconType;
  titulo: string;
  descripcion: string;
};

type FormProps = {
  onBack: () => void;
  token: string;
};

function Content_transferencias() {
  const [currentView, setCurrentView] = useState<"main" | "toHapi" | "toBank">(
    "main"
  );
  const { token, isLoadingProfile } = useUser();

  const opciones: Opcion[] = [
    {
      id: "toHapi",
      icon: FiSend,
      titulo: "Transfer to Hapi",
      descripcion: "Transfer funds from your bank account to your Hapi account",
    },
    {
      id: "toBank",
      icon: FiArrowUpRight,
      titulo: "Transfer to your bank",
      descripcion: "Transfer funds from your Hapi account to your bank account",
    },
  ];

  if (isLoadingProfile)
    return (
      <div className="content-home">
        <p style={{ textAlign: "center", padding: "20px" }}> Loading...</p>
      </div>
    );

  if (!token)
    return (
      <div className="content-home">
        <p style={{ color: "red", textAlign: "center" }}>
          No authentication token found.
        </p>
      </div>
    );

  return (
    <section className="content-home">
      <div className="sections">
        <div className="transfer-container">
          <div className="transfer-dinero">
            {/* VISTA PRINCIPAL */}
            {currentView === "main" && (
              <>
                <h2>Transfer money</h2>
                <div className="transfer-options">
                  {opciones.map((opt) => (
                    <TransferOption
                      key={opt.titulo}
                      icon={opt.icon}
                      titulo={opt.titulo}
                      descripcion={opt.descripcion}
                      onClick={() => setCurrentView(opt.id)}
                    />
                  ))}
                </div>
              </>
            )}

            {currentView === "toHapi" && (
              <FormTransferirHapi
                onBack={() => setCurrentView("main")}
                token={token}
              />
            )}

            {currentView === "toBank" && (
              <FormTransferirBanco
                onBack={() => setCurrentView("main")}
                token={token}
              />
            )}
          </div>

          <div className="transfer-recientes">
            <RecentTransfers />
          </div>
        </div>
      </div>
    </section>
  );
}

const FormTransferirHapi = ({ onBack, token }: FormProps) => {
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    if (!amount || !reference) {
      setMessage("Fill in all fields.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post(
        `${API_URL}/stocks/transactions/deposit/`,
        {
          amount: parseFloat(amount),
          reference,
          type: "toHapi",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.status === 200 || res.status === 201) {
        setMessage("Transfer to Hapi completed successfully.");
        setAmount("");
        setReference("");
      }
    } catch (err: any) {
      console.error(err);
      setMessage("Error sending the transfer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="transfer-form">
      <button onClick={onBack} className="back-button">
        <FiChevronLeft /> Back
      </button>
      <h2>Transfer to Hapi</h2>

      <div className="form-group">
        <label>From your bank account</label>
        <div className="account-display">
          <span>User</span>
        </div>
      </div>

      <div className="form-group">
        <label>Amount to transfer</label>
        <div className="amount-input-wrapper">
          <span>$</span>
          <input
            type="number"
            placeholder="0.00"
            className="amount-input"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <span>USD</span>
        </div>
      </div>

      <div className="form-group">
        <label>Reference</label>
        <input
          type="text"
          placeholder="Ex. Monthly deposit"
          className="reference-input"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
        />
      </div>

      <button
        className="submit-button"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Sending..." : "Send Money"}
      </button>

      {message && <p className="message">{message}</p>}
    </div>
  );
};

const FormTransferirBanco = ({ onBack, token }: FormProps) => {
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    if (!amount || !reference) {
      setMessage(" Fill in all fields.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post(
        `${API_URL}/stocks/transactions/withdraw/`,
        {
          amount: parseFloat(amount),
          reference,
          type: "toBank",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.status === 200 || res.status === 201) {
        setMessage(" Withdrawal completed successfully.");
        setAmount("");
        setReference("");
      }
    } catch (err: any) {
      console.error(err);
      setMessage(" Error processing withdrawal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="transfer-form">
      <button onClick={onBack} className="back-button">
        <FiChevronLeft /> Back
      </button>
      <h2>Transfer to your bank</h2>

      <div className="form-group">
        <label>From</label>
        <div className="account-display">
          <FiHome />
          <span>My Hapi account</span>
        </div>
      </div>

      <div className="form-group">
        <label>To your bank account</label>
        <div className="account-display">
          <span>Destination account</span>
        </div>
      </div>

      <div className="form-group">
        <label>Amount to be withdrawn</label>
        <div className="amount-input-wrapper">
          <span>$</span>
          <input
            type="number"
            placeholder="0.00"
            className="amount-input"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <span>USD</span>
        </div>
      </div>

      <div className="form-group">
        <label>References</label>
        <input
          type="text"
          placeholder="Ex. Payment for services"
          className="reference-input"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
        />
      </div>

      <button
        className="submit-button"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Proccesing..." : "withdraw money"}
      </button>

      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default Content_transferencias;

