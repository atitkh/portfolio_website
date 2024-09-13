import React, { useEffect, useState } from 'react';
import './home.css';
import { Gallery, GalleryModal, LoadingScreen } from '../../components';
import { useDisclosure } from '@mantine/hooks';
import { useParams } from 'react-router-dom';

import { DataContext } from '../../layout/main';

function Home() {
    const { id } = useParams();

    const [opened, { open, close }] = useDisclosure(false);
    const [currentItem, setCurrentItem] = useState({});

    const [categories, setCategories] = useState([])
    const [currentCategory, setCurrentCategory] = useState('All')
    const [portfolioData, setPortfolio] = useState([])
    const [loading, setLoading] = useState(true)

    const { allPortfolioData } = React.useContext(DataContext);

    const handleCloseModal = () => {
        close();
        setCurrentItem({});
    };

    const handleOpenModal = (item) => {
        open();
        setCurrentItem(item);
    };

    useEffect(() => {
        setCategories(allPortfolioData.data.main_categories);
        setPortfolio(allPortfolioData.data.portfolio);

        if (id && allPortfolioData.data.portfolio) {
            handleOpenModal(allPortfolioData.data.portfolio[id]);
            // console.warn(id);
        }

        setLoading(false);
    }, [])

    if (loading) {
        return (
            <LoadingScreen />
        );
    }
    else {
        return (
            // main page
            <div className='home'>
                <GalleryModal
                    item={currentItem}
                    lensID={currentItem.lensID}
                    opened={opened}
                    onClose={handleCloseModal}

                    win={currentItem.win}
                    image={currentItem.image}
                    video={currentItem.video}
                    title={currentItem.title}
                    date={currentItem.date}
                    description={currentItem.description}
                    categories={currentItem.categories}
                    projectLink={currentItem.projectLink}
                />
                <div className="home_categories">
                    {categories.map((item, index) => (
                        <div><p onClick={() => setCurrentCategory(item)} className={currentCategory === item ? 'active' : 'inactive'}>{item}</p></div>
                    ))}
                </div>
                <div className='home_gallery'>
                    {portfolioData.map((item, index) => (
                        <>{currentCategory === "All" ? <div onClick={() => handleOpenModal(item)}><Gallery key={item.id} lensID={item.lensID} win={item.win} image={item.image} video={item.video} title={item.title} description={item.description} projectLink={item.projectLink} categories={item.categories} date={item.date} /></div> : null}
                            {(item.mainCategory).includes(currentCategory) ? <div onClick={() => handleOpenModal(item)}><Gallery key={item.id} lensID={item.lensID} win={item.win} image={item.image} video={item.video} title={item.title} description={item.description} projectLink={item.projectLink} categories={item.categories} date={item.date} /></div> : null}</>
                    ))}
                </div>
            </div>
        );
    }
}

export default Home;