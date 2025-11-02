import "../styles/Dashboard.css";
import "../styles/transferencias.css";
import Header from "../components/header_search";
import SideBar from "../components/sidebar";
import Content_transferencias from "../components/Content_transferencias";

function TransferPage() {
  return (
    <main className="search-navigation">
      <SideBar />
      <Header />
      <Content_transferencias />
    </main>
  );
}

export default TransferPage;
