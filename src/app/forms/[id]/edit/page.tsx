'use client';

import React, { useEffect, useState, use } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { QuestionCard } from './components/QuestionCard';
import { useAutosave } from '@/hooks/useAutosave';
import { Check, Loader2, Plus, ArrowLeft, ExternalLink, Globe } from 'lucide-react';
import Link from 'next/link';
import { API_BASE_URL } from '@/lib/constants';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';

// Matches the backend Prisma structures perfectly
interface FormState {
    title: string;
    description: string;
    isPublished: boolean;
    questions: {
        id?: string; // Optional because new questions don't have an ID yet
        text: string;
        type: string;
        isRequired: boolean;
        options: { text: string }[];
    }[];
}

export default function EditFormPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: formId } = use(params);
    const { token, isLoading } = useAuth();
    const router = useRouter();
    const [isInitializing, setIsInitializing] = useState(true);

    // Initialize the Master global react-hook-form
    const { register, control, watch, reset } = useForm<FormState>({
        defaultValues: { title: '', description: '', isPublished: false, questions: [] },
    });

    // Separate local state for publish status so we can control it independently of autosave
    const [isPublished, setIsPublished] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);

    // Automatically track arrays and push up unique random IDs specifically for Dnd-Kit bound mapping logic
    const { fields, append, remove, move } = useFieldArray({
        control,
        name: 'questions',
        keyName: 'internalId', // dnd-kit requires a unique key distinct from backend Prisma `id` safely
    });

    const formData = watch();

    // Polling Autosave hook implicitly binding to `formData` 
    const { isSaving, lastSavedAt } = useAutosave(formData, formId, token, 2000);

    // Security bounds to ensure user hits the JWT constraints accurately
    useEffect(() => {
        if (!isLoading && !token) router.replace('/login');
    }, [token, isLoading, router]);

    // Initial Bootup Data Fetch loading state logically
    useEffect(() => {
        if (!token) return;

        const fetchFormStructure = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/forms/${formId}`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });

                if (res.status === 401 || res.status === 403 || res.status === 404) {
                    router.push('/dashboard');
                    return;
                }

                const data = await res.json();

                // Map backend state clearly onto React Hook Form's reset parameter implicitly
                reset({
                    title: data.title,
                    description: data.description || '',
                    isPublished: data.isPublished,
                    questions: data.questions.map((q: any) => ({
                        ...q,
                        options: q.options || [],
                    })),
                });
                setIsPublished(data.isPublished);
            } catch (error) {
                console.error('Fetch error:', error);
            } finally {
                setIsInitializing(false);
            }
        };

        fetchFormStructure();
    }, [token, formId, reset, router]);

    // Publish: save current state as published, then open the live form
    const handlePublish = async () => {
        if (!token) return;
        setIsPublishing(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/forms/${formId}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ isPublished: true }),
            });
            if (res.ok) {
                setIsPublished(true);
                window.open(`/f/${formId}`, '_blank');
            }
        } catch (e) {
            console.error('Publish error:', e);
        } finally {
            setIsPublishing(false);
        }
    };

    // Unpublish: set form back to draft
    const handleUnpublish = async () => {
        if (!token) return;
        setIsPublishing(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/forms/${formId}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ isPublished: false }),
            });
            if (res.ok) setIsPublished(false);
        } catch (e) {
            console.error('Unpublish error:', e);
        } finally {
            setIsPublishing(false);
        }
    };

    // Configure Dnd-kit hardware bindings
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            // Find the explicit mapped indexes to instruct React-Hook-Form to `move()` natively
            const oldIndex = fields.findIndex((f) => f.internalId === active.id);
            const newIndex = fields.findIndex((f) => f.internalId === over.id);
            move(oldIndex, newIndex);
        }
    };

    if (isInitializing) {
        return (
            <div className="flex-1 flex justify-center items-center">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="flex-1 bg-[#f9fafb] relative pb-32">
            {/* Top Fixed Header Banner Autosave states */}
            <header className="sticky top-16 z-40 bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="text-gray-500 hover:text-gray-900 transition-colors p-2 -ml-2 rounded-full hover:bg-gray-100">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>
                    <span className="text-sm font-medium text-gray-900 hidden sm:block truncate max-w-xs" title={formData.title}>
                        {formData.title || 'Untitled Form'}
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center text-sm font-medium text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100 gap-2">
                        {isSaving ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                                <span className="text-indigo-600">Saving changes...</span>
                            </>
                        ) : lastSavedAt ? (
                            <>
                                <Check className="w-4 h-4 text-emerald-500" />
                                <span className="text-emerald-600">Saved to Cloud</span>
                            </>
                        ) : (
                            <span>All changes saved</span>
                        )}
                    </div>
                    {/* Publish Controls */}
                    <div className="h-6 w-px bg-gray-200"></div>
                    {isPublished ? (
                        <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
                                <Globe className="w-3.5 h-3.5" />
                                Published
                            </span>
                            <a
                                href={`/f/${formId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-full transition-colors"
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                                View Live
                            </a>
                            <button
                                onClick={handleUnpublish}
                                disabled={isPublishing}
                                className="text-sm font-medium text-gray-500 hover:text-red-600 bg-gray-50 hover:bg-red-50 border border-gray-200 hover:border-red-200 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
                            >
                                {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Unpublish'}
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handlePublish}
                            disabled={isPublishing}
                            className="flex items-center gap-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-1.5 rounded-full shadow-sm hover:shadow-indigo-200 hover:shadow-md transition-all disabled:opacity-60"
                        >
                            {isPublishing ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Globe className="w-4 h-4" />
                            )}
                            Publish & View
                        </button>
                    )}
                </div>
            </header>

            {/* Form Editor Body Mappings */}
            <div className="max-w-3xl mx-auto px-4 sm:px-6 mt-8">

                {/* Form Title & Description Header Block */}
                <div className="bg-white rounded-t-xl rounded-b-md shadow-sm border border-t-8 border-indigo-600 p-8 mb-6">
                    <input
                        {...register('title')}
                        className="w-full text-4xl font-bold border-b border-transparent hover:border-gray-200 focus:border-indigo-600 focus:outline-none bg-transparent transition-colors mb-4 placeholder-gray-300 py-1"
                        placeholder="Form Title"
                    />
                    <textarea
                        {...register('description')}
                        rows={2}
                        className="w-full text-sm text-gray-600 border-b border-transparent hover:border-gray-200 focus:border-indigo-600 focus:outline-none bg-transparent transition-colors resize-none placeholder-gray-400 py-1"
                        placeholder="Form Description (Optional)"
                    />
                </div>

                {/* Dnd-Kit Sortable Questions Render Core */}
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={fields.map((f) => f.internalId)} strategy={verticalListSortingStrategy}>
                        {fields.map((field, index) => (
                            <QuestionCard
                                key={field.internalId}
                                id={field.internalId}
                                index={index}
                                register={register}
                                control={control}
                                questionType={formData.questions[index]?.type || 'short_answer'}
                                onRemove={() => remove(index)}
                            />
                        ))}
                    </SortableContext>
                </DndContext>

                {/* Global Add Floating Button */}
                <div className="mt-8 flex justify-center">
                    <Button
                        onClick={() => append({ text: '', type: 'multiple_choice', isRequired: false, options: [{ text: 'Option 1' }] })}
                        size="lg"
                        className="shadow-lg hover:shadow-xl group"
                    >
                        <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                        Add New Question
                    </Button>
                </div>
            </div>
        </div>
    );
}
