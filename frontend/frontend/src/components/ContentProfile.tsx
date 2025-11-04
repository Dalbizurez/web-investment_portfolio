import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";

    interface UserProfile {
    username: string;
    email: string;
    language: string;
    }

    
    
    export default function AccountSettings() {
    const { getAccessTokenSilently } = useAuth0(); // user eliminado ya que no se usa
    const [activeTab, setActiveTab] = useState<"profile" | "password" | "language">("profile");
    const [profile, setProfile] = useState<UserProfile>({ username: "", email: "", language: "" });
    const [newPassword, setNewPassword] = useState("");
    const [oldPassword, setOldPassword] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
        try {
            const token = await getAccessTokenSilently();
            const res = await axios.get("http://back.g4.atenea.lat/update-profile/", {
            headers: { Authorization: `Bearer ${token}` },
            });
            setProfile(res.data);
        } catch (error) {
            console.error(error);
        }
        };
        fetchProfile();
    }, [getAccessTokenSilently]);

    const handleUpdateProfile = async () => {
        try {
        const token = await getAccessTokenSilently();
        await axios.post(
            "http://back.g4.atenea.lat/update-profile/",
            { ...profile },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessage("Perfil actualizado con éxito");
        } catch (error) {
    console.error(error);
    setMessage("Error al actualizar perfil");
    }

    };

    const handleChangePassword = async () => {
        try {
        const token = await getAccessTokenSilently();
        await axios.post(
            "http://back.g4.atenea.lat/change-password/",
            { old_password: oldPassword, new_password: newPassword },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessage("Contraseña actualizada correctamente");
        } catch (error) {
    console.error(error);
    setMessage("Error al actualizar perfil");
    }

    };

    return (
        <div className="flex h-full">
        {/* Menú lateral */}
        <div className="w-1/4 bg-gray-100 p-4 rounded-l-2xl border-r">
            <h2 className="text-xl font-semibold mb-4">Configuración</h2>
            <ul className="space-y-3">
            {["profile", "password", "language"].map((tab) => (
                <li
                key={tab}
                className={`cursor-pointer ${activeTab === tab ? "font-bold text-blue-600" : ""}`}
                onClick={() => setActiveTab(tab as "profile" | "password" | "language")}
                >
                {tab === "profile" ? "Perfil" : tab === "password" ? "Contraseña" : "Idioma"}
                </li>
            ))}
            </ul>
        </div>

        {/* Contenido principal */}
        <div className="w-3/4 p-6 rounded-r-2xl bg-white">
            {activeTab === "profile" && (
            <div>
                <h3 className="text-lg font-medium mb-4">Editar Perfil</h3>
                <input
                type="text"
                placeholder="Username"
                value={profile.username}
                onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                className="border p-2 rounded w-full mb-2"
                />
                <input
                type="email"
                placeholder="Email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="border p-2 rounded w-full mb-2"
                />
                <button
                onClick={handleUpdateProfile}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                Guardar cambios
                </button>
            </div>
            )}

            {activeTab === "password" && (
            <div>
                <h3 className="text-lg font-medium mb-4">Cambiar Contraseña</h3>
                <input
                type="password"
                placeholder="Contraseña actual"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="border p-2 rounded w-full mb-2"
                />
                <input
                type="password"
                placeholder="Nueva contraseña"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="border p-2 rounded w-full mb-2"
                />
                <button
                onClick={handleChangePassword}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                Cambiar contraseña
                </button>
            </div>
            )}

            {activeTab === "language" && (
            <div>
                <h3 className="text-lg font-medium mb-4">Idioma</h3>
                <select
                value={profile.language}
                onChange={(e) => setProfile({ ...profile, language: e.target.value })}
                className="border p-2 rounded w-full mb-2"
                >
                <option value="es">Español</option>
                <option value="en">English</option>
                </select>
                <button
                onClick={handleUpdateProfile}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                Guardar idioma
                </button>
            </div>
            )}

            {message && <p className="mt-4 text-sm">{message}</p>}
        </div>
        </div>
    );
    }
