const bdGeo = require('bangladesh-districts-upazilas');

export const locationSynonyms: Record<string, string[]> = {
  dhaka: ['dhaka', 'daka', 'ঢাকা'],
  chattogram: ['chattogram', 'chittagong', 'ctg', 'চট্টগ্রাম', 'চট্রগ্রাম'],
  rajshahi: ['rajshahi', 'রাজশাহী'],
  khulna: ['khulna', 'খুলনা'],
  barishal: ['barishal', 'barisal', 'বরিশাল'],
  sylhet: ['sylhet', 'silet', 'সিলেট'],
  rangpur: ['rangpur', 'রংপুর'],
  mymensingh: ['mymensingh', 'ময়মনসিংহ', 'ময়মনসিংহ'],
  mirpur: ['mirpur', 'মিরপুর'],
  uttara: ['uttara', 'উত্তরা'],
  gulshan: ['gulshan', 'গুলশান'],
  banani: ['banani', 'বনানী'],
  dhanmondi: ['dhanmondi', 'ধানমন্ডি', 'ধানমন্ডী'],
  mohammadpur: ['mohammadpur', 'মোহাম্মদপুর'],
  savar: ['savar', 'সাভার'],
  gazipur: ['gazipur', 'গাজীপুর'],
  narayanganj: ['narayanganj', 'নারায়ণগঞ্জ', 'নারায়নগঞ্জ'],
  comilla: ['comilla', 'cumilla', 'কুমিল্লা'],
  bogura: ['bogura', 'bogra', 'বগুড়া', 'বগুরা'],
  tangail: ['tangail', 'টাঙ্গাইল'],
  faridpur: ['faridpur', 'ফরিদপুর'],
  jashore: ['jashore', 'jessore', 'যশোর'],
  pabna: ['pabna', 'পাবনা'],
  dinajpur: ['dinajpur', 'দিনাজপুর'],
  coxsbazar: ['coxsbazar', 'coxs bazar', 'কক্সবাজার', 'কক্স বাজার'],
  feni: ['feni', 'ফেনী', 'ফেনি'],
  noakhali: ['noakhali', 'নোয়াখালী', 'নোয়াখালি'],
};

export function expandSearchTerm(term: string): string[] {
  const normalizedTerm = term.trim().toLowerCase();
  
  // Create an array to hold all variations to search for
  let variations = new Set<string>();
  variations.add(normalizedTerm);
  variations.add(term.trim()); // Original case
  
  try {
    const upa = bdGeo.getUpazilaByBanglaName(term.trim());
    if (upa) variations.add(upa.name);
    
    const dist = bdGeo.getDistrictByBanglaName(term.trim());
    if (dist) variations.add(dist.name);
    
    const div = bdGeo.getDivisionByName(term.trim());
    if (div) variations.add(div.name);

    const upaSearch = bdGeo.searchUpazilas(term.trim());
    if (upaSearch && upaSearch.length > 0) {
      upaSearch.forEach((u: any) => variations.add(u.name));
    }

    const distSearch = bdGeo.searchDistricts(term.trim());
    if (distSearch && distSearch.length > 0) {
      distSearch.forEach((d: any) => variations.add(d.name));
    }
  } catch(e) {
    console.error('Error matching bdGeo:', e);
  }
  
  // Check if any of our mapped synonyms match
  for (const [key, synonyms] of Object.entries(locationSynonyms)) {
    if (synonyms.some(s => s.toLowerCase() === normalizedTerm || normalizedTerm.includes(s.toLowerCase()))) {
      synonyms.forEach(s => variations.add(s));
    }
  }

  return Array.from(variations);
}
