import React from "react";
import SideBar from "../components/sidebar";
import Header from "../components/header_search";
import SearchActions from "../components/search_actions";
import type { SearchResult } from "../hooks/use_search_actions";

const renderItem = (item: SearchResult) => (
  <div
    key={item.id}
    style={{
      border: "1px solid #ddd",
      padding: "10px",
      borderRadius: "8px",
      background: "#fff",
      width: "200px",
      textAlign: "center",
    }}
  >
    <h4>{item.name}</h4>
    <small>{item.category}</small>
    <p>${item.price}</p>
  </div>
);

const SearchPage: React.FC = () => {
  return (
    <main className="search-navigation">
      <SideBar />
      <Header />
      <div className="content-home">
        <SearchActions
          renderItem={renderItem}
        />
      </div>
    </main>
  );
};

export default SearchPage;
