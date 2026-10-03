const bdGeo = require('bangladesh-districts-upazilas');

/**
 * Bangladesh Divisions, Districts and Upazilas for donor location filtering.
 */

export interface Upazila {
  labelEn: string;
  labelBn: string;
  value: string;
}

export interface District {
  labelEn: string;
  labelBn: string;
  value: string;
  upazilas: Upazila[];
}

export interface Division {
  labelEn: string;
  labelBn: string;
  value: string;
  districts: District[];
}

const allDivisions = bdGeo.getAllDivisions();

export const BD_DIVISIONS: Division[] = allDivisions.map((div: any) => {
  const districtsData = bdGeo.getDistrictsByDivision(div.name);
  const districts = districtsData.map((d: any) => {
    const upazilasData = bdGeo.getUpazilasByDistrict(d.name);
    return {
      labelEn: d.name,
      labelBn: d.banglaName || d.name,
      value: d.name,
      upazilas: upazilasData.map((u: any) => ({
        labelEn: u.name,
        labelBn: u.banglaName || u.name,
        value: u.name,
      })).sort((a: any, b: any) => a.labelEn.localeCompare(b.labelEn)),
    };
  }).sort((a: any, b: any) => a.labelEn.localeCompare(b.labelEn));
  
  return {
    labelEn: div.name,
    labelBn: div.banglaName || div.name,
    value: div.name,
    districts,
  };
});

/**
 * Helper to get label based on locale
 */
export const getLocaleLabel = (locale: string, item: { labelEn: string; labelBn: string }) => {
  return locale === 'en' ? item.labelEn : item.labelBn;
};
