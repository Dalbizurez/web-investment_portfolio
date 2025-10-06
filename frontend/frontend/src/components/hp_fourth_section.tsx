import "../styles/hp_fourth_section.css";
import Investor1 from "../assets/hp_fourth_container_1.png";
import Investor2 from "../assets/hp_fourth_container_2.png";

export default function FourthSection() {
  return (
    <section className="fourth-section">
      <h2>Current Hapi investors:</h2>

      <div className="investor-images">
        <img src={Investor1} alt="Investor 1" />
        <img src={Investor2} alt="Investor 2" />
      </div>

      <p className="investor-text">
        *Investors from Hapi Corp. among other startups. This does not mean that
        they endorse or agree with the products offered by Hapi.
      </p>
    </section>
  );
}
