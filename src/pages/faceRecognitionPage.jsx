import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

const FaceRecognitionPage = () => {
    const videoRef = useRef();
    const canvasRef = useRef();
    const [resultFaceRecognition, setResultFaceRecognition] = useState("");

    // Load fungsi dengan useEffect
    useEffect(() => {
        loadModels();
    }, []);

    // Open Web Cam
    const startWebCam = () => {
        navigator.mediaDevices
            .getUserMedia({ video: true, audio: false })
            .then((stream) => {
                videoRef.current.srcObject = stream;
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const stopWebCam = () => {
        const stream = videoRef.current.srcObject;
        const tracks = stream.getTracks();

        tracks.forEach((track) => {
            track.stop();
        });

        videoRef.current.srcObject = null;
    };

    const loadModels = () => {
        Promise.all([
            faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
            faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
            faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
            faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
        ]).then(() => {
            startWebCam();
        });
    };

    const getLabeledFaces = () => {
        const labels = ["Roni", "Adit"];
        return Promise.all(
            labels.map(async (label) => {
                const descriptions = [];
                for (let i = 1; i <= 2; i++) {
                    const img = await faceapi.fetchImage(
                        `./labels/${label}/${i}.jpg`
                    );
                    const detections = await faceapi
                        .detectSingleFace(img)
                        .withFaceLandmarks()
                        .withFaceDescriptor();
                    descriptions.push(detections.descriptor);
                }
                return new faceapi.LabeledFaceDescriptors(label, descriptions);
            })
        );
    };

    const faceDetection = async () => {
        const labeledFaceDescriptors = await getLabeledFaces();
        const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors);
        const displayVideoSize = {
            width: videoRef.current.width,
            height: videoRef.current.height,
        };

        let resultsLabel = [];
        let countResults = {};
        let dominanResults;

        const interval = setInterval(async () => {
            const detections = await faceapi
                .detectAllFaces(
                    videoRef.current,
                    new faceapi.TinyFaceDetectorOptions()
                )
                .withFaceLandmarks()
                .withFaceDescriptors();

            canvasRef.current.innerHtml = faceapi.createCanvasFromMedia(
                videoRef.current
            );

            faceapi.matchDimensions(canvasRef.current, displayVideoSize);

            const resizedDetections = faceapi.resizeResults(
                detections,
                displayVideoSize
            );

            const results = resizedDetections.map((d) => {
                return faceMatcher.findBestMatch(d.descriptor);
            });

            console.log(results);

            results.forEach((result, i) => {
                const box = resizedDetections[i].detection.box;
                const drawBox = new faceapi.draw.DrawBox(box, {
                    label: result,
                });
                drawBox.draw(canvasRef.current);
                resultsLabel.push(results[i].label);
                console.log(resultsLabel.length);
            });

            // Munculin canvas di kamera
            // faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
            // faceapi.draw.drawFaceLandmarks(
            //     canvasRef.current,
            //     resizedDetections
            // );

            if (resultsLabel.length === 20) {
                // Menghitung jumlah kemunculan setiap elemen
                for (let i = 0; i < resultsLabel.length; i++) {
                    let element = resultsLabel[i];
                    if (countResults[element] === undefined) {
                        countResults[element] = 1;
                    } else {
                        countResults[element]++;
                    }
                }

                // Mencari elemen dengan jumlah kemunculan terbanyak
                let maxCountResult = 0;
                for (let element in countResults) {
                    if (countResults[element] > maxCountResult) {
                        maxCountResult = countResults[element];
                        dominanResults = element;
                    }
                }

                console.log(dominanResults);
                stopWebCam();
                clearInterval(interval);
                setResultFaceRecognition(dominanResults);
                return;
            }
        }, 250);
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
                    onPlay={faceDetection}
                ></video>
                <canvas className="appcanvas" ref={canvasRef}></canvas>
            </div>
        );
    };

    const ElementResult = () => {
        return (
            <h3>
                Result ={" "}
                {resultFaceRecognition !== "unknown"
                    ? resultFaceRecognition
                    : "Tidak Dikenali"}
            </h3>
        );
    };

    return (
        <div className="homepage-display-data">
            <p className="homepage-display-data-hint">
                Arahkan wajah ke kamera
            </p>
            {resultFaceRecognition === "" ? (
                <ElementCamera />
            ) : (
                <ElementResult />
            )}
        </div>
    );
};

export default FaceRecognitionPage;
