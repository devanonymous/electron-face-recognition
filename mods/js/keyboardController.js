const {savePerson} = require(path.resolve(__dirname, '../modules/savePerson'));

const clearStrValue =  (str) => {
    let newStr = str;

    if (newStr > '') {
        newStr = newStr.trim();
    }

    return newStr;
};

/**
 *
 * @param {string} userName
 * @param {string} userPosition
 */
const savePersonToFile = (userName, userPosition) => {
    isBlockedPlay = true;
    savePerson(videoEl, options, userName, userPosition)
        .then(() => {
            isBlockedPlay = false;
        })
        .catch((err) => {
            log.error('mod:createFoto() catch error', err);
        });
};

/**
 * показывает поле ввода должности, скрывает поле ввода имени
 *
 * @param {HTMLElement} fieldName
 * @param {HTMLElement} fieldPosition
 */
const enterUserPosition = (fieldName, fieldPosition) => {
    fieldName.classList.remove('field-name-show');
    fieldPosition.classList.add('field-name-show');
    keyboard.changeInput('#user-position');
    keyboard.init();
};

/**
 * показывает поле ввода имени, скрывает поле ввода должности
 *
 * @param {HTMLElement} fieldName
 * @param {HTMLElement} fieldPosition
 */
const enterUserName = (fieldName, fieldPosition) => {
    fieldName.classList.add('field-name-show');
    fieldPosition.classList.remove('field-name-show');
    keyboard.changeInput('#name');
    keyboard.init();
};

const enterButtonOnClick = () => {
    const enterButton = document.querySelector('.btn-enter');

    enterButton.addEventListener('pointerdown', function (event) {
        event.preventDefault();

        const fieldName = document.querySelector('#name');
        const fieldPosition = document.querySelector('#user-position');
        const userName = clearStrValue(fieldName.value);
        const userPosition = clearStrValue(fieldPosition.value);

        if (userName > '' && userPosition > '') {
            savePersonToFile(userName, userPosition);
        } else if (userName > '' && !userPosition) {
            enterUserPosition(fieldName, fieldPosition);
        } else {
            enterUserName(fieldName, fieldPosition)
        }
    });
};

/**
 * Клик на кнопку показать/скрыть клавиатуру
 */
const showKeyboardButtonOnClick = () => {
    document.querySelectorAll('.login-buttons').forEach((btn) => {
        btn.addEventListener('click', function () {
            const $name = document.querySelector('#name');
            $name.classList.toggle('field-name-show');
            $name.focus();

            this.classList.toggle('login-buttons_show');
            keyboard.toggle();
        });
    });
};

document.addEventListener("DOMContentLoaded", function () {
    enterButtonOnClick();
    showKeyboardButtonOnClick();
});