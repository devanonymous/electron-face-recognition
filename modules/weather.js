// const fetch = require('node-fetch');
const log = require('electron-log');

module.exports = function () {
    try {
        return new Promise(function (resolve, reject) {
            return resolve('-9');

            fetch('https://api.apixu.com/v1/current.json?key=48cfd6c0a0bb4de0acf51724190401&q=Moscow')
                .then((re) => re.json())
                .then((re) => {
                    if ( re && re.current && re.current.temp_c ) {
                        resolve(re.current.temp_c);
                    } else {
                        reject(re);
                    }
                })
                .catch((err) => {
                    log.error(err);
                });
        });
    } catch (err) {
        log.error(err);
    }
};