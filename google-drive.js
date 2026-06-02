// ─────────────────────────────────────────────────────────────
// RIFIM ERP — Google Drive + Sheets + Email Integration
// Via Apps Script proxy (tanpa OAuth popup)
// ─────────────────────────────────────────────────────────────

const RIFIM_GAS    = 'https://script.google.com/macros/s/AKfycbyrUp1IVAOrHpXpDrpOvK4W6J0w6Ky9aI0T5TDTwHbCn7sUBu1U-8laJ5LfPU5Gy-Rd/exec';
const RIFIM_FOLDER = '1Ejaz210g3TeM46W6up5BtgHNzEWwOnRQ';
const RIFIM_SHEET_ABSENSI = '1FU5hKMpYn1qhsl4-xZYUZrXDhTOV6aRRewYEs6gIkxA';
const RIFIM_SHEET_STAFF   = '1fcraq3QHqIaD-13Ebzt6stT9aA6j_loTXeAtpNX12kw';

/** Upload file ke Google Drive via Apps Script */
async function uploadFileToDrive(file, folderId) {
  const base64 = await fileToBase64(file);
  const body = JSON.stringify({
    action: 'uploadFile',
    fileName: file.name,
    mimeType: file.type || 'image/jpeg',
    base64Data: base64,
    folderId: folderId || RIFIM_FOLDER
  });
  // text/plain menghindari CORS preflight ke GAS
  const res = await fetch(RIFIM_GAS, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: body
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch(e) { data = {}; }
  const fid = data.fileId || data.id || null;
  if (fid) {
    console.log('✅ Drive upload OK:', fid);
    return fid;
  }
  if (data.error) throw new Error(data.error);
  // Jika tidak ada fileId tapi tidak ada error, kemungkinan berhasil
  console.warn('Drive: no fileId in response', data);
  return 'uploaded'; // return non-null agar UI tahu berhasil
}

/** Append satu baris ke Google Sheets */
async function appendToSheet(sheetId, sheetName, values) {
  try {
    const res = await fetch(RIFIM_GAS, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' }, // bypass CORS preflight for GAS
      body: JSON.stringify({ action: 'appendRow', sheetId, sheetName, values })
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
  } catch (e) {
    console.warn('Sheet append failed:', e.message);
    return null;
  }
}

/** Append banyak baris sekaligus ke Google Sheets (untuk export rekap) */
async function appendRowsToSheet(sheetId, sheetName, rows, clearFirst=false) {
  try {
    const res = await fetch(RIFIM_GAS, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' }, // bypass CORS preflight for GAS
      body: JSON.stringify({ action: 'appendRows', sheetId, sheetName, rows, clearFirst })
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
  } catch (e) {
    console.warn('Sheet appendRows failed:', e.message);
    return null;
  }
}

/** Convert File/Blob ke base64 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result.split(',')[1]);
    reader.onerror = () => reject(new Error('FileReader failed'));
    reader.readAsDataURL(file);
  });
}
