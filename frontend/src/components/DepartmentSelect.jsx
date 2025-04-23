import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';
import { DEPARTMENTS_LIST } from '../constants/departments';

const DepartmentSelect = ({ 
  value, 
  onChange, 
  error, 
  helperText, 
  required = false,
  disabled = false,
  fullWidth = true,
  size = 'medium'
}) => {
  return (
    <FormControl 
      fullWidth={fullWidth} 
      error={error} 
      required={required}
      size={size}
    >
      <InputLabel id="department-select-label">Department</InputLabel>
      <Select
        labelId="department-select-label"
        id="department-select"
        value={value}
        label="Department"
        onChange={onChange}
        disabled={disabled}
      >
        {DEPARTMENTS_LIST.map((department) => (
          <MenuItem key={department} value={department}>
            {department}
          </MenuItem>
        ))}
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default DepartmentSelect;
