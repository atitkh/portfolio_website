import React from 'react';
import { MainScene } from '../../utils';
import './VRB.css';

function VRB() {
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        if (!loading) {
            document.getElementById("loadingScreen").style.display = "none";
        }
        console.warn('stopped loading')
    }, [loading]);

    return (
        <>
            <div id="loadingScreen">
                <div className="loader-container">
                    <div className="wrapper">
                        <span className="circle circle-1"></span>
                        <span className="circle circle-2"></span>
                        <span className="circle circle-3"></span>
                        <span className="circle circle-4"></span>
                        <span className="circle circle-5"></span>
                        <span className="circle circle-6"></span>
                        <span className="circle circle-7"></span>
                        <span className="circle circle-8"></span>
                    </div>
                </div>
            </div>
            <MainScene setLoading={setLoading} />
        </>
    );
}

export default VRB;