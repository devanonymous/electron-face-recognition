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
        console.log(personName);
        if (personName) {
            switch (personName.toLowerCase()) {
                case "анна":
                    guideVideoElement.src = "../../assets/video/anna.webm";
                    break;
                case "владимир":
                    guideVideoElement.src = "../../assets/video/vladimir.webm";
                    break;
                case "павел":
                    guideVideoElement.src = "../../assets/video/pavel.webm";
                    break;
                case "цвия":
                    guideVideoElement.src = "../../assets/video/chvia.webm";
                    break;
                case "яков":
                    guideVideoElement.src = "../../assets/video/yakow.webm";
                    break;
                default:
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
     * Если в объективе камеры несколь человек, то проигрываем столько видео, сколько людей в камере
     *
     * @param {Set} personNames
     * @param {HTMLVideoElement} guideVideoElement
     */
    _playSeveralVideos(personNames, guideVideoElement) {
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