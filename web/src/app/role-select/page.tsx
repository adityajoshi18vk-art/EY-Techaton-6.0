'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { Users, Briefcase } from 'lucide-react';

export default function RoleSelectPage() {
  const router = useRouter();
  const setSelectedRole = useAuthStore((state) => state.setSelectedRole);

  const handleRoleSelect = (role: 'customer' | 'employee') => {
    setSelectedRole(role);
    router.push(`/login?role=${role}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Welcome to EY Automotive AI Platform
          </h1>
          <p className="text-xl text-gray-300">
            Please select your role to continue
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Customer Card */}
          <button
            onClick={() => handleRoleSelect('customer')}
            className="group bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-500/30 transition-colors">
                <Users className="w-12 h-12 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Customer</h2>
              <p className="text-gray-300 mb-6">
                Access your vehicle information, book services, provide feedback, and chat with our AI assistant
              </p>
              <ul className="text-sm text-gray-400 space-y-2 text-left w-full">
                <li>✓ Book service appointments</li>
                <li>✓ View vehicle diagnostics</li>
                <li>✓ Chat with AI assistant</li>
                <li>✓ Provide feedback</li>
              </ul>
            </div>
          </button>

          {/* Employee Card */}
          <button
            onClick={() => handleRoleSelect('employee')}
            className="group bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-purple-500/20 rounded-full flex items-center justify-center mb-6 group-hover:bg-purple-500/30 transition-colors">
                <Briefcase className="w-12 h-12 text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Employee</h2>
              <p className="text-gray-300 mb-6">
                Access the full AI-powered platform with analytics, diagnostics, and management tools
              </p>
              <ul className="text-sm text-gray-400 space-y-2 text-left w-full">
                <li>✓ Master AI Agent dashboard</li>
                <li>✓ Analytics & insights</li>
                <li>✓ Customer outreach</li>
                <li>✓ Security & compliance</li>
              </ul>
            </div>
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            Powered by 7 specialized AI agents | EY Techathon 6.0
          </p>
        </div>
      </div>
    </div>
  );
}
