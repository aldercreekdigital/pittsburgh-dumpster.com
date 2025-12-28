'use client';

import { useState, FormEvent } from 'react';
import { DUMPSTER_SIZES } from '@/lib/constants';

interface QuoteFormProps {
  preSelectedSize?: string;
  compact?: boolean;
}

export default function QuoteForm({ preSelectedSize, compact = false }: QuoteFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: 'PA',
    zip: '',
    dumpsterSize: preSelectedSize || '',
    projectType: '',
    deliveryDate: '',
    pickupDate: '',
    description: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="card-industrial p-8 text-center">
        <div className="w-16 h-16 bg-primary-light/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-primary-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold mb-2">Thank You!</h3>
        <p className="text-gray-600 mb-4">
          We&apos;ve received your quote request. Our team will contact you within 2 hours during business hours.
        </p>
        <p className="text-sm text-gray-500">
          Need immediate assistance? Call us at{' '}
          <a href="tel:+1-412-555-3867" className="text-accent-orange font-bold">
            (412) 555-DUMP
          </a>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card-industrial p-6 md:p-8">
      <h3 className="text-2xl font-bold mb-6">Get Your Free Quote</h3>

      <div className={`grid gap-4 ${compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
        {/* Contact Info */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-orange focus:border-transparent"
            placeholder="John Smith"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number *
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            required
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-orange focus:border-transparent"
            placeholder="(412) 555-1234"
          />
        </div>

        <div className={compact ? '' : 'md:col-span-2'}>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-orange focus:border-transparent"
            placeholder="john@example.com"
          />
        </div>

        {/* Address */}
        <div className={compact ? '' : 'md:col-span-2'}>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
            Delivery Address *
          </label>
          <input
            type="text"
            id="address"
            name="address"
            required
            value={formData.address}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-orange focus:border-transparent"
            placeholder="123 Main Street"
          />
        </div>

        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
            City *
          </label>
          <input
            type="text"
            id="city"
            name="city"
            required
            value={formData.city}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-orange focus:border-transparent"
            placeholder="Pittsburgh"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
              State *
            </label>
            <select
              id="state"
              name="state"
              required
              value={formData.state}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-orange focus:border-transparent"
            >
              <option value="PA">Pennsylvania</option>
              <option value="WV">West Virginia</option>
              <option value="OH">Ohio</option>
            </select>
          </div>
          <div>
            <label htmlFor="zip" className="block text-sm font-medium text-gray-700 mb-1">
              ZIP *
            </label>
            <input
              type="text"
              id="zip"
              name="zip"
              required
              value={formData.zip}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-orange focus:border-transparent"
              placeholder="15071"
            />
          </div>
        </div>

        {/* Project Details */}
        <div>
          <label htmlFor="dumpsterSize" className="block text-sm font-medium text-gray-700 mb-1">
            Dumpster Size *
          </label>
          <select
            id="dumpsterSize"
            name="dumpsterSize"
            required
            value={formData.dumpsterSize}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-orange focus:border-transparent"
          >
            <option value="">Select a size...</option>
            {DUMPSTER_SIZES.map((size) => (
              <option key={size.size} value={size.size}>
                {size.size} - {size.priceRange}
              </option>
            ))}
            <option value="Not Sure">Not Sure - Need Advice</option>
          </select>
        </div>

        <div>
          <label htmlFor="projectType" className="block text-sm font-medium text-gray-700 mb-1">
            Project Type *
          </label>
          <select
            id="projectType"
            name="projectType"
            required
            value={formData.projectType}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-orange focus:border-transparent"
          >
            <option value="">Select project type...</option>
            <option value="Home Renovation">Home Renovation</option>
            <option value="Roofing">Roofing Project</option>
            <option value="Kitchen/Bath Remodel">Kitchen/Bath Remodel</option>
            <option value="Garage/Basement Cleanout">Garage/Basement Cleanout</option>
            <option value="Estate Cleanout">Estate Cleanout</option>
            <option value="Landscaping">Landscaping/Yard Debris</option>
            <option value="New Construction">New Construction</option>
            <option value="Demolition">Demolition</option>
            <option value="Commercial">Commercial Project</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="deliveryDate" className="block text-sm font-medium text-gray-700 mb-1">
            Preferred Delivery Date
          </label>
          <input
            type="date"
            id="deliveryDate"
            name="deliveryDate"
            value={formData.deliveryDate}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-orange focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="pickupDate" className="block text-sm font-medium text-gray-700 mb-1">
            Estimated Pickup Date
          </label>
          <input
            type="date"
            id="pickupDate"
            name="pickupDate"
            value={formData.pickupDate}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-orange focus:border-transparent"
          />
        </div>

        {!compact && (
          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Project Description (Optional)
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-orange focus:border-transparent"
              placeholder="Tell us about your project..."
            />
          </div>
        )}
      </div>

      <div className="mt-6">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Submitting...
            </span>
          ) : (
            'Get Your Free Quote'
          )}
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-4 text-center">
        By submitting this form, you agree to be contacted about your quote request.
        We respect your privacy and will never share your information.
      </p>
    </form>
  );
}
