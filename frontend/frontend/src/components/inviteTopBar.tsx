import React from "react";
import "../styles/styles.css";

const TopBar: React.FC = () => {
    return (
        <header className="top-bar">
        <div className="search-bar">
            <input type="text" placeholder="🔍 Search for a company or ETF" />
        </div>

        <div className="top-buttons">
            <button className="btn-crypto">💰 Free Crypto</button>
            <button className="btn-user">👤</button>
        </div>
        </header>
    );
};

export default TopBar;
