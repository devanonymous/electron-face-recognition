const {ipcRenderer} = require('electron');
const path = require('path');

const faceapi = require('face-api.js');

// const getCanvas = require(path.resolve(__dirname, '../js/helpers/canvas'));

ipcRenderer.on('faceObject', (event, {canvas, IS_VERTICAL_ORIENTATION, options}) => {
    console.log(canvas);

    const canvas2 = document.getElementById('canvas');
    const context = canvas2.getContext('2d');

    context.putImageData(new ImageData(new Uint8ClampedArray(canvas[0].data), canvas[2]), canvas[1], canvas[2]);


    faceapi.detectAllFaces(canvas2)
        .withFaceExpressions()
        .withFaceLandmarks()
        .withFaceDescriptors()
        .then(faceDesctiption => {
            console.log('Atatata', faceDesctiption)
        })

});


function ready() {
    ipcRenderer.send('ready')
}

ready();