const savePerson = require(path.resolve(__dirname, '../modules/savePerson'));

const clearStrValue = function (str) {
    let newStr = str;

    if (newStr > '') {
        newStr = newStr.trim();
    }

    return newStr;
};



document.addEventListener("DOMContentLoaded", function () {
    const link = document.querySelector('.btn-enter');

    link.addEventListener('pointerdown', function (event) {
        event.preventDefault();

        const fieldName = document.querySelector('#name');
        const fieldPosition = document.querySelector('#user-position');
        const userName = clearStrValue(fieldName.value);
        const userPosition = clearStrValue(fieldPosition.value);

        if (userName > '' && userPosition > '') {
            isBlockedPlay = true;
            savePerson(videoEl, options, userName, userPosition)
                .then(() => {
                    isBlockedPlay = false;
                })
                .catch((err) => {
                    log.error('mod:createFoto() catch error', err);
                });
        } else if (userName > '' && !userPosition) {
            fieldName.classList.remove('field-name-show');
            fieldPosition.classList.add('field-name-show');
            keyboard.changeInput('#user-position');
            keyboard.init();
        } else {
            fieldName.classList.add('field-name-show');
            fieldPosition.classList.remove('field-name-show');
            keyboard.changeInput('#name');
            keyboard.init();
        }
    });


    document.querySelectorAll('.login-buttons').forEach((btn) => {
        btn.addEventListener('click', function () {
            const $name = document.querySelector('#name');
            $name.classList.add('field-name-show');
            $name.focus();

            this.classList.add('login-buttons_show');
            keyboard.show();
        });
    });
});