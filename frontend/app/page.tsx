'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store';

export default function LoginPage() {
  const [role, setRole] = useState<'Student' | 'Admin'>('Student');
  const [consent, setConsent] = useState(false);
  const router = useRouter();
  const setLogin = useStore((state) => state.setLogin);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      alert("You must provide consent to use this system.");
      return;
    }

    // Anonymized user ID for mock login
    const userId = crypto.randomUUID();

    try {
      const res = await fetch('http://localhost:8000/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          anonymized_user_id: userId,
          role,
          consent_status: consent
        })
      });
      if (res.ok) {
        setLogin(userId, role, consent);
        if (role === 'Student') router.push('/inbox');
        else router.push('/admin');
      }
    } catch (err) {
      console.error(err);
      alert("Failed to connect to backend");
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full border border-gray-100">
        <h1 className="text-3xl font-bold text-center text-blue-900 mb-2">CampusShield Lite</h1>
        <p className="text-gray-500 text-center mb-8">Consent-First Phishing Early Warning</p>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'Student' | 'Admin')}
              className="w-full border border-gray-300 rounded-lg p-3 text-black focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="Student">Student</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 leading-relaxed">
                I consent to the collection of anonymized usage data for the purpose of identifying simulated phishing attacks. No personal identifying information (PII) will be shown in the admin dashboard.
              </span>
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
            disabled={!consent}
          >
            Access System
          </button>
        </form>
      </div>
    </div>
  );
}
