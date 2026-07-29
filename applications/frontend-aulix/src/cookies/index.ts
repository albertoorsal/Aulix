

interface CookieOptions {
    days? : number;
    path? : string;
    sameSite? : "Strict" | "Lax" | "None";
    secure?: boolean
}


export function setCookie(name : string, value : string, cookieOptions: CookieOptions) {
    const { days = 1, path = "/", sameSite = "Lax", secure } = cookieOptions;
    const expires = new Date(Date.now() + days * 864e5) .toUTCString();
     let cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=${path}; SameSite=${sameSite}`;
    // Secure is required when SameSite=None, and recommended on HTTPS.
    if (secure || sameSite === "None") cookie += "; Secure";
    document.cookie = cookie;
}