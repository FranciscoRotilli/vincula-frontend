import * as React from 'react'
import styles from './Input.module.css'
import colors from '@/styles/colors'
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
    variant?: 'outlined' | 'filled' | 'standard'
    height?: number
    type?: string
    placeholder: string
    label?: string
    error?: string
    startIcon?: React.ReactElement<SvgIconProps>
    endIcon?: React.ReactElement<SvgIconProps>
}

const Input = ({
    variant = 'outlined',
    height = 40,
    type = "text",
    placeholder,
    label,
    error,
    startIcon,
    endIcon
}: InputProps) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const isPassword: boolean = type === "password"

    const outsideLabel = label && variant != 'filled'

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
            if (!inputRef.current.validity.valid) {
                setError(customMsg)
            } else {
                setError(undefined)
            }
        }
    }

    const displayError = elementError || error
    const hasError = !!displayError

    return (
        <FormControl error={hasError} fullWidth>
            {outsideLabel && <p className={styles.label}>{label}</p>}
            <TextField
                label={outsideLabel ? undefined : label}
                variant={variant}
                type={isPassword ? showPassword ? 'text' : 'password' : type}
                placeholder={placeholder}
                size="small"
                inputRef={inputRef}
                onBlur={handleBlur}
                slotProps={{
                    input: {
                        sx: {height: height},
                        startAdornment: startIcon ? (
                            <InputAdornment position="start">
                                {startIcon}
                            </InputAdornment>
                        ) : undefined,
                        endAdornment: isPassword ? (
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={() => setShowPassword((v) => !v)}
                                    edge="end"
                                >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        ) : (
                            endIcon ? (
                                <InputAdornment position="end">
                                    {endIcon}
                                </InputAdornment>
                            ) : undefined
                        ),
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