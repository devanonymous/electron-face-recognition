const faceapi = require('face-api.js/build/commonjs/index.js');

const dataBase = require('./dataBase');
const {getCanvas} = require('../helpers/canvas');


module.exports.loadSavedPersons = async () => {
    const data = await dataBase.getAllPersons();
    console.log('загруженные данные: ================================== ', data);
    return data;
};

/* TODO: отрефакторить этот быдлокод*/
/**
 *
 *
 *
 * @param {HTMLVideoElement} videoEl
 * @param {object} options
 * @param {string} name
 * @param {string} position
 * @param {boolean} isVerticalOrientation
 * @returns {Promise<void>}
 */
module.exports.savePerson = async (videoEl, options, name, position = '', isVerticalOrientation) => {
    const descriptors = [];
    let totalAttempts = 0;
    const facesRequired = 1;
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

        const face = await faceapi.detectSingleFace(getCanvas(videoEl, isVerticalOrientation), options)
            .withFaceLandmarks()
            .withFaceDescriptor();

        const distanceThreshold = new faceapi.FaceMatcher(face).distanceThreshold;

        if (!face || distanceThreshold === 0) {
            continue;
        }

        descriptors.push(new faceapi.LabeledFaceDescriptors(name, [new Float32Array(face.descriptor)]));

        $fotoIndex.innerHTML = descriptors.length;

        if (descriptors.length >= facesRequired) {
            break;
        }
    }

    if (descriptors.length >= facesRequired) {
        dataBase.addPerson({
                className: {
                    name:`${name}`,
                    position: `${position}`
                },
                descriptors
            });
        $createFoto.classList.remove('create-foto_show');
    } else {
        $fotoDescription.innerHTML = `Распознание не удалось`;

        setTimeout(() => {
            $createFoto.classList.remove('create-foto_show');
        }, 5000);
    }
};
