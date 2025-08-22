import * as React from 'react'
import styles from './Input.module.css'

import {
    FormControl,
    FormHelperText,
    InputAdornment,
    SvgIconProps,
    IconButton,
    TextField,
} from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'

type InputProps = React.ComponentProps<'input'> & {
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
    name?: string
    value?: string | number
    minLength?: number
    maxLength?: number
    pattern?: string
    id?: string
    variant?: 'outlined' | 'filled' | 'standard'
    height?: number
    type?: 'text' | 'password' | 'email' | 'tel' | 'date' | 'time' | 'datetime-local' | 'search'
    required?: boolean
    placeholder: string
    disabled?: boolean
    label?: string
    error?: string
    validate?: (value: string) => string | undefined
    startIcon?: React.ReactElement<SvgIconProps>
    endIcon?: React.ReactElement<SvgIconProps>
}

const Input = ({
    onChange,
    name,
    value,
    minLength,
    maxLength,
    pattern,
    id,
    variant = 'outlined',
    height = 40,
    type = "text",
    required = false,
    placeholder,
    disabled = false,
    label,
    error,
    validate,
    startIcon,
    endIcon
}: InputProps) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const isPassword: boolean = type === "password"

    const labelText = required ? (label + " *") : label

    const outsideLabel = labelText && variant != 'filled'

    const inputRef = React.useRef<HTMLInputElement>(null)
    const [elementError, setError] = React.useState<string | undefined>(undefined)

    function getCustomErrorMessage(input: HTMLInputElement) {
        if (input.validity.valueMissing) return "Campo obrigatório"
        if (input.validity.typeMismatch) return "Formato inválido"
        if (input.validity.tooShort) return `Mínimo ${input.minLength} caracteres`
        if (input.validity.tooLong) return `Máximo ${input.maxLength} caracteres`
        if (input.validity.patternMismatch) return "Valor inválido"
        return ""
    }

    const handleBlur = () => {
        if (inputRef.current) {
            const customMsg = getCustomErrorMessage(inputRef.current)
            inputRef.current.setCustomValidity(customMsg)
            let validationMsg = customMsg

            if (validate && inputRef.current.value) {
                const customError = validate(inputRef.current.value)
                if (customError) {
                    validationMsg = customError
                    inputRef.current.setCustomValidity(customError)
                }
            }

            if (!inputRef.current.validity.valid) {
                setError(validationMsg)
            } else {
                setError(undefined)
                inputRef.current.setCustomValidity("")
            }
        }
    }

    const displayError = elementError || error
    const hasError = !!displayError

    return (
        <FormControl error={hasError} fullWidth>
            {outsideLabel && (
                <p className={`${styles.label} ${required ? styles.requiredLabel : ''}`}>
                    {labelText}
                </p>
            )}
            <TextField
                onChange={onChange}
                value={value}
                name={name}
                id={id}
                label={outsideLabel ? undefined : labelText}
                variant={variant}
                type={isPassword ? showPassword ? 'text' : 'password' : type}
                required={required}
                placeholder={placeholder}
                disabled={disabled}
                size="small"
                inputRef={inputRef}
                onBlur={handleBlur}
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
                    },
                    htmlInput: {
                        minLength,
                        maxLength,
                        pattern,
                    }
                }}
                error={hasError}
            />
            {hasError &&
                <FormHelperText sx={{ marginLeft: '0.2em' }}>
                    {displayError}
                </FormHelperText>
            }
        </FormControl>
    )
}

export default Input