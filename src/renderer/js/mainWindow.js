const path = require('path');
const faceapi = require('face-api.js');
const moment = require('moment');
const log = require('electron-log');
const {ipcRenderer} = require("electron");

const dataBase = require(path.resolve(__dirname, '../js/common/dataBase'));
const keyboard = require(path.resolve(__dirname, './../js/helpers/keyboard'));
const guide = require(path.resolve(__dirname, './../js/helpers/Guide'));
const findPerson = require(path.resolve(__dirname, './../js/helpers/findPerson'));
const faceBox = require(path.resolve(__dirname, './../js/common/face-box'));
const {loadSavedPersons} = require(path.resolve(__dirname, './../js/common/savePerson'));
const guidVideo = document.getElementById('f-gid__video');

const bubble = document.getElementById('background-wrap');
const videoEl = document.querySelector('#inputVideo');
const backgroundBluredVideo = document.getElementById('background-blur-video');

let personNames = new Set();

let isBubbleShow = false;


const IS_VERTICAL_ORIENTATION = false;

const OPTIONS = new faceapi.TinyFaceDetectorOptions({scoreThreshold: 0.5, inputSize: 288});

let isBlockedPlay = false;
let savedPeople;

if (IS_VERTICAL_ORIENTATION) {
    videoEl.classList.add('rotate');
} else {
    videoEl.classList.add('rotate-horizontal');
}

/*
* TODO:  вынести бабл в отдельный файл
*/

const hideBubble = () => {
    if (!bubble.classList.contains('hide-background-wrap')) {
        bubble.classList.add('hide-background-wrap')
    }
};

let guidTimerId = null;

/**
 *
 * Отображать гида через каждые n секунд
 *
 */
const setGuideTimeout = () => {
    const TIMEOUT = 15 * 1000;
    if (!guidTimerId) {
        guidTimerId = setTimeout(() => {
            guide.update(personNames, guidVideo);
            clearTimeout(guidTimerId);
            guidTimerId = null;
        }, TIMEOUT);
    }
};


/**
 * @param {Set} personNames
 */
function showBubble(personNames) {
    if (!keyboard.isShown()) {
        isBubbleShow = true;
        setGuideTimeout(personNames);
        if (bubble.classList.contains('hide-background-wrap')) {
            bubble.classList.remove('hide-background-wrap');
            guide.update(personNames, guidVideo) /* Когда появляется бабл проигрываем гида */
        }
    }
}

/* таймер скрытия бабла */
const TIMEOUT = 10000;
let timerId = setTimeout(function tick() {
    if (!isBubbleShow) {
        hideBubble();
    } else {
        isBubbleShow = false;
    }
    timerId = setTimeout(tick, TIMEOUT);
}, TIMEOUT);


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
const getFullFaceDescriptions = async (videoEl) => {
    const fullFaceDescriptions = await faceapi.detectAllFaces(getCanvas(videoEl, IS_VERTICAL_ORIENTATION), OPTIONS)
        .withFaceLandmarks()
        .withFaceExpressions()
        .withAgeAndGender()
        .withFaceDescriptors();

    console.log(fullFaceDescriptions);

    return faceapi.resizeResults(fullFaceDescriptions, IS_VERTICAL_ORIENTATION ? {
        width: 1080,
        height: 1920
    } : {width: videoEl.videoWidth, height: videoEl.videoHeight});
};

/**
 *
 * @param {object} fb
 * @param {object} bestMatch
 */
const setValueToFaceBox = (fb, bestMatch) => {
    if (bestMatch) {
        if (bestMatch.distance !== 0) { /* решение бага в либе, который заключается в том, что если лицо занимаем большую часть изображени, то распознавание происходит не правильно */
            fb.setValues({
                name: bestMatch.className.name,
                position: bestMatch.className.position,
            });
            console.log('name:', bestMatch.className.name, 'dist:', bestMatch.distance, 'desc', bestMatch.descriptor);
        }
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

    let names = [];

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
            fb.setAgeAndGender(face.age, face.gender);
        }
        fb.show(face.detection.box, (detectionsForSize.length > 1), IS_VERTICAL_ORIENTATION);
        fb.setRounds();

        names.push(bestMatch.className.name)
    }

    personNames = new Set(names);
    if (detectionsForSize.length > 0) {
        showBubble(personNames);
    }
    names = [];

    makeFaceBoxesSmall(faceBoxes);
};

const detectFaces = async (videoEl) => {
    const detectionsForSize = await getFullFaceDescriptions(videoEl);
    drawFaceBoxes(detectionsForSize);
};

async function onPlay(videoEl) {
    if (isPausedOrEnded(videoEl)) {
        return
    }
    faceapi.getMediaDimensions(videoEl);
    await detectFaces(videoEl);
    setTimeout(() => onPlay(videoEl));
}


const loadFaceAPIModels = async () => {
    await faceapi.nets.tinyFaceDetector.loadFromDisk(path.resolve(__dirname, '../../../weights'));
    await faceapi.loadFaceDetectionModel(path.resolve(__dirname, '../../../weights'));
    await faceapi.loadFaceLandmarkModel(path.resolve(__dirname, '../../../weights'));
    await faceapi.loadFaceRecognitionModel(path.resolve(__dirname, '../../../weights'));
    await faceapi.loadFaceExpressionModel(path.resolve(__dirname, '../../../weights'));
    await faceapi.loadAgeGenderModel(path.resolve(__dirname, '../../../weights'));
};

const startVideoStreamFromWebCamera = () => {
    navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
                width: {ideal: IS_VERTICAL_ORIENTATION ? 1920 : 1080},
                height: {ideal: 1080},
            }
        },
    ).then(function (stream) {
        videoEl.srcObject = stream;
        if (!IS_VERTICAL_ORIENTATION) backgroundBluredVideo.srcObject = stream;
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