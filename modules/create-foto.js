module.exports = async (name, position = '') => {
    const descriptors = [];
    let totalAttempts = 0;
    const facesRequired = 20;
    const threshold = 40;

    isBlockedPlay = true;

    while (totalAttempts < threshold) {
        totalAttempts++;

        const face = await faceapi.detectSingleFace(canvas, options)
            .withFaceLandmarks()
            .withFaceDescriptor();

        if (!face) {
            const toastHTML = `<span>no face</span>`;
            M.toast({ html: toastHTML, classes: 'rounded pulse no-find' });
            continue;
        }

        const descriptorArray = [].slice.call(face.descriptor);
        descriptors.push(descriptorArray);

        const toastHTML = `<span>${descriptors.length}</span>`;
        M.toast({ html: toastHTML, classes: 'rounded pulse find' });

        if (descriptors.length >= facesRequired) {
            break;
        }
    }

    if (descriptors.length >= facesRequired) {
        fs.writeFileSync(photoDataPath(name), JSON.stringify({
            className: {
                name:`${name}`,
                position: `${position}`
            },
            descriptors
        }));
        location.reload()
    } else {
        const toastHTML = `<span>Распознание не удалось</span>`;
        M.toast({ html: toastHTML, classes: 'rounded pulse no-find' });
    }

    isBlockedPlay = false;
};