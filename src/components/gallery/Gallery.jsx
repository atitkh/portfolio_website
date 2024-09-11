/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/alt-text */
import React from 'react'
import './gallery.css'
import { GitHub, Language } from "@mui/icons-material";
import { IconBrandYoutube, IconPaperclip } from '@tabler/icons-react';

function Gallery({ key, image, win, video, title, description, projectLink, categories, date }) {

    return (
        <>
            <div className='gallery_container' style={{ cursor: 'pointer' }}>
                <div className='gallery_item'>
                    <div className='gallery_item_image'>
                        <img src={video ? video : image} alt='gallery' key={key} />
                    </div>
                    {win &&
                        <div className="gallery_item_winner">
                            <div>
                                <img src={`./textures/winner_${win.position}.png`} alt='gallery' key={key + 'win'} />
                            </div>
                        </div>
                    }
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
                                {
                                    categories.map((item, index) => (
                                        <span>{item} </span>
                                    ))
                                }
                                {win &&
                                    <span style={
                                        win.position === 0 ? { backgroundColor: '#EFA900', color: '#474747' } :
                                            win.position === 1 ? { backgroundColor: '#A4A4A4', color: '#F1F1F1' } :
                                                win.position === 2 ? { backgroundColor: '#977547', color: '#F1F1F1' } :
                                                    { color: '#FFFFFF' }
                                    }>{win.hackathon}</span>
                                }
                            </p>
                        </div>

                        <div className='gallery_item_info_url' sx={{ zIndex: '100' }}>
                            {projectLink.map((item, index) => (
                                <a href={item} target='_blank' rel='noreferrer'>
                                    {item.includes('github.com') ? <GitHub /> :
                                        item.includes('devpost.com') ? <IconPaperclip /> :
                                            item.includes('youtube.com') || item.includes('youtu.be') ? <IconBrandYoutube /> :
                                                item.includes('snapchat.com') ? <Language /> :
                                                    <Language />}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div >
        </>
    );
}

export default Gallery;