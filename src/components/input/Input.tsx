import * as React from 'react'
import styles from './Input.module.css'
import {
    OutlinedInput,
    FormControl,
    FormHelperText,
    InputAdornment,
    SvgIconProps,
    IconButton,
    OutlinedInputProps
} from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'

type InputProps = React.ComponentProps<'input'> & {
    size?: number
    type?: React.HTMLAttributes<InputProps>
    placeholder: string
    label?: string
    hasError?: boolean
    startIcon?: React.ReactElement<SvgIconProps>
    endIcon?: React.ReactElement<SvgIconProps>
}

const Input = ({
    size = 40,
    type = "text",
    placeholder,
    label,
    hasError = false,
    startIcon,
    endIcon
}: InputProps) => {
    const [showPassword, setShowPassword] = React.useState(false)

    const isPassword = type === "password"

    return (
        <FormControl error={hasError} variant="outlined" fullWidth>
            {label && <p className={styles.label}>{label}</p>}
            <OutlinedInput
                sx={{
                    height: size
                }}
                type={isPassword && !showPassword ? "password" : "text"}
                placeholder={placeholder}
                size="small"
                startAdornment={startIcon &&
                    <InputAdornment position='start'>
                        {startIcon}
                    </InputAdornment>
                }
                endAdornment={
                    isPassword ? (
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
                        endIcon && <InputAdornment position="end">{endIcon}</InputAdornment>
                    )
                }
            />
            {hasError &&
                <FormHelperText sx={{ marginLeft: '0.2em' }}>
                    Error
                </FormHelperText>
            }
        </FormControl>
    )
}

export default Input