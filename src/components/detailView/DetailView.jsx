import React, { useEffect, useState } from 'react'
import { Container } from '@mantine/core';
import Markdown from 'react-markdown'
import './DetailView.css'
import axios from 'axios';
import { useParams } from 'react-router-dom';
import LoadingScreen from '../loadingScreen/LoadingScreen';

function DetailView() {
        const { id } = useParams();
        const [markdown, setMarkdown] = useState('');
        const [loading, setLoading] = useState(true);

        useEffect(() => {
                const fetchData = async () => {
                        const result = await axios.get(`https://api.atitkharel.com.np/portfolio/atit/md?id=${id}`);
                        setMarkdown(result.data);

                        setLoading(false);
                }
                fetchData();
        }, [id])

        if (loading) {
                return (
                        <LoadingScreen />
                );
        }
        else {
                return (
                        document.title = ' | Portfolio Website',

                        <div className='detail'>
                                <div className='detail_body'>
                                        <Container c='#282828'>
                                                <Markdown className='detail_markdown'>{markdown}</Markdown>
                                        </Container>
                                </div>
                        </div>
                )
        }
}

export default DetailView