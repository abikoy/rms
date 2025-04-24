import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';
import { SCHOOLS_LIST } from '../constants/schools';

const SchoolSelect = ({ 
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
      <InputLabel id="school-select-label">School</InputLabel>
      <Select
        labelId="school-select-label"
        id="school-select"
        value={value}
        label="School"
        onChange={onChange}
        disabled={disabled}
      >
        {SCHOOLS_LIST.map((school) => (
          <MenuItem key={school} value={school}>
            {school}
          </MenuItem>
        ))}
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default SchoolSelect;
