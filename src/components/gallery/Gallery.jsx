import React from 'react'
import './gallery.css'
import { GitHub } from "@mui/icons-material"

function Gallery({ image, video, title, description, gitLink, categories, date }) {
    return (
        <div className='gallery_item'>
            <div className='gallery_item_image'>
                <img src={image} alt='gallery' />
            </div> 
            <div className='gallery_item_info'>
                <div className='gallery_item_info_title'>
                    <h2>{title}</h2>
                </div>
                <div className='gallery_item_info_description'>
                    <h3>{description}</h3>
                </div>
                <div className='gallery_item_info_categories'>
                    <h4>
                        {categories.map((item) => (
                            <span>{item}, </span>
                        ))}
                    </h4>
                </div>

                <div className='gallery_item_info_date'>
                    <h4>
                        {date}
                    </h4>
                </div>

                <div className='gallery_item_info_git'>
                    <a href={gitLink} target='_blank' rel='noreferrer'>
                        <GitHub />
                    </a>
                </div>
            </div>
        </div>
    );
}

export default Gallery;