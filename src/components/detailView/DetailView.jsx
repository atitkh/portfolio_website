import React, { useEffect, useState } from 'react'
import { Container } from '@mantine/core';
import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
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
                        let data = result.data;

                        // Go through the data and replace hyperlinks with actual links, excluding image links
                        data = data.replace(/(\[.*?\]\(.*?\))/g, (match, p1, offset, string) => {
                                const prevChar = string.charAt(offset - 1);
                                const text = match.match(/\[.*?\]/)[0].replace(/^\[|\]$/g, '');
                                const link = match.match(/\(.*?\)/)[0].replace(/^\(|\)$/g, '');

                                if (prevChar === '!') {
                                        return match; // It's an image link, return as is
                                }

                                // Return as an HTML link
                                return `<a href="${link}" target="_blank" rel="noopener noreferrer" style="text-decoration:solid; color: #33beff; font-weight: bold;
                                ">${text}</a>`;
                        });
                        setMarkdown(data);
                        
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
                        document.title = 'Read More | Portfolio Website',

                        <div className='detail'>
                                <div className='detail_body'>
                                        <Container c='#282828' style={{
                                                fontSize: '1.2rem',
                                                lineHeight: '1.8',
                                        }} >
                                                <Markdown
                                                        className='detail_markdown'
                                                        rehypePlugins={[rehypeRaw]}
                                                        remarkPlugins={[remarkGfm]}
                                                >
                                                        {markdown}
                                                </Markdown>
                                        </Container>
                                </div>
                        </div>
                )
        }
}

export default DetailView