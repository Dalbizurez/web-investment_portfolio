import AccountSettings from "../components/AccountSettings";
import Sidebar from "../components/inviteSideBar";
import TopBar from "../components/inviteTopBar";

export default function AccountPage() {
  return (
    <div className="layout">
      <Sidebar />
      <div className="flex-1 p-6">
        <TopBar />
        <AccountSettings />
      </div>
    </div>
  );
}
