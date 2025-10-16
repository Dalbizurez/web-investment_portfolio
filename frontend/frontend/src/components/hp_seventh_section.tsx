import React from "react";
import "../styles/hp_seventh-section.css"

import GooglePlay from "../assets/google_play_seventh_2.png";
import AppStore from "../assets/app_store_seventh_1.png";
import Image from "../assets/hp_seventh_container.png";

const SeventhSection: React.FC = () => {
  return (
    <section className="download-section">
      <div className="download-container">
        <div className="download-left">
          <h2>Download the app</h2>
          <div className="download-buttons">
            <img src={GooglePlay} alt="GooglePlay" />
            <img src={AppStore} alt="App Store" />
          </div>
        </div>
        <div className="download-right">
          <img src={Image} alt="App preview" />
        </div>
      </div>
    </section>
  );
};

export default SeventhSection;
