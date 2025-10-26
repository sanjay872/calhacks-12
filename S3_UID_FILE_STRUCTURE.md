# S3 File Organization by User UID

## Overview

Files in S3 are now organized by user UID in the structure:

```
calhacks3.0/
  ├── {UID_1}/
  │   ├── file1.pdf
  │   ├── file2.pdf
  │   └── file3.pdf
  ├── {UID_2}/
  │   ├── document1.pdf
  │   └── document2.pdf
  └── ...
```

## Backend API Endpoints

### 1. Upload File

**Endpoint:** `POST /upload_file`

**Parameters:**

- `file`: The file to upload (multipart/form-data)
- `user_id`: User's UID (form data)

**Response:**

```json
{
  "success": true,
  "file_name": "contract.pdf",
  "s3_path": "abc123/contract.pdf",
  "file_type": "application/pdf",
  "file_size": 12345,
  "user_id": "abc123",
  "message": "File uploaded successfully to S3 at abc123/contract.pdf"
}
```

**Example (Python):**

```python
# The backend automatically handles this
s3_path = s3_client.upload_file(temp_file_path, 'calhacks3.0', 'document.pdf', uid='abc123')
# Uploads to: calhacks3.0/abc123/document.pdf
```

### 2. List Files

**Endpoint:** `GET /list_files?user_id={uid}`

**Query Parameters:**

- `user_id` (optional): User's UID to filter files
  - If provided: Returns files only for that user
  - If omitted: Returns all files in bucket

**Response:**

```json
{
  "files": [
    {
      "name": "contract.pdf",
      "full_path": "abc123/contract.pdf",
      "size": 12345,
      "last_modified": "2025-01-15T10:30:00"
    }
  ],
  "user_id": "abc123",
  "count": 1
}
```

## Frontend Usage

### 1. Upload File with User UID

```typescript
import { uploadFile } from "../services/backend";
import { getUser } from "../utils/auth-helpers";

const handleUpload = async (file: File) => {
  const user = getUser();
  if (!user?.uid) {
    alert("Please sign in");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  const result = await uploadFile(formData, user.uid);
  console.log("Uploaded to:", result.s3_path);
  // Output: "abc123/contract.pdf"
};
```

### 2. List Files for Current User

```typescript
import { listFiles } from "../services/backend";
import { getUserUid } from "../utils/auth-helpers";

const loadMyFiles = async () => {
  const uid = getUserUid();
  if (!uid) {
    console.error("User not signed in");
    return;
  }

  const response = await listFiles(uid);
  console.log(`Found ${response.count} files`);
  console.log(response.files);
};
```

### 3. List All Files (Admin)

```typescript
const loadAllFiles = async () => {
  const response = await listFiles(); // No UID = all files
  console.log(response.files);
};
```

## S3Client Methods

### upload_file(file_path, bucket_name, file_name, uid=None)

Uploads a file to S3

- **With UID:** Uploads to `bucket/uid/filename`
- **Without UID:** Uploads to `bucket/filename`

```python
# Upload for specific user
s3_client.upload_file('temp.pdf', 'calhacks3.0', 'contract.pdf', uid='user123')
# Result: calhacks3.0/user123/contract.pdf

# Upload without user folder
s3_client.upload_file('temp.pdf', 'calhacks3.0', 'public.pdf')
# Result: calhacks3.0/public.pdf
```

### list_files(bucket_name, uid=None)

Lists files in S3

- **With UID:** Returns only files in `bucket/uid/`
- **Without UID:** Returns all files

```python
# Get files for specific user
files = s3_client.list_files('calhacks3.0', uid='user123')
# Returns: [{'name': 'contract.pdf', 'full_path': 'user123/contract.pdf', ...}]

# Get all files
all_files = s3_client.list_files('calhacks3.0')
# Returns all files from all users
```

## Getting User UID

### Option 1: Using `useAuth` Hook (React components)

```typescript
import { useAuth } from "../hooks/useAuth";

function MyComponent() {
  const { user } = useAuth();
  const uid = user?.uid;
  return <div>User ID: {uid}</div>;
}
```

### Option 2: Using Helper Functions (anywhere)

```typescript
import { getUserUid } from "../utils/auth-helpers";

const uid = getUserUid();
console.log("Current user:", uid);
```

## Complete Example: Upload & List Files

```typescript
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { uploadFile, listFiles } from "../services/backend";

function FileManager() {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);

  useEffect(() => {
    if (user?.uid) {
      loadFiles();
    }
  }, [user]);

  const loadFiles = async () => {
    if (!user?.uid) return;
    const response = await listFiles(user.uid);
    setFiles(response.files);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.uid) return;

    const formData = new FormData();
    formData.append("file", file);

    await uploadFile(formData, user.uid);
    loadFiles(); // Refresh file list
  };

  return (
    <div>
      <input type="file" onChange={handleUpload} />
      <ul>
        {files.map((file, i) => (
          <li key={i}>
            {file.name} - {file.size} bytes
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## Benefits

✅ **User Isolation:** Each user's files are in their own folder
✅ **Easy Management:** Simple to list/delete user files
✅ **Scalable:** Works with unlimited users
✅ **Secure:** Each user can only access their own files
✅ **Clean URLs:** Files have predictable paths: `uid/filename`

## Testing

1. Sign in to get your UID
2. Upload a file - it goes to `calhacks3.0/{your_uid}/filename`
3. List files with your UID - see only your files
4. List files without UID - see all files (admin)
