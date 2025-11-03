import React from "react";
import Navbar from "../components/navbar";
import FirstSection from "../components/hp_first_section";
import SecondSection from "../components/hp_second_sectionc";
import ThirdSection from "../components/hp_third_section";
import FourthSection from "../components/hp_fourth_section";
import FifthSection from "../components/hp_fifth_section";
import CarouselSection from "../components/hp_sixth_section";
import SeventhSection from "../components/hp_seventh_section";
import ViewStocks from "../components/ViewStocks"; 
import "../styles/view.css";


function HomePage() {
  return (
    <div className="home-page-container">
      <Navbar />
      <FirstSection />
      <SecondSection />
      <ThirdSection />
      <FourthSection />
      <FifthSection />
      <CarouselSection />
      <SeventhSection />
      <ViewStocks />
    </div>
  );
}

export default HomePage;
