export default function ContentHome() {
	return (
		<div className="content-home">
			<div className="sections">
				<section className="section-1">
					<div className="text-section">
						<h1>Free stock trading</h1>
						<p className="subtitle">With no minimums or broker commissions</p>
						<p className="description">Fund your account and invest in your favorite stocks and crypto</p>
						<button className="btn-primary">Fund your account</button>
					</div>
					<div className="buying-power">
						<span>Buying power {">"}</span>
						<span className="amount">$0.00</span>
					</div>
				</section>
				<section className="section-22">
					<div className="section-2">
						<div className="actions">
							<div className="action-item">
								<div className="icon">💰</div>
								<p>Deposit</p>
							</div>
							<div className="action-item">
								<div className="icon">🏦</div>
								<p>Withdraw</p>
							</div>
							<div className="action-item">
								<div className="icon">📈</div>
								<p>Invest</p>
							</div>
						</div>
						<div className="prime-card">
							<div className="prime-info">
								<h2>hapi <span>prime</span></h2>
								<p className="bold">Supercharge your investments!</p>
								<p>Instant cash from sales to invest, real-time data, Prime trading fees, and more.</p>
							</div>
							<button className="btn-prime">I want Prime</button>
						</div>
					</div>
				</section>
				<section className="section-3">
					<div className="crypto-card">
						<img src="/src/assets/Crypto-Currencies.png" alt="Crypto Icon" />

						<div className="crypto-info">
							<h3>Transfer your cryptos to Hapi!</h3>
							<p>
							Now you can send and receive Bitcoin (BTC), Litecoin (LTC), and Bitcoin Cash (BCH) to Hapi.
							</p>
						</div>
					</div>

					<div className="crypto-card">
						<img src="/src/assets/Instant_Cash.png" alt="Crypto Icon" />

						<div className="crypto-info">
							<h3>Transfer your cryptos to Hapi!</h3>
							<p>
								Discover new, budget-friendly, and secure deposit methods
							</p>
						</div>
					</div>


					<div className="crypto-card">
						<img src="/src/assets/Hapi_Coin_Icon.png" alt="Crypto Icon" className="crypto-icon" />

						<div className="crypto-info">
							<h3>Transfer your cryptos to Hapi!</h3>
							<p>
								Invite your friends and earn up to US$10 for each one.
							</p>
						</div>
					</div>

				</section>
				<section className="section-4">
					<h1>resto de categorias</h1>		
				</section>
			</div>
		</div>
	)
}
