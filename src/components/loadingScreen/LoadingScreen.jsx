import './loadingScreen.css';

const LoadingScreen = (props) => {
    const { progressColor, completed } = props;

    const titleStyles = {
        display: 'block',
        color: '#ffffff',
        fontSize: 15,
        fontWeight: 600,
        marginTop: 80
    }

    const containerStyles = {
        height: 6,
        width: '100%',
        backgroundColor: "white",
        borderRadius: 10,
        marginTop: 10
    }

    const fillerStyles = {
        height: '100%',
        width: `${completed}%`,
        backgroundColor: progressColor,
        borderRadius: 'inherit',
        textAlign: 'right',
        transition: 'width 1s ease-in-out'
    }

    return (
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

                {completed !== undefined && progressColor !== undefined &&
                    <div style={titleStyles}>
                        LOADING: {completed}%
                        <div style={containerStyles}>
                            <div style={fillerStyles} />
                        </div>
                    </div>
                }
            </div>
        </div>
    );
};

export default LoadingScreen;