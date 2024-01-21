import React, { useState } from 'react';
import { MainScene } from '../../utils';
import { Gallery, GalleryModal } from '../../components'
import './VRB.css';
import { useDisclosure } from '@mantine/hooks';

function VRB() {
    const [loading, setLoading] = useState(true);
    const [opened, { open, close }] = useDisclosure(false);
    const [currentItem, setCurrentItem] = useState({});

    const handleCloseGModal = () => {
        close();
        setCurrentItem({});
    };

    const handleOpenGModal = (item) => {
        open();
        setCurrentItem(item);
    };

    React.useEffect(() => {
        if (!loading) {
            document.getElementsByClassName('loader-container')[0].style.display = 'none';
            document.getElementsByClassName('overlay')[0].style.display = 'none';
        }
        console.warn('stopped loading')
    }, [loading]);

    return (
        <>
            <div className='overlay'>
                <div className="loader-container">
                    <div className="wrapper">
                        <span className="circle circle-1"></span>
                        <span className="circle circle-2"></span>
                        <span className="circle circle-3"></span>
                        <span className="circle circle-4"></span>
                        <span className="circle circle-5"></span>
                        <span className="circle circle-6"></span>
                        <span className="circle circle-7"></span>
                        <span className="circle circle-8"></span>
                    </div>
                </div>

                <GalleryModal
                    item={currentItem}
                    lensID={currentItem.lensID}
                    opened={opened}
                    onClose={handleCloseGModal}

                    image={currentItem.image}
                    title={currentItem.title}
                    date={currentItem.date}
                    description={currentItem.description}
                    categories={currentItem.categories}
                    projectLink={currentItem.projectLink}
                />
            </div>

            <MainScene setLoading={setLoading} handleOpenGModal={handleOpenGModal} />
        </>
    );
}

export default VRB;