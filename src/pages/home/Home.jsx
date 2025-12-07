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
    const [sortOption, setSortOption] = useState('Newest');

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
        const validCategories = categories.filter(category =>
            portfolioData.some(item => item.mainCategory.includes(category))
        );
        validCategories.unshift('All');

        // Helper function to parse flexible date formats
        const parseFlexibleDate = (dateStr) => {
            if (!dateStr) return new Date(0);
            
            // Try parsing as-is first
            const parsed = new Date(dateStr);
            if (!isNaN(parsed)) return parsed;
            
            // If just a year (e.g., "2025")
            if (/^\d{4}$/.test(dateStr.trim())) {
                return new Date(dateStr);
            }
            
            // If year and month (e.g., "March 2025", "2025-03")
            // If full date (e.g., "March 20, 2025")
            // Date constructor handles most formats
            return new Date(dateStr);
        };

        // Sorting logic
        const sortedPortfolio = [...portfolioData].sort((a, b) => {
            if (sortOption === 'Newest') {
                return parseFlexibleDate(b.date) - parseFlexibleDate(a.date);
            } else if (sortOption === 'Oldest') {
                return parseFlexibleDate(a.date) - parseFlexibleDate(b.date);
            } else if (sortOption === 'A-Z') {
                return a.title.localeCompare(b.title);
            } else if (sortOption === 'Z-A') {
                return b.title.localeCompare(a.title);
            }
            return 0;
        });

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
                    citations={currentItem?.metadata?.citations || 0}
                    description={currentItem.description}
                    categories={currentItem.categories}
                    projectLink={currentItem.projectLink}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', margin: '8px 0' }}>
                    <select
                        value={sortOption}
                        onChange={e => setSortOption(e.target.value)}
                        style={{ padding: '2px 8px', borderRadius: 4, border: '1px solid #ccc', background: 'transparent', fontSize: 14 }}
                        aria-label="Sort listings"
                    >
                        <option value="Newest">Newest</option>
                        <option value="Oldest">Oldest</option>
                        <option value="A-Z">A-Z</option>
                        <option value="Z-A">Z-A</option>
                    </select>
                </div>
                <div className="home_categories">
                    <div className="home_categories_arrow left" onClick={() => document.querySelector('.home_categories_inner').scrollBy({ left: -200, behavior: 'smooth' })}>&lt;</div>
                    <div className="home_categories_inner">
                        {validCategories.map((item, index) => (
                            <div key={index}><p onClick={() => setCurrentCategory(item)} className={currentCategory === item ? 'active' : 'inactive'}>{item}</p></div>
                        ))}
                    </div>
                    <div className="home_categories_arrow right" onClick={() => document.querySelector('.home_categories_inner').scrollBy({ left: 200, behavior: 'smooth' })}>&gt;</div>
                </div>
                <div className='home_gallery'>
                    {sortedPortfolio.map((item, index) => (
                        <React.Fragment key={index}>
                            {currentCategory === "All" ?
                                <div onClick={() => handleOpenModal(item)}>
                                    <Gallery key={item.id} lensID={item.lensID} win={item.win} image={item.image} video={item.video} title={item.title} description={item.description} projectLink={item.projectLink} categories={item.categories} date={item.date} />
                                </div>
                                : null}
                            {(item.mainCategory).includes(currentCategory) ?
                                <div onClick={() => handleOpenModal(item)}>
                                    <Gallery key={item.id} lensID={item.lensID} win={item.win} image={item.image} video={item.video} title={item.title} description={item.description} projectLink={item.projectLink} categories={item.categories} date={item.date} />
                                </div>
                                : null}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        );
    }
}

export default Home;