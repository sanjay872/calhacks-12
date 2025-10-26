import { uploadFile } from "../services/backend";
import { getUser } from "../utils/auth-helpers";

function Right() {
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const user = getUser();
      if (user) {
        console.log("Selected file:", file);
        const formData = new FormData();
        formData.append("file", file); // Add the file to FormData with key "file"
        formData.append("user_id", user?.uid);
        try {
          const result = await uploadFile(formData);
          console.log("Upload successful:", result);
          alert(`File "${file.name}" uploaded successfully!`);
        } catch (error) {
          console.error("Upload failed:", error);
          alert("Failed to upload file. Check console for details.");
        }
      } else {
        console.log("No user found");
        return;
      }
    }
  };
  return (
    <div className="w-1/2 h-full overflow-y-auto bg-gray-50 dark:bg-gray-800">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
          Right Panel
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Content for the right side goes here
          <input
            type="file"
            onChange={handleFileChange}
            accept=".pdf"
            multiple={false}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md"
            style={{ minHeight: "40px", maxHeight: "120px" }}
          ></input>
        </p>
      </div>
    </div>
  );
}

export default Right;
