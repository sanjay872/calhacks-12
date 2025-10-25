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
