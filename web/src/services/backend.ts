export async function getContracts() {
  const response = await fetch(" http://127.0.0.1:8000/contracts");
  const data = await response.json();
  console.log(data);
  return data;
}

export async function listFiles(userId?: string) {
  const url = userId
    ? `http://127.0.0.1:8000/list_files?user_id=${userId}`
    : "http://127.0.0.1:8000/list_files";

  const response = await fetch(url);
  const data = await response.json();
  console.log("data in listFiles", data);
  return data;
}

export async function uploadFile(formData: FormData, userId: string) {
  try {
    // Add user_id to FormData
    formData.append("user_id", userId);

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

export async function contractData(
  userId: string,
  contractName: string,
  contractDate: string,
  contractSignatory: string,
  contractFileName: string
) {
  try {
    const { database } = await import("./firebase");
    const { ref, push, set } = await import("firebase/database");

    // Create reference to user's contracts
    const userContractsRef = ref(database, `users/${userId}`);

    // Push creates a new unique ID for the contract
    const newContractRef = push(userContractsRef);

    // Save contract data
    await set(newContractRef, {
      contractName: contractName,
      Date: contractDate,
      Fellow: contractSignatory,
      fileName: contractFileName,
      createdAt: new Date().toISOString(),
    });

    console.log("✅ Contract data saved to Firebase:", newContractRef.key);
    return {
      success: true,
      contractId: newContractRef.key,
      message: "Contract data saved successfully",
    };
  } catch (error) {
    console.error("❌ Error saving contract data to Firebase:", error);
    throw error;
  }
}
