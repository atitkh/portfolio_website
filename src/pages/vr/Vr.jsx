import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Scene } from '../../components';
import { Controllers, Hands, VRButton, XR } from '@react-three/xr';
import { SmoothLocomotion, SnapRotation } from '../../utils';
import BaseCharacter from '../../ui/BaseCharacter';
import { Physics } from '@react-three/cannon';
import { OrthographicCamera, PerspectiveCamera, PointerLockControls } from '@react-three/drei';

function Vr(props) {

    let [sessionStarted, setSessionStarted] = useState(false);

    return (
        // document.title = mainTitle + ' | XR Portfolio',
        <>
            <div className="container">
                <VRButton />

                <Canvas id='three-canvas-container' style={{ height: '100vh' }}>
                    <Suspense fallback={null}>
                        <XR
                            onSessionStart={(event) => {
                                setSessionStarted(true);
                                console.log('Session started');
                            }}
                            onSessionEnd={(event) => {
                                setSessionStarted(false);
                                console.log('Session ended');
                            }}
                        >

                            <Physics gravity={[0, -9.8, 0]}>
                                {/* controlls */}
                                <Controllers rayMaterial={{ color: 'blue' }} />
                                <Hands />

                                <gridHelper position-y={0.01} args={[100, 100]} />

                                {sessionStarted ? <OrthographicCamera /> :
                                    <>
                                        <PerspectiveCamera position={[0, 1, 3]} />
                                        <PointerLockControls pointerSpeed={0.4} />
                                        <BaseCharacter position={[0, 2, 3]} />
                                    </>
                                }

                                {/* movement in VR */}
                                <SmoothLocomotion hand='right' />
                                <SnapRotation hand='left' />

                                <Scene sessionStarted={sessionStarted} />

                            </Physics>
                        </XR>
                    </Suspense>
                </Canvas>

                <div className="dot" style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    transform: 'translate3d(-50%, -50%, 0)',
                    border: '2px solid white',
                }} />
            </div>
        </>
    )
}

export default Vr;