import QrScanner from "qr-scanner";
import { useState, useRef, useEffect } from "react";

const ScannerQRCodePages = () => {
    const [resultQRCode, setResultQRCode] = useState("");
    const [hasCamera, setHasCamera] = useState(true);
    const [hasFlash, setHasFlash] = useState(true);
    const videoRef = useRef(null);
    const [scanner, setScanner] = useState(null);

    useEffect(() => {
        // Check Device has Camera
        QrScanner.hasCamera().then((hasCamera) => {
            setHasCamera(hasCamera);
        });

        // Init Class QrScanner
        if (videoRef.current !== null && hasCamera) {
            console.log("jalan");
            const newScanner = new QrScanner(
                videoRef.current,
                (result) => setResultQRCode(result),
                {
                    onDecodeError: (error) => {
                        console.log(error);
                    },
                    highlightScanRegion: true,
                    highlightCodeOutline: true,
                }
            );

            // Check Device has Flash
            newScanner.hasFlash().then((hasFlash) => {
                setHasFlash(hasFlash);
            });

            // set scanner to useState
            setScanner(newScanner);

            // Set scanner to window.scanner
            window.scanner = newScanner;
        }
    }, []);

    useEffect(() => {
        if (scanner && videoRef) {
            // Start camera
            scanner.start().then(() => {
                checkFlashAvailabilty();
                // ListCamera
                QrScanner.listCameras(true).then((cameras) => {
                    cameras.forEach((camera) => {
                        console.log(camera);
                    });
                });
            });
        }
    }, [scanner, hasFlash, videoRef]);

    useEffect(() => {
        console.log(resultQRCode);
        if (resultQRCode.data !== undefined) {
            console.log(resultQRCode.data);
            // console.log(resultQRCode.data === undefined);
            stopCamera();
        }
    }, [resultQRCode]);

    const checkDeviceHasCamera = () => {
        if (scanner) {
            QrScanner.hasCamera().then((hasCamera) => {
                return hasCamera;
            });
        }
        return null;
    };

    const checkFlashAvailabilty = () => {
        if (scanner) {
            scanner.hasFlash().then((hasFlash) => {
                return hasFlash;
            });
        }
        return null;
    };

    const startCamera = () => {
        if (scanner) {
            scanner.start();
        }
    };

    const stopCamera = () => {
        if (scanner) {
            scanner.stop();
        }
    };

    const flashOnOff = () => {
        if (scanner) {
            scanner.toggleFlash().then(() => {
                console.log("Flash ON|OFF = " + scanner.isFlashOn());
            });
        }
    };

    const ElementCamera = () => {
        return (
            <div className="video-frame">
                <video
                    crossOrigin="anonymous"
                    ref={videoRef}
                    autoPlay
                    width="400"
                    height="550"
                ></video>
            </div>
        );
    };

    const ElementResult = () => {
        return <h3>Result = {resultQRCode}</h3>;
    };

    return (
        <div className="homepage-display-data">
            <p className="homepage-display-data-hint">
                Tekan tombol start lalu arahkan kamera ke QR Code petugas
            </p>
            {/* {resultQRCode.data !== undefined ? (
                <ElementResult />
            ) : (
                <ElementCamera />
            )} */}

            <div className="video-frame">
                <video
                    crossOrigin="anonymous"
                    ref={videoRef}
                    autoPlay
                    width="400"
                    height="550"
                ></video>
            </div>
        </div>
    );
};

export default ScannerQRCodePages;
