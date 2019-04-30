const faceapi = require('face-api.js/build/commonjs/index.js');
const db = require('pouchdb');
const  { ipcRenderer } = require('electron');

const localDB = new db(require('os').homedir() + '/NEURO_ID_DB');
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
}

const dataBase = new DataBase();

module.exports = dataBase;