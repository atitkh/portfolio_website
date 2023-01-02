/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/alt-text */
import React from 'react'
import './gallery.css'
import { GitHub, Language} from "@mui/icons-material"

function Gallery({ key, image, video, title, description, projectLink, categories, date }) {
    return (
        <div className='gallery_container'>
            <div className='gallery_item'>
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

                    <div className='gallery_item_info_url'>
                        {projectLink.map((item, index) => (
                            <a href={item} target='_blank' rel='noreferrer'>
                                {item.includes('github.com') ? <GitHub /> : <Language />} 
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Gallery;