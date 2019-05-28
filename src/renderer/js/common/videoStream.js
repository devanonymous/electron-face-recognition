const {IS_VERTICAL_ORIENTATION} = require('./../../../common/params');


class WebCamStreamHelper {

    /**
     * singleton
     */
    constructor() {
        if (WebCamStreamHelper.instance) {
            return WebCamStreamHelper.instance;
        }

        WebCamStreamHelper.instance = this;
    }

    /**
     * @returns {Promise<MediaStream | *>}
     */
    async getVideoStream() {
        if (!this.stream) {
            this.stream = await navigator.mediaDevices.getUserMedia({
                    audio: false,
                    video: {
                        width: {
                            ideal: IS_VERTICAL_ORIENTATION ? 1920 : 1080
                        },
                        height: {
                            ideal: 1080
                        },
                    }
                },
            )
        }
        return this.stream;
    }

    /**
     * @param {HTMLVideoElement || Element} videoElement
     */
    setStreamToVideoElement(videoElement) {
        this.getVideoStream().then(stream => {
            videoElement.srcObject = stream;
        }).catch(error => {
            console.log(`setStreamToVideoElement error: ${error}`)
        })
    }
}

module.exports = WebCamStreamHelper;