import { Link } from "react-router-dom";
import Image from "../assets/hp_first_container.png";
import "../styles/hp_first_section.css";

function FirstSection() {
  return (
    <section className="container">
      <div className="left">
        <h1>Invest in the US Stock Market from Latam</h1>
        <p>+12,000 Stocks, ETFs and Cryptocurrencies starting at $5. Start your portfolio today!</p>
        <Link to="/get-started" className="button">
          Invest now
        </Link>
      </div>
      <div className="right">
        <img src={Image} alt="Img" />
      </div>
    </section>
  );
}

export default FirstSection;
