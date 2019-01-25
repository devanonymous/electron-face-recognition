(function () {

    function ready() {
        var keyBtn = document.querySelectorAll('.m_k_btn');
        var enter = document.querySelector('.m_k_enter');
        var adrInp = document.querySelector('.m_adress');
        var langBtnRU = document.getElementById('m_langRU');
        var langBtnEN = document.getElementById('m_langEN');
        var firstL = document.querySelector('.m_first_line');
        var secondL = document.querySelector('.m_second_line');
        var thirdL = document.querySelector('.m_third_line');
        var fourthL = document.querySelector('.m_fourth_line');
        var spaceBtn = document.querySelector('.m_k_space');
        var inp = document.querySelector('[name=address');
        var foSpace = document.querySelector('.for_space');
        const keyWrapper = document.querySelector('.m_keyboard-container');
        const govno = document.querySelector('.govno-block');
        const tell_inp_kb = document.querySelector('#tel_inp');

        let inpT;

        window.onload = function () {
            //inp.focus;
            keyBtn.forEach(function (item, i, keyBtn) {
                if (langBtnRU.classList.contains('m_open')) {
                    childRU = item.firstElementChild;
                    childEN = item.lastElementChild;
                    enterRU = enter.firstElementChild;
                    enterEN = enter.lastElementChild;
                    childRU.classList.add('m_open');
                    enterRU.classList.add('m_open');
                    childEN.classList.remove('m_open');
                    enterEN.classList.remove('m_open');
                    //govno.classList.remove('en-lan');
                }
                if (langBtnEN.classList.contains('m_open')) {
                    childRU = item.firstElementChild;
                    childEN = item.lastElementChild;
                    enterRU = enter.firstElementChild;
                    enterEN = enter.lastElementChild;
                    childRU.classList.remove('m_open');
                    enterRU.classList.remove('m_open');
                    childEN.classList.add('m_open');
                    enterEN.classList.add('m_open');
                    //govno.classList.add('en-lan');
                }
            })
        }

        var langBtn = document.querySelector('.m_k_lang');
        langBtn.addEventListener("pointerdown", function (event) {
            langBtn.classList.add('fuck');
            event.preventDefault(event);
            if (langBtnRU.classList.contains('m_open')) {
                langBtnRU.classList.remove('m_open');
                langBtnEN.classList.add('m_open');
                //govno.classList.add('en-lan');
                keyBtn.forEach(function (item, i, keyBtn) {
                    childRU = item.firstElementChild;
                    childSIM = item.children[1];
                    childEN = item.lastElementChild;
                    childRU.classList.remove('m_open');
                    enterRU.classList.remove('m_open');
                    childSIM.classList.remove('m_open');
                    numSim.classList.remove('m_open');
                    keyWrapper.classList.remove('simbols');
                    childEN.classList.add('m_open');
                    enterEN.classList.add('m_open');
                    asEmptyElem = childEN.children[0];
                    if (asEmptyElem.textContent < 1) {
                        emptyElemAn = asEmptyElem.parentElement;
                        emptyElemFat = emptyElemAn.parentElement;
                        emptyElemFat.style.display = 'none';
                        foSpace.style.width = '225px';
                    }
                })
            }
            else {
                langBtnRU.classList.add('m_open');
                langBtnEN.classList.remove('m_open');
                //govno.classList.remove('en-lan');
                keyBtn.forEach(function (item, i, keyBtn) {
                    childRU = item.firstElementChild;
                    childSIM = item.children[1];
                    childEN = item.lastElementChild;
                    childRU.classList.add('m_open');
                    childSIM.classList.remove('m_open');
                    numSim.classList.remove('m_open');
                    keyWrapper.classList.remove('simbols');
                    enterRU.classList.add('m_open');
                    item.style.display = "inline-block";
                    foSpace.style.width = '338px';
                    childEN.classList.remove('m_open');
                    enterEN.classList.remove('m_open');
                })
            };
        })

        langBtn.addEventListener("pointerdown", function (event) {
            langBtn.classList.remove('fuck');
        })

        var upper = document.querySelector('.m_k_touppercase');
        var up = upper.firstElementChild;
        var down = upper.lastElementChild;
        upper.addEventListener("pointerdown", function (event) {
            upper.classList.add('fuck');
            if (up.classList.contains('m_open')) {
                up.classList.remove('m_open');
                down.classList.add('m_open');
                keyBtn.forEach(function (item, i, keyBtn) {
                    item.classList.add('m_upper');
                })
            }
            else {
                up.classList.add('m_open');
                down.classList.remove('m_open');
                keyBtn.forEach(function (item, i, keyBtn) {
                    item.classList.remove('m_upper');
                })
            }
        })
        upper.addEventListener("pointerup", function (event) {
            upper.classList.remove('fuck');
        })

        /*const test = () => {
         let val = textAreaGlobal.value;
         textAreaGlobal.selectionEnd = textAreaGlobal.selectionEnd - 1;
         let tarrget = event.target;
         console.log(tarrget);
         }

         textAreaGlobal.addEventListener('pointerdown', test);

         function setCarret(){
         let nowSelection = inp.getAttribute('selection');
         textAreaGlobal.selectionEnd = +nowSelection+1;
         }*/
        var inputEvent = new Event("input");

        keyBtn.forEach(function (item, i, keyBtn) {
            item.addEventListener("pointerdown", function (event) {
                item.classList.add('fuck');
                var inp = document.querySelector('.field-name-show');

                if (langBtnRU.classList.contains('m_open') && item.children[0].classList.contains('m_open')) {
                    point = item.querySelector('.m_lan_ru .m_simbol').textContent;
                    if (down.classList.contains('m_open')) {
                        inp.value += point.toUpperCase();
                    } else {
                        if (inp.closest('#tel_inp')) {
                            if (inp.value.length <= 14) {
                                inp.value += point;
                                tell_inp.classList.remove('backs');
                            }
                        } else {
                            /*if(inp.selectionStart<inp.value.length) {
                             let beforeSelection = inp.value.substring(0, inp.selectionStart).length;
                             inp.setAttribute('selection', beforeSelection);
                             inp.value = inp.value.substring(0, inp.selectionStart)+point+inp.value.substring(inp.selectionStart, inp.value.length);
                             setCarret();
                             } else {*/
                            inp.value += point;
                            //}
                        }
                    }
                }
                if (numSim.classList.contains('m_open') && item.children[0].classList.length === 1 && item.children[2].classList.length === 1) {
                    point = item.querySelector('.num_sim').textContent;
                    if (inp.closest('#tel_inp')) {
                        if(inp.value.length==7) {
                            inp.value += ")";
                        }
                        if (inp.value.length <= 14) {
                            inp.value += point;
                            tell_inp.classList.remove('backs');
                        }
                    } else {
                        inp.value += point;
                    }
                }
                if (langBtnEN.classList.contains('m_open') && item.children[2].classList.contains('m_open')) {
                    point = item.querySelector('.m_lan_en .m_simbol').textContent;
                    if (down.classList.contains('m_open')) {
                        if (inp.closest('#tel_inp')) {
                            if (inp.value.length <= 14) {
                                inp.value += point;
                                tell_inp.classList.remove('backs');
                            }
                        } else {
                            inp.value += point.toUpperCase();;
                        }
                    } else {
                        if (inp.closest('#tel_inp')) {
                            if (inp.value.length <= 14) {
                                inp.value += point;
                                tell_inp.classList.remove('backs');
                            }
                        } else {
                            inp.value += point;
                        }
                    }
                }

                inp.dispatchEvent(inputEvent);
            })
            item.addEventListener("pointerup", function (event) {
                item.classList.remove('fuck');
            })
        })

//const tell_inp_kb = document.querySelector('#tel_inp');
        const removerInput = () => {
            backSpace.classList.add('fuck');
            let intDel = setInterval(function () {
                var inp = document.activeElement;
                if (inp.closest('#tel_inp')) {
                    if (inp.value.length > 4) {
                        inpVal = inp.value.slice(0, -1);
                        inp.value = inpVal;
                        //tell_inp.classList.add('backs');
                    }
                    if(inp.value.length > 8) {
                        tell_inp.classList.add('backs');
                    }
                    /*if(inp.value.length < 8) {
                     tell_inp.classList.remove('backs');
                     }*/
                    if (inp.value.length == 6) {
                        tell_inp_kb.classList.remove('bracket');
                        tell_inp.classList.remove('backs');
                    }
                } else {
                    inpVal = inp.value.slice(0, -1);
                    inp.value = inpVal;
                }
                inp.dispatchEvent(inputEvent);
            }, 80);
            backSpace.addEventListener('pointerup', function () {
                clearInterval(intDel);
                backSpace.classList.remove('fuck');
            })
        }

        var backSpace = document.querySelector('.m_k_backspace');
        backSpace.addEventListener("pointerdown", removerInput, false);

        spaceBtn.addEventListener("pointerdown", function (event) {
            spaceBtn.classList.add('fuck');
            var inp = document.activeElement;
            inp.value += " ";
            spaceBtn.addEventListener("pointerup", function (event) {
                spaceBtn.classList.remove('fuck');
            })
        })


        var numSim = document.querySelector('.m_k_num');
        numSim.addEventListener("pointerdown", function (event) {
            event.preventDefault(event);
            numSim.classList.add('fuck');
            if (numSim.classList.contains('m_open')) {
                numSim.classList.remove('m_open');
                keyWrapper.classList.remove('simbols');
                for (var i = keyBtn.length - 1; i >= 0; i--) {
                    var el = keyBtn[i];
                    removedOne = el.children[0];
                    addOne = el.children[1];
                    removedTwo = el.children[2];
                    addOne.classList.remove('m_open');
                    if (langBtnRU.classList.contains('m_open')) {
                        removedOne.classList.add('m_open');
                    } else {
                        removedTwo.classList.add('m_open');
                        asEmptyElem = removedTwo.children[0];
                        if (asEmptyElem.textContent < 1) {
                            emptyElemAn = asEmptyElem.parentElement;
                            emptyElemFat = emptyElemAn.parentElement;
                            emptyElemFat.style.display = 'none';
                            foSpace.style.width = '225px';
                        }
                    }
                }
            } else {
                numSim.classList.add('m_open');
                keyWrapper.classList.add('simbols');
                for (var i = keyBtn.length - 1; i >= 0; i--) {
                    var el = keyBtn[i];
                    /*if(el.closest('#not_sim')) {
                     el.style.display = 'none';
                     }*/
                    removedOne = el.children[0];
                    addOne = el.children[1];
                    removedTwo = el.children[2];
                    removedOne.classList.remove('m_open');
                    removedTwo.classList.remove('m_open');
                    addOne.classList.add('m_open');
                    if (langBtnEN.classList.contains('m_open')) {
                        el.style.display = "inline-block";
                        foSpace.style.width = '338px';
                    }
                }
            }

        })
        numSim.addEventListener("pointerup", function (event) {
            numSim.classList.remove('fuck');
        });

        const btnToSave = document.querySelector('.m_k_enter');
        btnToSave.addEventListener("pointerdown", function (event) {
            btnToSave.classList.add('fuck');
            var inp = document.activeElement;
            //event.preventDefault(event);
            inp.value += "\r\n";

            inp.dispatchEvent(new Event("click_enter"));
        })
        btnToSave.addEventListener("pointerup", function (event) {
            btnToSave.classList.remove('fuck');
        })
    }
    document.addEventListener("DOMContentLoaded", ready);
})();
