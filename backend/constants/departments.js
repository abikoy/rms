const { SCHOOLS, SCHOOL_DEPARTMENTS } = require('./schools');

// Get all departments across all schools
const DEPARTMENTS_LIST = Object.values(SCHOOL_DEPARTMENTS).flat();

// Get departments for a specific school
const getDepartmentsBySchool = (school) => {
  return SCHOOL_DEPARTMENTS[school] || [];
};

// Validate if a department belongs to a school
const isDepartmentInSchool = (department, school) => {
  const schoolDepartments = SCHOOL_DEPARTMENTS[school] || [];
  return schoolDepartments.includes(department);
};

module.exports = {
  DEPARTMENTS_LIST,
  getDepartmentsBySchool,
  isDepartmentInSchool
};
