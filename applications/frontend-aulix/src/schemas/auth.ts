


export interface User {
    id: string;
    email: string;
    roles: string[];
    permissions: string[];
    expiresAt: string;
}


export interface VerifyUserResponse {
    success: boolean;
    data: {
        userId: string;
        email: string;
        roles: string[];
        permissions: string[];
        expiresAt: string;
    };
    timestamp: string;
}


