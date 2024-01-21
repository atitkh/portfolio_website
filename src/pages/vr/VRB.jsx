import React, { useState } from 'react';
import { MainScene } from '../../utils';
import { GalleryModal, LoadingScreen } from '../../components'
import './VRB.css';
import { useDisclosure } from '@mantine/hooks';

function VRB() {
    const [loading, setLoading] = useState(true);
    const [loadingPercent, setLoadingPercent] = useState(0);
    const [opened, { open, close }] = useDisclosure(false);
    const [currentItem, setCurrentItem] = useState({});
    const [pageTitle, setPageTitle] = useState('Loading');

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
            document.getElementsByClassName('overlay')[0].style.display = 'none';
            console.warn('Loading complete');
        }
    }, [loading]);

    React.useEffect(() => {
        if (pageTitle) {
            document.title = `${pageTitle} | XR Portfolio`;
        }
    }, [pageTitle]);

    return (
        <>
            <div className='overlay'>
                <LoadingScreen progressColor="#00FF80" completed={loadingPercent} />

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

            <MainScene setPageTitle={setPageTitle} setLoading={setLoading} setLoadingPercent={setLoadingPercent} handleOpenGModal={handleOpenGModal} />
        </>
    );
}

export default VRB;