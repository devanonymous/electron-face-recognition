const $ = require('jquery');

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

    document.querySelectorAll('.login-buttons').forEach((btn) => {
        btn.addEventListener('click', function () {
            const $name = document.querySelector('#name');
            $name.classList.add('field-name-show');
            $name.focus();

            this.classList.add('login-buttons_show');
        });
    });






    /*{
        const myVivus = new Vivus('face-box__name-svg-circle', {
            type: 'delayed',
            duration: 500,
            animTimingFunction: Vivus.EASE
        }, function () {
            console.log('end myVivus');
        });

        myVivus.play(function () {
            console.log('play myVivus');
        });
    }*/

});