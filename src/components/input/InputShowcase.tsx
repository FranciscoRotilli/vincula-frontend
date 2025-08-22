'use client'
import React from 'react'

import Input from './Input'
import { Visibility } from '@mui/icons-material'

const InputShowcase = () => (
    <div style={{ background: "#fff", padding: 20 }}>
        <Input type="password" placeholder={"Placeholder"} />
    </div>
)

export default InputShowcase