const app = require('electron').app || require('electron').remote.app;
const fs = require('fs');
const path = require('path');
const faceapi = require('face-api.js');
const getCanvas = require('./../helpers/canvas');

if ( !fs.existsSync(path.join(app.getPath('home'), `/foto-data/`)) ) {
    fs.mkdirSync(path.join(app.getPath('home'), `/foto-data/`));
}

module.exports = async (videoEl, options, name, position = '') => {
    const photoDataPath = (name) => path.join(app.getPath('home'), `/foto-data/${name}.json`);
    const descriptors = [];
    let totalAttempts = 0;
    const facesRequired = 20;
    const threshold = 40;
    const $createFoto = document.querySelector('.create-foto');
    const $fotoDescription = $createFoto.querySelector('.js-create-foto__foto-description');
    const $fotoIndex = $createFoto.querySelector('.js-create-foto__foto-index');
    const $fotoMax = $createFoto.querySelector('.js-create-foto__foto-max');

    $fotoDescription.innerHTML = '';
    $fotoIndex.innerHTML = 0;
    $fotoMax.innerHTML = facesRequired;
    $createFoto.classList.add('create-foto_show');

    while (totalAttempts < threshold) {
        totalAttempts++;

        const face = await faceapi.detectSingleFace(getCanvas(videoEl), options)
            .withFaceLandmarks()
            .withFaceDescriptor();

        if (!face) {
            continue;
        }

        const descriptorArray = [].slice.call(face.descriptor);
        descriptors.push(descriptorArray);

        $fotoIndex.innerHTML = descriptors.length;

        if (descriptors.length >= facesRequired) {
            break;
        }
    }

    if (descriptors.length >= facesRequired) {
        fs.writeFileSync(photoDataPath(name), JSON.stringify({
            className: {
                name:`${name}`,
                position: `${position}`
            },
            descriptors
        }));
        location.reload()
    } else {
        $fotoDescription.innerHTML = `Распознание не удалось`;

        setTimeout(() => {
            $createFoto.classList.remove('create-foto_show');
        }, 5000);
    }
};
