// src/api/auth.ts
export async function login(username: string, password: string) {
    const response = await fetch("https://tu-dominio.com/api/login/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
        throw new Error("Error al iniciar sesión");
    }

    return await response.json(); // devuelve { access, refresh }
}
