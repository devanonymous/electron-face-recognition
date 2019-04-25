const faceapi = require('face-api.js');
const db = require('pouchdb');
const  { ipcRenderer } = require('electron');

const localDB = new db('savedPeople');
const remoteDB = new db('http://localhost:5984/savedPeople');

localDB.sync(remoteDB, {
    live: true,
    retry: true
}).on('complete', function () {
    // yay, we're in sync!
}).on('error', function (err) {
    // boo, we hit an error!
});


class DataBase {
    isUniqueUser(face) {
        const savedPeople = db.getAllData();
        const faceMatcher = new faceapi.FaceMatcher(face);
        for (const key in savedPeople) {
            const descriptor = Object.values(savedPeople[key]);
            const bestMatch = faceMatcher.findBestMatch(new Float32Array(descriptor.slice(0, descriptor.length - 1)));
            if (bestMatch.label !== "unknown") {
                return false;
            }
        }
        return true;
    };

    addPerson(user) {
        localDB.post(user);
        this.sendMessageThatPersonHasBeenAdded();
    }

    sendMessageThatPersonHasBeenAdded () {
        ipcRenderer.send('PersonHasBeenAdded');
    };

    _transformDBData(dataFromDB) {
        return dataFromDB.rows.map(item => item.doc)
    }

    async getAllPersons() {
        const dataFromDB = await localDB.allDocs({
            include_docs: true
        });
        const allPersons = this._transformDBData(dataFromDB);
        console.log('allPersons', dataFromDB.rows)
        return allPersons
    }

    getPersonsCount() {
        let count = 0;
        localDB.allDocs().then(entries => count = entries.rows.length);
        return count;
    }
}

const dataBase = new DataBase();

module.exports = dataBase;