// ============================================================
// RIFIM ERP — google-drive.js (Apps Script Proxy)
// ============================================================
const RIFIM_GAS = "https://script.google.com/macros/s/AKfycbyrUp1IVAOrHpXpDrpOvK4W6J0w6Ky9aI0T5TDTwHbCn7sUBu1U-8laJ5LfPU5Gy-Rd/exec";
const RIFIM_FOLDER = "1Ejaz210g3TeM46W6up5BtgHNzEWwOnRQ";
const RIFIM_SHEET_ABSENSI = "1FU5hKMpYn1qhsl4-xZYUZrXDhTOV6aRRewYEs6gIkxA";
const RIFIM_SHEET_STAFF = "1fcraq3QHqIaD-13Ebzt6stT9aA6j_loTXeAtpNX12kw";

async function uploadFileToDrive(file, folderId) {
  const folder = folderId || RIFIM_FOLDER;
  try {
    const base64 = await fileToBase64(file);
    const res = await fetch(RIFIM_GAS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName: file.name, mimeType: file.type, base64Data: base64, folderId: folder })
    });
    const r = await res.json();
    if (r.success && r.fileId) return r.fileId;
    throw new Error(r.error || "Upload gagal");
  } catch(e) {
    console.error("Drive upload:", e);
    return null;
  }
}

async function gasAction(params) {
  try {
    const res = await fetch(RIFIM_GAS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params)
    });
    return await res.json();
  } catch(e) {
    return { success: false, error: e.message };
  }
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = () => reject(new Error("Read failed"));
    reader.readAsDataURL(file);
  });
}
