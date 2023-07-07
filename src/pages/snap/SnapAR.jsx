import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Transform2D, bootstrapCameraKit, createMediaStreamSource } from '@snap/camera-kit';
import { Group, LoadingOverlay, Text } from '@mantine/core';
import { useParams } from 'react-router-dom';

function SnapAR(props) {
  // get lensID 
  let { lensID } = useParams();
  let newTab = true;

  if (!lensID) {
    lensID = props.lensID;
    newTab = false;
  }

  const mediaStreamRef = useRef(null);

  const [mainTitle, setMainTitle] = useState('');
  const [session, setSession] = useState(null);
  const [source, setSource] = useState(null);
  const [currentLens, setCurrentLens] = useState(null);
  const [lensInitialized, setLensInitialized] = useState(false);
  const [lensStarted, setLensStarted] = useState(false);

  const setCameraKitSource = useCallback(async (session, deviceId, currentLens) => {
    // stop lens
    if (mediaStreamRef.current) {
      session.pause();
      mediaStreamRef.current.getVideoTracks()[0].stop();
    }

    // set source
    mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({
      video: { deviceId },
    });

    let cameraType = 'front';

    // check if lens has cameraFacingPreference
    if (currentLens) {
      // if lens has cameraFacingPreference, set cameraType to that
      checkCameraPreference(session, currentLens);
      return;
    }
    // if lens has no cameraFacingPreference, check if camera is front or back
    else {
      mediaStreamRef.current.getVideoTracks()[0].getSettings().facingMode === 'user' ? cameraType = 'front' : cameraType = 'back';
    }

    // set source
    const source = createMediaStreamSource(mediaStreamRef.current, { cameraType: cameraType });
    await session.setSource(source);
    source.setRenderSize(320, 570);
    // mirror front camera
    if (cameraType === 'front') {
      source.setTransform(Transform2D.MirrorX);
    }
    setSource(source);

    // export session to parent
    props.handleSessionExport(session, mediaStreamRef.current);

    // start lens
    session.play();
    setLensStarted(true);
  }, []);

  const attachCamerasToSelect = useCallback(async (session) => {
    const cameraSelect = document.getElementById('cameras');
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter(({ kind }) => kind === 'videoinput');

    if (cameraSelect && cameras.length > 0 && devices) {
      cameras.forEach((camera) => {
        const option = document.createElement('option');

        option.value = camera.deviceId;
        option.text = camera.label;

        cameraSelect.appendChild(option);
      });

      cameraSelect.addEventListener('change', (event) => {
        const deviceId = (event.target).selectedOptions[0]
          .value;

        setCameraKitSource(session, deviceId);
      });
    }
  }, [setCameraKitSource]);

  const checkCameraPreference = useCallback(async (session, currentLens) => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter(({ kind }) => kind === 'videoinput');
    const cameraSelect = document.getElementById('cameras');

    if (cameras.length > 0) {
      let usableCams = [];

      // if lens has cameraFacingPreference, set cameraType to that
      if (currentLens.cameraFacingPreference?.toLowerCase().includes('front')) {
        usableCams = cameras.filter(({ label }) => label.toLowerCase().includes('front'));
      }
      else {
        usableCams = cameras.filter(({ label }) => label.toLowerCase().includes('back'));
      }

      if (cameraSelect && usableCams.length > 0) {
        cameraSelect.value = usableCams[0]?.deviceId;
      }
      setCameraKitSource(session, usableCams[0]?.deviceId);
    }
  }, [setCameraKitSource]);

  // This useEffect hook runs once when the component mounts
  useEffect(() => {
    async function init() {
      let lens;
      // Bootstrap the camera kit with the provided API token
      const cameraKit = await bootstrapCameraKit({
        apiToken: process.env.REACT_APP_SNAP_TOKEN,
      });

      // Create a new session
      const session = await cameraKit.createSession();
      setSession(session);

      // Add an event listener for errors
      session.events.addEventListener('error', (event) => {
        console.error(event);
      });

      // Replace the canvas element with the live output of the session
      document.getElementById('canvas').replaceWith(session.output.live);

      // Create a new user media source and set it as the session source
      // const userMediaSource = await createUserMediaSource();
      // const source = session.setSource(userMediaSource);
      // (await source).setRenderSize(320, 570);
      // setSource(source);

      // Load the lenses and apply the first one
      if (lensID) {
        lens = await cameraKit.lensRepository.loadLens(lensID, process.env.REACT_APP_LENS_GROUP_ID);
        const appliedLens = lens;
        await session.applyLens(appliedLens);
        // setLenses(lenses);
        setCurrentLens(lens);
        setMainTitle(appliedLens.name);
      }

      await setCameraKitSource(session, true, lens);
      await attachCamerasToSelect(session);

      // Set the lensInitialized flag to true
      setLensInitialized(true);
    }

    if (!session) {
      init();
    }
  }, []);

  // Render the canvas and select elements
  return (
    <>
      {!newTab && <LoadingOverlay visible={!lensInitialized} overlayBlur={2} />}
      <div>
        <Group position="center" style={{ marginTop: 20 }}>
          <Text
            size={'xl'}
            weight={700}
            color='black'
            style={{
              textAlign: 'center',
              textTransform: 'uppercase'
            }}
          >{mainTitle}</Text>
        </Group>

        <Group position="center" style={{ marginTop: 20, maxWidth: '320', maxHeight: '570' }}>
          <div id="canvas" style={{
            width: '320px',
            height: '570px',

            position: 'relative',
            borderRadius: '0.5rem',
            boxShadow: '0 0 0.5rem 0 rgba(0, 0, 0, 0.2)',
          }}>
            <LoadingOverlay visible={!lensInitialized} overlayBlur={2} />
          </div>

          <Group style={{ position: 'absolute', top: 20, right: 20 }}>
            <Text size='md' weight={500} color='dimmed'>Select Camera</Text>
            <select id="cameras"></select>
          </Group>

          <div className='overlay' style={{ position: 'absolute', zIndex: '0.5' }}>
            {/* <Button
              onClick={() => {
                if (lensStarted) {
                  session.pause();
                  setLensStarted(false);
                } else {
                  session.play('live');
                  setLensStarted(true);
                }
              }}
              style={{ position: 'absolute', bottom: 20, left: 20 }}
            >
              {lensStarted ? 'Pause' : 'Play'}
            </Button> */}
          </div>
        </Group>
      </div>
    </>
  );
}

export default SnapAR;