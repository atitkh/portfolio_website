import { React, useEffect, useState } from 'react';
import './home.css';
import './loader.css'
import { Gallery } from '../../components';
import axios from 'axios';
import { GitHub, LinkedIn, Language } from "@mui/icons-material"

function Home() {
    
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

    if (loading) {
        return (
            <div className="loader-container">
                <div class="wrapper">
                    <span class="circle circle-1"></span>
                    <span class="circle circle-2"></span>
                    <span class="circle circle-3"></span>
                    <span class="circle circle-4"></span>
                    <span class="circle circle-5"></span>
                    <span class="circle circle-6"></span>
                    <span class="circle circle-7"></span>
                    <span class="circle circle-8"></span>
                </div>
            </div>
        );
    }
    else {
        return (
            <div className='home'>
                <div className="home_head">
                    <div className="home_head_name">
                        <h1>{mainTitle}</h1>
                    </div>
                    <div className="home_head_links">
                        <a href={socialLinks.github} target="_blank" rel="noreferrer"><h1><GitHub fontSize='large' /></h1></a>
                        <a href={socialLinks.linkedin} target="_blank" rel="noreferrer"><h1><LinkedIn fontSize='large' /></h1></a>
                        <a href={socialLinks.website} target="_blank" rel="noreferrer"><h1><Language fontSize='large' /></h1></a>
                    </div>
                </div>
                <div className="home_categories">
                    {categories.map((item, index) => (
                        <div><p onClick={() => setCurrentCategory(item) } className={currentCategory === item ? 'active' : 'inactive'}>{item}</p></div>
                    ))}
                </div>
                <div className='home_gallery'>
                    {portfolioData.map((item, index) => (
                        <>{currentCategory === "All" ? <div><Gallery key={item.id} image={item.image} video={item.video} title={item.title} description={item.description} projectLink={item.projectLink} categories={item.categories} date={item.date} /></div> : null}
                        {(item.mainCategory).includes(currentCategory) ? <div><Gallery key={item.id} image={item.image} video={item.video} title={item.title} description={item.description} projectLink={item.projectLink} categories={item.categories} date={item.date} /></div> : null}</>
                    ))}
                </div>
            </div>
        );
    }
}

export default Home;