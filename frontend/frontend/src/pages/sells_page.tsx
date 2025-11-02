import React from "react";
import SideBar from "../components/sidebar";
import Header from "../components/header_search";
import SellActions from "../components/sell_actions";
import type { SellActionItem } from "../components/sell_actions";

const mockSellData: SellActionItem[] = [
  { id: "101", name: "Apple", category: "Technology", price: 180, quantity: 10 },
  { id: "102", name: "Tesla", category: "Energy", price: 240, quantity: 5 },
  { id: "103", name: "JPMorgan", category: "Finance", price: 145, quantity: 8 },
];

const SellsPage: React.FC = () => {
  return (
    <main className="search-navigation">
      <SideBar />
      <Header />
      <div className="content-home">
        <SellActions mockData={mockSellData} />
      </div>
    </main>
  );
};

export default SellsPage;
