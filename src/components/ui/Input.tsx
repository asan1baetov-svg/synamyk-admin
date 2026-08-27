import { TextField, TextFieldProps } from '@mui/material'

export function Input(props: TextFieldProps) {
  return (
    <TextField
      {...props}
      variant="outlined"
      size="small"
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: '8px',
          '& fieldset': {
            borderColor: '#edf0f5',
          },
          '&:hover fieldset': {
            borderColor: '#e8ecf0',
          },
          '&.Mui-focused fieldset': {
            borderColor: '#3b6ff0',
          },
        },
      }}
    />
  )
}
