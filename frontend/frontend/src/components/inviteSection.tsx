import React from 'react';
import { useReferralCode } from '../hooks/useReferralCode';

const InviteSection: React.FC = () => {
  const { 
    shareReferralCode, 
    isSharing, 
    error 
  } = useReferralCode();

  return (
    <section className="invite-section">
      <p className="section-title">Referred</p>
      <h2>Invite friends. Earn rewards!</h2>
      <p>
        Invite your friends to Hapi. Once they register and use the app,
        both of you will receive special rewards.
      </p>

      <button 
        className="share-button" 
        onClick={shareReferralCode}
        disabled={isSharing}
      >
        {isSharing ? 'Sharing...' : 'Share code'}
      </button>

      {error && (
        <div className="error-message" style={{color: 'red', marginTop: '10px'}}>
          {error}
        </div>
      )}

      <div className="details">
        <h3>Referral Bonus Program</h3>
        <p>
          Earn $8 when you refer friends and your friends get $5 discount 
          on their first investment. Share your code and both get rewarded!
        </p>

        <h3>Instant Rewards</h3>
        <p>
          Get immediate rewards when your friends sign up and make their 
          first deposit. No waiting periods!
        </p>

        <h3>Unlimited Referrals</h3>
        <p>
          Invite as many friends as you want! There's no limit to how much 
          you can earn through our referral program.
        </p>
      </div>
    </section>
  );
};

export default InviteSection;