import { requireAuth } from '@/lib/auth/session';
import { getUserFilesAction } from '@/lib/actions/fileActions';
import FileUpload from '@/components/files/FileUpload';
import RecordList from '@/components/files/RecordList';

export default async function MedicalRecordsPage() {
  await requireAuth();
  const res = await getUserFilesAction();
  const files = res.files || [];

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Medical Records Pipeline</h1>
        <p className="text-sm text-gray-500 mt-1">
          Upload medical reports (PDF/Images), extract clean text, and inspect structured chunks
        </p>
      </div>

      <FileUpload />
      <RecordList files={files} />
    </div>
  );
}
