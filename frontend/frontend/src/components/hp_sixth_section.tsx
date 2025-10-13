import React from "react";
import "../styles/hp_sixth_section.css";
import useCarousel from "../hooks/carousel";

import Item1Image from "../assets/hp_sixth_container_1.png";
import Item2Image from "../assets/hp_sixth_container_2.png";
import Item3Image from "../assets/hp_sixth_container_3.png";

interface CarouselItem {
  title: React.ReactNode;
  description: string;
  buttonText: string;
  image: string;
}

const carouselItems: CarouselItem[] = [
  {
    title: (
      <>
        <span className="carousel_title">+12,000</span> assets available
      </>
    ),
    description:
      "Invest in Apple, Tesla, Amazon, Google and leading ETFs from S&P 500, Nasdaq 100, ARK Invest and more starting from $5 USD.",
    buttonText: "Start investing",
    image: Item1Image,
  },
  {
    title: (
      <>
        Crypto <span className="carousel_title">24 hours</span> a day
      </>
    ),
    description:
      "+40 cryptocurrencies available: Bitcoin, Ethereum, Solana, Ripple, Dogecoin and more.",
    buttonText: "Start investing",
    image: Item2Image,
  },
  {
    title: (
      <>
        The <span className="carousel_title">lowest</span> transaction costs!
      </>
    ),
    description:
      "Buying and selling stocks costs 0.15% or less. Cryptocurrency costs are less than 1% of the transaction value.",
    buttonText: "Start investing",
    image: Item3Image,
  },
];

const CarouselSection: React.FC = () => {
  const { currentIndex, goToItem } = useCarousel(
    carouselItems.length,
    5000
  );
  const currentItem = carouselItems[currentIndex];

  return (
    <section className="carousel-section">
      <div className="carousel-content">
        <div className="carousel-left">
          <h2>{currentItem.title}</h2>
          <p>{currentItem.description}</p>
          <a href="/get-started" className="carousel-button">
            {currentItem.buttonText}
          </a>
        </div>

        <div className="carousel-right">
          <img src={currentItem.image} alt="Carousel visual" />
        </div>
      </div>

      <div className="carousel-indicators">
        {carouselItems.map((_, index) => (
          <span
            key={index}
            className={`indicator ${currentIndex === index ? "active" : ""}`}
            onClick={() => goToItem(index)}
          />
        ))}
      </div>
    </section>
  );
};

export default CarouselSection;
