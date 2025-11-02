import InviteSection from "../components/inviteSection";
import InviteImage from "../components/inviteImage";
import "../styles/invite_section.css";
import "../styles/styles.css";
import SideBar from "../components/sidebar";
import Header from "../components/header_search";

function InvitePage() {
  return (
    <main className="page-container">
      <SideBar />
      <div className="main-area">
        <Header />
        <div className="invite-layout">
          <InviteSection />
          <div className="inviteImage">
            <InviteImage />
          </div>
        </div>
      </div>
    </main>
  );
}

export default InvitePage;