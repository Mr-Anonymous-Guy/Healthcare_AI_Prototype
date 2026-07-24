'use server';

import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma/client';
import { ProfileInput } from '@/lib/validations/profile';
import { revalidatePath } from 'next/cache';

export async function getProfileAction() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { error: 'Unauthorized' };
  }

  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: currentUser.id },
    });

    return {
      success: true,
      user: {
        id: currentUser.id,
        email: currentUser.email,
        role: currentUser.role,
      },
      profile: profile || null,
    };
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    return { error: 'Failed to fetch profile data' };
  }
}

export async function updateProfileAction(data: ProfileInput) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { error: 'Unauthorized' };
  }

  try {
    const dobDate = data.dateOfBirth ? new Date(data.dateOfBirth) : null;

    // Upsert real record into profiles table in database
    const updatedProfile = await prisma.profile.upsert({
      where: { userId: currentUser.id },
      update: {
        fullName: data.fullName,
        phone: data.phone || null,
        dateOfBirth: dobDate,
        gender: data.gender || null,
        bloodType: data.bloodType || null,
        emergencyContact: data.emergencyContact || null,
        medicalHistory: data.medicalHistory || null,
        allergies: data.allergies || null,
      },
      create: {
        userId: currentUser.id,
        fullName: data.fullName,
        phone: data.phone || null,
        dateOfBirth: dobDate,
        gender: data.gender || null,
        bloodType: data.bloodType || null,
        emergencyContact: data.emergencyContact || null,
        medicalHistory: data.medicalHistory || null,
        allergies: data.allergies || null,
      },
    });

    revalidatePath('/profile');
    revalidatePath('/dashboard');

    return {
      success: true,
      profile: updatedProfile,
      message: 'Profile updated successfully!',
    };
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return { error: error.message || 'Failed to update profile' };
  }
}
