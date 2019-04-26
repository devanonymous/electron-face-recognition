const path = require('path');
const faceapi = require('face-api.js');
const moment = require('moment');
const log = require('electron-log');
const { ipcRenderer } = require("electron");

const dataBase = require(path.resolve(__dirname, '../modules/dataBase'));
const keyboard = require(path.resolve(__dirname, '../helpers/keyboard'));
const findPerson = require(path.resolve(__dirname, '../mods/js/findPerson'));
const faceBox = require(path.resolve(__dirname, '../modules/face-box'));
const {loadSavedPersons} = require(path.resolve(__dirname, '../modules/savePerson'));


const IS_VERTICAL_ORIENTATION = true;

log.info(path.resolve(__dirname, '../modules/savePerson'));

const rotateVideo = window.innerWidth < window.innerHeight;

const videoEl = document.querySelector('#inputVideo');

const options = new faceapi.TinyFaceDetectorOptions({scoreThreshold: 0.5, inputSize: 672});
let isBlockedPlay = false;
let savedPeople;

if (rotateVideo) {
    videoEl.classList.add('rotate');
}


/* после того как пользователь добавился в базу данных приходит сообщение и мы загружаем базу заново */
ipcRenderer.on('PersonHasBeenAdded', async () => {
    savedPeople = await loadSavedPersons();
});


/*TODO: what the fuck is this?*/

let ti = setTimeout(() => {
}, 0);
document.body.addEventListener('click', function () {
    clearTimeout(ti);

    ti = setTimeout(() => {
        document.querySelector('.keyboard').classList.remove('open');
        document.querySelector('#name').value = '';
        document.querySelector('#user-position').value = '';
    }, 1000 * 30);
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
            age: bestMatch.descriptor
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
    await faceapi.nets.tinyFaceDetector.loadFromDisk(path.resolve(__dirname, '../mods/weights'));
    await faceapi.loadFaceDetectionModel(path.resolve(__dirname, '../mods/weights'));
    await faceapi.loadFaceLandmarkModel(path.resolve(__dirname, '../mods/weights'));
    await faceapi.loadFaceRecognitionModel(path.resolve(__dirname, '../mods/weights'));
    await faceapi.loadFaceExpressionModel(path.resolve(__dirname, '../mods/weights'));
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