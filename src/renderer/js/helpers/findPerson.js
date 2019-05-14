/*
    в таком виде данные хранятся в бд

    {
        className: {name: "name", position: "position"},
        descriptors: [{…}],                                          ## дескрипторы храняться в массиве, т.к у одного человека может быть несколько дескрипторов, если указать в savePerson.js чтобы сохранялось несколько фото
        _id: "0c3d70fd-b7df-48b0-9938-1fa55b7609ff",
        _rev: "1-eb569e6424ed134000c5474b4de7791f",
    }
*/

/*
*
* TODO: make refactoring
*
* */

const electron = require('electron');
const path = require('path');
const fs = require('fs');
const faceapi = require('face-api.js/build/commonjs/index.js');


/**
 *  Делает из объекта дескриптора массив
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
 * Перебираем всех сохранённых людей (savedPeople) и сравниваем с лицом у вебкамеры (face)
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
