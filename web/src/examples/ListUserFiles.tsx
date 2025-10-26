import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { listFiles } from "../services/backend";

/**
 * Example component showing how to list files for the current user
 */
function ListUserFiles() {
  const { user } = useAuth();
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      loadUserFiles();
    }
  }, [user]);

  const loadUserFiles = async () => {
    if (!user?.uid) return;

    setLoading(true);
    try {
      const response = await listFiles(user.uid);
      setFiles(response.files);
      console.log(`Found ${response.count} files for user ${user.uid}`);
    } catch (error) {
      console.error("Error loading files:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div>Please sign in to view your files</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">My Files</h2>
        <button
          onClick={loadUserFiles}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div>Loading files...</div>
      ) : files.length === 0 ? (
        <div className="text-gray-500">No files uploaded yet</div>
      ) : (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="p-4 border rounded-lg bg-white shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{file.name}</h3>
                  <p className="text-sm text-gray-500">
                    Path: {file.full_path}
                  </p>
                  <p className="text-sm text-gray-500">
                    Size: {(file.size / 1024).toFixed(2)} KB
                  </p>
                  <p className="text-sm text-gray-500">
                    Modified: {new Date(file.last_modified).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ListUserFiles;
