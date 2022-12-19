import React from 'react';
import './home.css';
import { Gallery } from '../../components';

var portfolioData = [
    {
        id: 1,
        image: 'https://images.unsplash.com/photo-1626126090001-8b1f2e1b1b1a?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
        video: 'https://www.youtube.com/watch?v=1Q8fG0TtVAY',
        title: 'Test Title',
        description: 'Test Description',
        gitLink: 'https://github.com/atitkh',
        categories: ['React', 'Javascript', 'HTML', 'CSS'],
        date: '2021-07-19'
    },

    {
        id: 2,
        image: 'https://images.unsplash.com/photo-1626126090001-8b1f2e1b1b1a?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
        video: 'https://www.youtube.com/watch?v=1Q8fG0TtVAY',
        title: 'Test Title',
        description: 'Test Description',
        gitLink: 'https://github.com/atitkh',
        categories: ['React', 'Javascript', 'HTML', 'CSS'],
        date: '2021-07-19'
    },
];

function Home() {
    return (
        <div className='home'>
            <h1>Portfolio Gallery</h1>
            <div className='home_gallery'>
                {portfolioData.map((item) => (
                    <Gallery key={item.id} image={item.image} video={item.video} title={item.title} description={item.description} gitLink={item.gitLink} categories={item.categories} date={item.date} />
                ))}
            </div>
        </div>
    );
}

export default Home;