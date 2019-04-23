const electron = require('electron');
const path = require('path');
const fs = require('fs');
const faceapi = require('face-api.js');


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


/**
 *
 *
 * @param {object} objectDescriptor
 * @returns {Array}
 */
const makeArrayFromObjectDescriptor = (objectDescriptor) => {
    const descriptorsArray = [];
    for (let key in objectDescriptor) {
        descriptorsArray.push(objectDescriptor[key]);
    }
    return descriptorsArray
};

/**
 *
 * @param {Array} bestMatchers
 * @param {object} webcamFace
 * @returns {object}
 */
function createBestResult(bestMatchers, webcamFace) {
    const result = bestMatchers.filter(matcher => matcher.bestMatcher.label !== "unknown")[0];
    if (result) {
        return {
            distance: result.bestMatcher.distance,
            descriptor: webcamFace.descriptor[0],
            className: result.className
        };
    }
    return {
        distance: 1,
        descriptor: webcamFace.descriptor[0],
        className: {
            className: {
                name: 'Неопознанный',
                position: 'человек'
            },
            descriptors: webcamFace.descriptor[0]
        }
    };
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
            const desc = new Float32Array(makeArrayFromObjectDescriptor(descriptor._descriptors[0]));
            const label = descriptor._label;

            const labeledFaceDescription = new faceapi.LabeledFaceDescriptors(label, [new Float32Array(desc)]);

            const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescription);
            const bestMatcher = faceMatcher.findBestMatch(face.descriptor);
            bestMatchers.push({bestMatcher, className});
        })
    });
    return createBestResult(bestMatchers, face);
};
