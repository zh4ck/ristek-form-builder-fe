'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { API_BASE_URL } from '@/lib/constants';

// Zod Schema validating specific rules securely on the client edge
const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const [globalError, setGlobalError] = useState<string | null>(null);
    const { login } = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterFormValues) => {
        setGlobalError(null);
        try {
            // POST mapping to the custom backend Express logic built earlier
            const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.error || 'Failed to register');
            }

            // Automatically hydrate into global state and localStorage mapping on successful DB creation
            login(responseData.token, responseData.user);
        } catch (error: any) {
            setGlobalError(error.message || 'An unexpected error occurred.');
        }
    };

    return (
        <div className="flex-1 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 border">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">Create an Account</h2>
                    <p className="text-sm text-gray-500 mt-2">Start building dynamic aesthetic forms for free.</p>
                </div>

                {globalError && (
                    <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-md text-sm text-center border border-red-100">
                        {globalError}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <Input
                        label="Full Name"
                        type="text"
                        placeholder="Jane Doe"
                        {...register('name')}
                        error={errors.name?.message}
                    />

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
                        Create Account
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-500">
                    Already have an account?{' '}
                    <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
                        Log in
                    </Link>
                </div>
            </div>
        </div>
    );
}
