import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Vr() {

    const [mainTitle, setMainTitle] = useState('')
    const [socialLinks, setSocialLinks] = useState([])
    const [categories, setCategories] = useState([])
    const [currentCategory, setCurrentCategory] = useState('All')
    const [portfolioData, setPortfolio] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            const result = await axios.get('https://api.atitkharel.com.np/portfolio/atit/')
            setMainTitle(result.data.title);
            setSocialLinks(result.data.social_links);
            setCategories(result.data.main_categories);
            setPortfolio(result.data.portfolio);
            setLoading(false);
        }
        fetchData(); 
    }, [])

    return (
        document.title = mainTitle + ' | XR Portfolio',
        <>
        </>
    )
}

export default Vr