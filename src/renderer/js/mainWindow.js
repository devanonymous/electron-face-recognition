const path = require('path');
const faceapi = require('face-api.js');
const moment = require('moment');
const log = require('electron-log');
const {ipcRenderer} = require("electron");

const dataBase = require(path.resolve(__dirname, '../../modules/dataBase'));
const keyboard = require(path.resolve(__dirname, './../js/helpers/keyboard'));
const findPerson = require(path.resolve(__dirname, './../js/helpers/findPerson'));
const faceBox = require(path.resolve(__dirname, './../../modules/face-box'));
const {loadSavedPersons} = require('./../../modules/savePerson');
const guidVideo = document.getElementById('f-gid__video');

const bubble = document.getElementById('background-wrap');
const videoEl = document.querySelector('#inputVideo');

let isBubbleShow = true;
const IS_VERTICAL_ORIENTATION = true;


const options = new faceapi.TinyFaceDetectorOptions({scoreThreshold: 0.5, inputSize: 672});
let isBlockedPlay = false;
let savedPeople;

const rotateVideo = window.innerWidth < window.innerHeight;
if (rotateVideo) {
    videoEl.classList.add('rotate');
}

const hideBubble = () => {
    if (!bubble.classList.contains('hide-background-wrap')) {
        bubble.classList.add('hide-background-wrap')
        // keyboard.hide();
    }
};


let timerId = setTimeout(function tick() {
    if (!isBubbleShow) {
        hideBubble();
        console.log('hide bubble');
    } else {
        isBubbleShow = false;
    }
    timerId = setTimeout(tick, 10000);
}, 10000);


/* после того как пользователь добавился в базу данных приходит сообщение и мы загружаем базу заново */
ipcRenderer.on('PersonHasBeenAdded', async () => {
    savedPeople = await loadSavedPersons();
});

/**
 *
 * @param {HTMLVideoElement} videoEl видео с вебкамеры
 * @returns {boolean}
 */
const isPausedOrEnded = (videoEl) => {
    if (videoEl.paused || videoEl.ended) {
        console.log(`onPlay(): videoEl paused or ended; return;`);
        return true;
    } else if (isBlockedPlay) {
        console.log(`onPlay(): isBlockedPlay; return;`);
        setTimeout(() => onPlay(videoEl), 1000);
        return true;
    }
    return false
};

/**
 * Распозднает лица, и возврашает полное описание всех распознанных лиц увеличенное до разрешения экрана устройства,
 * чтобы получить корректные координаты прямоуголька (faceBox'a)
 */
const getFullFaceDescriptions = async () => {
    const fullFaceDescriptions = await faceapi.detectAllFaces(getCanvas(videoEl, IS_VERTICAL_ORIENTATION), options)
        .withFaceExpressions()
        .withFaceLandmarks()
        .withFaceDescriptors();

    return  faceapi.resizeResults(fullFaceDescriptions, IS_VERTICAL_ORIENTATION ? {width: 1080, height: 1920} : {width: 1920, height: 1080});
};

/**
 *
 * @param {object} fb
 * @param {object} bestMatch
 */
const setValueToFaceBox = (fb, bestMatch) => {
    if (bestMatch) {
        fb.setValues({
            name: bestMatch.className.name,
            position: bestMatch.className.position,
        });
        console.log('name:', bestMatch.className.name, 'dist:', bestMatch.distance, 'desc', bestMatch.descriptor);
    } else {
        fb.setDefaultValues();
        console.log('name: неопознанный человечишко');
    }
};

/**
 *  если кол-во ФейсБоксов больше одного, то  сделать их уменьшенными
 *
 * @param {Array} faceBoxes
 */
const makeFaceBoxesSmall = (faceBoxes) => {
    if (faceBoxes.length > 1) {
        faceBoxes.forEach((fb) => {
            fb.toSmalled();
        });
    }
};

/**
 * @param {string} name
 */
