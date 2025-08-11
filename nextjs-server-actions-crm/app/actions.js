'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema with Zod
const ContactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email format'),
  company: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  notes: z.string().max(500).optional(),
});

export async function createContact(formData) {
  'use server';
  const rawData = {
    name: formData.get('name'),
    email: formData.get('email'),
    company: formData.get('company') || undefined,
    phone: formData.get('phone') || undefined,
    notes: formData.get('notes') || undefined,
  };

  try {
    // Validate with Zod
    const validatedData = ContactSchema.parse(rawData);

    // Check for existing contact
    const existingContact = await prisma.contact.findUnique({
      where: { email: validatedData.email },
    });

    if (existingContact) {
      return { error: 'Contact with this email already exists' };
    }

    // Create contact
    const contact = await prisma.contact.create({
      data: validatedData,
    });

    // Revalidate contacts page cache
    revalidatePath('/contacts');
    revalidatePath('/');

    return { success: true, contact };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }
    console.error('Failed to create contact:', error);
    return { error: 'Failed to create contact. Please try again.' };
  }
}

export async function getContacts(searchTerm = '') {
  'use server';
  try {
    const contacts = await prisma.contact.findMany({
      where: searchTerm
        ? {
            OR: [
              { name: { contains: searchTerm, mode: 'insensitive' } },
              { email: { contains: searchTerm, mode: 'insensitive' } },
              { company: { contains: searchTerm, mode: 'insensitive' } },
            ],
          }
        : {},
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit results for performance
    });
    return contacts;
  } catch (error) {
    console.error('Failed to fetch contacts:', error);
    return [];
  }
}

export async function updateContact(id, formData) {
  'use server';
  const rawData = {
    name: formData.get('name'),
    email: formData.get('email'),
    company: formData.get('company') || undefined,
    phone: formData.get('phone') || undefined,
    notes: formData.get('notes') || undefined,
  };

  try {
    const validatedData = ContactSchema.parse(rawData);
    const contact = await prisma.contact.update({
      where: { id },
      data: validatedData,
    });
    revalidatePath('/contacts');
    return { success: true, contact };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }
    console.error('Failed to update contact:', error);
    return { error: 'Failed to update contact' };
  }
}

export async function deleteContact(id) {
  'use server';
  try {
    await prisma.contact.delete({
      where: { id },
    });
    revalidatePath('/contacts');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete contact:', error);
    return { error: 'Failed to delete contact' };
  }
}

