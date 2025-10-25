import React from "react";
import Sidebar from "./inviteSideBar";
import "../styles/styles.css";

interface LayoutProps {
    children: React.ReactNode;
    }

    const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="layout">
        <Sidebar />
        <div className="main-section">{children}</div>
        </div>
    );
};

export default Layout;
