'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

// Zod Schema for strong typing and validation
const loginSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const [globalError, setGlobalError] = useState<string | null>(null);
    const { login } = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormValues) => {
        setGlobalError(null);
        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.error || 'Failed to login');
            }

            // Automatically syncs to localStorage and pushes router to /dashboard natively via AuthContext
            login(responseData.token, responseData.user);
        } catch (error: any) {
            setGlobalError(error.message || 'An unexpected error occurred.');
        }
    };

    return (
        <div className="flex-1 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 border">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">Welcome back</h2>
                    <p className="text-sm text-gray-500 mt-2">Log in to manage your forms.</p>
                </div>

                {globalError && (
                    <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-md text-sm text-center border border-red-100">
                        {globalError}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <Input
                        label="Email Address"
                        type="email"
                        placeholder="you@example.com"
                        {...register('email')}
                        error={errors.email?.message}
                    />

                    <Input
                        label="Password"
                        type="password"
                        placeholder="••••••••"
                        {...register('password')}
                        error={errors.password?.message}
                    />

                    <Button type="submit" className="w-full" isLoading={isSubmitting}>
                        Log in
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-500">
                    Don't have an account?{' '}
                    <Link href="/register" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
                        Sign up
                    </Link>
                </div>
            </div>
        </div>
    );
}
