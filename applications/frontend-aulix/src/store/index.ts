import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice"

export const store = configureStore({
    reducer: {
        auth: authReducer,
        // HERE add more slices 
    }
})


// Infer types straight from the store so they never drift.
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;