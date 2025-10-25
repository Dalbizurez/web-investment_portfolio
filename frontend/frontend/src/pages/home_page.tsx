import Navbar from "../components/navbar";
import FirstSection from "../components/hp_first_section";
import SecondSection from "../components/hp_second_sectionc";
import ThirdSection from "../components/hp_third_section";
import FourthSection from "../components/hp_fourth_section";
import FifthSection from "../components/hp_fifth_section";
import CarouselSection from "../components/hp_sixth_section";
import SeventhSection from "../components/hp_seventh_section";

import SearchActions from "../components/search_actions";
import type { SearchResult } from "../hooks/use_search_actions";

function HomePage() {
  const categories = ["Technology", "Finance", "Energy"];

  const fetchData = async (
    query: string,
    category: string
  ): Promise<SearchResult[]> => {
    const data: SearchResult[] = [
      { id: 1, name: "Apple", category: "Technology", price: 170 },
      { id: 2, name: "Tesla", category: "Energy", price: 310 },
      { id: 3, name: "JPMorgan", category: "Finance", price: 140 },
      { id: 4, name: "Microsoft", category: "Technology", price: 295 },
      { id: 5, name: "ExxonMobil", category: "Energy", price: 100 },
    ];

    return data.filter(
      (item) =>
        item.name.toLowerCase().includes(query.toLowerCase()) &&
        (category === "" || item.category === category)
    );
  };

  const renderItem = (item: SearchResult) => (
  <div
    key={item.id}
    style={{
      border: "1px solid #ddd",
      padding: "10px",
      borderRadius: "8px",
      background: "#fff",
    }}
  >
    <h4>{item.name}</h4>
    <small>{item.category}</small>
    <p>${item.price}</p>
  </div>
);

  return (
    <>
      <Navbar />
      <FirstSection />
      <SecondSection />
      <ThirdSection />
      <FourthSection />
      <FifthSection />
      <CarouselSection />
      <SeventhSection />

      <SearchActions
        categories={categories}
        renderItem={renderItem}
        fetchData={fetchData}
      />
    </>
  );
}

export default HomePage;
