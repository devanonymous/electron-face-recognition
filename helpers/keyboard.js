const Keyboard = require('../modules/Keyboard_input/keyboard');


const keyboard = new Keyboard({
    input: "#name",   // селектор в формате .class-name
    maxWidth: 800,          // примерная максимальная ширина инпута
    sendEvent: false,       // отправка кастомного эвента
    debug: true,           // сообщения в консоли
});
keyboard.init();
keyboard.hide();

module.exports = keyboard;