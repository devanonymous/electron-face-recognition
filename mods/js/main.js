const electron = require('electron');
const path = require('path');
const fs = require('fs');
const faceapi = require('face-api.js');
const moment = require('moment');

const commonjs = require('../mods/js/commons');
const faceBox = require('../modules/faceBox');

let minFaceSize = 100
let maxDistance = 0.5
let minConfidence = 0.99
let forwardTimes = []

const CAMERA_ROTATION = -90;
const CAMERA_REALWIDTH = 1920;
const globalContainer = document.querySelector('.margin');

const videoEl = document.querySelector('#inputVideo')
// videoEl.style.transform = 'rotate(' + CAMERA_ROTATION + 'deg) scaleX(-1)';
var canvas = document.createElement('canvas');
canvas.width = globalContainer.getBoundingClientRect().width;
canvas.height = globalContainer.getBoundingClientRect().height;
var context = canvas.getContext('2d');

const options = new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 })
let isBlockedPlay = false;

if ( !fs.existsSync(path.join(electron.remote.app.getPath('home'), `/foto-data/`)) ) {
    fs.mkdirSync(path.join(electron.remote.app.getPath('home'), `/foto-data/`));
}

const photoDataPath = (name) => path.join(electron.remote.app.getPath('home'), `/foto-data/${name}.json`);

const getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min)) + min;
};

const createFoto = async (name) => {
    const descriptors = [];
    let totalAttempts = 0;
    const facesRequired = 20;
    const threshold = 40;

    isBlockedPlay = true;

    while (totalAttempts < threshold) {
        totalAttempts++;

        const face = await faceapi.detectSingleFace(canvas, options)
            .withFaceLandmarks()
            .withFaceDescriptor();

        if (!face) {
            const toastHTML = `<span>no face</span>`;
            M.toast({ html: toastHTML, classes: 'rounded pulse no-find' });
            continue;
        }

        const descriptorArray = [].slice.call(face.descriptor);
        descriptors.push(descriptorArray);

        const toastHTML = `<span>${descriptors.length}</span>`;
        M.toast({ html: toastHTML, classes: 'rounded pulse find' });

        if (descriptors.length >= facesRequired) {
            break;
        }
    }

    if (descriptors.length >= facesRequired) {
        fs.writeFileSync(photoDataPath(name), JSON.stringify({
            className: `${name}`,
            descriptors
        }));
        location.reload()
    } else {
        const toastHTML = `<span>Распознание не удалось</span>`;
        M.toast({ html: toastHTML, classes: 'rounded pulse no-find' });
    }

    isBlockedPlay = false;
}

const link = document.querySelector('.m_k_enter')

link.addEventListener('pointerdown', function (event) {
    event.preventDefault(event)
    createFoto(document.querySelector('#name').value)
})

document.querySelector('#name').addEventListener('focus', function () {
    document.querySelector('.keyboard').classList.add('open');
});
document.querySelector('#name').addEventListener('click', function () {
    document.querySelector('.keyboard').classList.add('open');
});

let ti = setTimeout(() => {}, 0);
document.body.addEventListener('click', function () {
    clearTimeout(ti);

    ti = setTimeout(() => {
        document.querySelector('.keyboard').classList.remove('open');
        document.querySelector('#name').value = '';
    }, 1000 * 30);
});

function rotateCanvas(m_video) {
    context.save();
    // context.translate(-420, -320);
    // context.rotate((CAMERA_ROTATION === 0 ? 1 : -CAMERA_ROTATION) * Math.PI / 180);
    // context.scale(1.35, 1.35);
    context.drawImage(m_video, 0, 0, canvas.width, canvas.height);
    context.restore();
};

function updateTimeStats(timeInMs) {
    forwardTimes = [timeInMs].concat(forwardTimes).slice(0, 30)
    const avgTimeInMs = forwardTimes.reduce((total, t) => total + t) / forwardTimes.length
}

