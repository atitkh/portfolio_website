/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/alt-text */
import React from 'react'
import './gallery.css'
import { GitHub, Language } from "@mui/icons-material"
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { ActionIcon, Badge, Button, Group, Image, Modal, ScrollArea, Stack, Text, useMantineTheme } from '@mantine/core';
import { IconExternalLink, IconX } from '@tabler/icons-react';

function Gallery({ key, image, video, title, description, projectLink, categories, date }) {
    const [opened, { open, close }] = useDisclosure(false);
    const isMobile = useMediaQuery("(max-width: 50rem)");

    return (
        <>
            <div className='gallery_container' style={{ cursor: 'pointer' }}>
                <div className='gallery_item' onClick={open}>
                    <div className='gallery_item_image'>
                        <img src={image} alt='gallery' key={key} />
                    </div>
                    <div className="gallery_item_info_bg">
                    </div>
                    <div className='gallery_item_info'>
                        <div className='gallery_item_info_title'>
                            <p>{title}</p>
                        </div>
                        <div className='gallery_item_info_date'>
                            <p>{date}</p>
                        </div>
                        <div className='gallery_item_info_description'>
                            <p>{description}</p>
                        </div>
                        <div className='gallery_item_info_categories'>
                            <p>
                                {categories.map((item, index) => (
                                    <span>{item} </span>
                                ))}
                            </p>
                        </div>

                        <div className='gallery_item_info_url' sx={{ zIndex: '100' }}>
                            {projectLink.map((item, index) => (
                                <a href={item} target='_blank' rel='noreferrer'>
                                    {item.includes('github.com') ? <GitHub /> : <Language />}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <GalleryModal
                key={key}
                opened={opened}
                onClose={close}
                isMobile={isMobile}

                image={image}
                title={title}
                date={date}
                description={description}
                categories={categories}
                projectLink={projectLink}
            />
        </>
    );
}

function GalleryModal({ key, opened, onClose, isMobile, image, title, date, description, categories, projectLink }) {
    const theme = useMantineTheme();

    return (
        <Modal
            opened={opened}
            onClose={onClose}
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
        >
            {/* close */}
            { !isMobile &&
                <Group position='right'>
                    <ActionIcon onClick={onClose} radius='lg' size='xs'>
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
                <div style={{
                    flex: 1,
                    maxWidth: '340px',
                    maxHeight: '570px',
                    marginRight: isMobile ? '0' : '1rem'
                }}>
                    <Image
                        withPlaceholder
                        src={image}
                        alt={title}
                        key={key}
                        radius="md"
                        height={570}
                        width={340}
                        sx={{
                            borderRadius: '0.5rem',
                            boxShadow: '0 0 0.5rem 0 rgba(0, 0, 0, 0.2)',
                        }}
                    />
                </div>

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
                        </Text>
                        {projectLink.map((item, index) => (
                            <Button component="a" href={item} target='_blank' variant="filled" size='md' radius={'md'} style={{ marginTop: '0.5rem' }} leftIcon={
                                item.includes('github.com') ? <GitHub /> : <IconExternalLink />
                            }>
                                {item.includes('github.com') ? 'GitHub' :
                                    item.includes('devpost.com') ? 'Devpost' :
                                        item.includes('youtube.com') || item.includes('youtu.be') ? 'Video' :
                                            item.includes('snapchat.com') ? 'Try it' :
                                                'Website'
                                }
                            </Button>
                        ))}
                    </Stack>
                </div>
            </div>
        </Modal >
    );
}

export default Gallery;