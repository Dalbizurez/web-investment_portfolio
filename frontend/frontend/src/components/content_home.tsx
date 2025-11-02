import { FaFilePdf, FaUserPlus } from "react-icons/fa"; // importas los iconos que quieras




export default function ContentHome() {
  const handleGeneratePDF = async () => {
    try {
      alert("Financial statements PDF has been generated and sent to your email");
    } catch (error) {
      alert("Error generating PDF. Please try again.");
    }
  };

  const handleCopyReferralCode = async () => {
    try {

      
      const referralCode = "HAPI-REF-12345";
      await navigator.clipboard.writeText(referralCode);
      alert("Referral code copied to clipboard: " + referralCode);
    } catch (error) {
      alert("Error copying referral code. Please try again.");
    }
  };

  return (
    <div className="content-home">
      <div className="sections">
        <section className="section-1">
          <div className="text-section">
            <h1>Free stock trading</h1>
            <p className="subtitle">With no minimums or broker commissions</p>
            <p className="description">Fund your account and invest in your favorite stocks</p>
            <button className="btn-primary">Fund your account</button>
          </div>

        </section>
			<section className="section-22">
			{/* Utility Buttons Section */}
			<div className="utility-buttons">
				<button className="btn-pdf" onClick={handleGeneratePDF}>
				<FaFilePdf className="button-icon" />  {/* icono PDF */}
				Generate Financial PDF
				</button>
				<button className="btn-referral" onClick={handleCopyReferralCode}>
				<FaUserPlus className="button-icon" />  {/* icono de referral */}
				Copy Referral Code
				</button>
			</div>
			</section>

        <section className="section-3">
          {/* Referral Bonus Card */}
          <div className="crypto-card">
            <img src="/src/assets/Crypto-Currencies.png" alt="Referral Bonus" />
            <div className="crypto-info">
              <h3>Referral Bonus Program!</h3>
              <p>
                <strong>Earn $8 when you refer friends</strong> and <strong>your friends get $5 discount</strong> on their first investment.
                Share your code and both get rewarded!
              </p>
              <div className="bonus-breakdown">
                <div className="bonus-item">
                  <span className="bonus-amount">$8</span>
                  <span className="bonus-text">You earn</span>
                </div>
                <div className="bonus-item">
                  <span className="bonus-amount">$5</span>
                  <span className="bonus-text">Friend gets</span>
                </div>
              </div>
            </div>
          </div>

          {/* Instant Cash Card */}
          <div className="crypto-card">
            <img src="/src/assets/Instant_Cash.png" alt="Instant Cash" />
            <div className="crypto-info">
              <h3>Instant Cash from Referrals</h3>
              <p>
                Get immediate cash rewards when your friends sign up and make their first deposit. 
                No waiting periods!
              </p>
            </div>
          </div>

          {/* Unlimited Referrals Card */}
          <div className="crypto-card">
            <img src="/src/assets/Hapi_Coin_Icon.png" alt="Unlimited Referrals" className="crypto-icon" />
            <div className="crypto-info">
              <h3>Unlimited Referral Earnings</h3>
              <p>
                Invite as many friends as you want! There's no limit to how much you can earn 
                through our referral program.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}