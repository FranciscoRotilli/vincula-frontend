'use client';

import Box from '@mui/material/Box';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';

const theme = createTheme({
    palette: {
        primary: {
            main: '#ff8200',
        },
    },
});



const CaseTabs = ({ caseId }: { caseId: string }) => {
    const pathname = usePathname();
    const router = useRouter();

    const pathToTab = {
        [`/casos/${caseId}`]: 0,
        [`/casos/${caseId}/vinculos`]: 1,
        [`/casos/${caseId}/visualizacao`]: 2,
    };

    const currentTab = pathToTab[pathname as keyof typeof pathToTab] ?? 0;

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        const newPath = Object.keys(pathToTab).find(
            (path) => pathToTab[path as keyof typeof pathToTab] === newValue
        );
        if (newPath) {
            router.push(newPath);
        }
    };


    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs
                    value={currentTab}
                    onChange={handleChange}
                    aria-label='abas de navegação de caso'
                    data-testid='tabs-component'

                >
                    <Tab label="Informações gerais" id="tab-0" data-testid="tab-general-info" />
                    <Tab label="Vínculos" id="tab-1" data-testid="tab-vinculos" />
                    <Tab label="Visualização dos dados" id="tab-2" data-testid="tab-visualizacao" />
                </Tabs>
            </Box>
        </ThemeProvider>
    );
};

export default CaseTabs;