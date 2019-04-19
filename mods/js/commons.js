const electron = require('electron');
const path = require('path');
const fs = require('fs');
const faceapi = require('face-api.js');

function getImageUri(imageName) {
    return `../mods/img/${imageName}`
}

function getFaceImageUri(className, idx) {
    return path.resolve(__dirname, `../mods/img/${className}/${className}${idx}.png`);
}

async function fetchImage(uri) {
    return (await fetch(uri)).blob()
}

exports.loadSavedPeople = async function loadDetectedPeople() {
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

// TODO: эта дрочильня хуйню какую-то считает
function computeMeanDistance(descriptorsOfClass, faceDescriptor) {

    const divider = (descriptorsOfClass.length || 1);

    const distance = descriptorsOfClass
        .map(d => faceapi.euclideanDistance(d, faceDescriptor))
        .reduce((d1, d2) => d1 + d2, 0) / divider;

    return faceapi.round(distance);
}

/**
 *
 *
 * @param {object} objectDescriptor
 * @returns {Array}
 */
const makeArrayFromObectDescriptor = (objectDescriptor) => {
    const descriptorsArray = [];
    for (let key in objectDescriptor) {
        descriptorsArray.push(objectDescriptor[key]);
    }
    return descriptorsArray
};

/**
 *
 * @param {Array} bestMatchers
 * @returns {object}
 */
function createBestResult(bestMatchers) {
    const result = bestMatchers.filter(matcher => matcher.bestMatcher.label !== "unknown")[0];
    if (result) {
        return {
            distance: result.bestMatcher.distance,
            className: result.className
        };
    }
    return false
}

/**
 *
 * @param {Array} savedPeople
 * @param {Float32Array} face
 * @returns {boolean|*}
 */
exports.getBestMatch = function getBestMatch(savedPeople, face) {
    const bestMatchers = [];

    savedPeople.map(({descriptors, className}) => {
        descriptors.forEach((descriptor) => {
            const desc = new Float32Array(makeArrayFromObectDescriptor(descriptor._descriptors[0]));
            const label = descriptor._label;

            const labeledFaceDescription = new faceapi.LabeledFaceDescriptors(label, [new Float32Array(desc)]);

            const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescription);
            const bestMatcher = faceMatcher.findBestMatch(face.descriptor);
            bestMatchers.push({bestMatcher, className});
        })
    });
    return createBestResult(bestMatchers);
};
