'use client';

import { useState } from 'react';
import { useStore } from '@/store';
import { useRouter } from 'next/navigation';
import TeachBackModal from '@/components/TeachBackModal';

const MOCK_EMAILS = [
    {
        id: 1,
        subject: "URGENT: Verify your student account",
        sender_name: "Admin Desk",
        sender_email: "support@camppus-security.com",
        body: "Please click here to verify your account or it will be suspended.",
        has_attachment: false,
        attachment_ext: "",
    },
    {
        id: 2,
        subject: "Library Book Due",
        sender_name: "University Library",
        sender_email: "library@university.edu",
        body: "Your book is due tomorrow. Please return it.",
        has_attachment: false,
        attachment_ext: "",
    },
    {
        id: 3,
        subject: "Invoice for Tuition - Action Required",
        sender_name: "Finance Dept",
        sender_email: "finance@university.edu",
        body: "Attached is the invoice for the upcoming semester. 192.168.1.1",
        has_attachment: true,
        attachment_ext: ".zip",
    }
];

export default function InboxPage() {
    const { userId, role, consentGiven, logout } = useStore();
    const router = useRouter();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [selectedEmail, setSelectedEmail] = useState<any>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [scoreResult, setScoreResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [showTeachBack, setShowTeachBack] = useState(false);

    if (!userId || !consentGiven || role !== 'Student') {
        return (
            <div className="p-8 text-center text-red-600">
                Access Denied. Please login as a Student with consent.
                <button className="block mx-auto mt-4 text-blue-600 underline" onClick={() => router.push('/')}>Go back</button>
            </div>
        );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleEmailClick = async (email: any) => {
        setSelectedEmail(email);
        setScoreResult(null);
        setLoading(true);

        try {
            // 1. Check Phishing
            const res = await fetch('http://localhost:8000/check_phishing', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: userId,
                    email: {
                        subject: email.subject,
                        sender_name: email.sender_name,
                        sender_email: email.sender_email,
                        body: email.body,
                        has_attachment: email.has_attachment,
                        attachment_ext: email.attachment_ext
                    }
                })
            });
            const data = await res.json();
            setScoreResult(data);

            // 2. Record Click if risky
            if (data.level !== 'Low') {
                await fetch(`http://localhost:8000/record_click?user_id=${userId}`, { method: 'POST' });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getBadgeColor = (level: string) => {
        if (level === 'High') return 'bg-red-100 text-red-800 border-red-200';
        if (level === 'Medium') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        return 'bg-green-100 text-green-800 border-green-200';
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto flex gap-6">
                {/* Left: Inbox List */}
                <div className="w-1/3 bg-white rounded-xl shadow border border-gray-200 overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <h2 className="font-semibold text-gray-800">Your Inbox</h2>
                        <button onClick={() => { logout(); router.push('/'); }} className="text-sm text-gray-500 hover:text-red-600">Logout</button>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {MOCK_EMAILS.map(email => (
                            <button
                                key={email.id}
                                onClick={() => handleEmailClick(email)}
                                className={`w-full text-left p-4 border-b border-gray-50 hover:bg-blue-50 transition-colors ${selectedEmail?.id === email.id ? 'bg-blue-50' : ''}`}
                            >
                                <div className="font-medium text-gray-900 truncate">{email.sender_name}</div>
                                <div className="text-sm font-semibold text-gray-800 truncate mt-1">{email.subject}</div>
                                <div className="text-xs text-gray-500 truncate mt-1">{email.body}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right: Email Detail & Explainability */}
                <div className="w-2/3 flex flex-col gap-6">
                    {selectedEmail ? (
                        <>
                            {/* Email Content */}
                            <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
                                <h2 className="text-2xl font-bold mb-4">{selectedEmail.subject}</h2>
                                <div className="mb-6 flex gap-2 text-sm text-gray-600">
                                    <span className="font-semibold">{selectedEmail.sender_name}</span>
                                    <span>&lt;{selectedEmail.sender_email}&gt;</span>
                                </div>
                                <div className="bg-gray-50 p-4 rounded text-gray-800 min-h-[150px] whitespace-pre-wrap font-sans">
                                    {selectedEmail.body}
                                </div>
                                {selectedEmail.has_attachment && (
                                    <div className="mt-4 inline-flex items-center gap-2 bg-gray-100 px-3 py-2 rounded text-sm font-medium">
                                        📎 Attachment: invoice{selectedEmail.attachment_ext}
                                    </div>
                                )}
                            </div>

                            {/* Explainability Engine */}
                            {loading ? (
                                <div className="bg-white rounded-xl shadow border border-gray-200 p-6 flex items-center justify-center h-48">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                    <span className="ml-3 text-gray-500">Scanning with Hybrid Engine...</span>
                                </div>
                            ) : scoreResult ? (
                                <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-800">Security Analysis</h3>
                                            <p className="text-sm text-gray-500">Powered by heuristic & behavioral scoring</p>
                                        </div>
                                        <div className={`px-4 py-2 rounded-full font-bold border ${getBadgeColor(scoreResult.level)}`}>
                                            {scoreResult.level} Risk ({Math.round(scoreResult.score)}/100)
                                        </div>
                                    </div>

                                    {/* Reasons Section */}
                                    <div className="space-y-4">
                                        <h4 className="font-semibold text-gray-700">Why was this flagged?</h4>
                                        <ul className="space-y-2">
                                            {scoreResult.reasons.map((r: string, i: number) => (
                                                <li key={i} className="flex gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded border border-gray-100">
                                                    <span>🔍</span> {r}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {scoreResult.level !== 'Low' && (
                                        <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center">
                                            <p className="text-sm text-gray-500">Want to improve your organizational security?</p>
                                            <button
                                                onClick={() => setShowTeachBack(true)}
                                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-medium transition-colors"
                                            >
                                                Start Micro-Lesson
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : null}
                        </>
                    ) : (
                        <div className="bg-white rounded-xl shadow border border-gray-200 p-6 flex items-center justify-center h-full text-gray-400">
                            Select an email to view
                        </div>
                    )}
                </div>
            </div>

            <TeachBackModal
                isOpen={showTeachBack}
                onClose={() => setShowTeachBack(false)}
                userId={userId}
            />
        </div>
    );
}
