import { ActionIcon, Badge, Button, Group, Image, Modal, ScrollArea, Stack, Text, useMantineTheme } from '@mantine/core';
import { IconArticle, IconAugmentedReality, IconExternalLink, IconX } from '@tabler/icons-react';
import React, { useState } from 'react'
import { SnapAR } from '../../pages';
import { GitHub } from '@mui/icons-material';
import { useMediaQuery } from '@mantine/hooks';

function GalleryModal({ key, item, lensID, opened, onClose, image, video, title, date, description, categories, projectLink }) {
    const theme = useMantineTheme();
    const [startAR, setStartAR] = useState(false);
    const isMobile = useMediaQuery("(max-width: 50rem)");

    const [session, setSession] = useState(null);
    const [mediaStream, setMediaStream] = useState(null);

    const handleSession = (session, mediaStream) => {
        if (session) {
            setSession(session);
        }
        if (mediaStream) {
            setMediaStream(mediaStream);
        }
    }

    const handleOnClose = () => {
        onClose();
        if (session) {
            session.pause(); session.removeLens(); session.destroy(); setSession(null);
        }// pause the session
        if (mediaStream) {
            mediaStream.getVideoTracks().forEach(track => track.stop()); setMediaStream(null);
        } // stop all tracks
        setStartAR(false);
    }

    if (opened && item) return (
        <Modal
            opened={opened}
            onClose={handleOnClose}
            withCloseButton={isMobile}
            size="xl"
            radius={isMobile ? 'xs' : 'lg'}
            scrollAreaComponent={ScrollArea.Autosize}
            centered
            // fullScreen={isMobile}
            transitionProps={{ transition: 'fade', duration: 200 }}
            overlayProps={{
                color: theme.colorScheme === 'dark' ? theme.colors.dark[9] : theme.colors.gray[7],
                opacity: 0.55,
                blur: 3,
            }}
            zIndex={0.8}
        >
            {/* close */}
            {!isMobile &&
                <Group position='right'>
                    <ActionIcon onClick={handleOnClose} radius='lg' size='xs'>
                        <IconX />
                    </ActionIcon>
                </Group>
            }

            <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'center',
                alignItems: isMobile ? 'center' : 'flex-start',
                padding: isMobile ? '0' : '0 0.8rem 0.8rem 0.8rem',
                gap: '1rem',
            }}>
                <div id='canvas' style={{
                    flex: 1,
                    maxWidth: '320px',
                    maxHeight: '570px',
                    marginRight: isMobile ? '0' : '1rem',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'relative',
                    borderRadius: '0.5rem',
                    boxShadow: '0 0 0.5rem 0 rgba(0, 0, 0, 0.2)',
                }}>
                    <Image
                        withPlaceholder
                        src={video ? video : image}
                        alt={title}
                        key={key}
                        radius="md"
                        height={570}
                        width={320}
                        sx={{
                            borderRadius: '0.5rem',
                            boxShadow: '0 0 0.5rem 0 rgba(0, 0, 0, 0.2)',
                        }}
                    />

                    {item.win &&
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                        }}>
                            <div>
                                <img src={`/textures/winner_${item.win.position}.png`} alt='gallery' key={key + 'win'} />
                            </div>
                        </div>
                    }

                    {/* start AR if lens id is present and button is clicked */}
                    {lensID && startAR && (
                        <>
                            <SnapAR lensID={lensID} opened={opened} startAR={startAR} handleSessionExport={handleSession} />
                        </>
                    )}
                </div>

                {/* add select camers if mobile device */}
                {lensID && isMobile ?
                    <Group>
                        <Text size='md' weight={500} color='dimmed'>Select Camera</Text>
                        <select id="cameras"></select>
                    </Group>
                    :
                    null
                }

                <div style={{ flex: 1 }}>
                    <Stack spacing={0}>
                        <Text size='2rem' weight={700}>{title}</Text>
                        <Text size='md' weight={500} color='dimmed'>{date}</Text>
                        <Text size='md' style={{ marginTop: '1rem' }}>{description}</Text>
                        <Text size='md' style={{ margin: '1rem 0' }}>
                            {categories.map((item, index) => (
                                <Badge key={index} variant='outline' radius='xl' style={{ marginRight: '0.5rem' }}>
                                    {item}
                                </Badge>
                            ))}
                            {item.win &&
                                <Badge radius='xl' style={
                                    item.win.position === 0 ? { backgroundColor: '#EFA900', color: '#474747' } :
                                        item.win.position === 1 ? { backgroundColor: '#A4A4A4', color: '#F1F1F1' } :
                                            item.win.position === 2 ? { backgroundColor: '#977547', color: '#F1F1F1' } :
                                                { color: '#FFFFFF' }
                                }>
                                    {item.win.hackathon + ' Winner'}
                                </Badge>
                            }
                        </Text>

                        {lensID &&
                            // <Button component="a" href={`/snapar/${lensID}`} target='_blank' variant="filled" size='md' radius={'md'} style={{ marginTop: '0.5rem' }} leftIcon={<IconExternalLink />}>
                            //     Try on Browser
                            // </Button>
                            <Button onClick={() => { setStartAR(true); }} variant="filled" size='md' radius={'md'} style={{ marginTop: '0.5rem' }} leftIcon={<IconAugmentedReality />}>
                                Try on Browser
                            </Button>
                        }

                        {projectLink.map((item, index) => (
                            <Button key={index} component="a" href={item} target='_blank' variant="filled" size='md' radius={'md'} style={{ marginTop: '0.5rem' }} leftIcon={
                                item.includes('github.com') ? <GitHub /> : <IconExternalLink />
                            }>
                                {item.includes('github.com') ? 'GitHub' :
                                    item.includes('devpost.com') ? 'Devpost' :
                                        item.includes('youtube.com') || item.includes('youtu.be') ? 'Video' :
                                            item.includes('snapchat.com') ? 'Try on Snapchat' :
                                                'Website'
                                }
                            </Button>
                        ))}
                        {item.more &&
                            <Button key={'rmd'} component="a" href={`/more/${item.id}`} target='' variant="filled" size='md' radius={'md'} style={{ marginTop: '0.5rem' }} leftIcon={
                                <IconArticle />
                            }>
                                Read More
                            </Button>
                        }
                    </Stack>
                </div>
            </div>
        </Modal >
    );
}

export default GalleryModal;