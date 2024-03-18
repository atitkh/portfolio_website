import React, { useEffect, useState } from 'react';
import './home.css';
import { Gallery, GalleryModal, LoadingScreen } from '../../components';
import axios from 'axios';
import { GitHub, LinkedIn, Language } from "@mui/icons-material"
import { Button, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useParams } from 'react-router-dom';

function Home() {
    const { id } = useParams();

    const [opened, { open, close }] = useDisclosure(false);
    const [currentItem, setCurrentItem] = useState({});

    const [mainTitle, setMainTitle] = useState('')
    const [socialLinks, setSocialLinks] = useState([])
    const [categories, setCategories] = useState([])
    const [currentCategory, setCurrentCategory] = useState('All')
    const [portfolioData, setPortfolio] = useState([])
    const [loading, setLoading] = useState(true)

    const handleCloseModal = () => {
        close();
        setCurrentItem({});
    };

    const handleOpenModal = (item) => {
        open();
        setCurrentItem(item);
    };

    useEffect(() => {
        const fetchData = async () => {
            const result = await axios.get('https://api.atitkharel.com.np/portfolio/atit/')
            setMainTitle(result.data.title);
            setSocialLinks(result.data.social_links);
            setCategories(result.data.main_categories);
            setPortfolio(result.data.portfolio);

            if (id && result.data.portfolio) {
                handleOpenModal(result.data.portfolio[id]);
                // console.warn(id);
            }

            setLoading(false);
        }
        fetchData();
    }, [])

    if (loading) {
        return (
            <LoadingScreen />
        );
    }
    else {
        return (
            // set page title
            document.title = mainTitle + ' | Portfolio Website',

            // main page
            <div className='home'>
                <GalleryModal
                    item={currentItem}
                    lensID={currentItem.lensID}
                    opened={opened}
                    onClose={handleCloseModal}

                    image={currentItem.image}
                    video={currentItem.video}
                    title={currentItem.title}
                    date={currentItem.date}
                    description={currentItem.description}
                    categories={currentItem.categories}
                    projectLink={currentItem.projectLink}
                />

                <div className="home_head">
                    <div className="home_head_name">
                        <h1>{mainTitle}</h1>
                    </div>
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
                <div className="home_categories">
                    {categories.map((item, index) => (
                        <div><p onClick={() => setCurrentCategory(item)} className={currentCategory === item ? 'active' : 'inactive'}>{item}</p></div>
                    ))}
                </div>
                <div className='home_gallery'>
                    {portfolioData.map((item, index) => (
                        <>{currentCategory === "All" ? <div onClick={() => handleOpenModal(item)}><Gallery key={item.id} lensID={item.lensID} image={item.image} video={item.video} title={item.title} description={item.description} projectLink={item.projectLink} categories={item.categories} date={item.date} /></div> : null}
                            {(item.mainCategory).includes(currentCategory) ? <div onClick={() => handleOpenModal(item)}><Gallery key={item.id} lensID={item.lensID} image={item.image} video={item.video} title={item.title} description={item.description} projectLink={item.projectLink} categories={item.categories} date={item.date} /></div> : null}</>
                    ))}
                </div>
                <div className="home_footer">
                    <a href="https://kerkarcreations.com/" target="_blank" rel="noreferrer">
                        <p>©  {new Date().getFullYear()}   Kerkar Creations</p>
                    </a>
                </div>
            </div>
        );
    }
}

export default Home;