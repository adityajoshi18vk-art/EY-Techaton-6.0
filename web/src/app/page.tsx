import Link from 'next/link';
import { ArrowRight, Brain, Shield, TrendingUp, Users, Wrench, MessageSquare } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Brain className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">Coders Adda</span>
          </div>
          <Link 
            href="/role-select"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Login
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Driving Automotive Intelligence
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Master AI Agent orchestrating 6 specialized worker agents to revolutionize automotive service, 
            diagnostics, and customer experience
          </p>
          <div className="flex gap-4 justify-center">
            <Link 
              href="/role-select"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-lg font-semibold"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a 
              href="#features"
              className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-lg font-semibold"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
          AI-Powered Agent Architecture
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Data Analytics Agent */}
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Data Analytics</h3>
            <p className="text-gray-600">
              Real-time vehicle telemetry analysis, performance insights, and predictive patterns
            </p>
          </div>

          {/* Diagnostics Agent */}
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Wrench className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Diagnostics</h3>
            <p className="text-gray-600">
              Predictive maintenance, fault detection, and automated issue resolution recommendations
            </p>
          </div>

          {/* Customer Outreach Agent */}
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Customer Outreach</h3>
            <p className="text-gray-600">
              Personalized engagement campaigns with intelligent targeting and multi-channel delivery
            </p>
          </div>

          {/* Service Booking Agent */}
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <Brain className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Service Booking</h3>
            <p className="text-gray-600">
              Automated appointment scheduling, reminders, and intelligent calendar optimization
            </p>
          </div>

          {/* Feedback Agent */}
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6 text-pink-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Continuous Feedback</h3>
            <p className="text-gray-600">
              Sentiment analysis, satisfaction tracking, and proactive issue resolution
            </p>
          </div>

          {/* Security Agent */}
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Security & Compliance</h3>
            <p className="text-gray-600">
              Data protection, threat monitoring, and regulatory compliance management
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Transform Your Automotive Operations?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Experience the power of AI-driven automotive intelligence
          </p>
          <Link 
            href="/login"
            className="inline-flex items-center gap-2 px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors text-lg font-semibold"
          >
            Access Dashboard
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© 2025 Coders Adda - EY Techathon 6.0 Submission</p>
          <p className="text-sm mt-2">Built with Next.js 15, React 19, and TypeScript</p>
        </div>
      </footer>
    </div>
  );
}
