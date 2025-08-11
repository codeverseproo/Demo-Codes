'use client';

import { useState, useTransition, useEffect } from 'react';
import { deleteContact } from '@/app/actions';

export default function ContactsList({ initialContacts }) {
  const [contacts, setContacts] = useState(initialContacts);
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState(null);

  // Update contacts when initialContacts changes
  useEffect(() => {
    setContacts(initialContacts);
  }, [initialContacts]);

  const handleDelete = (id) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;

    setDeletingId(id);
    startTransition(async () => {
      const result = await deleteContact(id);
      if (result.success) {
        setContacts(contacts.filter((contact) => contact.id !== id));
      } else {
        alert('Failed to delete contact');
      }
      setDeletingId(null);
    });
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b">
        <h3 className="text-lg font-semibold text-gray-900">
          Contacts ({contacts.length})
        </h3>
      </div>
      {contacts.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          No contacts found. Add your first contact above.
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {contacts.map((contact) => (
            <div key={contact.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="text-lg font-medium text-gray-900">{contact.name}</h4>
                  <p className="text-sm text-gray-600">{contact.email}</p>
                  {contact.company && (
                    <p className="text-sm text-gray-600">{contact.company}</p>
                  )}
                  {contact.phone && (
                    <p className="text-sm text-gray-600">{contact.phone}</p>
                  )}
                  {contact.notes && (
                    <p className="text-sm text-gray-500 mt-2">{contact.notes}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    Added {new Date(contact.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(contact.id)}
                  disabled={deletingId === contact.id}
                  className="ml-4 text-red-600 hover:text-red-800 disabled:opacity-50"
                >
                  {deletingId === contact.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

