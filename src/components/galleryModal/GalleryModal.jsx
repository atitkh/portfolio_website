import { ActionIcon, Badge, Button, Group, Image, Modal, ScrollArea, Stack, Text, useMantineTheme } from '@mantine/core';
import { IconArticle, IconAugmentedReality, IconExternalLink, IconX } from '@tabler/icons-react';
import React, { useState } from 'react'
import { SnapAR } from '../../pages';
import { GitHub } from '@mui/icons-material';
import { useMediaQuery } from '@mantine/hooks';
import { IconPaperclip, IconFileTypePdf, IconBrandYoutube } from '@tabler/icons-react';

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
                                <img src={`/textures/winner_${item.win.position}.png`} alt='gallery' key={key + 'win'} width={150} height={150} />
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
                                    item.win.position === 0 ? { backgroundColor: '#FFB400', color: '#474747' } :
                                        item.win.position === 1 ? { backgroundColor: '#A4A4A4', color: '#F1F1F1' } :
                                            item.win.position === 2 ? { backgroundColor: '#BF822E', color: '#F1F1F1' } :
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
                                item.includes('github.com') ? <GitHub /> :
                                    item.includes('devpost.com') ? <IconPaperclip /> :
                                        (item.includes('/pdf?') || item.includes('.pdf')) ? <IconFileTypePdf /> :
                                            item.includes('researchgate.net') ? <svg width="28px" height="28px" viewBox="0 0 28 28" fill='white' role="img"><path d="M19.586 0c-.818 0-1.508.19-2.073.565-.563.377-.97.936-1.213 1.68a3.193 3.193 0 0 0-.112.437 8.365 8.365 0 0 0-.078.53 9 9 0 0 0-.05.727c-.01.282-.013.621-.013 1.016a31.121 31.123 0 0 0 .014 1.017 9 9 0 0 0 .05.727 7.946 7.946 0 0 0 .077.53h-.005a3.334 3.334 0 0 0 .113.438c.245.743.65 1.303 1.214 1.68.565.376 1.256.564 2.075.564.8 0 1.536-.213 2.105-.603.57-.39.94-.916 1.175-1.65.076-.235.135-.558.177-.93a10.9 10.9 0 0 0 .043-1.207v-.82c0-.095-.047-.142-.14-.142h-3.064c-.094 0-.14.047-.14.141v.956c0 .094.046.14.14.14h1.666c.056 0 .084.03.084.086 0 .36 0 .62-.036.865-.038.244-.1.447-.147.606-.108.385-.348.664-.638.876-.29.212-.738.35-1.227.35-.545 0-.901-.15-1.21-.353-.306-.203-.517-.454-.67-.915a3.136 3.136 0 0 1-.147-.762 17.366 17.367 0 0 1-.034-.656c-.01-.26-.014-.572-.014-.939a26.401 26.403 0 0 1 .014-.938 15.821 15.822 0 0 1 .035-.656 3.19 3.19 0 0 1 .148-.76 1.89 1.89 0 0 1 .742-1.01c.344-.244.593-.352 1.137-.352.508 0 .815.096 1.144.303.33.207.528.492.764.925.047.094.111.118.198.07l1.044-.43c.075-.048.09-.115.042-.199a3.549 3.549 0 0 0-.466-.742 3 3 0 0 0-.679-.607 3.313 3.313 0 0 0-.903-.41A4.068 4.068 0 0 0 19.586 0zM8.217 5.836c-1.69 0-3.036.086-4.297.086-1.146 0-2.291 0-3.007-.029v.831l1.088.2c.744.144 1.174.488 1.174 2.264v11.288c0 1.777-.43 2.12-1.174 2.263l-1.088.2v.832c.773-.029 2.12-.086 3.465-.086 1.29 0 2.951.057 3.667.086v-.831l-1.49-.2c-.773-.115-1.174-.487-1.174-2.264v-4.784c.688.057 1.29.057 2.206.057 1.748 3.123 3.41 5.472 4.355 6.56.86 1.032 2.177 1.691 3.839 1.691.487 0 1.003-.086 1.318-.23v-.744c-1.031 0-2.063-.716-2.808-1.518-1.26-1.376-2.95-3.582-4.355-6.074 2.32-.545 4.04-2.722 4.04-4.9 0-3.208-2.492-4.698-5.758-4.698zm-.515 1.29c2.406 0 3.839 1.26 3.839 3.552 0 2.263-1.547 3.782-4.097 3.782-.974 0-1.404-.03-2.063-.086v-7.19c.66-.059 1.547-.059 2.32-.059z" /></svg> :
                                                item.includes('youtube.com') || item.includes('youtu.be') ? <IconBrandYoutube /> :
                                                    <IconExternalLink />
                            }>
                                {item.includes('github.com') ? 'GitHub' :
                                    item.includes('devpost.com') ? 'Devpost' :
                                        (item.includes('/pdf?') || item.includes('.pdf')) ? 'View PDF' :
                                            item.includes('researchgate.net') ? 'ResearchGate' :
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