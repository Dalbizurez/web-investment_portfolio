import React from "react";
import "../styles/styles.css";
import logo from "../assets/icon.png";


const Sidebar: React.FC = () => {
    return (
        <aside className="sidebar">
        <img
            src={logo}
            alt="Hapi logo"
            className="sidebar-logo"
        />

        <ul className="menu">
            <li>🏠 Home</li>
            <li>💸 Transfers</li>
            <li>🔍 Search</li>
            <li className="active">🎁 Invite</li>
            <li>📊 Portfolio</li>
            <li>⋮ More</li>
        </ul>
        </aside>
    );
};

export default Sidebar;
