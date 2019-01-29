const app = require('electron').app || require('electron').remote.app;
const fs = require('fs');
const path = require('path');
const faceapi = require('face-api.js');

if ( !fs.existsSync(path.join(app.getPath('home'), `/foto-data/`)) ) {
    fs.mkdirSync(path.join(app.getPath('home'), `/foto-data/`));
}

module.exports = async (videoEl, name, position = '') => {
    const photoDataPath = (name) => path.join(app.getPath('home'), `/foto-data/${name}.json`);
    const descriptors = [];
    let totalAttempts = 0;
    const facesRequired = 20;
    const threshold = 40;

    // TODO: test and set alerts

    while (totalAttempts < threshold) {
        totalAttempts++;

        const face = await faceapi.detectSingleFace(videoEl, options)
            .withFaceLandmarks()
            .withFaceDescriptor();

        if (!face) {
            const toastHTML = `<span>no face</span>`;
            // M.toast({ html: toastHTML, classes: 'rounded pulse no-find' });
            continue;
        }

        const descriptorArray = [].slice.call(face.descriptor);
        descriptors.push(descriptorArray);

        const toastHTML = `<span>${descriptors.length}</span>`;
        // M.toast({ html: toastHTML, classes: 'rounded pulse find' });

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
        const toastHTML = `<span>Распознание не удалось</span>`;
        // M.toast({ html: toastHTML, classes: 'rounded pulse no-find' });
    }
};
