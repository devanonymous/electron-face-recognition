

class Keyboard{
    constructor(options){
        this.wrapper = document.querySelector(options.wrapper) || document.querySelector(".keyboard-wrap");
        this.keyboard = document.querySelector(".keyboard");
        this.input =  document.querySelector(options.target) || document.querySelector(".input-text");
        this.classes = this.keyboard.classList;
        this.debug = options.debug;
        this.sendEvent = options.sendEvent;
        this.maxWidth = options.maxWidth;
        this.caret = 0;
        this.keyboardClickHandler = this.keyboardClickHandler.bind(this);
        this.inputBlurHandler = this.inputBlurHandler.bind(this);
        this.inputChangeHandler = this.inputChangeHandler.bind(this);
        this.init = this.init.bind(this);
        this.destroy = this.destroy.bind(this);
        this.clear = this.clear.bind(this);
        this.writeToInput = this.writeToInput.bind(this);
    }
    init(){
        this.input.focus(); // ставим первый раз курсор в инпут
        this.keyboard.addEventListener( "click", this.keyboardClickHandler ); // клик на клавиатуре
        this.input.addEventListener( "blur", this.inputBlurHandler ); // потерян фокус с инпута
        this.input.addEventListener( "input", this.inputChangeHandler ); // изменен текст в инпуте
        this.caret = this.getCustomFocus().endPos;
        this.input.selectionStart = this.input.selectionEnd = this.caret; // указываем где должен быть курсор
        this.show();
        document.querySelectorAll(".keyboard .kb").forEach(kb => {
            kb.classList.remove("active");
        });
        document.querySelector(".keyboard .keyboard-ru").classList.add("active");
    }
    destroy(){
        this.keyboard.removeEventListener( "click", this.keyboardClickHandler );
        this.input.removeEventListener( "blur", this.inputBlurHandler );
        this.input.removeEventListener( "input", this.inputChangeHandler );
        this.input.value = "";
        this.input.selectionStart = this.input.selectionEnd = 0;
        if ( this.sendEvent ){ this.textChanged(""); }
        this.hide();
    }
    show(){
        this.wrapper.classList.add( "keyboard-active" );
    }
    hide(){
        this.wrapper.classList.remove( "keyboard-active" );
    }
    clear(){
        this.input.value = "";
        this.caret = 0;
        this.input.selectionStart = this.input.selectionEnd = 0;
        if ( this.sendEvent ){ this.textChanged(""); }
    }
    getCustomFocus(){
        let startPos = this.input.selectionStart;
        let endPos = this.input.selectionEnd;
        return {startPos:startPos, endPos:endPos};
    }
    // setCustomFocus(pos){
    //     if( this.input.firstChild ){
    //         let range = document.createRange();
    //         let sel = window.getSelection();
    //         range.setStart( this.input.firstChild, pos );
    //         range.collapse( true );
    //         sel.removeAllRanges();
    //         sel.addRange( range );
    //     } else{
    //         this.input.focus();
    //     }
    // }
    writeToInput( text ){
        this.input.value = text;
        if( this.sendEvent ){ this.textChanged( this.input.value ); }  // отправка в эвент
        // this.clone();
    }
    inputChangeHandler(event) {
        // обработчик ввода текста с физической клавиатуры
        if( this.debug ) { console.log( event ); }
        if( this.sendEvent ){ this.textChanged( this.input.value ); }  // отправка в эвент
        // this.clone();
    }
    // clone(){
    //     this.cloneDiv.innerText = this.input.value;
    // }
    // обработчик потери фокуса
    inputBlurHandler(event){
        this.input.focus(); 
        if( this.debug ){ console.log("потерян фокус"); }
    }
    keyboardClickHandler(event){
        event.preventDefault();
        let caret = this.getCustomFocus(),
            element = event.target,
            oldText = this.input.value,
            length = oldText.length,
            beforeCaret = oldText.substring( 0, caret.startPos ),
            afterCaret = oldText.substring( caret.endPos, length ),
            classL = "",
            newText = "",
            resultText = "";
        if( this.debug ) { console.log( "клик на элементе", element ); }
        // if ( element ==  this.input ){
        //     // console.log("это инпут")
        //     this.caret = this.getCustomFocus();
        //     return;
        // }
        // обработка кнопок с символами
        if ( element.tagname !== "I" ) {
             element = element.closest("I") 
        }
        if (element){
            classL = element.classList;
            newText = element.innerText; // берется текст из кнопки
            // визуальная реакция на нажатие
            element.classList.add("click");
            setTimeout(() => {
                element.classList.remove("click");
            }, 300); 
        } else { // клик мимо кнопки
            if( this.debug ) { console.log("это не кнопка", element ); }
            // this.setCustomFocus(this.caret);
            return false; 
        }

        // обработка кнопок с действиями
        if ( classL ){
            // нажат пробел
            if( classL.contains("btn-space") ) {
                newText = "\u00A0";
            }
            // нажат бэкспейс
            if( classL.contains("btn-bsp") ) {
                resultText = beforeCaret.slice(0, -1)+afterCaret;
                this.writeToInput( resultText ); // пишем полученный текст в инпут
                if ( this.sendEvent ){ this.textChanged(resultText); }  // отправка в эвент
                if( caret.startPos-1 >= 0 ){
                    // this.setCustomFocus(caret-1);
                    this.caret--;
                    this.input.selectionStart = this.input.selectionEnd = caret.startPos - 1;
                }
                return "bsp";
            }
            // нажат вввод
            if( classL.contains("btn-enter") ) {
                // поиск по тексту в инпуте (oldText)
                resultText = oldText;
                if ( this.sendEvent ){ this.textChanged(resultText); }  // отправка в эвент
                // this.setCustomFocus(caret);
                return "enter";
            }
            // нажат капс
            if( classL.contains("btn-caps") ) {
                this.keyboard.classList.toggle("caps-active");
                // this.setCustomFocus(caret);
                return "caps"; 
            }
            // нажат один из языков
            if( element.dataset.lng ) {
                document.querySelectorAll(".keyboard .kb").forEach(kb => {
                    kb.classList.remove("active");
                });
                document.querySelector(".keyboard .keyboard-" + element.dataset.lng).classList.add("active");
                return "lng";
            }
        }
        resultText = beforeCaret+newText+afterCaret;
        if( this.input.clientWidth < this.maxWidth ){                   // ограничиваем макс количество символов
            // document.activeElement.value = resultText;               // пишем текст в активный элемент (для нескольких инпутов)
            this.writeToInput( resultText ); // пишем полученный текст в инпут
            this.input.selectionStart = this.input.selectionEnd = caret.startPos + 1; // указываем где должен быть курсор
            // this.input.focus();  // фокус поставит слушалка blur на инпуте
            if ( this.sendEvent ){ this.textChanged(resultText); }      // отправка в эвент
            // ---------------------------
            this.caret++;
        }
    } // keyboardClickHandler /
    textChanged(text){
        if( this.debug ) { console.log( "текст в кастомный эвент -> ", text ); }
        document.dispatchEvent(new CustomEvent('keyboard_text_changed',{ detail: { text:text } }));  // кастомный эвент в document
    }
} // Класс Keyboard /

module.exports = Keyboard;