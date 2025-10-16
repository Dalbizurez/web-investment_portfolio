import "../styles/Dashboard.css";
import SideBar from "./sidebar";
import ContentHome from "./content_home";

function Header() {
  return (
    <main className='search-navigation'>
      <SideBar />
      <header className='search-header'>
        <input
          type="text"
          className="search-input"
          placeholder="Search a stock or ETF"
        />
        <div className='acount-section'>
          <div className='acount-services'>FD</div>
        </div>
      </header>
      <ContentHome />
    </main>
  );
};

export default Header;