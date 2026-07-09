import { Route } from 'react-router-dom';

import Login from '../modules/auth/pages/Login';
import Register from '../modules/auth/pages/Register';

import VerifyEmail
from '../modules/email-verification/pages/VerifyEmail';

import {
    ForgotPassword,
    ResetPassword,
} from '../modules/forgot-password/pages';

import {
    OAuthCallback,
} from '../modules/oauth/pages';

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