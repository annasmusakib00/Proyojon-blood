import bdGeo from 'bangladesh-districts-upazilas';

/**
 * Bangladesh Divisions, Districts and Upazilas for donor location filtering.
 */

export interface District {
  label: string;
  value: string;
  upazilas: string[];
}

export interface Division {
  label: string;
  value: string;
  districts: District[];
}

const allDivisions = bdGeo.getAllDivisions();

export const BD_DIVISIONS: Division[] = allDivisions.map((div: any) => {
  const districtsData = bdGeo.getDistrictsByDivision(div.name);
  const districts = districtsData.map((d: any) => {
    const upazilasData = bdGeo.getUpazilasByDistrict(d.name);
    return {
      label: d.name,
      value: d.name,
      upazilas: upazilasData.map((u: any) => u.name),
    };
  });
  
  return {
    label: div.name,
    value: div.name,
    districts,
  };
});

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
