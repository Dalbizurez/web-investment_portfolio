import InviteSection from "../components/inviteSection";
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
        <div className="invite-layout invite-layout--single">
          <InviteSection />
        </div>
      </div>
    </main>
  );
}

export default InvitePage;
