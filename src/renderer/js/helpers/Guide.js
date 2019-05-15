const USERS = ["анна", "владимир", "павел", "цвия", "яков"];

class Guide {
    constructor() {
        this.isPlaingVideo = false;
    }
    /**
     *
     * @param {string} personName
     * @param {HTMLVideoElement} guideVideoElement
     */
    _setGuideVideoSrc(personName, guideVideoElement) {
        if (personName) {
            if (USERS.includes(personName)) {
                guideVideoElement.src = `../../assets/video/${personName}.webm`
            } else {
                guideVideoElement.src = "../../assets/video/helloMotherfucker.webm";
            }
        } else {
            guideVideoElement.src = "../../assets/video/helloMotherfucker.webm";
        }
    }

    /**
     *
     * @param {Set} personNames
     * @param {HTMLVideoElement} guideVideoElement
     */
    _playSingleVideo(personNames, guideVideoElement) {
        const personName = personNames.values().next().value;
        this._setGuideVideoSrc(personName, guideVideoElement);
        guideVideoElement.play().catch(e => console.log(`Guid video play error: ${e}`));

        guideVideoElement.addEventListener('ended', () => {
            guideVideoElement.removeEventListener('ended', () => null);
            this.isPlaingVideo = false;
        })
    }


    /**
     * удаляем из personNames имена которые не содержаться в массиве USERS и в место них добавляем одно значение undefined
     * Это нужно для того, чтобы в случае если в personNames содержаться несколько человек, которые не содержаться в массиве users
     * ролик который проигрывается для неизвестного человека проигрывался только один раз
     *
     * TODO: возможно следует перенести эту логику в mainWindow и там проверять сужествует ли такой пользователь и если нет, то добавлять в множество undefined
     *
     * @param {Set} personNames
     * @private
     */
    _clearSetFromUnknownUsers(personNames) {
        let thereWereUnknownUsers = false;
        personNames.forEach((name => {
            if (!USERS.includes(name)) {
                personNames.delete(name);
                thereWereUnknownUsers = true;
            }
        }));
        if (thereWereUnknownUsers) {
            personNames.add(undefined)
        }
    }

    /**
     * Если в объективе камеры несколь человек, то проигрываем столько видео, сколько людей в камере
     *
     * @param {Set} personNames
     * @param {HTMLVideoElement} guideVideoElement
     */
    _playSeveralVideos(personNames, guideVideoElement) {
        this._clearSetFromUnknownUsers(personNames);

        const iterator = personNames.values();
        let personName = iterator.next();

        this._setGuideVideoSrc(personName.value, guideVideoElement);
        guideVideoElement.play().catch(e => console.log(`Guid video play error: ${e}`));

        guideVideoElement.addEventListener('ended', () => {
            personName = iterator.next();
            if (personName.done) {
                guideVideoElement.removeEventListener('ended', () => null);
                this.isPlaingVideo = false;
            } else {
                this._setGuideVideoSrc(personName.value, guideVideoElement);
                guideVideoElement.play().catch(e => console.log(`Guid video play error: ${e}`));
            }
        })
    }

    /**
     * @param {Set} personNames
     * @param {HTMLVideoElement} guideVideoElement
     */
    _play(personNames, guideVideoElement) {
        this.isPlaingVideo = true;
        if (personNames.size === 1) {
            this._playSingleVideo(personNames, guideVideoElement)
        } else {
            this._playSeveralVideos(personNames, guideVideoElement);
        }
    }

    /**
     * @param {Set} personNames
     * @param {HTMLVideoElement} guideVideoElement
     */
    update(personNames, guideVideoElement) {
        if (personNames.size > 0 && !this.isPlaingVideo) {
            this._play(personNames, guideVideoElement);
            console.log('играет', guideVideoElement.src)
        }
    }
}

module.exports = new Guide();