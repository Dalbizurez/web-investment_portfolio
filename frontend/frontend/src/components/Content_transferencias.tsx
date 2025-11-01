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

// --- COMPONENTE PRINCIPAL ---
function Content_transferencias() {
  const [currentView, setCurrentView] = useState<"main" | "toHapi" | "toBank">(
    "main"
  );
  const { token, isLoadingProfile } = useUser();

  const opciones: Opcion[] = [
    {
      id: "toHapi",
      icon: FiSend,
      titulo: "Transferir a Hapi",
      descripcion: "Transfiere fondos desde tu cuenta bancaria a tu cuenta Hapi",
    },
    {
      id: "toBank",
      icon: FiArrowUpRight,
      titulo: "Transfiere a tu banco",
      descripcion: "Transfiere fondos desde tu cuenta Hapi a tu cuenta bancaria",
    },
  ];

  if (isLoadingProfile)
    return (
      <div className="content-home">
        <p style={{ textAlign: "center", padding: "20px" }}>🔄 Cargando...</p>
      </div>
    );

  if (!token)
    return (
      <div className="content-home">
        <p style={{ color: "red", textAlign: "center" }}>
          No se encontró token de autenticación.
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
                <h2>Transferir dinero</h2>
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
      setMessage("Completa todos los campos.");
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
        setMessage("Transferencia a Hapi realizada correctamente.");
        setAmount("");
        setReference("");
      }
    } catch (err: any) {
      console.error(err);
      setMessage("Error al enviar la transferencia.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="transfer-form">
      <button onClick={onBack} className="back-button">
        <FiChevronLeft /> Volver
      </button>
      <h2>Transferir a Hapi</h2>

      <div className="form-group">
        <label>Desde tu cuenta bancaria</label>
        <div className="account-display">
          <span>Banco Patito 123123*****</span>
        </div>
      </div>

      <div className="form-group">
        <label>Monto a transferir</label>
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
        <label>Referencia</label>
        <input
          type="text"
          placeholder="Ej. Depósito mensual"
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
        {loading ? "Enviando..." : "Enviar Dinero"}
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
      setMessage(" Completa todos los campos.");
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
        setMessage(" Retiro realizado correctamente.");
        setAmount("");
        setReference("");
      }
    } catch (err: any) {
      console.error(err);
      setMessage(" Error al procesar el retiro.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="transfer-form">
      <button onClick={onBack} className="back-button">
        <FiChevronLeft /> Volver
      </button>
      <h2>Transfiere a tu banco</h2>

      <div className="form-group">
        <label>Desde</label>
        <div className="account-display">
          <FiHome />
          <span>Mi Cuenta Hapi (**** 5678)</span>
        </div>
      </div>

      <div className="form-group">
        <label>Hacia tu cuenta bancaria</label>
        <div className="account-display">
          <span>Banco Patito 123123*****</span>
        </div>
      </div>

      <div className="form-group">
        <label>Monto a retirar</label>
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
        <label>Referencia</label>
        <input
          type="text"
          placeholder="Ej. Pago de servicios"
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
        {loading ? "Procesando..." : "Retirar Dinero"}
      </button>

      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default Content_transferencias;
