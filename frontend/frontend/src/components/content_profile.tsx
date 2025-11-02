import { useState, useEffect } from "react";
import { useUser } from "./UserContext";
import axios from "axios";

const API_URL = "http://localhost:8000/api/user_try";

interface UserData {
  username: string;
  email: string;
  language: string;
}

interface PasswordData {
  old_password: string;
  new_password: string;
}

function ContentProfile() {
  const { token, isLoadingProfile } = useUser();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [passwordData, setPasswordData] = useState<PasswordData>({
    old_password: "",
    new_password: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Obtener perfil
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
        setErrorMsg(err.response?.data?.error || "Error al cargar el perfil");
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
        console.log(userData)   
        setSuccessMsg(null);
        setErrorMsg(null);
            const res = await axios.patch(`${API_URL}/update-profile/`, userData, {
            headers: { Authorization: `Bearer ${token}` },
            });
        setUserData(res.data);
        setSuccessMsg("Perfil actualizado correctamente");
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || "No se pudo actualizar el perfil");
    }
  };


  if (isLoadingProfile || isLoading)
    return (
      <div className="content-home">
        <p style={{ textAlign: "center", padding: "30px", color: "#616677" }}>
          Loading profile...
        </p>
      </div>
    );

  if (errorMsg && !userData)
    return (
      <div className="content-home">
        <p style={{ textAlign: "center", color: "#dc2626" }}>Error: {errorMsg}</p>
      </div>
    );

  return (
    <div className="content-home">
      <div className="sections">
        <div className="type">
          <p className="active">Profile Settings</p>
        </div>

        <div className="content">
          <div
            className="container-portfolio"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "2rem",
              maxWidth: "700px",
              margin: "auto",
            }}
          >
            {/* Mensajes */}
            {successMsg && (
              <div
                style={{
                  background: "#d4edda",
                  color: "#155724",
                  padding: "1rem",
                  borderRadius: "8px",
                  textAlign: "center",
                  fontWeight: "600",
                }}
              >
                {successMsg}
              </div>
            )}
            {errorMsg && (
              <div
                style={{
                  background: "#f8d7da",
                  color: "#721c24",
                  padding: "1rem",
                  borderRadius: "8px",
                  textAlign: "center",
                  fontWeight: "600",
                }}
              >
                {errorMsg}
              </div>
            )}

            {/* Formulario de perfil */}
            {userData && (
              <form
                onSubmit={handleProfileUpdate}
                style={{
                  background: "linear-gradient(135deg, #f5f7ff 0%, #eef2ff 100%)",
                  border: "1px solid #e6ebfe",
                  padding: "2rem",
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(76, 88, 237, 0.1)",
                }}
              >
                <h2
                  style={{
                    textAlign: "center",
                    color: "#1e2134",
                    fontWeight: "600",
                    marginBottom: "1.5rem",
                  }}
                >
                  Edit Profile
                </h2>

                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <input
                    type="text"
                    value={userData.username}
                    placeholder="Username"
                    onChange={(e) =>
                      setUserData({ ...userData, username: e.target.value })
                    }
                    style={{
                      padding: "0.8rem",
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px",
                    }}
                  />
                  <input
                    type="email"
                    value={userData.email}
                    placeholder="Email"
                    onChange={(e) =>
                      setUserData({ ...userData, email: e.target.value })
                    }
                    style={{
                      padding: "0.8rem",
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px",
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      background: "#4c58ed",
                      color: "#fff",
                      padding: "0.8rem",
                      border: "none",
                      borderRadius: "8px",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "background 0.3s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#3b43f1")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "#4c58ed")
                    }
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

export default ContentProfile;
