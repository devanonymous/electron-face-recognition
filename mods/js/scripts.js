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


    {
        /*let canvasSize = 64,
            centre = canvasSize/2,
            radius = canvasSize*0.4,
            s = Snap('#svg'),
            path = "",
            arc = s.path(path),
            startY = centre-radius,
            runBtn = document.getElementById('run'),
            percDiv = document.getElementById('percent'),
            input = document.getElementById('input');*/

        /*input.onkeyup = function(evt) {
            if(isNaN(input.value)) {
                input.value = '';
            }
        };

        runBtn.onclick = function() {
            run(input.value/100);
        };*/

        function run(percent) {
            let endpoint = percent*360;
            Snap.animate(0, endpoint,   function (val) {
                arc.remove();
                let d = val,
                    dr = d-90,
                    radians = Math.PI*(dr)/180,
                    endx = centre + radius*Math.cos(radians),
                    endy = centre + radius * Math.sin(radians),
                    largeArc = d>180 ? 1 : 0;
                path = "M"+centre+","+startY+" A"+radius+","+radius+" 0 "+largeArc+",1 "+endx+","+endy;
                arc = s.path(path);
                console.log(val)
                arc.attr({
                    stroke: 'url(#gradientName)',
                    fill: 'none',
                    strokeWidth: 4
                });
                // percDiv.innerHTML =    Math.round(val/360*100) +'%';
            }, 2000);
        }

        setInterval(() => {
            // run(75);
        }, 5000);
        // run(input.value/100);
    }

    {
        document.querySelectorAll('.face-box__svg-round').forEach((elem, elemIndex) => {
            const width = 64;//elem.getBBox();console.log(width)
            const height = 64;
            const round = {
                center: 32,
                radius: 30,
                activeRadius: 30,
                sum: 0,
                finalSum: 0,
                parts: [],
                finalParts: [],
                part: 0,
                finalPart: 0,
                minValue: 5,// %
                sumMinValues: 0,
            };
            const percent = {
                sum: 0,
                parts: [],
                part: 0,
                minValue: 3// %
            };


            for ( let i = 0; 1 > i; i++ ) {
                const end = 20;

                const endPI = Math.PI * (end * round.finalPart) / 180;

                const endX = round.center + round.radius * Math.cos(endPI);
                const endY = round.center + round.radius * Math.sin(endPI);

                const M = 'M'+ round.center +','+ 0;
                const A = 'A'+ round.radius +','+ round.radius +
                    (100/percent.sum * percent.parts[i] > 50 ? ' 0 1,1 ' : ' 0 0,1 ') +
                    endX +','+ endY;
                const pathData = M + A;

                elem.querySelector('.face-box__svg-round-path').setAttribute('d', pathData);
            }
        });
    }

    function graphics() {
        (function () {
            let $graphics = $(".b-graphic");

            if ( $graphics.length < 1 ) {
                return false;
            }

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

                $items.attr("data-index", function (index) {
                    return index;
                });

                const size = 150;

                let style = {
                    fill: "none",
                    activeFill: "none",

                    stroke: "url(#gradientName)",
                    activeStroke: "url(#gradientName)",
                    strokeWidth: 4,
                    activeStrokeWidth: 4
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
                let textSufix = ($parts.text().trim().indexOf("%") > 0 ? "%" : false);

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
                        'stroke-linejoin="round" ' +
                        'data-active="'+ M + activeL + activeA + Z +'" '+
                        'data-index="'+ i +'" ' +
                        'mask="url(#svg-cat_'+ graphicIndex +')" ' +
                        'transform="rotate(-90)" ' +
                        'style="transform-origin: 50%;"></path>';

/*
                    let textX = round.center + (round.radius/1.5) * Math.cos((startPI+endPI)/2);
                    let textY = round.center + (round.radius/1.5) * Math.sin((startPI+endPI)/2);

                    let tx1 = round.center + (round.radius/1.5) * Math.cos((startPI+endPI*2)/3);
                    let tx2 = round.center + (round.radius/1.5) * Math.sin((startPI+endPI*2)/3);
                    let tx3 = round.center + round.radius * Math.cos((startPI+endPI*2)/3);
                    let tx4 = round.center + round.radius * Math.sin((startPI+endPI*2)/3);

                    let insertText = (textSufix ? round.parts[i] +"%" : round.parts[i]);

                    if ( round.parts[i] * round.part - round.part > 10 ) {
                        html+= ''+
                            '<text '+
                            'x="'+ textX +'" '+
                            'y="'+ textY +'" '+
                            'fill="#000" '+
                            'font-size="15" '+
                            'font-family="\'PT Sans\',\'Helvetica Neue\',Helvetica,Arial,\'sans-serif\'" '+
                            'data-index="'+ i +'" '+
                            'transform="translate(-10,0)">'+ insertText +'</text>';
                    } else {
                        html+= ''+
                            '<defs>'+
                            '<path '+
                            'id="testPath'+i+'" '+
                            'd="M'+tx1+','+tx2+' C'+tx1+','+tx2+' '+tx1+','+tx2+' '+tx3+','+tx4+'" />'+
                            '</defs>'+
                            '<text '+
                            'fill="#000" '+
                            'font-size="15" '+
                            'font-family="PTSans, sans-serif" '+
                            'data-index="'+ i +'">'+
                            '<textPath xlink:href="#testPath'+i+'">'+ insertText +'</textPath>'+
                            '</text> ';
                    }*/
                }

                html+= `<defs>
                    <mask id="svg-cat_${graphicIndex}">
                        <rect class="svg-cat__rect" width="${size}" height="${size}" fill="white" />
                        <circle class="svg-cat__circle" stroke="white" fill="black"
                        cx="${size/2}" cy="${size/2}" r="${(size - style.strokeWidth)/2}" stroke-width="${style.strokeWidth}" />
                    </mask>
                </defs>`;

                $svg.html(html);
/*
                let d;
                let $activeItem;
                let $activePath;

                $svg.find("path")
                    .on("mouseenter", function () {
                        let $thisPath = $(this);
                        d = $thisPath.attr("d");

                        let part = parseFloat($thisPath.attr("data-part"));

                        i = parseInt($thisPath.attr("data-index"),10);

                        $svg
                            .append(
                                $thisPath
                                    .attr("fill", style.activeFill)
                                    .attr("stroke", style.activeStroke)
                                    .attr("stroke-width", style.activeStrokeWidth)
                                    .attr("d",$thisPath.attr("data-active"))
                            )
                            .append($svg.find("text[data-index='"+i+"']"));

                        $activeItem = $this.find(".b-graphic__items__item[data-index='"+i+"']");
                        $activeItem.addClass("b-graphic__items__item_active");
                    })
                    .on("mouseleave", function () {
                        $(this)
                            .attr("fill", style.fill)
                            .attr("stroke", style.stroke)
                            .attr("stroke-width", style.strokeWidth)
                            .attr("d",d);

                        $activeItem.removeClass("b-graphic__items__item_active");
                    });

                $svg.find("text")
                    .on("mouseenter", function () {
                        i = parseInt($(this).attr("data-index"),10);

                        $svg.find("path[data-index='"+i+"']").trigger("mouseenter");
                    })
                    .on("mouseleave", function () {
                        i = parseInt($(this).attr("data-index"),10);

                        $svg.find("path[data-index='"+i+"']").trigger("mouseleave");
                    });

                setTimeout(function () {
                    $items
                        .on("mouseenter", function () {
                            i = parseInt($(this).attr("data-index"),10);
                            $activePath = $svg.find("path[data-index='"+i+"']");
                            d = $activePath.attr("d");


                            $svg
                                .append(
                                    $activePath
                                        .attr("fill", style.activeFill)
                                        .attr("stroke", style.activeStroke)
                                        .attr("stroke-width", style.activeStrokeWidth)
                                        .attr("d",$activePath.attr("data-active"))
                                )
                                .append($svg.find("text[data-index='"+i+"']"));
                        })
                        .on("mouseleave", function () {
                            $activePath
                                .attr("fill", style.fill)
                                .attr("stroke", style.stroke)
                                .attr("stroke-width", style.strokeWidth)
                                .attr("d",d);
                        });
                },0);*/

                // console.log("===")
            });
        })();
    }

    graphics();




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