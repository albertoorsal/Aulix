import { useState } from "react";
import { login, selectAuthError, selectAuthStatus } from "../features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {useLocation, useNavigate} from "react-router-dom";
import React from "react";

interface LocationState {
    from?: {pathname : string};
}

export default function Login() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const status = useAppSelector(selectAuthStatus);
    const error = useAppSelector(selectAuthError);

    const[email, setEmail] = useState("");
    const[password, setPassword] = useState("");

    const from = (location.state as LocationState)?.from?.pathname || "/dashboard";
    
    async function handleSubmit(e :  React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        const result = await dispatch(login({email, password}));
        if (login.fulfilled.match(result)) {
            navigate(from, {replace : true})
        }
    }

    return (
        <div>
            <div>
                <h2>Login</h2>
                <form onSubmit={handleSubmit}>
                    {error && <div>Error {error}</div>}

                    <label htmlFor="email">Email</label>
                    <input id="email" type="email" value={email} 
                        onChange={(e) => setEmail(e.target.value)} required/>


                    <label htmlFor="password">Password</label>
                    <input id="password" type="password" value={password} 
                        onChange={(e) => setPassword(e.target.value)} required/>

                    
                    <button type="submit" disabled={status === "loading"}>
                        {status === "loading" ? "Signing in…" : "Sign in"}
                    </button>
                </form>
            </div>
        </div>
    )
}