'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plus, LayoutGrid, Search, Calendar, FileText } from 'lucide-react';
import Link from 'next/link';

interface Form {
    id: string;
    title: string;
    description: string | null;
    isPublished: boolean;
    createdAt: string;
    updatedAt: string;
}

export default function DashboardPage() {
    const { token, isLoading, logout } = useAuth();
    const router = useRouter();

    const [forms, setForms] = useState<Form[]>([]);
    const [isFetching, setIsFetching] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

    // Authentication Guard Redirecting unauthorized users actively mapping layout renders securely
    useEffect(() => {
        if (!isLoading && !token) {
            router.replace('/login');
        }
    }, [token, isLoading, router]);

    // Fetch logic explicitly tracking sort metrics hitting nested form APIs dynamically
    useEffect(() => {
        if (!token) return;

        const fetchForms = async () => {
            setIsFetching(true);
            try {
                const url = new URL('http://localhost:5000/api/forms');
                if (searchQuery) url.searchParams.append('search', searchQuery);
                url.searchParams.append('sort', sortOrder);

                const response = await fetch(url.toString(), {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.status === 401 || response.status === 403) {
                    logout();
                    return;
                }

                if (!response.ok) throw new Error('Failed to fetch forms');

                const data = await response.json();
                setForms(data);
            } catch (error) {
                console.error('Fetch error:', error);
            } finally {
                setIsFetching(false);
            }
        };

        // Debounce the search query slightly to avoid slamming the backend API on every keystroke
        const debounceTrigger = setTimeout(() => {
            fetchForms();
        }, 300);

        return () => clearTimeout(debounceTrigger);
    }, [token, searchQuery, sortOrder, logout]);

    const handleCreateForm = async () => {
        if (!token) return;
        setIsCreating(true);

        try {
            const response = await fetch('http://localhost:5000/api/forms', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });

            if (!response.ok) throw new Error('Failed to create form');

            const newForm = await response.json();

            // Redirect seamlessly pointing at the new nested Edit page architecture you requested
            router.push(`/forms/${newForm.id}/edit`);
        } catch (error) {
            console.error('Create form error:', error);
            setIsCreating(false);
        }
    };

    if (isLoading || (!token && !isLoading)) {
        return (
            <div className="flex-1 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
            {/* Dashboard Header UI Component bounds */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <LayoutGrid className="w-8 h-8 text-indigo-600" />
                        My Dashboard
                    </h1>
                    <p className="text-gray-500 mt-1">Manage and analyze your form configurations.</p>
                </div>

                <Button onClick={handleCreateForm} isLoading={isCreating} className="shadow-sm">
                    <Plus className="w-5 h-5 mr-1" />
                    Create New Form
                </Button>
            </div>

            {/* Analytics / Sort Filters Panel Context map */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 mb-8">
                <div className="flex-1 relative">
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search forms by title..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow text-sm"
                    />
                </div>
                <div className="sm:w-48">
                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-sm appearance-none cursor-pointer"
                    >
                        <option value="desc">Newest First</option>
                        <option value="asc">Oldest First</option>
                    </select>
                </div>
            </div>

            {/* Grid Iteration Flow Mapping */}
            {isFetching && forms.length === 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-48 rounded-xl bg-gray-100 animate-pulse border border-gray-200"></div>
                    ))}
                </div>
            ) : forms.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No forms found</h3>
                    <p className="text-gray-500 mt-1 max-w-sm mx-auto">
                        {searchQuery
                            ? "We couldn't find any forms matching your search query."
                            : "You haven't created any forms yet. Click the button above to get started!"}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {forms.map((form) => (
                        <div key={form.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
                            <div className="p-6 flex-1">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1" title={form.title}>
                                        {form.title}
                                    </h3>
                                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${form.isPublished ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                        {form.isPublished ? 'Published' : 'Draft'}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-10">
                                    {form.description || 'No description provided.'}
                                </p>
                                <div className="flex items-center text-xs text-gray-400 mt-auto">
                                    <Calendar className="w-3.5 h-3.5 mr-1" />
                                    {new Date(form.createdAt).toLocaleDateString(undefined, {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </div>
                            </div>
                            <div className="border-t border-gray-100 bg-gray-50 p-4 flex gap-3">
                                <Link href={`/forms/${form.id}/edit`} className="flex-1">
                                    <Button variant="secondary" className="w-full bg-white border border-gray-200 hover:bg-gray-50">
                                        Edit Output
                                    </Button>
                                </Link>
                                {form.isPublished && (
                                    <Link href={`/forms/${form.id}/stats`} className="flex-1">
                                        <Button variant="ghost" className="w-full text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 bg-white border border-indigo-100">
                                            Results
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
