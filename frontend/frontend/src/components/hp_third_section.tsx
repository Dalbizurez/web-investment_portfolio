import "../styles/hp_third_section.css";
import Image from "../assets/hp_third_container.png";
import GooglePlay from "../assets/google_play.png";
import AppStore from "../assets/app_store.png";

export default function ThirdSection() {
  return (
    <section className="third-section">
      <div className="third-section-content">
        <div className="third-left">
          <img src={Image} alt="Hapi app illustration" />
        </div>
        <div className="third-right">
          <h2>What is Hapi and how does it work?</h2>
          <p>
            We are the investment app <b>more powerful and easy to use, designed
            for people from Latin America to invest in the US stock market and
            cryptocurrencies</b>, fast, easy and secure.
          </p>

          <div className="image-row">
            <img src={GooglePlay} alt="Google Play badge" />
            <img src={AppStore} alt="App Store badge" />
          </div>
        </div>
      </div>
    </section>
  );
}
