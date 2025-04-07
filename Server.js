import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { key, hwid } = req.body;

  if (!key || !hwid) {
    return res.status(400).json({ success: false, message: 'Key or HWID missing' });
  }

  const filePath = path.resolve('keys.json');
  const keysData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  if (!keysData.hasOwnProperty(key)) {
    return res.status(404).json({ success: false, message: 'Key not found' });
  }

  const usedHWID = keysData[key];

  // Jika belum digunakan, tandai sebagai digunakan
  if (usedHWID === null) {
    keysData[key] = hwid;
    fs.writeFileSync(filePath, JSON.stringify(keysData, null, 2));
    return res.status(200).json({ success: true, message: 'Key redeemed' });
  }

  // Jika HWID cocok, validasi tetap diterima
  if (usedHWID === hwid) {
    return res.status(200).json({ success: true, message: 'Key already redeemed by this HWID' });
  }

  // Jika HWID tidak cocok
  return res.status(403).json({ success: false, message: 'Key already used by another HWID' });
}
