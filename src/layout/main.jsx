import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { GitHub, LinkedIn, Language } from "@mui/icons-material"
import { Button } from '@mantine/core';
import { LoadingScreen } from '../components';
import { redirect } from 'react-router-dom';

const DataContext = React.createContext();

const MainLayout = ({ children }) => {
    const [mainTitle, setMainTitle] = useState('');
    const [socialLinks, setSocialLinks] = useState({});
    const [allPortfolioData, setAllPortfolioData] = useState();
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            axios.get('https://api.atitkharel.com.np/portfolio/atit/').then((result) => {

                setMainTitle(result.data.title);
                setSocialLinks(result.data.social_links);
                setAllPortfolioData(result);

                setLoading(false);
            }).catch((error) => {
                setError(true);
                setLoading(false);
            });
        }
        fetchData();
    }, [])

    return (
        // set page title
        document.title = mainTitle + ' | Portfolio Website',

        loading ? <LoadingScreen /> :
            <div>
                <header>
                    <div className="home_head">
                        <a href="/" style={{ textDecoration: 'none' }}>
                            <div className="home_head_name">
                                <h1>{mainTitle}</h1>
                            </div>
                        </a>
                        <div className="home_head_links">
                            {/* <Tooltip label="Coming Soon" withArrow> */}
                            <Button
                                variant="outline"
                                style={{ marginRight: '1rem' }}
                                onClick={() => window.location.href = '/vr'}
                            >
                                VIEW IN VR
                            </Button>
                            {/* </Tooltip> */}
                            <a href={socialLinks.github} target="_blank" rel="noreferrer"><h1><GitHub fontSize='large' /></h1></a>
                            <a href={socialLinks.linkedin} target="_blank" rel="noreferrer"><h1><LinkedIn fontSize='large' /></h1></a>
                            <a href={socialLinks.website} target="_blank" rel="noreferrer"><h1><Language fontSize='large' /></h1></a>
                        </div>
                    </div>
                </header>
                <main>
                    <DataContext.Provider value={{ allPortfolioData }}>
                        {children}
                    </DataContext.Provider>
                </main>
                <footer>
                    <div className="home_footer">
                        <a href="https://kerkarcreations.com/" target="_blank" rel="noreferrer">
                            <p>©  {new Date().getFullYear()}   Kerkar Creations</p>
                        </a>
                    </div>
                </footer>
            </div>
    );
};
export { DataContext, MainLayout };