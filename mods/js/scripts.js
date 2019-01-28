document.addEventListener("DOMContentLoaded", function () {
    const modals = document.querySelectorAll('.modal');
    const clickKeyboard = function () {
        const fieldName = document.querySelector('#name');
        const fieldPosition = document.querySelector('#user-position');

        if ( fieldName.classList.contains('field-name-show') ) {
            fieldName.focus();
        } else if ( fieldName.classList.contains('field-name-show') ) {
            fieldPosition.focus();
        }
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
});