import { useState, useEffect } from "react";
import { useUser } from "./UserContext";
import axios from "axios";

const API_URL = "http://localhost:8000/api/user_try";

interface UserData {
  username: string;
  email: string;
  language: string;
}

function ContentProfile() {
  const { token, isLoadingProfile } = useUser();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return;
      try {
        setIsLoading(true);
        const res = await axios.get(`${API_URL}/profile/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData(res.data);
      } catch (err: any) {
        setErrorMsg(err.response?.data?.error || "Error loading profile");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData) return;
    try {
      setSuccessMsg(null);
      setErrorMsg(null);
      const res = await axios.patch(`${API_URL}/update-profile/`, userData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserData(res.data);
      setSuccessMsg("Profile updated successfully");
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || "Unable to update profile");
    }
  };

  if (isLoadingProfile || isLoading)
    return (
      <div className="content-home">
        <p className="loading-text">Loading profile...</p>
      </div>
    );

  if (errorMsg && !userData)
    return (
      <div className="content-home">
        <p className="error-msg">Error: {errorMsg}</p>
      </div>
    );

  return (
    <div className="content-home">
      <div className="sections">
        <div className="type">
          <p>Profile Settings</p>
        </div>

        <div className="content">
          <div className="container-portfolio">

            {userData && (
              <form className="card" onSubmit={handleProfileUpdate}>
                <h2>Edit Profile</h2>
                <input
                  type="text"
                  value={userData.username}
                  placeholder="Username"
                  onChange={(e) => setUserData({ ...userData, username: e.target.value })}
                />
                <input
                  type="email"
                  value={userData.email}
                  placeholder="Email"
                  onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                />
                <button type="submit">Save Changes</button>
              </form>
            )}

            <div className="card">
              <h3>Use a referral code</h3>
              <input type="text" placeholder="Enter referral code" id="refToApply" />
              <button
                onClick={async () => {
                  const code = (document.getElementById("refToApply") as HTMLInputElement)?.value;
                  if (!code) return alert("Enter a code");
                  try {
                    await axios.post(
                      "http://localhost:8000/api/user_try/use-referral-code/",
                      { referral_code: code },
                      { headers: { Authorization: `Bearer ${token}` } }
                    );
                    alert("Code applied successfully");
                  } catch (e: any) {
                    alert(e.response?.data?.error || "Error applying code");
                  }
                }}
              >
                Apply code
              </button>
            </div>

            {successMsg && <div className="success-msg">{successMsg}</div>}
            {errorMsg && <div className="error-msg">{errorMsg}</div>}

          </div>
        </div>
      </div>
    </div>
  );
}

export default ContentProfile;
