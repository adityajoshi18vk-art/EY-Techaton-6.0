'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth';
import { Send, Bell, Users, AlertCircle, Calendar, Wrench } from 'lucide-react';

export default function EmployeeNotificationsPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    customerId: 'C001',
    customerEmail: 'customer@example.com',
    title: '',
    message: '',
    type: 'info' as 'alert' | 'reminder' | 'info',
    category: 'general' as 'vehicle' | 'booking' | 'maintenance' | 'general',
  });

  const { data: bookingsData } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => apiClient.getBookings(),
  });

  const sendNotificationMutation = useMutation({
    mutationFn: (notification: any) => apiClient.createNotification(notification),
    onSuccess: () => {
      alert('Notification sent successfully!');
      setFormData({
        customerId: 'C001',
        customerEmail: 'customer@example.com',
        title: '',
        message: '',
        type: 'info',
        category: 'general',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendNotificationMutation.mutate({
      ...formData,
      createdBy: user?.email || 'admin',
    });
  };

  const quickTemplates = [
    {
      title: 'Service Complete',
      message: 'Your vehicle service has been completed successfully. You can pick up your vehicle at your convenience.',
      type: 'info' as const,
      category: 'booking' as const,
    },
    {
      title: 'Maintenance Reminder',
      message: 'Your vehicle is due for scheduled maintenance. Please book an appointment to keep your vehicle in optimal condition.',
      type: 'reminder' as const,
      category: 'maintenance' as const,
    },
    {
      title: 'Vehicle Alert',
      message: 'Our diagnostic scan detected potential issues with your vehicle. Please schedule an inspection as soon as possible.',
      type: 'alert' as const,
      category: 'vehicle' as const,
    },
  ];

  const bookings = bookingsData?.bookings || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Send Notifications</h2>
        <p className="text-gray-600">Send alerts, reminders, and updates to customers</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <Bell className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Notifications Sent</p>
              <p className="text-2xl font-bold text-gray-900">--</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <Send className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Auto-Generated</p>
              <p className="text-2xl font-bold text-gray-900">Active</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Notification Form */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Create Notification</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer
              </label>
              <select
                value={formData.customerEmail}
                onChange={(e) => {
                  const selectedEmail = e.target.value;
                  if (selectedEmail === 'customer@example.com') {
                    setFormData({
                      ...formData,
                      customerId: 'C001',
                      customerEmail: 'customer@example.com',
                    });
                  } else {
                    const booking = bookings.find((b: any) => {
                      const email = b.customerName.toLowerCase().replace(/\s+/g, '.') + '@example.com';
                      return email === selectedEmail;
                    });
                    if (booking) {
                      setFormData({
                        ...formData,
                        customerId: booking.customerId,
                        customerEmail: selectedEmail,
                      });
                    }
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="customer@example.com">Customer (customer@example.com)</option>
                {bookings.map((booking: any) => {
                  const email = booking.customerName.toLowerCase().replace(/\s+/g, '.') + '@example.com';
                  return (
                    <option key={booking.id} value={email}>
                      {booking.customerName} ({email}) - {booking.id}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="info">Info</option>
                  <option value="reminder">Reminder</option>
                  <option value="alert">Alert</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="general">General</option>
                  <option value="vehicle">Vehicle</option>
                  <option value="booking">Booking</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Service Appointment Reminder"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder="Enter your notification message..."
                required
              />
            </div>

            <button
              type="submit"
              disabled={sendNotificationMutation.isPending}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {sendNotificationMutation.isPending ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Send Notification</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Quick Templates */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Quick Templates</h3>
          <div className="space-y-3">
            {quickTemplates.map((template, index) => (
              <button
                key={index}
                onClick={() => setFormData({ ...formData, ...template })}
                className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  {template.type === 'alert' && <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />}
                  {template.type === 'reminder' && <Calendar className="w-5 h-5 text-yellow-500 mt-0.5" />}
                  {template.type === 'info' && <Bell className="w-5 h-5 text-blue-500 mt-0.5" />}
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 mb-1">{template.title}</p>
                    <p className="text-sm text-gray-600">{template.message}</p>
                    <div className="flex gap-2 mt-2">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        template.type === 'alert' ? 'bg-red-100 text-red-700' :
                        template.type === 'reminder' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {template.type}
                      </span>
                      <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                        {template.category}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Auto-Generated Notifications</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Booking reminders (24h before appointment)</li>
              <li>• Completed service notifications</li>
              <li>• Vehicle diagnostic alerts</li>
              <li>• Maintenance schedule reminders</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
