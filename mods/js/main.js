const path = require('path');
const faceapi = require('face-api.js');
const moment = require('moment');
const log = require('electron-log');

const commonjs = require(path.resolve(__dirname, '../mods/js/commons'));
const faceBox = require(path.resolve(__dirname, '../modules/face-box'));
const createFoto = require(path.resolve(__dirname, '../modules/savePerson'));

log.info(path.resolve(__dirname, '../modules/savePerson'));

const rotateVideo = window.innerWidth < window.innerHeight;

const videoEl = document.querySelector('#inputVideo');

const options = new faceapi.TinyFaceDetectorOptions({scoreThreshold: 0.5, inputSize: 736});
let isBlockedPlay = false;
let savedPeople;

if (rotateVideo) {
    videoEl.classList.add('rotate');
}

const link = document.querySelector('.m_k_enter');

link.addEventListener('pointerdown', function (event) {
    event.preventDefault();

    const fieldName = document.querySelector('#name');
    const fieldPosition = document.querySelector('#user-position');
    const userName = clearStrValue(fieldName.value);
    const userPosition = clearStrValue(fieldPosition.value);

    if (userName > '' && userPosition > '') {
        isBlockedPlay = true;
        createFoto(videoEl, options, userName, userPosition)
            .then(() => {
                isBlockedPlay = false;
            })
            .catch((err) => {
                log.error('mod:createFoto() catch error', err);
            });
    } else if (userName > '' && !userPosition) {
        fieldName.classList.remove('field-name-show');
        fieldPosition.classList.add('field-name-show');
    } else {
        fieldName.classList.add('field-name-show');
        fieldPosition.classList.remove('field-name-show');
    }
});

const clearStrValue = function (str) {
    let newStr = str;

    if (newStr > '') {
        newStr = newStr.trim();
    }

    return newStr;
};


document.querySelector('#name').addEventListener('focus', function () {
    document.querySelector('.keyboard').classList.add('open');
});
document.querySelector('#name').addEventListener('click', function () {
    document.querySelector('.keyboard').classList.add('open');
});
document.querySelector('#user-position').addEventListener('focus', function () {
    document.querySelector('.keyboard').classList.add('open');
});
document.querySelector('#user-position').addEventListener('click', function () {
    document.querySelector('.keyboard').classList.add('open');
});

const clickKeyboard = function () {
    const fieldName = document.querySelector('#name');
    const fieldPosition = document.querySelector('#user-position');
    // console.log('$',fieldName.classList.contains('field-name-show'),fieldPosition.classList.contains('field-name-show'));
    if (fieldName.classList.contains('field-name-show')) {
        fieldName.focus();
    } else if (fieldPosition.classList.contains('field-name-show')) {
        console.log('focus position');
        fieldPosition.focus();
    }
};
const keyboard = document.querySelector('.keyboard');
keyboard.addEventListener('click', clickKeyboard, false);

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
 * @returns {Promise<({} & {detection: FaceDetection} & {expressions: FaceExpressionPrediction[]} & {landmarks: FaceLandmarks68; unshiftedLandmarks: FaceLandmarks68; alignedRect: FaceDetection}) | any>}
 */
const getFullFaceDescriptions = async () => {
    const fullFaceDescriptions = await faceapi.detectAllFaces(getCanvas(videoEl), options)
        .withFaceExpressions()
        .withFaceLandmarks()
        .withFaceDescriptors();

    return faceapi.resizeResults(fullFaceDescriptions, {width: 1080, height: 1920});
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
        console.log('name:', bestMatch.className.name, 'dist:', bestMatch.distance);
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
        const bestMatch = commonjs.getBestMatch(savedPeople, face);
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

    setTimeout(() => onPlay(videoEl), 1000 / 25); /*TODO: может этот таймаут нахуй не нужен?*/
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
        stream => videoEl.srcObject = stream,
        err => console.error(err)
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
    savedPeople = await commonjs.loadSavedPeople();
    startVideoStreamFromWebCamera();
}

document.addEventListener("DOMContentLoaded", () => {
    run();

    const $currentTime = document.querySelector('.js-current-time');

    setInterval(() => {
        $currentTime.innerHTML = `${moment().format('HH:mm:ss')}`;
    }, 1000);

    {
        const weather = require('../modules/weather');

        weather().then((re) => {
            document.querySelector('.js-current-weather').innerHTML = `${re}`;
        });
    }

    {
        const $gidButton = document.querySelector('.js-gid-button');
        const $gids = document.querySelector('.f-gid');
        const $videos = document.querySelectorAll('.f-gid__video');

        $videos.forEach((video) => {
            video.addEventListener('ended', function () {
                $gids.classList.remove('f-gid_showed');
            });
        });

        $gidButton.addEventListener('click', function () {
            $videos[0].currentTime = 0;
            $videos[0].play()
                .then(() => {
                    $gids.classList.add('f-gid_showed');
                })
                .catch((err) => {
                    log.error(err);
                });
        });
    }
});