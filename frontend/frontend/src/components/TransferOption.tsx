// En tu archivo TransferOption.tsx

import type { IconType } from "react-icons";
import { FiChevronRight } from "react-icons/fi";
// Asumo que importas tu CSS
// import "../styles/transferencias.css"; 

// 1. Define las props, incluyendo onClick
type TransferOptionProps = {
    icon: IconType;
    titulo: string;
    descripcion: string;
    onClick: () => void; // <-- AÑADE ESTA LÍNEA
};

const TransferOption = ({
    icon: Icon,
    titulo,
    descripcion,
    onClick, // <-- AÑADE ESTA LÍNEA
}: TransferOptionProps) => {

    return (
        <div className="transfer-option" onClick={onClick}>
            <div className="transfer-info">
                <div className="transfer-icon">
                    <Icon />
                </div>
                <div>
                    <h3>{titulo}</h3>
                    <p>{descripcion}</p>
                </div>
            </div>
            <div className="transfer-arrow">
                <FiChevronRight />
            </div>
        </div>
    );
};

export default TransferOption;