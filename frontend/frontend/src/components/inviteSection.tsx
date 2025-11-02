import { useUser } from "./UserContext";
import React, { useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:8000/api";

interface ProfileData {
  id?: number;
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  referral_code?: string;
}

var users_code: string


const InviteSection: React.FC = () => {
  const { token } = useUser(); 

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/user_try/profile/`, {
        headers: { 
          Authorization: `Bearer ${token}` 
        }
      });
      
    users_code = response.data.referral_code
      return response.data;
    } catch (error: any) {
      console.log("Error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
    }
  };

  useEffect(() => {
    const shareButton = document.getElementById("shareButton");

    const handleShare = async () => {
      
      const profileData = await fetchUserProfile();
      
      // LUEGO: Continuar con el compartir normal
      if (navigator.share) {
        try {
          await navigator.share({
            title: "Invite to Hapi",
            text: "Join Hapi and earn free cryptocurrency.",
            url: users_code,
          });
          alert("code shared successfully!");
        } catch (err) {
          console.error("Error sharing code:", err);
        }
      } else {
        navigator.clipboard.writeText(users_code);
        alert("code  copied to clipboard: " + users_code);
      }
    };

    shareButton?.addEventListener("click", handleShare);

    return () => {
      shareButton?.removeEventListener("click", handleShare);
    };
  }, [token]); // Agregar token como dependencia

  return (
    <section className="invite-section">
      <p className="section-title">Referred</p>
      <h2>Invite friends. Earn crypto!</h2>
      <p>
        Invite your friends to Hapi. Once they register and deposit funds, both
        of you will receive free cryptocurrency rewards.
      </p>

      <button className="share-button" id="shareButton">
        Share code
      </button>

      <div className="details">
        <h3>100% chance to win a prize</h3>
        <p>
          Every time a friend registers and deposits, you get a free crypto
          reward in your account.{" "}
          <a href="#">Read terms and conditions here.</a>
        </p>

        <h3>Win up to $500 in crypto</h3>
        <p>
          You have 1 in 400 chance to win $500, 1 in 100 to win $20, 1 in 20 to
          win $10, and 1 in 2 to win $1.
        </p>

        <h3>Unlimited invitations</h3>
        <p>
          Invite as many friends as you want and earn crypto rewards for each
          one.
        </p>
      </div>
    </section>
  );
};

export default InviteSection;