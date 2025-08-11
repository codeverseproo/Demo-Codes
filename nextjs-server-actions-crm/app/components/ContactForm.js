'use client';

import { useState, useTransition } from 'react';
import { createContact, updateContact } from '@/app/actions';

export default function ContactForm({ contact = null, onSuccess }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState({ text: '', type: '' });
  const isEditing = Boolean(contact);

  async function handleSubmit(formData) {
    startTransition(async () => {
      try {
        const result = isEditing
          ? await updateContact(contact.id, formData)
          : await createContact(formData);

        if (result.success) {
          setMessage({
            text: isEditing ? 'Contact updated successfully!' : 'Contact created successfully!',
            type: 'success',
          });
          if (!isEditing) {
            document.getElementById('contact-form').reset();
          }
          onSuccess?.(result.contact);
        } else {
          setMessage({ text: result.error, type: 'error' });
        }
      } catch (error) {
        setMessage({ text: 'An unexpected error occurred', type: 'error' });
      }
    });
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">
        {isEditing ? 'Edit Contact' : 'Add New Contact'}
      </h2>
      <form id="contact-form" action={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            defaultValue={contact?.name || ''}
            required
            disabled={isPending}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="John Doe"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            defaultValue={contact?.email || ''}
            required
            disabled={isPending}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="john@example.com"
          />
        </div>
        <div>
          <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
            Company
          </label>
          <input
            type="text"
            id="company"
            name="company"
            defaultValue={contact?.company || ''}
            disabled={isPending}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Acme Corp"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            defaultValue={contact?.phone || ''}
            disabled={isPending}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="+1 (555) 123-4567"
          />
        </div>
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            defaultValue={contact?.notes || ''}
            disabled={isPending}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Additional notes about this contact..."
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-md transition duration-300"
        >
          {isPending ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Contact' : 'Add Contact')}
        </button>
        {message.text && (
          <div className={`p-3 rounded-md ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}
      </form>
    </div>
  );
}

