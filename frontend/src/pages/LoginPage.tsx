import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/design-system.css';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(email, password);
            window.location.href = '/dashboard';
        } catch (err) {
            setError('Invalid email or password. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Demo credentials helper - Using backend seeded users
    const fillDemoCredentials = (role: 'admin' | 'user' | 'approver') => {
        const demoAccounts = {
            admin: { email: 'alex.admin@company.com', password: 'password123' },
            user: { email: 'sarah.staff@company.com', password: 'password123' },
            approver: { email: 'mike.manager@company.com', password: 'password123' }
        };
        setEmail(demoAccounts[role].email);
        setPassword(demoAccounts[role].password);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-fuchsia-50 to-indigo-50 relative overflow-hidden">
            {/* Animated Background Shapes */}
            <div className="absolute top-20 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
            <div className="absolute top-40 right-40 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style={{ animationDelay: '2s' }}></div>

            {/* Login Card */}
            <div className="glass-card p-8 w-full max-w-md relative z-10 animate-fade-in shadow-strong">
                {/* Logo/Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl mb-4 shadow-lg">
                        <span className="text-3xl">🚀</span>
                    </div>
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
                        Enterprise Hub Enterprise
                    </h2>
                    <p className="text-gray-500 mt-2">Enterprise Agent Orchestration</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm animate-fade-in">
                        {error}
                    </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input"
                            placeholder="alex.admin@company.com"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn btn-primary w-full justify-center"
                    >
                        {isLoading ? (
                            <>
                                <div className="spinner w-5 h-5 border-2"></div>
                                Signing in...
                            </>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                {/* Demo Accounts */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-3 text-center">Quick Login (Demo)</p>
                    <div className="grid grid-cols-3 gap-2">
                        <button
                            type="button"
                            onClick={() => fillDemoCredentials('admin')}
                            className="btn btn-outline text-xs py-2"
                        >
                            Admin
                        </button>
                        <button
                            type="button"
                            onClick={() => fillDemoCredentials('approver')}
                            className="btn btn-outline text-xs py-2"
                        >
                            Approver
                        </button>
                        <button
                            type="button"
                            onClick={() => fillDemoCredentials('user')}
                            className="btn btn-outline text-xs py-2"
                        >
                            User
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 text-center text-sm text-gray-500">
                    <p>Powered by FastMCP & LangGraph</p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
