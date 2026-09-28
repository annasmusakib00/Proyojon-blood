/**
 * Bangladesh Divisions and Districts for donor location filtering.
 */

export interface District {
  label: string;
  value: string;
}

export interface Division {
  label: string;
  value: string;
  districts: District[];
}

export const BD_DIVISIONS: Division[] = [
  {
    label: 'ঢাকা',
    value: 'ঢাকা',
    districts: [
      { label: 'ঢাকা', value: 'ঢাকা' },
      { label: 'গাজীপুর', value: 'গাজীপুর' },
      { label: 'নারায়ণগঞ্জ', value: 'নারায়ণগঞ্জ' },
      { label: 'মানিকগঞ্জ', value: 'মানিকগঞ্জ' },
      { label: 'মুন্সিগঞ্জ', value: 'মুন্সিগঞ্জ' },
      { label: 'নরসিংদী', value: 'নরসিংদী' },
      { label: 'ফরিদপুর', value: 'ফরিদপুর' },
      { label: 'গোপালগঞ্জ', value: 'গোপালগঞ্জ' },
      { label: 'কিশোরগঞ্জ', value: 'কিশোরগঞ্জ' },
      { label: 'মাদারীপুর', value: 'মাদারীপুর' },
      { label: 'রাজবাড়ী', value: 'রাজবাড়ী' },
      { label: 'শরিয়তপুর', value: 'শরিয়তপুর' },
      { label: 'টাঙ্গাইল', value: 'টাঙ্গাইল' },
    ],
  },
  {
    label: 'চট্টগ্রাম',
    value: 'চট্টগ্রাম',
    districts: [
      { label: 'চট্টগ্রাম', value: 'চট্টগ্রাম' },
      { label: 'কক্সবাজার', value: 'কক্সবাজার' },
      { label: 'কুমিল্লা', value: 'কুমিল্লা' },
      { label: 'ফেনী', value: 'ফেনী' },
      { label: 'লক্ষ্মীপুর', value: 'লক্ষ্মীপুর' },
      { label: 'নোয়াখালী', value: 'নোয়াখালী' },
      { label: 'রাঙ্গামাটি', value: 'রাঙ্গামাটি' },
      { label: 'খাগড়াছড়ি', value: 'খাগড়াছড়ি' },
      { label: 'বান্দরবান', value: 'বান্দরবান' },
      { label: 'ব্রাহ্মণবাড়িয়া', value: 'ব্রাহ্মণবাড়িয়া' },
      { label: 'চাঁদপুর', value: 'চাঁদপুর' },
    ],
  },
  {
    label: 'রাজশাহী',
    value: 'রাজশাহী',
    districts: [
      { label: 'রাজশাহী', value: 'রাজশাহী' },
      { label: 'বগুড়া', value: 'বগুড়া' },
      { label: 'চাঁপাইনবাবগঞ্জ', value: 'চাঁপাইনবাবগঞ্জ' },
      { label: 'জয়পুরহাট', value: 'জয়পুরহাট' },
      { label: 'নওগাঁ', value: 'নওগাঁ' },
      { label: 'নাটোর', value: 'নাটোর' },
      { label: 'নবাবগঞ্জ', value: 'নবাবগঞ্জ' },
      { label: 'পাবনা', value: 'পাবনা' },
      { label: 'সিরাজগঞ্জ', value: 'সিরাজগঞ্জ' },
    ],
  },
  {
    label: 'খুলনা',
    value: 'খুলনা',
    districts: [
      { label: 'খুলনা', value: 'খুলনা' },
      { label: 'বাগেরহাট', value: 'বাগেরহাট' },
      { label: 'চুয়াডাঙ্গা', value: 'চুয়াডাঙ্গা' },
      { label: 'যশোর', value: 'যশোর' },
      { label: 'ঝিনাইদহ', value: 'ঝিনাইদহ' },
      { label: 'কুষ্টিয়া', value: 'কুষ্টিয়া' },
      { label: 'মাগুরা', value: 'মাগুরা' },
      { label: 'মেহেরপুর', value: 'মেহেরপুর' },
      { label: 'নড়াইল', value: 'নড়াইল' },
      { label: 'সাতক্ষীরা', value: 'সাতক্ষীরা' },
    ],
  },
  {
    label: 'বরিশাল',
    value: 'বরিশাল',
    districts: [
      { label: 'বরিশাল', value: 'বরিশাল' },
      { label: 'ভোলা', value: 'ভোলা' },
      { label: 'ঝালকাঠি', value: 'ঝালকাঠি' },
      { label: 'পটুয়াখালী', value: 'পটুয়াখালী' },
      { label: 'পিরোজপুর', value: 'পিরোজপুর' },
      { label: 'বরগুনা', value: 'বরগুনা' },
    ],
  },
  {
    label: 'সিলেট',
    value: 'সিলেট',
    districts: [
      { label: 'সিলেট', value: 'সিলেট' },
      { label: 'হবিগঞ্জ', value: 'হবিগঞ্জ' },
      { label: 'মৌলভীবাজার', value: 'মৌলভীবাজার' },
      { label: 'সুনামগঞ্জ', value: 'সুনামগঞ্জ' },
    ],
  },
  {
    label: 'রংপুর',
    value: 'রংপুর',
    districts: [
      { label: 'রংপুর', value: 'রংপুর' },
      { label: 'দিনাজপুর', value: 'দিনাজপুর' },
      { label: 'গাইবান্ধা', value: 'গাইবান্ধা' },
      { label: 'কুড়িগ্রাম', value: 'কুড়িগ্রাম' },
      { label: 'লালমনিরহাট', value: 'লালমনিরহাট' },
      { label: 'নীলফামারী', value: 'নীলফামারী' },
      { label: 'পঞ্চগড়', value: 'পঞ্চগড়' },
      { label: 'ঠাকুরগাঁও', value: 'ঠাকুরগাঁও' },
    ],
  },
  {
    label: 'ময়মনসিংহ',
    value: 'ময়মনসিংহ',
    districts: [
      { label: 'ময়মনসিংহ', value: 'ময়মনসিংহ' },
      { label: 'জামালপুর', value: 'জামালপুর' },
      { label: 'নেত্রকোণা', value: 'নেত্রকোণা' },
      { label: 'শেরপুর', value: 'শেরপুর' },
    ],
  },
];

/**
 * Flatten all districts for quick lookup / dropdown.
 */
export const ALL_DISTRICTS = BD_DIVISIONS.flatMap((div) =>
  div.districts.map((d) => ({
    label: `${d.label}, ${div.label}`,
    value: d.value,
    division: div.value,
  }))
);
