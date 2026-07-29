import {createSlice, createAsyncThunk, isRejectedWithValue} from "@reduxjs/toolkit"
import type { User } from "../../schemas/auth";
import { loginRequest, logoutRequest, verifyUserRequest } from "../../apis/auth";
import type { RootState } from "../../store";


interface AuthState {
    user: User | null;
    status: "idle" | "loading" | "failed";
    initialized: boolean;
    error: string | null;
}


const initialState : AuthState = {
    user: null,
    status: "idle",
    initialized: true,
    error: null,
}


export const checkAuth = createAsyncThunk("auth/checkAuth", async (_, { rejectWithValue}) => {
    try {
        return await verifyUserRequest();
    } catch {
        return rejectWithValue(null);
    }
})


export const login = createAsyncThunk("auth/login",
    async (credentials : { email : string, password: string }, {rejectWithValue}) => {
        try{
            await loginRequest(credentials.email, credentials.password);
            return await verifyUserRequest();
        }catch(err){
            const message = err instanceof Error ? err.message : "Login failed";
            return rejectWithValue(message);
        }
    }
)


export const logout = createAsyncThunk("auth/logout", async() => {
    await logoutRequest();
})


const authSlice = createSlice({
    name: "auth", 
    initialState,
    reducers: {
        clearError(state) {
            state.error = null;
        }
    },

    extraReducers: (builder) => {
        builder
            .addCase(checkAuth.pending, (state) => {
                state.status = "loading";
            })
            .addCase(checkAuth.fulfilled, (state, action) => {
                state.status = "idle";
                state.initialized = true;
                state.user = action.payload;
            })
            .addCase(checkAuth.rejected, (state) => {
                state.status = "idle";
                state.initialized = true;
                state.user = null;
            })

            // LOGIN
            // --- login ---
            .addCase(login.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.status = "idle";
                state.user = action.payload;
            })
            .addCase(login.rejected, (state, action) => {
                state.status = "failed";
                state.error = (action.payload as string) ?? "Login failed";
            })
            // --- logout (clear state even if the request failed) ---
            .addCase(logout.fulfilled, (state) => {
                state.user = null;
                state.status = "idle";
                state.error = null;
            })
            .addCase(logout.rejected, (state) => {
                state.user = null;
        });
    }
});


export const {clearError } = authSlice.actions;

// Selectors
export const selectUser = (state: RootState) => state.auth.user;
export const selectRoles = (state: RootState) => state.auth.user?.roles ?? [];
export const selectIsAuthenticated = (state: RootState) => Boolean(state.auth.user);
export const selectIsInitialized = (state: RootState) => state.auth.initialized;
export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectAuthError = (state: RootState) => state.auth.error;


export default authSlice.reducer;
