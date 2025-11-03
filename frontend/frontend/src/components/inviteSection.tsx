import React, { useState } from "react";
import { useReferralCode } from "../hooks/useReferralCode";

const box = {
  background: "#fff",
  borderRadius: "12px",
  padding: "18px",
  boxShadow: "0 6px 18px rgba(76,88,237,0.08)",
  border: "1px solid #e6ebfe"
};

const InviteSection: React.FC = () => {
  const {
    loading, error,
    referralCode, referralUrl,
    successfulReferrals, totalEarnings,
    hasUsedReferral, referredBy, referredUsers,
    copyReferralUrl, applyReferralCode, isSharing
  } = useReferralCode();

  const [manualCode, setManualCode] = useState("");

  return (
    <section className="invite-section">
      <p className="section-title">Referral</p>
      <h2>Invite friends. Earn rewards!</h2>
      <p>Earn <b>$8</b> por cada amigo que invites, y tu amigo recibe <b>$5</b> 🎉</p>

      {/* Código y copiar */}
      <div style={{...box, marginTop: 12}}>
        <p style={{margin:0, color:"#616677"}}>Your code</p>
        <div style={{
          marginTop: 8,
          border: "2px dashed #4c58ed",
          background:"#eef2ff",
          borderRadius: 10,
          padding: "12px",
          fontWeight: 700,
          textAlign: "center",
          letterSpacing: 1
        }}>
          {referralCode || (loading ? "Loading..." : "—")}
        </div>

        <button
          className="share-button"
          onClick={copyReferralUrl}
          disabled={isSharing || !referralUrl}
          style={{
            marginTop: 12,
            background:"#4c58ed", color:"#fff",
            padding:"10px 16px", borderRadius:8, fontWeight:700
          }}
        >
          {isSharing ? "Copying..." : "Copy my invite link"}
        </button>

        {referralUrl && (
          <p style={{fontSize:12, color:"#4c58ed", marginTop:8, wordBreak:"break-all"}}>
            {referralUrl}
          </p>
        )}
      </div>

      {/* Stats */}
      <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:12, marginTop:12}}>
        <div style={box}>
          <p style={{margin:0, color:"#616677"}}>Successful Referrals</p>
          <h2 style={{margin:"8px 0 0", color:"#1e2134"}}>{successfulReferrals}</h2>
        </div>
        <div style={box}>
          <p style={{margin:0, color:"#616677"}}>Total Earnings</p>
          <h2 style={{margin:"8px 0 0", color:"#1e2134"}}>${totalEarnings}</h2>
        </div>
        <div style={box}>
          <p style={{margin:0, color:"#616677"}}>Used a Code?</p>
          <h2 style={{margin:"8px 0 0", color:"#1e2134"}}>{hasUsedReferral ? "✅ Yes" : "❌ Not yet"}</h2>
          {referredBy && <small>Referred by: {referredBy}</small>}
        </div>
      </div>

      {/* Aplicar código manual */}
      <div style={{...box, marginTop:12}}>
        <h3 style={{marginTop:0}}>Use a referral code</h3>
        <div style={{display:"flex", gap:8}}>
          <input
            type="text"
            placeholder="ABC12345"
            value={manualCode}
            onChange={(e)=> setManualCode(e.target.value.toUpperCase())}
            disabled={hasUsedReferral}
            style={{flex:1, padding:"10px", border:"1px solid #cbd5e1", borderRadius:8, textTransform:"uppercase"}}
          />
          <button
            onClick={async ()=>{
              if (!manualCode.trim()) return alert("Enter a code");
              const ok = await applyReferralCode(manualCode);
              if (ok) setManualCode("");
            }}
            disabled={hasUsedReferral || !manualCode.trim()}
            style={{
              background:"#FF9800", color:"#fff",
              padding:"10px 16px", borderRadius:8, fontWeight:700,
              opacity: hasUsedReferral || !manualCode.trim() ? 0.6 : 1
            }}
          >
            Apply code
          </button>
        </div>
        {hasUsedReferral && (
          <p style={{color:"#856404", marginTop:8, fontWeight:700}}>
            ℹ️ You have already used a referral code. Only one per account.
          </p>
        )}
      </div>

      {/* Lista de referidos */}
      {referredUsers?.length > 0 && (
        <div style={{...box, marginTop:12}}>
          <h3 style={{marginTop:0}}>People you referred</h3>
          <div style={{border:"1px solid #e6ebfe", borderRadius:8, overflow:"hidden"}}>
            {referredUsers.map((u, i)=>(
              <div key={u.id} style={{
                padding:"10px 12px",
                borderBottom: i<referredUsers.length-1 ? "1px solid #eef2ff" : "none"
              }}>
                <b>{u.username}</b> ({u.email})
                <div style={{fontSize:12, color:"#616677"}}>
                  Status: {u.status} · Joined: {new Date(u.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading && <p style={{marginTop:10, color:"#616677"}}>Loading referral info…</p>}
      {error && <p style={{marginTop:10, color:"#dc2626"}}>{error}</p>}
    </section>
  );
};

export default InviteSection;
