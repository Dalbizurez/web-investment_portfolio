import { useState } from "react";

function Content_portafolio() {
	const [activeTab, setActiveTab] = useState("portafolio");

	return (
		<div className="content-home">
			<div className="sections">
				{/* === TABS === */}
				<div className="type">
					<p
						className={activeTab === "portafolio" ? "active" : ""}
						onClick={() => setActiveTab("portafolio")}
					>
						Portafolio
					</p>
					<p
						className={activeTab === "assets" ? "active" : ""}
						onClick={() => setActiveTab("assets")}
					>
						Assets
					</p>
				</div>

				{/* === CONTENIDO DINÁMICO === */}
				<div className="content">
					{/* --- PORTAFOLIO --- */}
					{activeTab === "portafolio" && (
						<div className="container-portafolio">
							<div className="totales">
								<h1>My account</h1>
								<div className="total">
									<h3>Total assets</h3>
									<p>$0.00</p>
									<p>0.00%</p>
								</div>
								<div className="total">
									<h3>Total money</h3>
									<p>$0.00</p>
									<p>0.00%</p>
								</div>
								<div className="total">
									<h3>Locked assets</h3>
									<p>$0.00</p>
									<p>0.00%</p>
								</div>
							</div>

							<div className="graphics">
								<h2>$0</h2>
								<p>Total balance</p>
							</div>
						</div>
					)}

					{activeTab === "assets" && (
						<div className="container-portafolio">
							<div className="totales">
								<h1>My account</h1>
								<div className="total">
									<h3>Assets</h3>
									<p>$0.00</p>
									<p>0.00%</p>
								</div>
							</div>

							<div className="graphics">
								<h2>$0</h2>
								<p>Total balance</p>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default Content_portafolio;