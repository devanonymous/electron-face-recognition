const app = require('electron').app || require('electron').remote.app;
const fs = require('fs');
const path = require('path');
const faceapi = require('face-api.js');
const electron = require('electron');

const getCanvas = require('./../helpers/canvas');


if ( !fs.existsSync(path.join(app.getPath('home'), `/foto-data/`)) ) {
    fs.mkdirSync(path.join(app.getPath('home'), `/foto-data/`));
}

module.exports.loadSavedPersons = async function loadDetectedPeople() {
    const dataDir = path.join(electron.remote.app.getPath('home'), `/foto-data/`);
    const dirContent = fs.readdirSync(dataDir);

    const data = dirContent
        .filter(file => file.endsWith('.json'))
        .map(file => {
            const content = fs.readFileSync(path.join(dataDir, file), 'utf-8')
            const json = JSON.parse(content);
            console.log('json', json);
            return {
                className: {
                    name: json.className.name,
                    position: json.className.position
                },
                descriptors: json.descriptors
            };
        });
    console.log('загруженные данные: ================================== ', data);
    return data;
};

/* TODO: отрефакторить этот быдлокод*/
module.exports.savePerson = async (videoEl, options, name, position = '') => {
    const photoDataPath = (name) => path.join(app.getPath('home'), `/foto-data/${name}.json`);
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

        const face = await faceapi.detectSingleFace(getCanvas(videoEl), options)
            .withFaceLandmarks()
            .withFaceDescriptor();

        if (!face) {
            continue;
        }

        descriptors.push(new faceapi.LabeledFaceDescriptors(name, [new Float32Array(face.descriptor)]));

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
