export async function getContracts() {
  const response = await fetch(" http://127.0.0.1:8000/contracts");
  const data = await response.json();
  console.log(data);
  return data;
}

export async function listFiles() {
  const response = await fetch("http://127.0.0.1:8000/list_files");
  const data = await response.json();
  console.log("data in listFiles", data);
  return data;
}

export async function uploadFile(formData: FormData) {
  try {
    const response = await fetch("http://127.0.0.1:8000/upload_file", {
      method: "POST",
      body: formData,
      // DON'T set Content-Type header - browser will set it automatically with boundary
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Upload response:", data);
    return data;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
}
