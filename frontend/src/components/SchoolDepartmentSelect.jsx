import React, { useState, useEffect } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Grid
} from '@mui/material';
import { SCHOOLS_LIST, getDepartmentsBySchool } from '../constants/schools';

// Roles that don't need school/department selection
const ROLES_WITHOUT_ORG_UNITS = [
  'system_admin',
  'ddu_asset_manager',
  'iot_asset_manager',
  'technical_team'
];

const SchoolDepartmentSelect = ({
  role,
  school,
  department,
  onSchoolChange,
  onDepartmentChange,
  error,
  helperText,
  required = false,
  disabled = false,
  fullWidth = true,
  size = 'medium'
}) => {
  const [availableDepartments, setAvailableDepartments] = useState([]);
  const isSchoolDean = role === 'school_dean';
  const shouldShowOrgUnits = !ROLES_WITHOUT_ORG_UNITS.includes(role);

  useEffect(() => {
    if (school) {
      setAvailableDepartments(getDepartmentsBySchool(school));
    } else {
      setAvailableDepartments([]);
    }
  }, [school]);

  if (!shouldShowOrgUnits) {
    return null;
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <FormControl 
          fullWidth={fullWidth} 
          error={error} 
          required={required}
          size={size}
          disabled={disabled}
        >
          <InputLabel id="school-select-label">School</InputLabel>
          <Select
            labelId="school-select-label"
            id="school-select"
            value={school || ''}
            label="School"
            onChange={(e) => onSchoolChange(e.target.value)}
          >
            {SCHOOLS_LIST.map((schoolName) => (
              <MenuItem key={schoolName} value={schoolName}>
                {schoolName}
              </MenuItem>
            ))}
          </Select>
          {helperText && <FormHelperText>{helperText}</FormHelperText>}
        </FormControl>
      </Grid>

      {!isSchoolDean && (
        <Grid item xs={12}>
          <FormControl 
            fullWidth={fullWidth} 
            error={error} 
            required={required}
            size={size}
            disabled={!school || disabled}
          >
            <InputLabel id="department-select-label">Department</InputLabel>
            <Select
              labelId="department-select-label"
              id="department-select"
              value={department || ''}
              label="Department"
              onChange={(e) => onDepartmentChange(e.target.value)}
            >
              {!school && (
                <MenuItem disabled value="">
                  Select a School first
                </MenuItem>
              )}
              {availableDepartments.map((dept) => (
                <MenuItem key={dept} value={dept}>
                  {dept}
                </MenuItem>
              ))}
            </Select>
            {helperText && <FormHelperText>{helperText}</FormHelperText>}
          </FormControl>
        </Grid>
      )}
    </Grid>
  );
};

export default SchoolDepartmentSelect;
