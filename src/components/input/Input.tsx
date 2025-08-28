'use client'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import {
    FormControl,
    FormHelperText,
    IconButton,
    InputAdornment,
    SvgIconProps,
    TextField,
    TextFieldProps,
} from '@mui/material'
import { 
    ChangeEvent, 
    forwardRef, 
    ReactElement, 
    useEffect, 
    useState} from 'react'

import styles from './Input.module.css'

type InputProps = Omit<TextFieldProps, 'error'> & {
    type?: 'text' | 'password' | 'email' | 'tel' | 'date' | 'time' | 'datetime-local' | 'search'
    variant?: 'outlined' | 'filled' | 'standard'
    height?: number
    error?: string
    placeholder: string
    label?: string
    startIcon?: ReactElement<SvgIconProps>
    endIcon?: ReactElement<SvgIconProps>
    onChange?: (event: ChangeEvent<HTMLInputElement>) => void
    value?: string
}

const Input = forwardRef<HTMLDivElement, InputProps>(({
    type = "text",
    variant = "outlined",
    height,
    label,
    required,
    error,
    startIcon,
    endIcon,
    onChange,
    value,
    ...rest
}, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const isPassword: boolean = type === "password"

    const labelText = required && variant != 'filled' ? (label + " *") : label
    const outsideLabel = labelText && variant != 'filled'

    const hasError = !!error

    const [hasValue, setHasValue] = useState(!!value && value.toString().length > 0)
    const iconColor = hasValue ? "var(--text-color-primary)" : "var(--text-color-secundary)"

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        setHasValue(event.target.value.length > 0)
        if (onChange) onChange(event)
    }

    useEffect(() => {
        setHasValue(!!value && value.toString().length > 0)
    }, [value])

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
                onChange={handleChange}
                value={value}
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
                            <InputAdornment position="start" sx={{ color: iconColor }}>
                                {startIcon}
                            </InputAdornment>
                        ) : undefined,
                        endAdornment: isPassword ? (
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={() => setShowPassword((v) => !v)}
                                    edge="end"
                                    sx={{ color: iconColor }}
                                >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        ) : (
                            endIcon ? (
                                <InputAdornment position="end" sx={{ color: iconColor }}>
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

Input.displayName = 'Input';

export default Input