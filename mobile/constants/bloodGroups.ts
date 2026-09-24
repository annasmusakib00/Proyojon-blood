export const BLOOD_GROUPS = [
  { label: 'A+', value: 'A_POS' },
  { label: 'A−', value: 'A_NEG' },
  { label: 'B+', value: 'B_POS' },
  { label: 'B−', value: 'B_NEG' },
  { label: 'O+', value: 'O_POS' },
  { label: 'O−', value: 'O_NEG' },
  { label: 'AB+', value: 'AB_POS' },
  { label: 'AB−', value: 'AB_NEG' },
] as const;

export type BloodGroupValue = (typeof BLOOD_GROUPS)[number]['value'];
