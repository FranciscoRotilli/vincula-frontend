'use client'
import React from 'react'

import Input from './Input'
import { CalendarMonth, DateRange, Lock, Person } from '@mui/icons-material'

const InputShowcase = () => (
    <div style={{ background: "#fff", padding: 20, width: 300 }}>
        <Input 
        variant = 'outlined' //Optional (default: outlined), 'outlined' | 'filled' | 'standard'
        height = {40} // Optional (default: 40), number
        type = "text" // Optional (defalut: "text"), HTML type as string
        placeholder = "Placeholder" // Mandatory, string
        label = "Label" // Optional, string
        //error = "Error message" // Optional, string
        //startIcon = {<CalendarMonth />} // Optional, icon element https://mui.com/material-ui/material-icons/
        //endIcon = {<CalendarMonth />} // // Optional, icon element
        />
    </div>
)

export default InputShowcase