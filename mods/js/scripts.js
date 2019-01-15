document.addEventListener("DOMContentLoaded", function () {
    const modals = document.querySelectorAll('.modal');
    const clickKeyboard = function () {
        const input = document.querySelector('#name');
        input.focus();
    };
    const clickEnter = function () {
        document.querySelector('.modal.open .button').dispatchEvent(new Event('pointerdown'));
    };
    const instances = M.Modal.init(modals, {
        onOpenEnd: function () {
            const input = this.el.querySelector('#name');

            if ( input ) {
                input.focus();
                const keyboard = document.querySelector('.keyboard');
                keyboard.classList.add('open');
                keyboard.addEventListener('click', clickKeyboard, false);
                keyboard.querySelector('.m_k_enter').addEventListener('click', clickEnter, false);
            }
        },
        onCloseStart: function () {
            const input = this.el.querySelector('#name');

            if ( input ) {
                const keyboard = document.querySelector('.keyboard');
                keyboard.classList.remove('open');
                keyboard.removeEventListener('click', clickKeyboard, false);
                keyboard.querySelector('.m_k_enter').removeEventListener('click', clickEnter, false);
            }
        }
    });
});