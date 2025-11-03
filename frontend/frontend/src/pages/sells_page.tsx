import SideBar from "../components/sidebar";
import Header from "../components/header_search";
import SellActions from "../components/sell_actions";
import "../styles/Dashboard.css";
import "../styles/sell_actions.css";

function SellsPage() {
  return (
    <main className="search-navigation">
      <SideBar />
      <div className="content-home">
        <Header />
        <div className="sections">
          <SellActions />
        </div>
      </div>
    </main>
  );
}

export default SellsPage;
