# Keyboard by Vladimir G.
### HTML template as input field
#### Почему contenteditable а не input?, потому, что input сложно стилизовать.
```
<span class="input-text" contenteditable></span>
```
### Link the module to main script
```
require Keyboard from "./path/keyboard";
```
### Make class instance and call .init()
```
document.addEventListener("DOMContentLoaded",function() {

    const keyboard = new Keyboard({
        input: ".input-text",   // селектор в формате .class-name
        maxWidth: 800,          // примерная максимальная ширина инпута в px
        sendEvent: false,       // отправка кастомного эвента
        debug: false,           // сообщения в консоли
    });
    keyboard.init();

}); 
```
### If you want to close Keyboard and remove EventListeners:
```
keyboard.destroy();
```
### How to listebn custom event (make sure you set sendEvent: true ):
```
keyboardEnterHandler = (event) => {
    // console.log ( "текст в эвенте", event.detail.text );
};
document.addEventListener( "keyboard_text_changed", keyboardEnterHandler ); // слушаем кастомный эвент изменения текста в инпуте
```