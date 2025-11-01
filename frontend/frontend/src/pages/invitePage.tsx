import React from "react";
import Layout from "../components/Layout";

import InviteSection from "../components/inviteSection";
import InviteImage from "../components/inviteImage";
import "../styles/styles.css";
import SideBar from "../components/sidebar";
import Header from "../components/header_search";

const InvitePage: React.FC = () => {
  return (
    <Layout>
      <div className="page-container">
        <SideBar/>

        <div className="main-area">
        <Header />

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
