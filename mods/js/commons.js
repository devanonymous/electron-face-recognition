const electron = require('electron');
const path = require('path');
const fs = require('fs');
const faceapi = require('face-api.js');

//const classes = ['amy', 'bernadette', 'howard', 'leonard', 'penny', 'raj', 'sheldon', 'stuart', 'maxim', 'igor', 'vladimir']
function getImageUri(imageName) {
  return `../mods/img/${imageName}`
}

function getFaceImageUri(className, idx) {
  return path.resolve(__dirname, `../mods/img/${className}/${className}${idx}.png`);
}

async function fetchImage(uri) {
  return (await fetch(uri)).blob()
}

exports.loadDetectedPeople = async function loadDetectedPeople() {
  const dataDir = path.join(electron.remote.app.getPath('home'), `/foto-data/`);
  const dirContent = fs.readdirSync(dataDir);

  return dirContent
    .filter(file => file.endsWith('.json'))
    .map(file => {
      const content = fs.readFileSync(path.join(dataDir, file), 'utf-8')
      const json = JSON.parse(content)
      return {
        className: {
            name: json.className.name,
            position: json.className.position
        },
        descriptors: json.descriptors.map(descriptor => new Float32Array(descriptor))
      };
    });
};

exports.getBestMatch = function getBestMatch(descriptorsByClass, queryDescriptor) {
  if ( !descriptorsByClass.length ) {
      return false;
  }

  function computeMeanDistance(descriptorsOfClass) {

    const divider = (descriptorsOfClass.length || 1)

    const distance = descriptorsOfClass
      .map(d => faceapi.euclideanDistance(d, queryDescriptor))
      .reduce((d1, d2) => d1 + d2, 0) / divider

    return faceapi.round(distance);
  }
  return descriptorsByClass
    .map(
      ({
        descriptors,
        className
      }) => ({
        distance: computeMeanDistance(descriptors),
        className
      })
    )
    .reduce((best, curr) => best.distance < curr.distance ? best : curr)
}