async function onPlay(videoEl) {
    if (videoEl.paused || videoEl.ended) {
        console.log(`onPlay(): videoEl paused or ended; return;`);
        return false;
    } else if (isBlockedPlay) {
        console.log(`onPlay(): isBlockedPlay; return;`);
        setTimeout(() => onPlay(videoEl), 1000);
        return false;
    }

    const {
        width,
        height
    } = faceapi.getMediaDimensions(videoEl)
    rotateCanvas(videoEl)

    const ts = Date.now()
    const fullFaceDescriptions = await faceapi.detectAllFaces(canvas, options)
        .withFaceExpressions()
        .withFaceLandmarks()
        .withFaceDescriptors()

    updateTimeStats(Date.now() - ts)

    document.querySelectorAll('.face-box').forEach((box) => {
        box.remove();
    });
    let faceboxesLength = 0;

    for (const face of fullFaceDescriptions) {
        const bestMatch = commonjs.getBestMatch(trainDescriptorsByClass, face.descriptor);

        const fb = new faceBox();
        fb.setValues({name: (bestMatch.distance < maxDistance ? bestMatch.className : '')});
        faceboxesLength++;

        face.expressions.forEach((expressionItem) => {
            if ( expressionItem.probability.toFixed(2) > 0 ) {
                // let exNameRus = ``;
                // let $expressionItem;

                switch (expressionItem.expression) {
                    case "neutral":
                        // exNameRus = `Нейтральны`;
                        break;
                    case "happy":
                        fb.setValues({happy: Math.round(expressionItem.probability * 100)});
                        // exNameRus = `Радость`;
                        // $expressionItem = faceBox.querySelector('.face-box__expressions-item_happy');
                        break;
                    case "sad":
                        fb.setValues({sad: Math.round(expressionItem.probability * 100)});
                        // exNameRus = `Огорчение`;
                        // $expressionItem = faceBox.querySelector('.face-box__expressions-item_sad');
                        break;
                    case "angry":
                        // exNameRus = `Злы`;
                        break;
                    case "fearful":
                        fb.setValues({fearful: Math.round(expressionItem.probability * 100)});
                        // exNameRus = `Испуг`;
                        // $expressionItem = faceBox.querySelector('.face-box__expressions-item_fearful');
                        break;
                    case "disgusted":
                        // exNameRus = `Чувствуете отвращение`;
                        break;
                    case "surprised":
                        fb.setValues({suprised: Math.round(expressionItem.probability * 100)});
                        // exNameRus = `Удивление`;
                        // $expressionItem = faceBox.querySelector('.face-box__expressions-item_surprised');
                        break;
                }

                /*if ( $expressionItem ) {
                    const percentage = Math.round(expressionItem.probability * 100);
                    $expressionItem.querySelector('.face-box__expressions-item-percent-value').innerHTML = `${percentage}`;
                }*/
            }
        });

        fb.show(face.detection.box, (faceboxesLength > 1));
        // document.body.appendChild(faceBox);

        // faceBox.appendChild(expressionsClone);

        // console.log(face.expressions)

        if (bestMatch.distance < maxDistance) {
            const text = `${bestMatch.className}` //(${bestMatch.distance})
            var toastHTML = `<span>${text}</span>`;
            // M.toast({ html: toastHTML, classes: 'rounded pulse find' });
        } else {
            // console.log(`Jane Doe`);
            /*const text = `unknown (best match - ${bestMatch.className}) (${bestMatch.distance} >= ${maxDistance})`
            var toastHTML = `<div class="chip"><img src="../mods/img/amy/amy1.png" alt="Contact Person">Jane Doe</div>`;
            M.toast({ html: toastHTML, classes: 'rounded pulse not_found' });*/
        }
    }
    setTimeout(() => onPlay(videoEl), 100);
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
    await faceapi.loadFaceDetectionModel('../mods/weights')
    await faceapi.loadFaceLandmarkModel('../mods/weights')
    await faceapi.loadFaceRecognitionModel('../mods/weights')
    await faceapi.loadFaceExpressionModel('../mods/weights')

    console.log(canvas.width, canvas.height);
    trainDescriptorsByClass = await commonjs.loadDetectedPeople()
    /* console.log(trainDescriptorsByClass) */
    // console.log(navigator.mediaDevices.getSupportedConstraints())
    navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
                facingMode: "environment",
                // aspectRatio: canvas.width/canvas.height,
                width: { ideal: 1920 },
                height: { ideal: 1080 },
                frameRate: { ideal: 60, min: 25 }
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