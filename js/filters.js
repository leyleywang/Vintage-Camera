const FilterModule = {
    filters: [
        {
            id: 'none',
            name: '原图',
            description: '不应用任何滤镜效果',
            adjustments: null
        },
        {
            id: 'classic-film',
            name: '经典胶卷',
            description: '模拟35mm经典胶卷效果，温暖色调，轻微颗粒感',
            adjustments: [
                { id: 'warmth', name: '暖色调', min: 0, max: 100, default: 50, step: 1 },
                { id: 'contrast', name: '对比度', min: 0, max: 100, default: 40, step: 1 },
                { id: 'grain', name: '颗粒感', min: 0, max: 100, default: 30, step: 1 }
            ]
        },
        {
            id: 'polaroid',
            name: '拍立得',
            description: '模拟宝丽来即时胶片效果，柔和色彩，轻微模糊',
            adjustments: [
                { id: 'softness', name: '柔和度', min: 0, max: 100, default: 40, step: 1 },
                { id: 'vignette', name: '暗角', min: 0, max: 100, default: 60, step: 1 },
                { id: 'saturation', name: '饱和度', min: 0, max: 100, default: 70, step: 1 }
            ]
        },
        {
            id: 'vintage-70s',
            name: '70年代复古',
            description: '70年代胶片风格，偏黄偏绿，高对比度',
            adjustments: [
                { id: 'yellowish', name: '黄调', min: 0, max: 100, default: 60, step: 1 },
                { id: 'greenish', name: '绿调', min: 0, max: 100, default: 40, step: 1 },
                { id: 'contrast', name: '对比度', min: 0, max: 100, default: 50, step: 1 }
            ]
        },
        {
            id: 'sepia',
            name: '棕褐色调',
            description: '经典的黑白照片效果，带有暖色调',
            adjustments: [
                { id: 'sepia', name: '棕褐色', min: 0, max: 100, default: 80, step: 1 },
                { id: 'intensity', name: '强度', min: 0, max: 100, default: 60, step: 1 }
            ]
        },
        {
            id: 'cinema',
            name: '电影质感',
            description: '电影胶片效果，宽画幅，蓝色调，高对比度',
            adjustments: [
                { id: 'bluish', name: '蓝调', min: 0, max: 100, default: 50, step: 1 },
                { id: 'contrast', name: '对比度', min: 0, max: 100, default: 60, step: 1 },
                { id: 'grain', name: '颗粒感', min: 0, max: 100, default: 20, step: 1 }
            ]
        },
        {
            id: 'black-white',
            name: '黑白胶片',
            description: '纯黑白胶片效果，高对比度，深黑色',
            adjustments: [
                { id: 'contrast', name: '对比度', min: 0, max: 100, default: 50, step: 1 },
                { id: 'brightness', name: '亮度', min: -50, max: 50, default: 0, step: 1 },
                { id: 'grain', name: '颗粒感', min: 0, max: 100, default: 15, step: 1 }
            ]
        },
        {
            id: 'kodachrome',
            name: '柯达克罗姆',
            description: '模拟柯达克罗姆幻灯片胶片，鲜艳色彩，高饱和度',
            adjustments: [
                { id: 'saturation', name: '饱和度', min: 0, max: 100, default: 80, step: 1 },
                { id: 'warmth', name: '暖色调', min: 0, max: 100, default: 40, step: 1 },
                { id: 'contrast', name: '对比度', min: 0, max: 100, default: 45, step: 1 }
            ]
        },
        {
            id: 'lomography',
            name: '乐魔',
            description: 'Lomo相机效果，暗角，色彩偏移，高对比度',
            adjustments: [
                { id: 'vignette', name: '暗角', min: 0, max: 100, default: 70, step: 1 },
                { id: 'colorShift', name: '色偏', min: 0, max: 100, default: 30, step: 1 },
                { id: 'contrast', name: '对比度', min: 0, max: 100, default: 55, step: 1 }
            ]
        },
        {
            id: 'cross-process',
            name: '交叉冲洗',
            description: '模拟交叉冲洗效果，高对比度，色彩异常',
            adjustments: [
                { id: 'saturation', name: '饱和度', min: 0, max: 100, default: 90, step: 1 },
                { id: 'contrast', name: '对比度', min: 0, max: 100, default: 60, step: 1 },
                { id: 'grain', name: '颗粒感', min: 0, max: 100, default: 25, step: 1 }
            ]
        }
    ],

    getFilterList() {
        return this.filters;
    },

    getFilterConfig(filterId) {
        return this.filters.find(f => f.id === filterId);
    },

    applyFilter(filterId, imageData, adjustments) {
        switch (filterId) {
            case 'none':
                return imageData;
            case 'classic-film':
                return this.applyClassicFilm(imageData, adjustments);
            case 'polaroid':
                return this.applyPolaroid(imageData, adjustments);
            case 'vintage-70s':
                return this.applyVintage70s(imageData, adjustments);
            case 'sepia':
                return this.applySepia(imageData, adjustments);
            case 'cinema':
                return this.applyCinema(imageData, adjustments);
            case 'black-white':
                return this.applyBlackWhite(imageData, adjustments);
            case 'kodachrome':
                return this.applyKodachrome(imageData, adjustments);
            case 'lomography':
                return this.applyLomography(imageData, adjustments);
            case 'cross-process':
                return this.applyCrossProcess(imageData, adjustments);
            default:
                return imageData;
        }
    },

    applyClassicFilm(imageData, adjustments) {
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        
        const warmth = (adjustments.warmth || 50) / 100;
        const contrast = (adjustments.contrast || 40) / 100;
        const grain = (adjustments.grain || 30) / 100;

        const contrastFactor = 1 + contrast;
        const contrastOffset = (1 - contrastFactor) * 128;

        for (let i = 0; i < data.length; i += 4) {
            let r = data[i];
            let g = data[i + 1];
            let b = data[i + 2];

            r = r * contrastFactor + contrastOffset;
            g = g * contrastFactor + contrastOffset;
            b = b * contrastFactor + contrastOffset;

            r += warmth * 30;
            g += warmth * 15;
            b -= warmth * 20;

            const noise = (Math.random() - 0.5) * grain * 40;
            r += noise;
            g += noise;
            b += noise;

            data[i] = Math.max(0, Math.min(255, r));
            data[i + 1] = Math.max(0, Math.min(255, g));
            data[i + 2] = Math.max(0, Math.min(255, b));
        }

        return imageData;
    },

    applyPolaroid(imageData, adjustments) {
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        
        const softness = (adjustments.softness || 40) / 100;
        const vignette = (adjustments.vignette || 60) / 100;
        const saturation = (adjustments.saturation || 70) / 100;

        const centerX = width / 2;
        const centerY = height / 2;
        const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                
                let r = data[idx];
                let g = data[idx + 1];
                let b = data[idx + 2];

                const gray = 0.299 * r + 0.587 * g + 0.114 * b;
                const satFactor = 1 + (saturation - 0.5) * 0.8;
                r = gray + (r - gray) * satFactor;
                g = gray + (g - gray) * satFactor;
                b = gray + (b - gray) * satFactor;

                r += softness * 10;
                g += softness * 10;
                b += softness * 5;

                const distFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
                const distRatio = distFromCenter / maxDist;
                const vignetteFactor = 1 - distRatio * vignette * 0.6;
                
                r *= vignetteFactor;
                g *= vignetteFactor;
                b *= vignetteFactor;

                data[idx] = Math.max(0, Math.min(255, r));
                data[idx + 1] = Math.max(0, Math.min(255, g));
                data[idx + 2] = Math.max(0, Math.min(255, b));
            }
        }

        return imageData;
    },

    applyVintage70s(imageData, adjustments) {
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        
        const yellowish = (adjustments.yellowish || 60) / 100;
        const greenish = (adjustments.greenish || 40) / 100;
        const contrast = (adjustments.contrast || 50) / 100;

        const contrastFactor = 1 + contrast;
        const contrastOffset = (1 - contrastFactor) * 128;

        for (let i = 0; i < data.length; i += 4) {
            let r = data[i];
            let g = data[i + 1];
            let b = data[i + 2];

            r = r * contrastFactor + contrastOffset;
            g = g * contrastFactor + contrastOffset;
            b = b * contrastFactor + contrastOffset;

            r += yellowish * 40;
            g += yellowish * 30;
            b -= yellowish * 30;

            r -= greenish * 10;
            g += greenish * 25;
            b -= greenish * 15;

            data[i] = Math.max(0, Math.min(255, r));
            data[i + 1] = Math.max(0, Math.min(255, g));
            data[i + 2] = Math.max(0, Math.min(255, b));
        }

        return imageData;
    },

    applySepia(imageData, adjustments) {
        const data = imageData.data;
        const sepia = (adjustments.sepia || 80) / 100;
        const intensity = (adjustments.intensity || 60) / 100;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            const gray = 0.299 * r + 0.587 * g + 0.114 * b;

            let newR = gray + sepia * 45;
            let newG = gray + sepia * 20;
            let newB = gray - sepia * 20;

            const factor = 1 + (intensity - 0.5) * 0.5;
            newR = (newR - 128) * factor + 128;
            newG = (newG - 128) * factor + 128;
            newB = (newB - 128) * factor + 128;

            data[i] = Math.max(0, Math.min(255, newR));
            data[i + 1] = Math.max(0, Math.min(255, newG));
            data[i + 2] = Math.max(0, Math.min(255, newB));
        }

        return imageData;
    },

    applyCinema(imageData, adjustments) {
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        
        const bluish = (adjustments.bluish || 50) / 100;
        const contrast = (adjustments.contrast || 60) / 100;
        const grain = (adjustments.grain || 20) / 100;

        const contrastFactor = 1 + contrast * 0.8;
        const contrastOffset = (1 - contrastFactor) * 128;

        const centerX = width / 2;
        const centerY = height / 2;
        const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                
                let r = data[idx];
                let g = data[idx + 1];
                let b = data[idx + 2];

                r = r * contrastFactor + contrastOffset;
                g = g * contrastFactor + contrastOffset;
                b = b * contrastFactor + contrastOffset;

                r -= bluish * 25;
                g -= bluish * 10;
                b += bluish * 40;

                const noise = (Math.random() - 0.5) * grain * 30;
                r += noise;
                g += noise;
                b += noise;

                const distFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
                const distRatio = distFromCenter / maxDist;
                const vignetteFactor = 1 - distRatio * 0.4;
                
                r *= vignetteFactor;
                g *= vignetteFactor;
                b *= vignetteFactor;

                data[idx] = Math.max(0, Math.min(255, r));
                data[idx + 1] = Math.max(0, Math.min(255, g));
                data[idx + 2] = Math.max(0, Math.min(255, b));
            }
        }

        return imageData;
    },

    applyBlackWhite(imageData, adjustments) {
        const data = imageData.data;
        const contrast = (adjustments.contrast || 50) / 100;
        const brightness = (adjustments.brightness || 0);
        const grain = (adjustments.grain || 15) / 100;

        const contrastFactor = 1 + contrast;
        const contrastOffset = (1 - contrastFactor) * 128 + brightness;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            let gray = 0.299 * r + 0.587 * g + 0.114 * b;

            gray = gray * contrastFactor + contrastOffset;

            const noise = (Math.random() - 0.5) * grain * 25;
            gray += noise;

            const finalGray = Math.max(0, Math.min(255, gray));
            data[i] = finalGray;
            data[i + 1] = finalGray;
            data[i + 2] = finalGray;
        }

        return imageData;
    },

    applyKodachrome(imageData, adjustments) {
        const data = imageData.data;
        const saturation = (adjustments.saturation || 80) / 100;
        const warmth = (adjustments.warmth || 40) / 100;
        const contrast = (adjustments.contrast || 45) / 100;

        const contrastFactor = 1 + contrast * 0.6;
        const contrastOffset = (1 - contrastFactor) * 128;

        for (let i = 0; i < data.length; i += 4) {
            let r = data[i];
            let g = data[i + 1];
            let b = data[i + 2];

            r = r * contrastFactor + contrastOffset;
            g = g * contrastFactor + contrastOffset;
            b = b * contrastFactor + contrastOffset;

            const gray = 0.299 * r + 0.587 * g + 0.114 * b;
            const satFactor = 1 + (saturation - 0.5) * 1.2;
            r = gray + (r - gray) * satFactor;
            g = gray + (g - gray) * satFactor;
            b = gray + (b - gray) * satFactor;

            r += warmth * 25;
            g += warmth * 10;
            b -= warmth * 15;

            if (r > 200) r = Math.min(255, r + 10);
            if (b < 100) b = Math.max(0, b - 10);

            data[i] = Math.max(0, Math.min(255, r));
            data[i + 1] = Math.max(0, Math.min(255, g));
            data[i + 2] = Math.max(0, Math.min(255, b));
        }

        return imageData;
    },

    applyLomography(imageData, adjustments) {
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        
        const vignette = (adjustments.vignette || 70) / 100;
        const colorShift = (adjustments.colorShift || 30) / 100;
        const contrast = (adjustments.contrast || 55) / 100;

        const contrastFactor = 1 + contrast;
        const contrastOffset = (1 - contrastFactor) * 128;

        const centerX = width / 2;
        const centerY = height / 2;
        const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                
                let r = data[idx];
                let g = data[idx + 1];
                let b = data[idx + 2];

                r = r * contrastFactor + contrastOffset;
                g = g * contrastFactor + contrastOffset;
                b = b * contrastFactor + contrastOffset;

                r += colorShift * 30;
                g += colorShift * 15;
                b -= colorShift * 25;

                const distFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
                const distRatio = distFromCenter / maxDist;
                const vignetteFactor = 1 - distRatio * vignette * 0.7;
                
                r *= vignetteFactor;
                g *= vignetteFactor;
                b *= vignetteFactor;

                data[idx] = Math.max(0, Math.min(255, r));
                data[idx + 1] = Math.max(0, Math.min(255, g));
                data[idx + 2] = Math.max(0, Math.min(255, b));
            }
        }

        return imageData;
    },

    applyCrossProcess(imageData, adjustments) {
        const data = imageData.data;
        const saturation = (adjustments.saturation || 90) / 100;
        const contrast = (adjustments.contrast || 60) / 100;
        const grain = (adjustments.grain || 25) / 100;

        const contrastFactor = 1 + contrast;
        const contrastOffset = (1 - contrastFactor) * 128;

        for (let i = 0; i < data.length; i += 4) {
            let r = data[i];
            let g = data[i + 1];
            let b = data[i + 2];

            r = r * contrastFactor + contrastOffset;
            g = g * contrastFactor + contrastOffset;
            b = b * contrastFactor + contrastOffset;

            const gray = 0.299 * r + 0.587 * g + 0.114 * b;
            const satFactor = 1 + (saturation - 0.5) * 1.5;
            r = gray + (r - gray) * satFactor;
            g = gray + (g - gray) * satFactor;
            b = gray + (b - gray) * satFactor;

            r = Math.min(255, r * 1.1);
            g = Math.max(0, g * 0.9);
            b = Math.min(255, b * 1.2);

            const noise = (Math.random() - 0.5) * grain * 35;
            r += noise;
            g += noise;
            b += noise;

            data[i] = Math.max(0, Math.min(255, r));
            data[i + 1] = Math.max(0, Math.min(255, g));
            data[i + 2] = Math.max(0, Math.min(255, b));
        }

        return imageData;
    }
};

export default FilterModule;
export const getFilterList = () => FilterModule.getFilterList();
export const getFilterConfig = (filterId) => FilterModule.getFilterConfig(filterId);
export const applyFilter = (filterId, imageData, adjustments) => FilterModule.applyFilter(filterId, imageData, adjustments);
