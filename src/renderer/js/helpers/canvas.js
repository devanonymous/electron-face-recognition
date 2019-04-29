

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
    canvas.width = isVerticalOrientation ? videoEl.videoHeight / REDUCE_BY : 1920 / REDUCE_BY;
    canvas.height = isVerticalOrientation ? videoEl.videoWidth / REDUCE_BY : 1080 / REDUCE_BY;
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

module.exports = getCanvas;