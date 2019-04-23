const electron = require('electron');
const path = require('path');
const fs = require('fs');
const faceapi = require('face-api.js');


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
