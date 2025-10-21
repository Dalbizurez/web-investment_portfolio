import { useState } from "react";
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

// --- TIPOS ---

type Opcion = {
    id: "toHapi" | "toBank";
    icon: IconType;
    titulo: string;
    descripcion: string;
};

type FormProps = {
    onBack: () => void;
};


function Content_transferencias() {
    const [currentView, setCurrentView] = useState<"main" | "toHapi" | "toBank">(
        "main"
    );

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

    return (
        <section className="content-home">
            <div className="sections">
                <div className="transfer-container">
                    <div className="transfer-dinero">
                        {/* VISTA PRINCIPAL (MENÚ) */}
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

                        {/* VISTA PARA TRANSFERIR A HAPI */}
                        {currentView === "toHapi" && (
                            <FormTransferirHapi onBack={() => setCurrentView("main")} />
                        )}

                        {/* VISTA PARA TRANSFERIR A BANCO */}
                        {currentView === "toBank" && (
                            <FormTransferirBanco onBack={() => setCurrentView("main")} />
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



const FormTransferirHapi = ({ onBack }: FormProps) => {
    return (
        <div className="transfer-form">
            <button onClick={onBack} className="back-button">
                <FiChevronLeft /> Volver
            </button>
            <h2>Transferir a Hapi</h2>

            <div className="form-group">
                <label>Desde tu cuenta bancaria</label>
                <div className="account-display">
                    <span>Banco Industrial (**** 1234)</span>
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
                    />
                    <span>USD</span>
                </div>
            </div>

            <button className="submit-button">Enviar Dinero</button>
        </div>
    );
};


const FormTransferirBanco = ({ onBack }: FormProps) => {
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
                    />
                    <span>USD</span>
                </div>
            </div>

            <button className="submit-button">Retirar Dinero</button>
        </div>
    );
};

export default Content_transferencias;