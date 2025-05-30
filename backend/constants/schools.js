// Import this file instead of hardcoding school values
// School and department mappings
const SCHOOLS = {
  COMPUTING: 'School of Computing',
  BUSINESS: 'School of Business and Economics',
  HEALTH: 'School of Health Science',
  ELECTRICAL: 'School of Computer and Electrical Engineering',
  CIVIL: 'School of Civil and COTM',
  NATURAL: 'School of Natural Science',
  SOCIAL: 'School of Social Science',
};

// Department mappings for each school
const SCHOOL_DEPARTMENTS = {
  [SCHOOLS.COMPUTING]: [
    'Software Engineering',
    'Computer Science',
    'Information Technology'
  ],
  [SCHOOLS.BUSINESS]: [
    'Economics',
    'Business'
  ],
  [SCHOOLS.HEALTH]: [
    'Midwifery',
    'Medical Laboratory',
    'Nursing',
    'Psychiatrist'
  ],
  [SCHOOLS.ELECTRICAL]: [
    'Electrical Engineering',
    'Computer Engineering'
    
  ],
  [SCHOOLS.CIVIL]: [
    'Civil Engineering',
    'COTM Engineering'
    
  ],
  [SCHOOLS.NATURAL]: [
    'Physics',
    'Biology',
    'Chemistry'
    
  ],
  [SCHOOLS.SOCIAL]: [
    'History',
    'Psychology',
    'Logistics'
    
  ]

};

const SCHOOLS_LIST = Object.values(SCHOOLS);

module.exports = {
  SCHOOLS,
  SCHOOLS_LIST,
  SCHOOL_DEPARTMENTS
};
