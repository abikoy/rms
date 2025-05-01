import { SCHOOLS } from '../constants/schools';

export const getAssetManagerSchools = (role) => {
  switch (role) {
    case 'iot_asset_manager':
      return [SCHOOLS.COMPUTING];
    case 'ddu_asset_manager':
      return [SCHOOLS.BUSINESS, SCHOOLS.HEALTH];
    default:
      return [];
  }
};

export const isRequestForAssetManager = (request, role) => {
  const allowedSchools = getAssetManagerSchools(role);
  return allowedSchools.includes(request.school);
};
