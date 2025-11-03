import React, { useState } from "react";
import { useReferralCode } from "../hooks/useReferralCode";
import "../styles/invite_section.css";

const InviteSection: React.FC = () => {
  const {
    loading,
    error,
    referralCode,
    referralUrl,
    successfulReferrals,
    totalEarnings,
    hasUsedReferral,
    referredBy,
    referredUsers,
    copyReferralUrl,
    applyReferralCode,
    isSharing,
  } = useReferralCode();

  const [manualCode, setManualCode] = useState("");

  return (
    <div className="invite-card-container">
      <h2 className="invite-title">Invite Friends — Earn Rewards</h2>
      <p className="invite-subtitle">
        Earn <b>$8</b> for each friend you invite, and they get <b>$5</b> 🎉
      </p>

      {/* Referral Code */}
      <div className="invite-box">
        <p className="invite-label">Your Code</p>

        <div className="invite-code-box">
          {referralCode || (loading ? "Loading…" : "—")}
        </div>

        <button
          className="share-button"
          onClick={copyReferralUrl}
          disabled={isSharing}
        >
          {isSharing ? "Copying..." : "Copy Invite Link"}
        </button>

        {referralUrl && (
          <p className="invite-link-preview">{referralUrl}</p>
        )}
      </div>

      {/* Stats */}
      <div className="invite-stats-grid">
        <div className="invite-stat-card">
          <p className="invite-stat-label">Successful Referrals</p>
          <h2>{successfulReferrals}</h2>
        </div>

        <div className="invite-stat-card">
          <p className="invite-stat-label">Total Earnings</p>
          <h2>${totalEarnings}</h2>
        </div>

        <div className="invite-stat-card">
          <p className="invite-stat-label">Used a Code?</p>
          <h2>{hasUsedReferral ? "✅ Yes" : "❌ No"}</h2>
          {referredBy && <small>Referred by: {referredBy}</small>}
        </div>
      </div>

      {/* Enter Code */}
      <div className="invite-box">
        <p className="invite-label">Enter a referral code</p>
        <div className="invite-input-row">
          <input
            className="invite-input"
            type="text"
            placeholder="ABC12345"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value.toUpperCase())}
            disabled={hasUsedReferral}
          />

          <button
            className="btn-crypto"
            disabled={hasUsedReferral}
            onClick={async () => {
              if (!manualCode.trim()) return;
              const ok = await applyReferralCode(manualCode);
              if (ok) setManualCode("");
            }}
          >
            Apply
          </button>
        </div>

        {hasUsedReferral && (
          <div className="invite-warning">
            ℹ️ You have already used a referral code. Only one allowed.
          </div>
        )}
      </div>

      {error && <div className="invite-error">{error}</div>}
    </div>
  );
};

export default InviteSection;
