import React from "react";
import SideBar from "../components/sidebar";
import Header from "../components/header_search";
import SearchActions from "../components/search_actions";
import "../styles/SearchActions.css";

const SearchPage: React.FC = () => {
  return (
    <main className="search-navigation">
      <SideBar />
      <Header />
      <div className="content-home">
        <SearchActions />
      </div>
    </main>
  );
};

export default SearchPage;
