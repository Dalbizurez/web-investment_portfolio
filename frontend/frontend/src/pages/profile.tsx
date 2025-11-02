import "../styles/Dashboard.css";
import "../styles/transferencias.css";
import Header from "../components/header_search";
import SideBar from "../components/sidebar";
import ContentProfile from "../components/content_profile";

function ProfilePage() {
  return (
    <main className="search-navigation">
      <SideBar />
      <Header />
      <ContentProfile />
    </main>
  );
}

export default ProfilePage;
