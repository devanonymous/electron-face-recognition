const electron = require('electron');
const path = require('path');
const fs = require('fs');
const faceapi = require('face-api.js');
const moment = require('moment');
const log = require('electron-log');

const commonjs = require('../mods/js/commons');
const faceBox = require('../modules/face-box');
const createFoto = require('../modules/create-foto');

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



const link = document.querySelector('.m_k_enter')

link.addEventListener('pointerdown', function (event) {
    event.preventDefault(event)

    const fieldName = document.querySelector('#name');
    const fieldPosition = document.querySelector('#user-position');
    const userName = clearStrValue(fieldName.value);
    const userPosition = clearStrValue(fieldPosition.value);

    if ( userName > '' && userPosition > '' ) {
        isBlockedPlay = true;
        createFoto(userName, userPosition)
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

function rotateCanvas(m_video) {
    context.save();
    context.translate(-420, 0);
    // context.rotate((CAMERA_ROTATION === 0 ? 1 : -CAMERA_ROTATION) * Math.PI / 180);
    // context.rotate(1 * Math.PI / 180);
    // context.scale(1.35, 1.35);
    context.drawImage(m_video, 0, 0, 1920, 1920);
    context.restore();
};

function updateTimeStats(timeInMs) {
    forwardTimes = [timeInMs].concat(forwardTimes).slice(0, 30)
    const avgTimeInMs = forwardTimes.reduce((total, t) => total + t) / forwardTimes.length
}

function graphics(size = 64, strokeWidth = 4) {
    (function () {
        let $graphics = $(".b-graphic");

        if ( $graphics.length < 1 ) {
            return false;
        }

        $graphics.each(function (graphicIndex) {
            let $this = $(this);
            let $graphWrapper = $this.find(".b-graphic__graph");
            let $items = $this.find(".b-graphic__items__item");
            let $parts = $items.find(".b-graphic__items__part");

            if ( $graphWrapper.length < 1 || $items.length < 1 || $parts.length < 1 ) {
                console.warn(
                    "$graphWrapper: "+ parseInt($graphWrapper.length,10) + "\n" +
                    "$items: "+ parseInt($items.length,10) + "\n" +
                    "$parts: "+ parseInt($parts.length,10)
                );

                return false;
            }

            $items.attr("data-index", function (index) {
                return index;
            });

            let style = {
                fill: "none",
                activeFill: "none",

                stroke: "url(#gradientName)",
                activeStroke: "url(#gradientName)",
                strokeWidth: strokeWidth,
                activeStrokeWidth: strokeWidth
            };
            let round = {
                center: size / 2,
                radius: (size - style.strokeWidth) / 2,
                activeRadius: (size - style.strokeWidth) / 2,
                sum: 0,
                finalSum: 0,
                parts: [],
                finalParts: [],
                part: 0,
                finalPart: 0,
                minValue: 5,// %
                sumMinValues: 0,
                normalValuesLength: 0
            };
            let percent = {
                sum: 0,
                parts: [],
                part: 0,
                minValue: 3// %
            };
            let i = 0;// clear if use this letiable
            let textSufix = ($parts.text().trim().indexOf("%") > 0 ? "%" : false);

            $parts.each(function (index, element) {
                let value = parseFloat($(element).text().trim());

                round.parts[index] = value;
                round.finalParts[index] = value;
                round.sum+= value;

                percent.parts[index] = value;
                percent.sum+= value;
            });

            round.part = 360 / round.sum;//console.log(round.part)
            percent.part = 100 / percent.sum;//console.log(percent.part)

            // for check need resize small sectors to minValue
            for ( i = 0; round.parts.length > i; i++ ) {
                if ( round.parts[i] * round.part - round.part <= 10 ) {
                    round.sumMinValues+= round.parts[i];
                    round.finalParts[i] = round.minValue;
                } else {
                    round.normalValuesLength++;
                }
            }

            if ( round.sumMinValues > 0 ) {
                for ( i = 0; round.parts.length > i; i++ ) {
                    if ( round.parts[i] * round.part - round.part > 10 ) {
                        round.finalParts[i] = round.parts[i] - (round.sumMinValues / round.normalValuesLength);
                    }
                }
            }

            for ( i = 0; round.parts.length > i; i++ ) {
                round.finalSum+= round.finalParts[i];
            }

            round.finalPart = 360 / round.finalSum;//console.log(round.finalParts)

            $graphWrapper.html("<svg></svg>");

            let $svg = $graphWrapper.find("svg");
            $svg.width(size);
            $svg.height(size);
            // let $defs = $svg.querySelector('defs');

            let start = 0;
            let end = 0;
            let html = "";

            for ( i = 0; $parts.length > i; i++ ) {
                start = start + (round.finalParts[i - 1] ? round.finalParts[i - 1] : 0);
                end = end + round.finalParts[i];

                let startPI = Math.PI * (start * round.finalPart) / 180;
                let endPI = Math.PI * (end * round.finalPart) / 180;

                let startX = round.center + round.radius * Math.cos(startPI);
                let startY = round.center + round.radius * Math.sin(startPI);

                let endX = round.center + round.radius * Math.cos(endPI);
                let endY = round.center + round.radius * Math.sin(endPI);

                let startActiveX = round.center + round.activeRadius * Math.cos(startPI);
                let startActiveY = round.center + round.activeRadius * Math.sin(startPI);

                let endActiveX = round.center + round.activeRadius * Math.cos(endPI);
                let endActiveY = round.center + round.activeRadius * Math.sin(endPI);

                let M = 'M'+ round.center +','+ round.center;
                let L = 'L'+ startX +','+ startY;
                let activeL = 'L'+ startActiveX +','+ startActiveY;
                let A = 'A'+ round.radius +','+ round.radius +
                    (100/percent.sum * percent.parts[i] > 50 ? ' 0 1,1 ' : ' 0 0,1 ') +
                    endX +','+ endY;
                let activeA = 'A'+ round.activeRadius +','+round.activeRadius +
                    (100/percent.sum * percent.parts[i] > 50 ? ' 0 1,1 ' : ' 0 0,1 ') +
                    endActiveX +','+ endActiveY;
                let Z = 'Z';

                // document.querySelector('#svg-cat path').setAttribute('d', M + L + A + Z);

                html+= ''+
                    '<path d="'+ M + L + A + Z +'" '+
                    'fill="'+ style.fill +'" '+
                    'stroke="'+ (i < 1 ? style.stroke : 'none') +'" '+
                    'stroke-width="'+ style.strokeWidth +'" '+
                    'stroke-linejoin="miter" ' +
                    'data-active="'+ M + activeL + activeA + Z +'" '+
                    'data-index="'+ i +'" ' +
                    'mask="url(#svg-cat_'+ graphicIndex +')" ' +
                    'transform="rotate(-90)" ' +
                    'style="transform-origin: 50%;"></path>';

                /*
                                    let textX = round.center + (round.radius/1.5) * Math.cos((startPI+endPI)/2);
                                    let textY = round.center + (round.radius/1.5) * Math.sin((startPI+endPI)/2);

                                    let tx1 = round.center + (round.radius/1.5) * Math.cos((startPI+endPI*2)/3);
                                    let tx2 = round.center + (round.radius/1.5) * Math.sin((startPI+endPI*2)/3);
                                    let tx3 = round.center + round.radius * Math.cos((startPI+endPI*2)/3);
                                    let tx4 = round.center + round.radius * Math.sin((startPI+endPI*2)/3);

                                    let insertText = (textSufix ? round.parts[i] +"%" : round.parts[i]);

                                    if ( round.parts[i] * round.part - round.part > 10 ) {
                                        html+= ''+
                                            '<text '+
                                            'x="'+ textX +'" '+
                                            'y="'+ textY +'" '+
                                            'fill="#000" '+
                                            'font-size="15" '+
                                            'font-family="\'PT Sans\',\'Helvetica Neue\',Helvetica,Arial,\'sans-serif\'" '+
                                            'data-index="'+ i +'" '+
                                            'transform="translate(-10,0)">'+ insertText +'</text>';
                                    } else {
                                        html+= ''+
                                            '<defs>'+
                                            '<path '+
                                            'id="testPath'+i+'" '+
                                            'd="M'+tx1+','+tx2+' C'+tx1+','+tx2+' '+tx1+','+tx2+' '+tx3+','+tx4+'" />'+
                                            '</defs>'+
                                            '<text '+
                                            'fill="#000" '+
                                            'font-size="15" '+
                                            'font-family="PTSans, sans-serif" '+
                                            'data-index="'+ i +'">'+
                                            '<textPath xlink:href="#testPath'+i+'">'+ insertText +'</textPath>'+
                                            '</text> ';
                                    }*/
            }

            html+= `<defs>
                    <mask id="svg-cat_${graphicIndex}">
                        <rect class="svg-cat__rect" width="${size}" height="${size}" fill="white" />
                        <circle class="svg-cat__circle" stroke="white" fill="black"
                        cx="${size/2}" cy="${size/2}" r="${(size - style.strokeWidth)/2}" stroke-width="${style.strokeWidth}" />
                    </mask>
                </defs>`;

            $svg.html(html);
            /*
                            let d;
                            let $activeItem;
                            let $activePath;

                            $svg.find("path")
                                .on("mouseenter", function () {
                                    let $thisPath = $(this);
                                    d = $thisPath.attr("d");

                                    let part = parseFloat($thisPath.attr("data-part"));

                                    i = parseInt($thisPath.attr("data-index"),10);

                                    $svg
                                        .append(
                                            $thisPath
                                                .attr("fill", style.activeFill)
                                                .attr("stroke", style.activeStroke)
                                                .attr("stroke-width", style.activeStrokeWidth)
                                                .attr("d",$thisPath.attr("data-active"))
                                        )
                                        .append($svg.find("text[data-index='"+i+"']"));

                                    $activeItem = $this.find(".b-graphic__items__item[data-index='"+i+"']");
                                    $activeItem.addClass("b-graphic__items__item_active");
                                })
                                .on("mouseleave", function () {
                                    $(this)
                                        .attr("fill", style.fill)
                                        .attr("stroke", style.stroke)
                                        .attr("stroke-width", style.strokeWidth)
                                        .attr("d",d);

                                    $activeItem.removeClass("b-graphic__items__item_active");
                                });

                            $svg.find("text")
                                .on("mouseenter", function () {
                                    i = parseInt($(this).attr("data-index"),10);

                                    $svg.find("path[data-index='"+i+"']").trigger("mouseenter");
                                })
                                .on("mouseleave", function () {
                                    i = parseInt($(this).attr("data-index"),10);

                                    $svg.find("path[data-index='"+i+"']").trigger("mouseleave");
                                });

                            setTimeout(function () {
                                $items
                                    .on("mouseenter", function () {
                                        i = parseInt($(this).attr("data-index"),10);
                                        $activePath = $svg.find("path[data-index='"+i+"']");
                                        d = $activePath.attr("d");


                                        $svg
                                            .append(
                                                $activePath
                                                    .attr("fill", style.activeFill)
                                                    .attr("stroke", style.activeStroke)
                                                    .attr("stroke-width", style.activeStrokeWidth)
                                                    .attr("d",$activePath.attr("data-active"))
                                            )
                                            .append($svg.find("text[data-index='"+i+"']"));
                                    })
                                    .on("mouseleave", function () {
                                        $activePath
                                            .attr("fill", style.fill)
                                            .attr("stroke", style.stroke)
                                            .attr("stroke-width", style.strokeWidth)
                                            .attr("d",d);
                                    });
                            },0);*/

            // console.log("===")
        });
    })();
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

    updateTimeStats(Date.now() - ts);

    // if ( document.querySelectorAll('.face-box').length > 0 ) {
        // return false;
    // }

    let oldFaceBoxIndex = 0;
    const oldFaceBoxes = document.querySelectorAll('.face-box');
    oldFaceBoxes.forEach((box) => {
        box.classList.add('face-box_hidden');
    });

    const faceBoxes = new Map();
    let faceboxesLength = 0;

    for (const face of fullFaceDescriptions) {
        const bestMatch = commonjs.getBestMatch(trainDescriptorsByClass, face.descriptor);

        const fb = new faceBox();
        faceBoxes.set(face.descriptor, fb);
        const html = oldFaceBoxes[oldFaceBoxIndex];

        if ( html ) {
            oldFaceBoxIndex++;
            fb.setNewHtml(html);
            html.classList.remove('face-box_hidden');
        }

        const userName = (bestMatch.distance < maxDistance ? bestMatch.className.name : '');
        fb.setValues({name: userName});
        const userPosition = (bestMatch.distance < maxDistance ? bestMatch.className.position : '');
        fb.setValues({position: userPosition});

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

        if (faceboxesLength > 1) {
            faceBoxes.forEach((fb) => {
                fb.toSmalled();
            });
        }



        {
            const graph = document.querySelector('#b-graphic');

            faceBoxes.forEach((fb) => {
                fb.html.querySelectorAll('.face-box__expressions-item').forEach((fbItem) => {
                    const graphClone = graph.cloneNode(true);
                    graphClone.classList.add('b-graphic');
                    graphClone.removeAttribute('id');

                    const graphItems = graphClone.querySelectorAll('.b-graphic__items__part');
                    const value = Math.round(fbItem.querySelector('.face-box__expressions-item-percent-value').innerHTML.trim());
                    graphItems[0].innerHTML = (value > 0 ? value : 0);
                    graphItems[1].innerHTML = 100 - value;

                    if ( value > 0 ) {
                        fbItem.appendChild(graphClone);
                    }
                });
            });

            graphics((faceboxesLength === 1 ? 165 : 64), (faceboxesLength === 1 ? 12 : 4));
        }



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
    await faceapi.loadFaceDetectionModel('../mods/weights')
    await faceapi.loadFaceLandmarkModel('../mods/weights')
    await faceapi.loadFaceRecognitionModel('../mods/weights')
    await faceapi.loadFaceExpressionModel('../mods/weights')

    console.log(canvas.width, canvas.height);
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