import React from "react";
import bill from "../assets/bill.jpg"; // 👈 replace with your actual image name
import "../styles/styles.css";

const InviteImage: React.FC = () => {
    return (
        <div className="invite-image-container">
        <img src={bill} alt="Bill" className="invite-image" />
        </div>
    );
    };

export default InviteImage;
