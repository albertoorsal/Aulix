import ProtectedRoute from './routes/ProtectedRoute'
import { Dashboard } from './pages/Dashboard'
import { Navigate, Route, Routes } from 'react-router'
import { useAppDispatch, useAppSelector } from './store/hooks';
import { checkAuth, selectIsInitialized } from './features/auth/authSlice';
import { useEffect } from 'react';
import Login from './pages/Login';
import RoleRoute from './routes/RoleRoute';
import Admin from './pages/Admin';
import PublicRoute from './routes/PublicRouter';

function App() {
    const dispatch = useAppDispatch();
    const initialized = useAppSelector(selectIsInitialized);

    useEffect(() => {
		dispatch(checkAuth());
    }, [dispatch]);


    if (!initialized) {
		return (
			<div>
				<div>Loading...</div>
			</div>
		)
    }


    return (
        <>
            <Routes>
        		{/* Public */}

				{/* Login is public, but redirect away if already signed in */}
				<Route element={<PublicRoute />}>
					<Route path="/login" element={<Login />} />
				</Route>

				{/* Private: must be authenticated */}
				<Route element={<ProtectedRoute />}>
				<Route path="/dashboard" element={<Dashboard />} />

				{/* Private AND admin-only: guards nest */}
				<Route element={<RoleRoute allow={["ADMIN"]} />}>
					<Route path="/admin" element={<Admin />} />
				</Route>
				</Route>

        	{/* Catch-all */}
        	<Route path="*" element={<Navigate to="/dashboard" replace />} />
      		</Routes>
        </>
    )
}

export default App