function changeGuidVideo(name) {
    if (name) {
        switch (name.toLowerCase()) {
            case "анна":
                guidVideo.src = "../../assets/video/анна.webm";
                break;
            case "владимир":
                guidVideo.src = "../../assets/video/владимир.webm";
                break;
            case "павел":
                guidVideo.src = "../../assets/video/павел.webm";
                break;
            case "цвия":
                guidVideo.src = "../../assets/video/цвия.webm";
                break;
            case "яков":
                guidVideo.src = "../../assets/video/яков.webm";
                break;
            default:
                guidVideo.src = "../../assets/video/helloMotherfucker.webm";
        }
    } else {
        guidVideo.src = "../../assets/video/helloMotherfucker.webm";
    }
}

/**
 * @param {string} name
 */
function showBubble(name) {
    if (!keyboard.isShown()) {
        isBubbleShow = true;
        if (bubble.classList.contains('hide-background-wrap')) {
            bubble.classList.remove('hide-background-wrap');
            changeGuidVideo(name);
            guidVideo.play();
        }
    }
}

const drawFaceBoxes = (detectionsForSize) => {
    let oldFaceBoxIndex = 0;
    const oldFaceBoxes = document.querySelectorAll('.face-box');
    oldFaceBoxes.forEach((box) => {
        box.classList.add('face-box_hidden');
        box.classList.remove('face-box_old-box');
    });

    /*  отображение прямоугольника */
    const faceBoxes = [];

    for (const face of detectionsForSize) {
        const bestMatch = findPerson.getBestMatch(savedPeople, face);
        const fb = new faceBox();
        faceBoxes.push(fb);
        const html = oldFaceBoxes[oldFaceBoxIndex];

        if (html) {
            oldFaceBoxIndex++;
            fb.setNewHtml(html);
            html.classList.remove('face-box_hidden');
            html.classList.add('face-box_old-box');
        }

        setValueToFaceBox(fb, bestMatch);

        if (face.expressions) {
            fb.parseExpressions(face.expressions);
        }

        fb.show(face.detection.box, (detectionsForSize.length > 1), rotateVideo);

        fb.setRounds();

        showBubble(bestMatch.className.name);
    }

    makeFaceBoxesSmall(faceBoxes);
};

const detectFaces = async () => {
    const detectionsForSize = await getFullFaceDescriptions();
    drawFaceBoxes(detectionsForSize);
};

async function onPlay(videoEl) {
    if (isPausedOrEnded(videoEl)) {
        return
    }
    faceapi.getMediaDimensions(videoEl);
    await detectFaces();
    setTimeout(() => onPlay(videoEl));
}


const loadFaceAPIModels = async () => {
    await faceapi.nets.tinyFaceDetector.loadFromDisk(path.resolve(__dirname, '../../../weights'));
    await faceapi.loadFaceDetectionModel(path.resolve(__dirname, '../../../weights'));
    await faceapi.loadFaceLandmarkModel(path.resolve(__dirname, '../../../weights'));
    await faceapi.loadFaceRecognitionModel(path.resolve(__dirname, '../../../weights'));
    await faceapi.loadFaceExpressionModel(path.resolve(__dirname, '../../../weights'));
};

const startVideoStreamFromWebCamera = () => {
    navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
                width: {ideal: 1920},
                height: {ideal: 1080},
            }
        },
    ).then(function (stream) {
        videoEl.srcObject = stream;
    }).catch(function (err) {
        console.log(err.name + ': ' + err.message);
    });
};

const initFaceAPIMonkeyPatch = () => {
    faceapi.env.monkeyPatch({
        Canvas: HTMLCanvasElement,
        Image: HTMLImageElement,
        ImageData: ImageData,
        Video: HTMLVideoElement,
        createCanvasElement: () => document.createElement('canvas'),
        createImageElement: () => document.createElement('img')
    });
};


async function run() {
    initFaceAPIMonkeyPatch();
    await loadFaceAPIModels();
    savedPeople = await loadSavedPersons();
    startVideoStreamFromWebCamera();
}

document.addEventListener("DOMContentLoaded", () => {
    if (!IS_VERTICAL_ORIENTATION) {
        videoEl.style.transform = "scaleX(-1)"
    }

    run().catch(err => {
        console.log('ERROR:', err)
    });
});