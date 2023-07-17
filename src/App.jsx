import { useState } from "react";
import "./App.css";
import "./pages/faceRecognitionPage";
import "./pages/scannerQRCodePage";
import ScannerQRCodePages from "./pages/scannerQRCodePage";
import FaceRecognitionPage from "./pages/faceRecognitionPage";

function App() {
    const [buttonClick, setButtonClick] = useState("");

    return (
        <div className="homepage">
            <h1 className="homepage-title">BPSense</h1>
            <div className="homepage-menu">
                <a
                    className="button"
                    onClick={(e) => {
                        e.preventDefault();
                        setButtonClick("face-recognition");
                    }}
                >
                    Face Recognition
                </a>
                <a
                    className="button"
                    onClick={(e) => {
                        e.preventDefault();
                        setButtonClick("qr-code");
                    }}
                >
                    QR Code
                </a>
            </div>

            <div className="homepage-display">
                {buttonClick === "" && "Pilih Menu"}
                {buttonClick === "qr-code" && <ScannerQRCodePages />}
                {buttonClick === "face-recognition" && <FaceRecognitionPage />}
            </div>
        </div>
    );
}

export default App;
