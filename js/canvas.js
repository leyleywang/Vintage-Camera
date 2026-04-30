const CanvasModule = {
    createCanvas(width, height) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        return canvas;
    },

    getContext(canvas, type = '2d') {
        return canvas.getContext(type);
    },

    resizeCanvas(canvas, maxWidth, maxHeight) {
        const ratio = Math.min(maxWidth / canvas.width, maxHeight / canvas.height);
        const newWidth = canvas.width * ratio;
        const newHeight = canvas.height * ratio;

        const tempCanvas = this.createCanvas(newWidth, newHeight);
        const ctx = tempCanvas.getContext('2d');
        ctx.drawImage(canvas, 0, 0, newWidth, newHeight);

        return tempCanvas;
    },

    loadImage(dataUrl) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = dataUrl;
        });
    },

    imageToCanvas(img) {
        const canvas = this.createCanvas(img.width, img.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        return canvas;
    },

    canvasToDataUrl(canvas, type = 'image/png', quality = 1.0) {
        return canvas.toDataURL(type, quality);
    },

    dataUrlToCanvas(dataUrl) {
        return new Promise((resolve, reject) => {
            this.loadImage(dataUrl)
                .then(img => resolve(this.imageToCanvas(img)))
                .catch(reject);
        });
    },

    flipCanvas(canvas, horizontal = true, vertical = false) {
        const tempCanvas = this.createCanvas(canvas.width, canvas.height);
        const ctx = tempCanvas.getContext('2d');

        ctx.save();
        ctx.translate(horizontal ? canvas.width : 0, vertical ? canvas.height : 0);
        ctx.scale(horizontal ? -1 : 1, vertical ? -1 : 1);
        ctx.drawImage(canvas, 0, 0);
        ctx.restore();

        return tempCanvas;
    },

    rotateCanvas(canvas, degrees) {
        const radians = (degrees * Math.PI) / 180;
        const sin = Math.abs(Math.sin(radians));
        const cos = Math.abs(Math.cos(radians));
        
        const newWidth = canvas.width * cos + canvas.height * sin;
        const newHeight = canvas.width * sin + canvas.height * cos;

        const tempCanvas = this.createCanvas(newWidth, newHeight);
        const ctx = tempCanvas.getContext('2d');

        ctx.save();
        ctx.translate(newWidth / 2, newHeight / 2);
        ctx.rotate(radians);
        ctx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
        ctx.restore();

        return tempCanvas;
    },

    addBorder(canvas, borderWidth, borderColor = '#000000') {
        const newWidth = canvas.width + borderWidth * 2;
        const newHeight = canvas.height + borderWidth * 2;

        const tempCanvas = this.createCanvas(newWidth, newHeight);
        const ctx = tempCanvas.getContext('2d');

        ctx.fillStyle = borderColor;
        ctx.fillRect(0, 0, newWidth, newHeight);
        ctx.drawImage(canvas, borderWidth, borderWidth);

        return tempCanvas;
    },

    addPolaroidBorder(canvas, bottomText = '') {
        const borderWidth = 20;
        const bottomBorderHeight = bottomText ? 80 : 60;
        
        const newWidth = canvas.width + borderWidth * 2;
        const newHeight = canvas.height + borderWidth + bottomBorderHeight;

        const tempCanvas = this.createCanvas(newWidth, newHeight);
        const ctx = tempCanvas.getContext('2d');

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, newWidth, newHeight);

        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(0, 0, newWidth, borderWidth);
        ctx.fillRect(0, 0, borderWidth, newHeight);
        ctx.fillRect(newWidth - borderWidth, 0, borderWidth, newHeight);
        ctx.fillRect(0, canvas.height + borderWidth, newWidth, bottomBorderHeight);

        ctx.drawImage(canvas, borderWidth, borderWidth);

        if (bottomText) {
            ctx.fillStyle = '#333333';
            ctx.font = '24px "Playfair Display", serif';
            ctx.textAlign = 'center';
            ctx.fillText(bottomText, newWidth / 2, canvas.height + borderWidth + 45);
        }

        return tempCanvas;
    },

    addVignette(canvas, intensity = 0.5) {
        const tempCanvas = this.createCanvas(canvas.width, canvas.height);
        const ctx = tempCanvas.getContext('2d');

        ctx.drawImage(canvas, 0, 0);

        const gradient = ctx.createRadialGradient(
            canvas.width / 2, canvas.height / 2, 0,
            canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 2
        );

        gradient.addColorStop(0, `rgba(0, 0, 0, 0)`);
        gradient.addColorStop(1 - intensity * 0.3, `rgba(0, 0, 0, ${intensity * 0.2})`);
        gradient.addColorStop(1, `rgba(0, 0, 0, ${intensity * 0.7})`);

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        return tempCanvas;
    },

    addFilmGrain(canvas, intensity = 0.3) {
        const tempCanvas = this.createCanvas(canvas.width, canvas.height);
        const ctx = tempCanvas.getContext('2d');

        ctx.drawImage(canvas, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const noise = (Math.random() - 0.5) * intensity * 50;
            data[i] += noise;
            data[i + 1] += noise;
            data[i + 2] += noise;
        }

        ctx.putImageData(imageData, 0, 0);

        return tempCanvas;
    },

    addDateStamp(canvas, date = new Date(), position = 'bottom-right') {
        const tempCanvas = this.createCanvas(canvas.width, canvas.height);
        const ctx = tempCanvas.getContext('2d');

        ctx.drawImage(canvas, 0, 0);

        const formattedDate = this.formatDate(date);

        ctx.font = '28px "Courier New", monospace';
        ctx.textBaseline = 'bottom';

        let x, y;
        const padding = 20;

        switch (position) {
            case 'top-left':
                x = padding;
                y = padding + 28;
                ctx.textAlign = 'left';
                break;
            case 'top-right':
                x = canvas.width - padding;
                y = padding + 28;
                ctx.textAlign = 'right';
                break;
            case 'bottom-left':
                x = padding;
                y = canvas.height - padding;
                ctx.textAlign = 'left';
                break;
            case 'bottom-right':
            default:
                x = canvas.width - padding;
                y = canvas.height - padding;
                ctx.textAlign = 'right';
                break;
        }

        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillText(formattedDate, x + 2, y + 2);

        ctx.fillStyle = '#e74c3c';
        ctx.fillText(formattedDate, x, y);

        return tempCanvas;
    },

    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${year}-${month}-${day} ${hours}:${minutes}`;
    },

    drawWatermark(canvas, text, opacity = 0.3) {
        const tempCanvas = this.createCanvas(canvas.width, canvas.height);
        const ctx = tempCanvas.getContext('2d');

        ctx.drawImage(canvas, 0, 0);

        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 48px "Playfair Display", serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(-Math.PI / 4);

        ctx.fillText(text, 0, 0);
        ctx.restore();

        return tempCanvas;
    },

    createCollage(canvases, layout = 'grid', spacing = 10) {
        if (canvases.length === 0) return null;

        let collageWidth, collageHeight;
        const positions = [];

        if (layout === 'grid') {
            const cols = Math.ceil(Math.sqrt(canvases.length));
            const rows = Math.ceil(canvases.length / cols);

            const maxWidth = Math.max(...canvases.map(c => c.width));
            const maxHeight = Math.max(...canvases.map(c => c.height));

            collageWidth = cols * maxWidth + (cols - 1) * spacing;
            collageHeight = rows * maxHeight + (rows - 1) * spacing;

            canvases.forEach((canvas, index) => {
                const col = index % cols;
                const row = Math.floor(index / cols);
                positions.push({
                    x: col * (maxWidth + spacing) + (maxWidth - canvas.width) / 2,
                    y: row * (maxHeight + spacing) + (maxHeight - canvas.height) / 2
                });
            });
        } else if (layout === 'horizontal') {
            collageWidth = canvases.reduce((sum, canvas) => sum + canvas.width, 0) + (canvases.length - 1) * spacing;
            collageHeight = Math.max(...canvases.map(c => c.height));

            let currentX = 0;
            canvases.forEach((canvas) => {
                positions.push({
                    x: currentX,
                    y: (collageHeight - canvas.height) / 2
                });
                currentX += canvas.width + spacing;
            });
        } else if (layout === 'vertical') {
            collageWidth = Math.max(...canvases.map(c => c.width));
            collageHeight = canvases.reduce((sum, canvas) => sum + canvas.height, 0) + (canvases.length - 1) * spacing;

            let currentY = 0;
            canvases.forEach((canvas) => {
                positions.push({
                    x: (collageWidth - canvas.width) / 2,
                    y: currentY
                });
                currentY += canvas.height + spacing;
            });
        }

        const collageCanvas = this.createCanvas(collageWidth, collageHeight);
        const ctx = collageCanvas.getContext('2d');

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, collageWidth, collageHeight);

        canvases.forEach((canvas, index) => {
            ctx.drawImage(canvas, positions[index].x, positions[index].y);
        });

        return collageCanvas;
    },

    createThumbnail(canvas, maxSize = 200) {
        return this.resizeCanvas(canvas, maxSize, maxSize);
    },

    downloadCanvas(canvas, filename = 'image.png') {
        const link = document.createElement('a');
        link.download = filename;
        link.href = canvas.toDataURL('image/png');
        link.click();
    }
};

export default CanvasModule;
export const createCanvas = (width, height) => CanvasModule.createCanvas(width, height);
export const getContext = (canvas, type) => CanvasModule.getContext(canvas, type);
export const resizeCanvas = (canvas, maxWidth, maxHeight) => CanvasModule.resizeCanvas(canvas, maxWidth, maxHeight);
export const loadImage = (dataUrl) => CanvasModule.loadImage(dataUrl);
export const imageToCanvas = (img) => CanvasModule.imageToCanvas(img);
export const canvasToDataUrl = (canvas, type, quality) => CanvasModule.canvasToDataUrl(canvas, type, quality);
export const dataUrlToCanvas = (dataUrl) => CanvasModule.dataUrlToCanvas(dataUrl);
