import Navbar from "../components/navbar";
import FirstSection from "../components/hp_first_section";
import SecondSection from "../components/hp_second_sectionc";
import ThirdSection from "../components/hp_third_section";
import FourthSection from "../components/hp_fourth_section";

function HomePage() {
  return (
    <>
      <Navbar />
      <FirstSection/>
      <SecondSection />
      <ThirdSection />
      <FourthSection />
    </>
  );
}

export default HomePage;
