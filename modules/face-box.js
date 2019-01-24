module.exports = class faceBox {
    constructor(name, position, age, neutral, happy, sad, angry, fearful, disgusted, surprised) {
        this.name = name || `Роман Абрамович`;
        this.position = position || `Директор NeuroCity`;
        this.age = age || 25;
        this.neutral = neutral || 0;
        this.happy = happy || 0;
        this.sad = sad || 0;
        this.angry = angry || 0;
        this.fearful = fearful || 0;
        this.disgusted = disgusted || 0;
        this.surprised = surprised || 0;
        this.html = document.querySelector('#face-box').cloneNode(true);
    }

    show(faceDetectionBox, smalledStyle) {
        this.html.classList.add('face-box');
        this.html.removeAttribute('id');
        this.html.style.top = faceDetectionBox.top +'px';
        this.html.style.width = faceDetectionBox.width +'px';
        this.html.style.height = faceDetectionBox.height +'px';
        this.html.style.left = faceDetectionBox.left +'px';
        this._updateValues();
        if (!smalledStyle) {
            this._showNormal();
        }
        document.body.appendChild(this.html);
    }

    toSmalled() {
        this._showSmalled();
    }

    setValues(...values) {
        this.name = values[0].name || this.name;
        this.position = values[0].position || this.position;
        this.age = values[0].age || this.age;
        this.neutral = values[0].neutral || this.neutral;
        this.happy = values[0].happy || this.happy;
        this.sad = values[0].sad || this.sad;
        this.angry = values[0].angry || this.angry;
        this.fearful = values[0].fearful || this.fearful;
        this.disgusted = values[0].disgusted || this.disgusted;
        this.surprised = values[0].surprised || this.surprised;
        this._updateValues();
    }

    _showNormal() {
        const html = this.html;
        html.querySelectorAll('.face-box__user-position_age').forEach((elem) => {
            elem.classList.remove('face-box__user-position_age_show');
        });
        html.querySelectorAll('.face-box__header-about').forEach((elem) => {
            elem.classList.remove('face-box__header-about_hidden');
        });
        html.querySelectorAll('.face-box__expressions').forEach((elem) => {
            elem.classList.remove('face-box__expressions_smalled');
        });
        html.querySelectorAll('.face-box__expressions-item').forEach((elem) => {
            elem.classList.remove('face-box__expressions-item_smalled');
        });
    }

    _showSmalled() {
        const html = this.html;
        html.querySelectorAll('.face-box__user-position_age').forEach((elem) => {
            elem.classList.add('face-box__user-position_age_show');
        });
        html.querySelectorAll('.face-box__header-about').forEach((elem) => {
            elem.classList.add('face-box__header-about_hidden');
        });
        html.querySelectorAll('.face-box__expressions').forEach((elem) => {
            elem.classList.add('face-box__expressions_smalled');
        });
        html.querySelectorAll('.face-box__expressions-item').forEach((elem) => {
            elem.classList.add('face-box__expressions-item_smalled');
        });
    }

    _updateValues() {
        const html = this.html;
        html.querySelectorAll('.js-face-box__user-name').forEach((elem) => {
            elem.innerHTML = this.name;
        });
        html.querySelectorAll('.js-face-box__user-position').forEach((elem) => {
            elem.innerHTML = this.position;
        });
        html.querySelectorAll('.js-face-box__user-age').forEach((elem) => {
            elem.innerHTML = this.age;
        });
        html.querySelectorAll('.js-face-box__user-surprised').forEach((elem) => {
            elem.innerHTML = this.surprised;
        });
        html.querySelectorAll('.js-face-box__user-happy').forEach((elem) => {
            elem.innerHTML = this.happy;
        });
        html.querySelectorAll('.js-face-box__user-sad').forEach((elem) => {
            elem.innerHTML = this.sad;
        });
        html.querySelectorAll('.js-face-box__user-fearful').forEach((elem) => {
            elem.innerHTML = this.fearful;
        });
    }
};
