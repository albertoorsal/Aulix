import type { User, VerifyUserResponse } from "../schemas/auth";

const API_BASE = "http://localhost:9000/api/auth";

export async function loginRequest(email : string, password: string) : Promise<void> {
    const response = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Invalid email or password");
    }
}


export async function verifyUserRequest(): Promise<User> {
    const res = await fetch(`${API_BASE}/verify`, {
        method: "GET",
        credentials: "include",
    });
 
    if (!res.ok) throw new Error("Not authenticated");
    
    const body = (await res.json()) as VerifyUserResponse;
    if (!body.success) throw new Error("Not authenticated");
    
    const d = body.data;
    return {
        id: d.userId,
        email: d.email,
        roles: d.roles,
        permissions: d.permissions,
        expiresAt: d.expiresAt,
    };
}


export async function logoutRequest() : Promise<void> {
    await fetch(`${API_BASE}/logout`, {
        method: "POST",
        credentials: "include"
    })
}