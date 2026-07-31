import { useState } from "react";
import { login, selectAuthError, selectAuthStatus } from "../features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {useLocation, useNavigate} from "react-router-dom";
import React from "react";
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";


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
        <div className="flex min-h-svh w-full items-center justify-center bg-background p-6">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-xl text-foreground">
                        Login to you account
                    </CardTitle>
                    <CardDescription>
                        Enter your email below to login to your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} id="login-form">
                        <div className="flex flex-col gap-6">
                            {error && (
                                <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                                    {error}
                                </div>
                            )}

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" value={email} placeholder="m@alux.com"
                                    onChange={(e) => setEmail(e.target.value)} required/>
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Password</Label>
                                    <a
                                        href="#"
                                        className="ml-auto inline-block text-sm text-secondary underline-offset-4 hover:underline"
                                    >
                                        Forgot your password?
                                    </a>
                                </div>
                                <Input id="password" type="password" value={password}
                                    onChange={(e) => setPassword(e.target.value)} required/>
                            </div>
                        </div>
                    </form>
                </CardContent>
                <CardFooter>
                    <Button
                        type="submit"
                        form="login-form"
                        disabled={status === "loading"}
                        className="w-full bg-primary text-primary-foreground hover:bg-primary-hover"
                    >
                        {status === "loading" ? "Signing in…" : "Sign in"}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}