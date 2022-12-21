import { React, useEffect, useState } from 'react';
import { NavLink } from "react-router-dom";
import './home.css';
import { Gallery } from '../../components';
import axios from 'axios';
import { GitHub, LinkedIn } from "@mui/icons-material"

function Home() {
    
    const [portfolioData, setPortfolio] = useState([]) 
    const [categories, setCategories] = useState([])
    const [socialLinks, setSocialLinks] = useState([]) 
    const [currentCategory, setCurrentCategory] = useState('All')

    useEffect(() => {
        const fetchData = async () => {
            const result = await axios.get('https://api.atitkharel.com.np/portfolio/ashlesha/')
            setPortfolio(result.data.portfolio);
            setCategories(result.data.main_categories);
            setSocialLinks(result.data.social_links);
        }
        fetchData();
    }, [])

    return (
        <div className='home'>
            <div className="home_head">
                <div className="home_head_name">
                    <h1>ASHLESHA MALLA</h1>    
                </div>
                <div className="home_head_links">
                    <a href={socialLinks.github} target="_blank" rel="noreferrer"><h1><GitHub fontSize='large' /></h1></a>
                    <a href={socialLinks.linkedin} target="_blank" rel="noreferrer"><h1><LinkedIn fontSize='large' /></h1></a>
                </div>
            </div>
            <div className="home_categories">
                {categories.map((item, index) => (
                    <div className={currentCategory === item ? 'active' : 'inactive'}><h1 onClick={() => setCurrentCategory(item) }>{item}</h1></div>
                ))}
            </div>
            <div className='home_gallery'>
                {portfolioData.map((item, index) => (
                    <>{currentCategory === "All" ? <div><Gallery key={item.id} image={item.image} video={item.video} title={item.title} description={item.description} gitLink={item.gitLink} categories={item.categories} date={item.date} /></div> : null}
                    {currentCategory === item.mainCategory ? <div><Gallery key={item.id} image={item.image} video={item.video} title={item.title} description={item.description} gitLink={item.gitLink} categories={item.categories} date={item.date} /></div> : null}</>
                ))}
            </div>
        </div>
    );
}

export default Home;