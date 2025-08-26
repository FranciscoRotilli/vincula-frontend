'use client'
import { CalendarMonth, Person, Search } from '@mui/icons-material'
import React from 'react'

import Input from './Input'

const InputShowcase = () => {

    const [value, setValue] = React.useState("Value")

    return (
        <div style={{ 
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            padding: '20px',
            backgroundColor: '#ffffff'
        }}>
            <div style={{ background: "#fff", padding: 20, width: 350, flexShrink: 0 }}>
                <Input 
                    onChange = {e => setValue(e.target.value)} // Optional, function
                    value = {value} // Can't be used without useState
                    name = "Name" // Optional, string
                    id = "id-input" // Optional, string
                    variant = 'outlined' // Optional (default: outlined), 'outlined' | 'filled' | 'standard'
                    //height = {40} // Optional (default: 40/small), number
                    type = "text" // Optional (defalut: "text"), 'text' | 'password' | 'email' | 'tel' | 'date' | 'time' | 'datetime-local' | 'search'
                    //required = {true} // Optional (default: false), boolean
                    placeholder = "Placeholder" // Mandatory, string
                    //disabled = {false} // Optional (default: false), boolean
                    label = "Label" // Optional, string
                    //error = "Error message" // Optional, string
                    startIcon = {<CalendarMonth />} // Optional, icon element https://mui.com/material-ui/material-icons/
                    //endIcon = {<CalendarMonth />} // // Optional, icon element https://mui.com/material-ui/material-icons/
                />
            </div>
            <div style={{ background: "#fff", padding: 20, width: 350, flexShrink: 0 }}>
                <Input 
                    placeholder = "Placeholder"
                    label = "Label"
                    error = "Error message"
                />
            </div>
            <div style={{ background: "#fff", padding: 20, width: 350, flexShrink: 0 }}>
                <Input 
                    placeholder = "Placeholder"
                    label = "Label"
                    error = " "
                    startIcon={<Search />}
                />
            </div>
            <div style={{ background: "#fff", padding: 20, width: 350, flexShrink: 0 }}>
                <Input 
                    placeholder = "Insira o usuário"
                    label = "Usuário"
                    required
                    startIcon={<Person />}
                />
            </div>
            <div style={{ background: "#fff", padding: 20, width: 350, flexShrink: 0 }}>
                <Input 
                    placeholder = "Insira a senha"
                    label = "Senha"
                    required
                    type='password'
                    startIcon={<Person />}
                />
            </div>
            <div style={{ background: "#fff", padding: 20, width: 350, flexShrink: 0 }}>
                <Input 
                    placeholder = "Insira o usuário"
                    label = "Usuário"
                    error="Usuário ou senha inválido."
                    required
                    startIcon={<Person />}
                />
            </div>
            <div style={{ background: "#fff", padding: 20, width: 350, flexShrink: 0 }}>
                <Input 
                    placeholder = "Insira a senha"
                    label = "Senha"
                    error="Usuário ou senha inválido."
                    required
                    type='password'
                    startIcon={<Person />}
                />
            </div>
            <div style={{ background: "#fff", padding: 20, width: 350, flexShrink: 0 }}>
                <Input 
                    variant="standard"
                    placeholder = "Insira o usuário"
                    label = "Usuário"
                    required
                    startIcon={<Person />}
                />
            </div>
            <div style={{ background: "#fff", padding: 20, width: 350, flexShrink: 0 }}>
                <Input 
                    variant="filled"
                    placeholder = "Insira a senha"
                    label = "Senha"
                    type='password'
                    required
                    startIcon={<Person />}
                />
            </div>
            <div style={{ background: "#fff", padding: 20, width: 350, flexShrink: 0 }}>
                <Input 
                    placeholder = "Placeholder"
                />
            </div>
        </div>
    )
}

export default InputShowcase