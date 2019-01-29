const electron = require('electron');
const path = require('path');
const fs = require('fs');
const faceapi = require('face-api.js');
const moment = require('moment');
const log = require('electron-log');

const commonjs = require(path.resolve(__dirname, '../mods/js/commons'));
const faceBox = require(path.resolve(__dirname, '../modules/face-box'));
const createFoto = require(path.resolve(__dirname, '../modules/create-foto'));

log.info(path.resolve(__dirname, '../modules/create-foto'));

const opt = {
    width: 1920,
    height: 1080,
    maxDistance: 0.5
};
const rotateVideo = window.innerWidth < window.innerHeight;

const videoEl = document.querySelector('#inputVideo');

const options = new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 })
let isBlockedPlay = false;

if ( rotateVideo ) {
    videoEl.classList.add('rotate');
}

const link = document.querySelector('.m_k_enter')

link.addEventListener('pointerdown', function (event) {
    event.preventDefault(event)

    const fieldName = document.querySelector('#name');
    const fieldPosition = document.querySelector('#user-position');
    const userName = clearStrValue(fieldName.value);
    const userPosition = clearStrValue(fieldPosition.value);

    if ( userName > '' && userPosition > '' ) {
        isBlockedPlay = true;
        createFoto(videoEl, userName, userPosition)
            .then(() => {
                isBlockedPlay = false;
            })
            .catch((err) => {
                log.error('mod:createFoto() catch error', err);
            });
    } else if ( userName > '' && !userPosition ) {
        fieldName.classList.remove('field-name-show');
        fieldPosition.classList.add('field-name-show');
    } else {
        fieldName.classList.add('field-name-show');
        fieldPosition.classList.remove('field-name-show');
    }
});

const clearStrValue = function (str) {
    let newStr = str;

    if ( newStr > '' ) {
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
    if ( fieldName.classList.contains('field-name-show') ) {
        fieldName.focus();
    } else if ( fieldPosition.classList.contains('field-name-show') ) {
        console.log('focus position')
        fieldPosition.focus();
    }
};
const keyboard = document.querySelector('.keyboard');
keyboard.addEventListener('click', clickKeyboard, false);

let ti = setTimeout(() => {}, 0);
document.body.addEventListener('click', function () {
    clearTimeout(ti);

    ti = setTimeout(() => {
        document.querySelector('.keyboard').classList.remove('open');
        document.querySelector('#name').value = '';
        document.querySelector('#user-position').value = '';
    }, 1000 * 30);
});

async function onPlay(videoEl) {
    if (videoEl.paused || videoEl.ended) {
        console.log(`onPlay(): videoEl paused or ended; return;`);
        return false;
    } else if (isBlockedPlay) {
        console.log(`onPlay(): isBlockedPlay; return;`);
        setTimeout(() => onPlay(videoEl), 1000);
        return false;
    }

    faceapi.getMediaDimensions(videoEl);

    const fullFaceDescriptions = await faceapi.detectAllFaces(videoEl, options)
        .withFaceExpressions()
        .withFaceLandmarks()
        .withFaceDescriptors();

    let oldFaceBoxIndex = 0;
    const oldFaceBoxes = document.querySelectorAll('.face-box');
    oldFaceBoxes.forEach((box) => {
        box.classList.add('face-box_hidden');
        box.classList.remove('face-box_old-box');
    });

    const faceBoxes = new Map();

    for (const face of fullFaceDescriptions) {
        const bestMatch = commonjs.getBestMatch(trainDescriptorsByClass, face.descriptor);
        const fb = new faceBox();
        faceBoxes.set(face.descriptor, fb);
        const html = oldFaceBoxes[oldFaceBoxIndex];

        if ( html ) {
            oldFaceBoxIndex++;
            fb.setNewHtml(html);
            html.classList.remove('face-box_hidden');
            html.classList.add('face-box_old-box');
        }

        const userName = (bestMatch.distance < opt.maxDistance ? bestMatch.className.name : '');
        fb.setValues({name: userName});
        const userPosition = (bestMatch.distance < opt.maxDistance ? bestMatch.className.position : '');
        fb.setValues({position: userPosition});

        if ( face.expressions ) {
            fb.parseExpressions(face.expressions);
        }

        fb.show(face.detection.box, (fullFaceDescriptions.length > 1), rotateVideo);

        fb.setRounds();
    }

    if (fullFaceDescriptions.length > 1) {
        faceBoxes.forEach((fb) => {
            fb.toSmalled();
        });
    }

    setTimeout(() => onPlay(videoEl), 1000);
}

async function run() {
    faceapi.env.monkeyPatch({
        Canvas: HTMLCanvasElement,
        Image: HTMLImageElement,
        ImageData: ImageData,
        Video: HTMLVideoElement,
        createCanvasElement: () => document.createElement('canvas'),
        createImageElement: () => document.createElement('img')
    })

    await faceapi.nets.ssdMobilenetv1.loadFromDisk(path.resolve(__dirname, '../mods/weights'))
    await faceapi.loadFaceDetectionModel(path.resolve(__dirname, '../mods/weights'))
    await faceapi.loadFaceLandmarkModel(path.resolve(__dirname, '../mods/weights'))
    await faceapi.loadFaceRecognitionModel(path.resolve(__dirname, '../mods/weights'))
    await faceapi.loadFaceExpressionModel(path.resolve(__dirname, '../mods/weights'))

    trainDescriptorsByClass = await commonjs.loadDetectedPeople()
    /* console.log(trainDescriptorsByClass) */
    // console.log(navigator.mediaDevices.getSupportedConstraints())
    /*navigator.mediaDevices.enumerateDevices()
        .then((devices) => {

            const cameras = devices.filter(device => device.kind === 'videoinput');
            const camera = cameras.find(camera => camera.label.includes('Dummy'));

            console.log(cameras, cameras)

            if (!camera) {
                throw new Error('No back camera found.');
            }

            console.log(camera, 'camera1')

            return navigator.mediaDevices.getUserMedia({
                video: { 
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                    frameRate: { ideal: 30, min: 25 },
                    deviceId: { exact: camera.deviceId } 
                },
                audio: false
            });
        }).then(function(stream) {
            videoEl.srcObject = stream;
            // log the real size
        }).catch(function(err) {
            console.log(err.name + ': ' + err.message);
        });*/

    navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
                facingMode: "environment",
                // aspectRatio: canvas.width/canvas.height,
                width: { ideal: 1920 },
                height: { ideal: 1080 },
                frameRate: { ideal: 30, min: 25 }
            }
        },
        stream => videoEl.srcObject = stream,
        err => console.error(err)
    ).then(function(stream) {
        videoEl.srcObject = stream;
        // log the real size
    }).catch(function(err) {
        console.log(err.name + ': ' + err.message);
    });

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