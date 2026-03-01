'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2, ArrowLeft, BarChart3, MessageSquareText } from 'lucide-react';
import Link from 'next/link';
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6'];

interface Answer {
    id: string;
    questionId: string;
    value: string;
    question: {
        text: string;
        type: string;
    };
}

interface Submission {
    id: string;
    submittedAt: string;
    answers: Answer[];
}

// Group answers by questionId for analytics
function buildQuestionStats(submissions: Submission[]) {
    const questionMap: Record<string, {
        text: string;
        type: string;
        values: string[];
    }> = {};

    submissions.forEach((sub) => {
        sub.answers.forEach((ans) => {
            if (!questionMap[ans.questionId]) {
                questionMap[ans.questionId] = {
                    text: ans.question.text,
                    type: ans.question.type,
                    values: [],
                };
            }
            questionMap[ans.questionId].values.push(ans.value);
        });
    });

    return Object.entries(questionMap).map(([id, data]) => ({ id, ...data }));
}

function buildChartData(values: string[]) {
    const counts: Record<string, number> = {};
    values.forEach((v) => {
        // Handle checkbox multi-values stored as comma-separated
        const parts = v.split(', ');
        parts.forEach((part) => {
            const trimmed = part.trim();
            if (trimmed) counts[trimmed] = (counts[trimmed] || 0) + 1;
        });
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

export default function StatsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: formId } = use(params);
    const { token, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [formTitle, setFormTitle] = useState('');

    useEffect(() => {
        if (!authLoading && !token) router.replace('/login');
    }, [token, authLoading, router]);

    useEffect(() => {
        if (!token) return;

        const fetchData = async () => {
            try {
                // Fetch form title
                const formRes = await fetch(`http://localhost:5000/api/forms/${formId}`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                if (formRes.ok) {
                    const formData = await formRes.json();
                    setFormTitle(formData.title);
                }

                // Fetch submissions
                const subsRes = await fetch(`http://localhost:5000/api/forms/${formId}/submissions`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                if (subsRes.ok) {
                    const data = await subsRes.json();
                    setSubmissions(data);
                }
            } catch (error) {
                console.error('Error loading stats:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [token, formId]);

    if (isLoading || authLoading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
            </div>
        );
    }

    const stats = buildQuestionStats(submissions);

    return (
        <div className="flex-1 bg-[#f9fafb] py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/dashboard" className="text-gray-500 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{formTitle || 'Form'} — Responses</h1>
                        <p className="text-gray-500 text-sm mt-1">
                            {submissions.length} {submissions.length === 1 ? 'response' : 'responses'} collected
                        </p>
                    </div>
                </div>

                {submissions.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                        <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-700 mb-2">No responses yet</h2>
                        <p className="text-gray-400">Share your form link to start collecting data.</p>
                        <div className="mt-6 bg-gray-50 rounded-lg p-3 inline-block">
                            <code className="text-sm text-indigo-600 font-mono">
                                {typeof window !== 'undefined' ? `${window.location.origin}/f/${formId}` : `/f/${formId}`}
                            </code>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {stats.map((q) => (
                            <div key={q.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                {/* Question Header */}
                                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                                    {q.type === 'SHORT_ANSWER' ? (
                                        <MessageSquareText className="w-5 h-5 text-indigo-500 shrink-0" />
                                    ) : (
                                        <BarChart3 className="w-5 h-5 text-indigo-500 shrink-0" />
                                    )}
                                    <h3 className="font-semibold text-gray-800">{q.text}</h3>
                                    <span className="ml-auto text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full font-medium">
                                        {q.values.length} answers
                                    </span>
                                </div>

                                <div className="p-6">
                                    {/* Short Answer — Text list */}
                                    {q.type === 'SHORT_ANSWER' && (
                                        <div className="max-h-64 overflow-y-auto space-y-2">
                                            {q.values.map((v, i) => (
                                                <div key={i} className="bg-gray-50 rounded-lg px-4 py-3 text-sm text-gray-700 border border-gray-100">
                                                    {v || <span className="text-gray-400 italic">Empty response</span>}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Choice-based — Charts */}
                                    {(q.type === 'MULTIPLE_CHOICE' || q.type === 'CHECKBOX' || q.type === 'DROPDOWN') && (() => {
                                        const chartData = buildChartData(q.values);
                                        return (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* Pie Chart */}
                                                <div className="h-64">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <PieChart>
                                                            <Pie
                                                                data={chartData}
                                                                cx="50%"
                                                                cy="50%"
                                                                innerRadius={50}
                                                                outerRadius={80}
                                                                paddingAngle={3}
                                                                dataKey="value"
                                                            >
                                                                {chartData.map((_, index) => (
                                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                                ))}
                                                            </Pie>
                                                            <Tooltip />
                                                            <Legend />
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                </div>

                                                {/* Bar Chart */}
                                                <div className="h-64">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                                            <XAxis type="number" allowDecimals={false} />
                                                            <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
                                                            <Tooltip />
                                                            <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                                                                {chartData.map((_, index) => (
                                                                    <Cell key={`bar-${index}`} fill={COLORS[index % COLORS.length]} />
                                                                ))}
                                                            </Bar>
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
