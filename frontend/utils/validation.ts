export type PasswordChecks = {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  special: boolean;
  noSpaces: boolean;
};

export function getPasswordChecks(password: string): PasswordChecks {
  return {
    length: password.length >= 10,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9\s]/.test(password),
    noSpaces: !/\s/.test(password),
  };
}

export function isStrongPassword(password: string) {
  const c = getPasswordChecks(password);
  return Object.values(c).every(Boolean);
}

export function passwordStrength(password: string) {
  const c = getPasswordChecks(password);
  const score = Object.values(c).filter(Boolean).length;
  if (!password) return { label: 'Not set', score: 0 };
  if (score <= 2) return { label: 'Weak', score };
  if (score <= 4) return { label: 'Almost there', score };
  if (score === 5) return { label: 'Strong', score };
  return { label: 'Very strong', score };
}

export function generateStrongPassword(length = 14) {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnopqrstuvwxyz';
  const numbers = '23456789';
  const special = '!@#$%^&*_-+=';
  const all = upper + lower + numbers + special;

  const pick = (chars: string) => chars[Math.floor(Math.random() * chars.length)];
  const chars = [pick(upper), pick(lower), pick(numbers), pick(special)];

  while (chars.length < length) chars.push(pick(all));

  return chars.sort(() => Math.random() - 0.5).join('');
}

export function isValidIndianMobile(phone: string) {
  return /^[6-9][0-9]{9}$/.test(phone);
}

// Aadhaar's Verhoeff checksum validates the number's mathematical structure.
// It does NOT prove that the number belongs to a real person or is issued by UIDAI.
const d = [
  [0,1,2,3,4,5,6,7,8,9],
  [1,2,3,4,0,6,7,8,9,5],
  [2,3,4,0,1,7,8,9,5,6],
  [3,4,0,1,2,8,9,5,6,7],
  [4,0,1,2,3,9,5,6,7,8],
  [5,9,8,7,6,0,4,3,2,1],
  [6,5,9,8,7,1,0,4,3,2],
  [7,6,5,9,8,2,1,0,4,3],
  [8,7,6,5,9,3,2,1,0,4],
  [9,8,7,6,5,4,3,2,1,0],
];
const p = [
  [0,1,2,3,4,5,6,7,8,9],
  [1,5,7,6,2,8,3,0,9,4],
  [5,8,0,3,7,9,6,1,4,2],
  [8,9,1,6,0,4,3,5,2,7],
  [9,4,5,3,1,2,6,8,7,0],
  [4,2,8,6,5,7,3,9,0,1],
  [2,7,9,3,8,0,6,4,1,5],
  [7,0,4,6,9,1,3,2,5,8],
];
const inv = [0,4,3,2,1,5,6,7,8,9];

export function isValidAadhaar(aadhaar: string) {
  if (!/^[0-9]{12}$/.test(aadhaar)) return false;
  if (/^(\d)\1{11}$/.test(aadhaar)) return false;

  let checksum = 0;
  const reversed = aadhaar.split('').reverse().map(Number);
  reversed.forEach((digit, index) => {
    checksum = d[checksum][p[index % 8][digit]];
  });
  return checksum === 0;
}
