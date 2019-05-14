

// во сколько раз уменьшить изображение
const REDUCE_BY = 2;

/**
 * берет кадр с вебкамеры, вставляет его в канвас, поворачивает в альбомную ориентацию (если isVerticalOrientation) и уменьшает его до разрешения 540x960,
 * т.к face-api.js распознает лица только в альбомной ориентации и изобрашение в fullHD почемуто распознаёт некорректно,
 * поэтому прежде чем передать канвас в faceAPI мы сначала уменьшаем его в 2 раза
 *
 * @param {HTMLVideoElement} videoEl видео с вебкамеры
 * @param {boolean} isVerticalOrientation
 * @returns {HTMLElement}
 */
const getCanvas = (videoEl, isVerticalOrientation) => {
    const canvas = document.getElementById('canvas-one');
    canvas.width = isVerticalOrientation ? videoEl.videoHeight / REDUCE_BY : 1080 / 3;
    canvas.height = isVerticalOrientation ? videoEl.videoWidth / REDUCE_BY : 1080 / 3;
    const context  = canvas.getContext('2d');

    if (isVerticalOrientation) {
        context.setTransform(
            0, 1, // x axis down the screen
            -1, 0, // y axis across the screen from right to left
            videoEl.videoHeight, // x origin is on the right side of the canvas
            0             // y origin is at the top
        );
    }

    context.save();
    context.restore();

    if (!isVerticalOrientation) {
        context.drawImage(videoEl, 0,0, canvas.width, canvas.height);
    } else {
        context.drawImage(videoEl, 0, canvas.width, canvas.height, canvas.width);
    }


    return canvas
};

const getCanvasData = (videoEl, isVerticalOrientation) => {
    const canvas = getCanvas(videoEl, isVerticalOrientation);
    const context = canvas.getContext('2d');
    return [context.getImageData(0, canvas.width, canvas.height, canvas.width), 0, canvas.width]
};

module.exports = {getCanvas:getCanvas, getCanvasData:getCanvasData};