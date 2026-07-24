import { getProfileAction } from '@/lib/actions/profileActions';
import ProfileForm from '@/components/profile/ProfileForm';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const result = await getProfileAction();

  if (result.error || !result.user) {
    redirect('/login');
  }

  const profileData = result.profile
    ? {
        fullName: result.profile.fullName,
        phone: result.profile.phone,
        dateOfBirth: result.profile.dateOfBirth ? result.profile.dateOfBirth.toISOString() : null,
        gender: result.profile.gender,
        bloodType: result.profile.bloodType,
        emergencyContact: result.profile.emergencyContact,
        medicalHistory: result.profile.medicalHistory,
        allergies: result.profile.allergies,
      }
    : null;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">User Profile</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your personal details, emergency contacts, and medical background
        </p>
      </div>

      <ProfileForm
        initialProfile={profileData}
        userEmail={result.user.email}
        userRole={result.user.role}
      />
    </div>
  );
}
