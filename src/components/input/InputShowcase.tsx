'use client'
import React from 'react'

import Input from './Input'
import { Person } from '@mui/icons-material'

const InputShowcase = () => (
    <div style={{ background: "#fff", padding: 20 }}>
        <Input 
        height = {40} // Optional (default: 40), number
        type = "text" // Optional (defalut: "text"), HTML type as string
        placeholder = "Placeholder" // Mandatory, string
        label = "Label" // Optional, string
        hasError = {false} // Optional (default: false), boolean
        startIcon = {<Person />} // Optional, icon element https://mui.com/material-ui/material-icons/
        endIcon = {undefined} // // Optional, icon element
        />
    </div>
)

export default InputShowcase