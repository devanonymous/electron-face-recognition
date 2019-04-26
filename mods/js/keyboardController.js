const {savePerson} = require(path.resolve(__dirname, '../modules/savePerson'));
const fieldName = document.querySelector('#name');
const fieldPosition = document.querySelector('#user-position');
const loginButtons = document.getElementById('login-buttons_group');


bubble.addEventListener('click', handleBubbleClick);


let isKeyboardButtonActive = false;

const clearStrValue = (str) => {
    let newStr = str;

    if (newStr > '') {
        newStr = newStr.trim();
    }

    return newStr;
};


function handleBubbleClick() {
    bubble.classList.add('hide-background-wrap');
    fieldName.classList.toggle('field-name-show');
    fieldName.focus();
    keyboard.changeInput('#name');
    keyboard.toggle();
    isKeyboardButtonActive = !isKeyboardButtonActive;
    document.getElementById('keyboard-button').classList.remove('hide-keyboard-button');
}


/**
 *
 * @param {string} userName
 * @param {string} userPosition
 */
const savePersonToDB = (userName, userPosition) => {
    isBlockedPlay = true;
    savePerson(videoEl, options, userName, userPosition, IS_VERTICAL_ORIENTATION)
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


const hideInputs = () => {
    fieldName.classList.remove('field-name-show');
    fieldPosition.classList.remove('field-name-show');
    keyboard.hide();
    // loginButtons.classList.toggle('login-buttons_show');
    fieldName.value = '';
    fieldPosition.value = '';
    isKeyboardButtonActive = !isKeyboardButtonActive;
    document.getElementById('keyboard-button').classList.add('hide-keyboard-button');
    bubble.classList.remove('hide-background-wrap');
};

const enterButtonOnClick = () => {
    const enterButton = document.querySelector('.btn-enter');

    enterButton.addEventListener('pointerdown', function (event) {
        event.preventDefault();

        const userName = clearStrValue(fieldName.value);
        const userPosition = clearStrValue(fieldPosition.value);

        if (userName > '' && userPosition > '') {
            savePersonToDB(userName, userPosition);
            hideInputs();
        } else if (userName > '' && !userPosition) {
            enterUserPosition(fieldName, fieldPosition);
        } else {
            enterUserName(fieldName, fieldPosition)
        }
    });
};

/**
 * Клик на кнопку показать/скрыть клавиатуру
 * TODO: refactoring
 */
const showKeyboardButtonOnClick = () => {
    document.querySelectorAll('.login-buttons').forEach((btn) => {
        btn.addEventListener('click', function () {
            // if (!isKeyboardButtonActive) {
            //     fieldName.classList.toggle('field-name-show');
            //     fieldName.focus();
            //     this.classList.toggle('login-buttons_show');
            //     keyboard.changeInput('#name');
            //     keyboard.toggle();
            //     isKeyboardButtonActive = !isKeyboardButtonActive;
            // } else {
                // this.classList.toggle('login-buttons_show');
            hideInputs()
            // bubble.classList.remove('hide-background-wrap');
            // }
        });
    });
};


document.addEventListener("DOMContentLoaded", function () {
    enterButtonOnClick();
    document.getElementById('keyboard-button').classList.add('hide-keyboard-button');
    showKeyboardButtonOnClick();
});