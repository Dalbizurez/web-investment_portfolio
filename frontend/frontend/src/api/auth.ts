export async function login(username: string, password: string) {
    console.log("aqui toy")

    const response = await fetch("http://127.0.0.1:8000/api/NormalUser/login/", {
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
