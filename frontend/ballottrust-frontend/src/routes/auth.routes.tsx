import { Route } from 'react-router-dom';

// Kept eager: this is the "/" landing route most unauthenticated traffic
// hits first, so there is no benefit to deferring it behind its own chunk.
import Login from '../modules/auth/pages/Login';

import {
    Register,
    VerifyEmail,
    ForgotPassword,
    ResetPassword,
    OAuthCallback,
} from './lazy-pages';

export const AuthRoutes = (
    <>
        <Route
            path="/"
            element={<Login />}
        />

        <Route
            path="/register"
            element={<Register />}
        />

        <Route
            path="/verify-email"
            element={<VerifyEmail />}
        />

        <Route
            path="/forgot-password"
            element={<ForgotPassword />}
        />

        <Route
            path="/reset-password"
            element={<ResetPassword />}
        />

        <Route
            path="/oauth/callback"
            element={<OAuthCallback />}
        />
    </>
);