import { FaFilePdf, FaUserPlus } from "react-icons/fa";
import { useReferralCode } from '../hooks/useReferralCode';
import { useStockReports } from "../hooks/useStockReports";

export default function ContentHome() {
  const { 
    shareReferralCode, 
    isSharing 
  } = useReferralCode();
  
  const { 
    requestReport, 
    isRequesting, 
    error, 
    successMessage 
  } = useStockReports();

  const handleGeneratePDF = async () => {
    const result = await requestReport({
      include_current_valuation: true,
      format: "PDF"
    });

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
            <button 
              className="btn-pdf" 
              onClick={handleGeneratePDF}
              disabled={isRequesting}
            >
              <FaFilePdf className="button-icon" />
              {isRequesting ? 'Generating PDF...' : 'Generate Financial PDF'}
            </button>
            
            <button 
              className="btn-referral" 
              onClick={shareReferralCode}
              disabled={isSharing}
            >
              <FaUserPlus className="button-icon" />
              {isSharing ? 'Copying...' : 'Copy Referral Code'}
            </button>
          </div>

          {/* Mensajes del sistema */}
          {error && (
            <div className="error-message">
              Error: {error}
            </div>
          )}
          
          {successMessage && (
            <div className="success-message">
              {successMessage}
            </div>
          )}
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