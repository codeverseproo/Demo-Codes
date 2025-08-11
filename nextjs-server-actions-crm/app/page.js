'use client';

import { useState, useEffect } from 'react';
import ContactForm from './components/ContactForm';
import ContactsList from './components/ContactsList';
import { getContacts } from './actions';

export default function Home() {
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    async function loadContacts() {
      const initialContacts = await getContacts();
      setContacts(initialContacts);
    }
    loadContacts();
  }, []);

  const handleContactAdded = (newContact) => {
    setContacts(prev => [newContact, ...prev]);
  };

  return (
    <main className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-900">
          CRM with Next.js 14 Server Actions
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <ContactForm onSuccess={handleContactAdded} />
          </div>
          
          <div>
            <ContactsList initialContacts={contacts} />
          </div>
        </div>
      </div>
    </main>
  );
}

