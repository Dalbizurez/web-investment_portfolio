import React from "react";
import Layout from "../components/Layout";
import TopBar from "../components/inviteTopBar";
import InviteSection from "../components/inviteSection";
import InviteImage from "../components/inviteImage";
import "../styles/styles.css";

const InvitePage: React.FC = () => {
  return (
    <Layout>
      <div className="page-container">
        <div className="sidebar">
        </div>

        <div className="main-area">
          <TopBar />

          <div className="invite-layout">
            <InviteSection />
            <div className="inviteImage"><InviteImage /></div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default InvitePage;
