const $ = require('jquery');

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

    show(faceDetectionBox, smalledStyle, rotateVideo) {
        this.html.classList.add('face-box');
        this.html.removeAttribute('id');
        if ( !rotateVideo ) {
            this.html.style.top = faceDetectionBox.top +'px';
            this.html.style.width = faceDetectionBox.width +'px';
            this.html.style.height = faceDetectionBox.height +'px';
            this.html.style.right = faceDetectionBox.left +'px';
        } else {
            this.html.style.top = faceDetectionBox.left +'px';
            this.html.style.width = faceDetectionBox.width +'px';
            this.html.style.height = faceDetectionBox.height +'px';
            this.html.style.left = faceDetectionBox.top +'px';
        }

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

    setNewHtml(html) {
        this.html = html;
        this._updateValues();
    }

    setRounds() {//size = 64, strokeWidth = 4
        return false;

        const graphMain = document.querySelector('#b-graphic');
        let $graphics = $(".b-graphic", this.html);

        if ( $graphics.length < 1 ) {
            this.html.querySelectorAll('.face-box__expressions-item').forEach((fbItem) => {
                const graphClone = graphMain.cloneNode(true);
                graphClone.classList.add('b-graphic');
                graphClone.removeAttribute('id');

                fbItem.appendChild(graphClone);
            });

            $graphics = $(".b-graphic", this.html);
        }

        const size = this.html.querySelector('.face-box__expressions-item').offsetWidth;
        const strokeWidth = (size > 64 ? 12 : 4);

        $graphics.each(function (graphicIndex) {
            let $this = $(this);
            let $graphWrapper = $this.find(".b-graphic__graph");
            let $items = $this.find(".b-graphic__items__item");
            let $parts = $items.find(".b-graphic__items__part");

            if ( $graphWrapper.length < 1 || $items.length < 1 || $parts.length < 1 ) {
                console.warn(
                    "$graphWrapper: "+ parseInt($graphWrapper.length,10) + "\n" +
                    "$items: "+ parseInt($items.length,10) + "\n" +
                    "$parts: "+ parseInt($parts.length,10)
                );

                return false;
            }

            const value = $this.find('.face-box__expressions-item-percent-value').text().trim();
            $parts[0].innerHTML = (value > 0 ? value : 0);
            $parts[1].innerHTML = 100 - value;

            console.log('value',value)

            $items.attr("data-index", function (index) {
                return index;
            });

            let style = {
                fill: "none",
                activeFill: "none",

                stroke: "url(#gradientName)",
                activeStroke: "url(#gradientName)",
                strokeWidth: strokeWidth,
                activeStrokeWidth: strokeWidth
            };
            let round = {
                center: size / 2,
                radius: (size - style.strokeWidth) / 2,
                activeRadius: (size - style.strokeWidth) / 2,
                sum: 0,
                finalSum: 0,
                parts: [],
                finalParts: [],
                part: 0,
                finalPart: 0,
                minValue: 5,// %
                sumMinValues: 0,
                normalValuesLength: 0
            };
            let percent = {
                sum: 0,
                parts: [],
                part: 0,
                minValue: 3// %
            };
            let i = 0;// clear if use this letiable
            let textSufix = ($parts.text().trim().indexOf("%") > 0 ? "%" : '');

            $parts.each(function (index, element) {
                let value = parseFloat($(element).text().trim());

                round.parts[index] = value;
                round.finalParts[index] = value;
                round.sum+= value;

                percent.parts[index] = value;
                percent.sum+= value;
            });

            round.part = 360 / round.sum;//console.log(round.part)
            percent.part = 100 / percent.sum;//console.log(percent.part)

            // for check need resize small sectors to minValue
            for ( i = 0; round.parts.length > i; i++ ) {
                if ( round.parts[i] * round.part - round.part <= 10 ) {
                    round.sumMinValues+= round.parts[i];
                    round.finalParts[i] = round.minValue;
                } else {
                    round.normalValuesLength++;
                }
            }

            if ( round.sumMinValues > 0 ) {
                for ( i = 0; round.parts.length > i; i++ ) {
                    if ( round.parts[i] * round.part - round.part > 10 ) {
                        round.finalParts[i] = round.parts[i] - (round.sumMinValues / round.normalValuesLength);
                    }
                }
            }

            for ( i = 0; round.parts.length > i; i++ ) {
                round.finalSum+= round.finalParts[i];
            }

            round.finalPart = 360 / round.finalSum;//console.log(round.finalParts)

            $graphWrapper.html("<svg></svg>");

            let $svg = $graphWrapper.find("svg");
            $svg.width(size);
            $svg.height(size);
            // let $defs = $svg.querySelector('defs');

            let start = 0;
            let end = 0;
            let html = "";

            for ( i = 0; $parts.length > i; i++ ) {
                start = start + (round.finalParts[i - 1] ? round.finalParts[i - 1] : 0);
                end = end + round.finalParts[i];

                let startPI = Math.PI * (start * round.finalPart) / 180;
                let endPI = Math.PI * (end * round.finalPart) / 180;

                let startX = round.center + round.radius * Math.cos(startPI);
                let startY = round.center + round.radius * Math.sin(startPI);

                let endX = round.center + round.radius * Math.cos(endPI);
                let endY = round.center + round.radius * Math.sin(endPI);

                let startActiveX = round.center + round.activeRadius * Math.cos(startPI);
                let startActiveY = round.center + round.activeRadius * Math.sin(startPI);

                let endActiveX = round.center + round.activeRadius * Math.cos(endPI);
                let endActiveY = round.center + round.activeRadius * Math.sin(endPI);

                let M = 'M'+ round.center +','+ round.center;
                let L = 'L'+ startX +','+ startY;
                let activeL = 'L'+ startActiveX +','+ startActiveY;
                let A = 'A'+ round.radius +','+ round.radius +
                    (100/percent.sum * percent.parts[i] > 50 ? ' 0 1,1 ' : ' 0 0,1 ') +
                    endX +','+ endY;
                let activeA = 'A'+ round.activeRadius +','+round.activeRadius +
                    (100/percent.sum * percent.parts[i] > 50 ? ' 0 1,1 ' : ' 0 0,1 ') +
                    endActiveX +','+ endActiveY;
                let Z = 'Z';

                // document.querySelector('#svg-cat path').setAttribute('d', M + L + A + Z);

                html+= ''+
                    '<path d="'+ M + L + A + Z +'" '+
                    'fill="'+ style.fill +'" '+
                    'stroke="'+ (i < 1 ? style.stroke : 'none') +'" '+
                    'stroke-width="'+ style.strokeWidth +'" '+
                    'stroke-linejoin="miter" ' +
                    'data-active="'+ M + activeL + activeA + Z +'" '+
                    'data-index="'+ i +'" ' +
                    'mask="url(#svg-cat_'+ graphicIndex +')" ' +
                    'transform="rotate(-90)" ' +
                    'style="transform-origin: 50%;"></path>';
            }

            html+= `<defs>
            <mask id="svg-cat_${graphicIndex}">
                <rect class="svg-cat__rect" width="${size}" height="${size}" fill="white" />
                <circle class="svg-cat__circle" stroke="white" fill="black"
                cx="${size/2}" cy="${size/2}" r="${(size - style.strokeWidth)/2}" stroke-width="${style.strokeWidth}" />
            </mask>
        </defs>`;

            $svg.html(html);
        });
    }

    parseExpressions(expressions) {
        expressions.forEach((expressionItem) => {
            if ( expressionItem.probability.toFixed(2) > 0 ) {
                switch (expressionItem.expression) {
                    case "neutral":// exNameRus = `Нейтральны`;
                        break;
                    case "happy":// exNameRus = `Радость`;
                        this.setValues({happy: Math.round(expressionItem.probability * 100)});
                        break;
                    case "sad":// exNameRus = `Огорчение`;
                        this.setValues({sad: Math.round(expressionItem.probability * 100)});
                        break;
                    case "angry":// exNameRus = `Злы`;
                        break;
                    case "fearful":// exNameRus = `Испуг`;
                        this.setValues({fearful: Math.round(expressionItem.probability * 100)});
                        break;
                    case "disgusted":// exNameRus = `Чувствуете отвращение`;
                        break;
                    case "surprised":// exNameRus = `Удивление`;
                        this.setValues({suprised: Math.round(expressionItem.probability * 100)});
                        break;
                }
            }
        });
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
