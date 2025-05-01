// School and department mappings
export const SCHOOLS = {
<<<<<<< HEAD
    COMPUTING: 'School of Computing',
    BUSINESS: 'School of Business and Economics',
    HEALTH: 'School of Health Science'
  };
  
  // Department mappings for each school
  export const SCHOOL_DEPARTMENTS = {
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
    ]
  };
  
  export const SCHOOLS_LIST = Object.values(SCHOOLS);
  
  // Get all departments across all schools
  export const ALL_DEPARTMENTS = Object.values(SCHOOL_DEPARTMENTS).flat();
  
  // Get departments for a specific school
  export const getDepartmentsBySchool = (school) => {
    return SCHOOL_DEPARTMENTS[school] || [];
  };
=======
  COMPUTING: 'School of Computing',
  BUSINESS: 'School of Business and Economics',
  HEALTH: 'School of Health Science'
};

// Department mappings for each school
export const SCHOOL_DEPARTMENTS = {
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
  ]
};

export const SCHOOLS_LIST = Object.values(SCHOOLS);

// Get all departments across all schools
export const ALL_DEPARTMENTS = Object.values(SCHOOL_DEPARTMENTS).flat();

// Get departments for a specific school
export const getDepartmentsBySchool = (school) => {
  return SCHOOL_DEPARTMENTS[school] || [];
};
>>>>>>> f15bed754d3a8305297a0a8e123271476d9d8394
