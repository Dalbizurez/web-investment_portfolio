import React, { useEffect } from "react";
import "../styles/styles.css";

const InvitePage: React.FC = () => {
  useEffect(() => {
    const shareButton = document.getElementById("shareButton");

    shareButton?.addEventListener("click", async () => {
      const link = "https://hapi.app/ref/invite";

      if (navigator.share) {
        try {
          await navigator.share({
            title: "Invita a Hapi",
            text: "Únete a Hapi y gana criptomonedas gratis.",
            url: link,
          });
          alert("¡Link compartido exitosamente!");
        } catch (err) {
          console.error("Error al compartir:", err);
        }
      } else {
        navigator.clipboard.writeText(link);
        alert("Link copiado al portapapeles: " + link);
      }
    });

    // 🔹 Limpieza del evento al desmontar el componente
    return () => {
      shareButton?.removeEventListener("click", () => {});
    };
  }, []);

  return (
    <div className="layout">
      {/* 🧭 Sidebar izquierda */}
      <aside className="sidebar">
        <img
          src="../assets/hapi-logo.png"
          alt="Hapi logo"
          className="sidebar-logo"
        />

        <ul className="menu">
          <li>🏠 Home</li>
          <li>💸 Transferencias</li>
          <li>🔍 Buscador</li>
          <li className="active">🎁 Invitar</li>
          <li>📊 Portafolio</li>
          <li>⋮ Más</li>
        </ul>
      </aside>

      {/* 🧩 Sección principal (derecha) */}
      <div className="main-section">
        {/* 🔝 Barra superior */}
        <header className="top-bar">
          <div className="search-bar">
            <input type="text" placeholder="🔍 Busca una empresa o ETF" />
          </div>

          <div className="top-buttons">
            <button className="btn-crypto">💰 Cripto gratis</button>
            <button className="btn-user">👤</button>
          </div>
        </header>

        {/* 📄 Contenido */}
        <main className="content">
          <img
            className="side-image"
            src="../assets/billete.jpg"
            alt="Cripto"
          />

          <section className="invite-section">
            <p className="section-title">Referidos</p>
            <h2>Invita amigos. ¡Gana cripto!</h2>
            <p>
              Invita a tus amigos a Hapi. Una vez que se registren e ingresen
              fondos, ambos recibirán criptomonedas gratis.
            </p>

            <button className="share-button" id="shareButton">
              Compartir link
            </button>

            <div className="details">
              <h3>100% chances de ganar un premio</h3>
              <p>
                Cada vez que un amigo se registra e ingresa fondos, recibes un
                premio gratis de criptomonedas en tu cuenta.{" "}
                <a href="#">Términos y condiciones aquí.</a>
              </p>

              <h3>Gana hasta US$500 en cripto</h3>
              <p>
                Tienes 1 en 400 chances de ganar US$500, 1 en 100 chances de
                ganar US$20, 1 en 20 chances de ganar US$10, y 1 en 2 chances de
                ganar US$1.
              </p>

              <h3>Invitaciones ilimitadas</h3>
              <p>
                Invita a cuántos amigos quieras y recibe criptos gratis por cada
                uno.
              </p>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default InvitePage;
