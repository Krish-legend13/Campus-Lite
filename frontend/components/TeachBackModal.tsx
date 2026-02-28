'use client';

import { useState } from 'react';

export default function TeachBackModal({ isOpen, onClose, userId }: { isOpen: boolean, onClose: () => void, userId: string }) {
    const [step, setStep] = useState(0);

    if (!isOpen) return null;

    const handleComplete = async () => {
        try {
            await fetch(`http://localhost:8000/complete_lesson?user_id=${userId}`, { method: 'POST' });
        } catch (e) {
            console.error(e);
        }
        onClose();
        // Reset state for next time
        setTimeout(() => setStep(0), 300);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-indigo-50">
                    <h3 className="font-bold text-indigo-900 text-lg">Micro-Lesson: Phishing Defense</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
                </div>

                <div className="p-6">
                    {step === 0 && (
                        <div className="space-y-4 text-gray-700">
                            <h4 className="font-semibold text-gray-900">Key Indicators of Phishing:</h4>
                            <ul className="list-disc pl-5 space-y-2">
                                <li><strong>Urgent Language:</strong> Attackers create artificial urgency (e.g., &quot;account suspended&quot;).</li>
                                <li><strong>Mismatched Domains:</strong> Check if the sender email matches the display name.</li>
                                <li><strong>Dangerous Attachments:</strong> Never open .zip, .exe, or .scr from unknown sources.</li>
                            </ul>
                            <button
                                onClick={() => setStep(1)}
                                className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg"
                            >
                                Next: Quick Quiz
                            </button>
                        </div>
                    )}

                    {step === 1 && (
                        <div className="space-y-4">
                            <h4 className="font-semibold text-gray-900">Which is safer to open?</h4>
                            <div className="space-y-3 mt-4">
                                <button
                                    onClick={() => alert('Incorrect. .scr (screensaver) is an executable format.')}
                                    className="w-full text-left p-3 border border-gray-200 rounded hover:bg-red-50"
                                >
                                    A document ending in .scr
                                </button>
                                <button
                                    onClick={() => setStep(2)}
                                    className="w-full text-left p-3 border border-gray-200 rounded hover:bg-green-50 focus:bg-green-50"
                                >
                                    A document ending in .pdf
                                </button>
                                <button
                                    onClick={() => alert('Incorrect. .exe is directly executable.')}
                                    className="w-full text-left p-3 border border-gray-200 rounded hover:bg-red-50"
                                >
                                    A document ending in .exe
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="text-center py-6 space-y-4">
                            <div className="text-4xl">🎉</div>
                            <h4 className="font-bold text-xl text-green-600">Lesson Completed!</h4>
                            <p className="text-gray-600">Your behavioral risk score has been improved.</p>
                            <button
                                onClick={handleComplete}
                                className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg"
                            >
                                Return to Inbox
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
