'use client';

import React, { useEffect, useState, use } from 'react';
import { Button } from '@/components/ui/Button';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface Option {
    id: string;
    text: string;
}

interface Question {
    id: string;
    text: string;
    type: string;
    isRequired: boolean;
    options: Option[];
}

interface FormData {
    id: string;
    title: string;
    description: string | null;
    questions: Question[];
}

export default function RespondentFormPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: formId } = use(params);
    const [form, setForm] = useState<FormData | null>(null);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [checkboxAnswers, setCheckboxAnswers] = useState<Record<string, string[]>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);

    useEffect(() => {
        const fetchForm = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/submissions/${formId}/form`);
                if (!res.ok) {
                    const data = await res.json();
                    setFetchError(data.error || 'This form is not available.');
                    return;
                }
                const data = await res.json();
                setForm(data);
            } catch {
                setFetchError('Could not load this form. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchForm();
    }, [formId]);

    const handleAnswerChange = (questionId: string, value: string) => {
        setAnswers((prev) => ({ ...prev, [questionId]: value }));
        if (errors[questionId]) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[questionId];
                return next;
            });
        }
    };

    const handleCheckboxChange = (questionId: string, optionText: string, checked: boolean) => {
        setCheckboxAnswers((prev) => {
            const current = prev[questionId] || [];
            const updated = checked
                ? [...current, optionText]
                : current.filter((v) => v !== optionText);
            return { ...prev, [questionId]: updated };
        });
        if (errors[questionId]) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[questionId];
                return next;
            });
        }
    };

    const validate = (): boolean => {
        if (!form) return false;
        const newErrors: Record<string, string> = {};
        form.questions.forEach((q) => {
            if (q.isRequired) {
                if (q.type === 'CHECKBOX') {
                    if (!checkboxAnswers[q.id] || checkboxAnswers[q.id].length === 0) {
                        newErrors[q.id] = 'This question is required.';
                    }
                } else {
                    if (!answers[q.id] || answers[q.id].trim() === '') {
                        newErrors[q.id] = 'This question is required.';
                    }
                }
            }
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate() || !form) return;

        setIsSubmitting(true);
        try {
            const payload = form.questions.map((q) => ({
                questionId: q.id,
                value: q.type === 'CHECKBOX'
                    ? (checkboxAnswers[q.id] || []).join(', ')
                    : (answers[q.id] || ''),
            }));

            const res = await fetch(`http://localhost:5000/api/submissions/${formId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answers: payload }),
            });

            if (!res.ok) throw new Error('Submission failed');
            setIsSubmitted(true);
        } catch {
            setErrors({ _global: 'Something went wrong. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (fetchError) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[60vh]">
                <div className="text-center space-y-4 max-w-md px-6">
                    <AlertCircle className="w-16 h-16 text-red-400 mx-auto" />
                    <h2 className="text-2xl font-bold text-gray-800">Form Unavailable</h2>
                    <p className="text-gray-500">{fetchError}</p>
                </div>
            </div>
        );
    }

    if (isSubmitted) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[60vh]">
                <div className="text-center space-y-4 max-w-md px-6">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">Thank You!</h2>
                    <p className="text-gray-500 text-lg">Your response has been recorded successfully.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 bg-[#f0f0f5] py-10 px-4">
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
                {/* Form Header */}
                <div className="bg-white rounded-t-xl rounded-b-md shadow-sm border border-t-8 border-indigo-600 p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{form!.title}</h1>
                    {form!.description && (
                        <p className="text-gray-500">{form!.description}</p>
                    )}
                    <p className="mt-4 text-sm text-red-500">* Required</p>
                </div>

                {errors._global && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                        {errors._global}
                    </div>
                )}

                {/* Questions */}
                {form!.questions.map((q) => (
                    <div key={q.id} className={`bg-white rounded-xl shadow-sm border p-6 ${errors[q.id] ? 'border-red-400 ring-1 ring-red-400' : 'border-gray-200'}`}>
                        <label className="block text-base font-semibold text-gray-800 mb-4">
                            {q.text}
                            {q.isRequired && <span className="text-red-500 ml-1">*</span>}
                        </label>

                        {/* SHORT_ANSWER */}
                        {q.type === 'SHORT_ANSWER' && (
                            <input
                                type="text"
                                value={answers[q.id] || ''}
                                onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                placeholder="Your answer"
                                className="w-full border-b-2 border-gray-200 focus:border-indigo-500 outline-none py-2 text-gray-700 bg-transparent transition-colors"
                            />
                        )}

                        {/* MULTIPLE_CHOICE */}
                        {q.type === 'MULTIPLE_CHOICE' && (
                            <div className="space-y-3">
                                {q.options.map((opt) => (
                                    <label key={opt.id} className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="radio"
                                            name={`q-${q.id}`}
                                            value={opt.text}
                                            checked={answers[q.id] === opt.text}
                                            onChange={() => handleAnswerChange(q.id, opt.text)}
                                            className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                                        />
                                        <span className="text-gray-700 group-hover:text-gray-900 transition-colors">{opt.text}</span>
                                    </label>
                                ))}
                            </div>
                        )}

                        {/* CHECKBOX */}
                        {q.type === 'CHECKBOX' && (
                            <div className="space-y-3">
                                {q.options.map((opt) => (
                                    <label key={opt.id} className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={checkboxAnswers[q.id]?.includes(opt.text) || false}
                                            onChange={(e) => handleCheckboxChange(q.id, opt.text, e.target.checked)}
                                            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                        />
                                        <span className="text-gray-700 group-hover:text-gray-900 transition-colors">{opt.text}</span>
                                    </label>
                                ))}
                            </div>
                        )}

                        {/* DROPDOWN */}
                        {q.type === 'DROPDOWN' && (
                            <select
                                value={answers[q.id] || ''}
                                onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-700 bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none"
                            >
                                <option value="">Choose an option</option>
                                {q.options.map((opt) => (
                                    <option key={opt.id} value={opt.text}>{opt.text}</option>
                                ))}
                            </select>
                        )}

                        {errors[q.id] && (
                            <p className="mt-2 text-sm text-red-500">{errors[q.id]}</p>
                        )}
                    </div>
                ))}

                <div className="flex justify-between items-center pt-2 pb-10">
                    <Button type="submit" isLoading={isSubmitting} size="lg" className="shadow-lg">
                        Submit
                    </Button>
                    <p className="text-xs text-gray-400">Powered by Form Builder</p>
                </div>
            </form>
        </div>
    );
}
