import * as React from 'react'
import styles from './Input.module.css'

import {
    FormControl,
    FormHelperText,
    InputAdornment,
    SvgIconProps,
    IconButton,
    TextField,
    TextFieldProps,
} from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'

type InputProps = Omit<TextFieldProps, 'error'> & {
    type?: 'text' | 'password' | 'email' | 'tel' | 'date' | 'time' | 'datetime-local' | 'search'
    variant?: 'outlined' | 'filled' | 'standard'
    height?: number
    error?: string
    placeholder: string
    label?: string
    startIcon?: React.ReactElement<SvgIconProps>
    endIcon?: React.ReactElement<SvgIconProps>
}

const Input = React.forwardRef<HTMLDivElement, InputProps>(({
    type = "text",
    variant = "outlined",
    height,
    label,
    required,
    error,
    startIcon,
    endIcon,
    ...rest
}, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const isPassword: boolean = type === "password"

    const labelText = required && variant != 'filled' ? (label + " *") : label
    const outsideLabel = labelText && variant != 'filled'

    const hasError = !!error

    return (
        <FormControl error={hasError} fullWidth>
            {outsideLabel && (
                <label htmlFor={rest.id} className={`${styles.label} ${required ? styles.requiredLabel : ''}`}>
                    {labelText}
                </label>
            )}
            <TextField
                {...rest}
                ref={ref}
                size='small'
                fullWidth
                variant={variant}
                label={labelText && !outsideLabel ? labelText : undefined}
                type={isPassword ? (showPassword ? 'text' : 'password') : type}
                required={required}
                error={hasError}
                slotProps={{
                    input: {
                        sx: { height: height },
                        startAdornment: startIcon ? (
                            <InputAdornment position="start" sx={{ color: 'rgba(176, 176, 176, 0.8)' }}>
                                {startIcon}
                            </InputAdornment>
                        ) : undefined,
                        endAdornment: isPassword ? (
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={() => setShowPassword((v) => !v)}
                                    edge="end"
                                    sx={{ color: 'rgba(176, 176, 176, 0.8)' }}
                                >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        ) : (
                            endIcon ? (
                                <InputAdornment position="end" sx={{ color: 'rgba(176, 176, 176, 0.8)' }}>
                                    {endIcon}
                                </InputAdornment>
                            ) : undefined
                        ),
                    }
                }}
            />
            {hasError &&
                <FormHelperText sx={{ marginLeft: '0.2em' }}>
                    {error}
                </FormHelperText>
            }
        </FormControl>
    )
})

export default Input