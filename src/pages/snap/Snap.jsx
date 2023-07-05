import React, { useState, useEffect } from 'react';
import { bootstrapCameraKit, createUserMediaSource } from '@snap/camera-kit';

function Snap() {

    const [mainTitle, setMainTitle] = useState('');
    const [session, setSession] = useState(null);
    const [lenses, setLenses] = useState([]);
    const [currentLens, setCurrentLens] = useState(null);

    // This useEffect hook runs once when the component mounts
    useEffect(() => {
        async function init() {
            // Bootstrap the camera kit with the provided API token
            const cameraKit = await bootstrapCameraKit({
                apiToken:
                    'eyJhbGciOiJIUzI1NiIsImtpZCI6IkNhbnZhc1MyU0hNQUNQcm9kIiwidHlwIjoiSldUIn0.eyJhdWQiOiJjYW52YXMtY2FudmFzYXBpIiwiaXNzIjoiY2FudmFzLXMyc3Rva2VuIiwibmJmIjoxNjg3MzM3NDkzLCJzdWIiOiIwZmYyYTEwMC03MzBlLTQ5Y2ItYmFhOS0wNjBmYmYxYWRmOTB-U1RBR0lOR34zMTZjNzhlZi1kMTBmLTRkZmQtODMxMy00YzU1Y2FiNjFlZjAifQ.rgtKdXYS1Zgd5b8_7Di92LtVVlJKyxMVQfclgk9uQzk',
            });

            // Create a new session
            const session = await cameraKit.createSession();
            setSession(session);

            // Add an event listener for errors
            session.events.addEventListener('error', (event) =>
                console.error(event.detail)
            );

            // Replace the canvas element with the live output of the session
            document.getElementById('canvas').replaceWith(session.output.live);

            // Load the lenses and apply the first one
            const { lenses } = await cameraKit.lensRepository.loadLensGroups([
                'fd0aa0f3-f64d-4729-887b-5b2aea09c64d',
            ]);
            const appliedLens = lenses[0];
            await session.applyLens(appliedLens);
            setLenses(lenses);
            setCurrentLens(lenses[0]);
            setMainTitle(appliedLens.name);

            // Create a new user media source and set it as the session source
            const userMediaSource = await createUserMediaSource();
            session.setSource(userMediaSource);

            // Start playing the session
            session.play('live');
        }
        init();
    }, []);

    // Render the canvas and select elements
    return (
        <>
            <div id="canvas"></div>
            <h1>{mainTitle}</h1>
            <select id="cameras">
                <option value="">Select a camera</option>
            </select>
            <select id="lenses" 
                value={currentLens?.id}
                onChange={async (event) => {
                    if (event.target.value === 'reset') {
                        await session.removeLens();
                        setCurrentLens(null);
                        setMainTitle('');
                        return;
                    }
                    const lens = lenses.find((lens) => lens.id === event.target.value);
                    console.log(lens);
                    await session.applyLens(lens);
                    setCurrentLens(lens);
                    setMainTitle(lens.name);
                }}
            >
                <option value="reset">Select a lens</option>
                {lenses.map((lens) => (
                    <option key={lens.id} value={lens.id}>
                        {lens.name}
                    </option>
                ))}
            </select>
        </>
    );
}

export default Snap;