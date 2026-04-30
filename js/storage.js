const StorageModule = {
    STORAGE_KEYS: {
        ALBUMS: 'vintage_camera_albums',
        PHOTOS: 'vintage_camera_photos',
        SETTINGS: 'vintage_camera_settings'
    },

    generateId() {
        return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    saveData(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('保存数据失败:', error);
            return false;
        }
    },

    loadData(key, defaultValue = []) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error('加载数据失败:', error);
            return defaultValue;
        }
    },

    clearData(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('清除数据失败:', error);
            return false;
        }
    },

    saveAlbum(album) {
        const albums = this.getAllAlbums();
        albums.unshift(album);
        return this.saveData(this.STORAGE_KEYS.ALBUMS, albums);
    },

    getAllAlbums() {
        return this.loadData(this.STORAGE_KEYS.ALBUMS, []);
    },

    getAlbumById(albumId) {
        const albums = this.getAllAlbums();
        return albums.find(album => album.id === albumId);
    },

    updateAlbum(updatedAlbum) {
        const albums = this.getAllAlbums();
        const index = albums.findIndex(album => album.id === updatedAlbum.id);
        
        if (index !== -1) {
            albums[index] = updatedAlbum;
            return this.saveData(this.STORAGE_KEYS.ALBUMS, albums);
        }
        return false;
    },

    deleteAlbum(albumId) {
        const albums = this.getAllAlbums();
        const filteredAlbums = albums.filter(album => album.id !== albumId);
        return this.saveData(this.STORAGE_KEYS.ALBUMS, filteredAlbums);
    },

    addPhotoToAlbum(albumId, photo) {
        const album = this.getAlbumById(albumId);
        if (album) {
            if (!album.photos) {
                album.photos = [];
            }
            album.photos.push(photo);
            return this.updateAlbum(album);
        }
        return false;
    },

    removePhotoFromAlbum(albumId, photoId) {
        const album = this.getAlbumById(albumId);
        if (album && album.photos) {
            album.photos = album.photos.filter(photo => photo.id !== photoId);
            return this.updateAlbum(album);
        }
        return false;
    },

    savePhoto(photo) {
        const photos = this.getAllPhotos();
        photos.unshift(photo);
        return this.saveData(this.STORAGE_KEYS.PHOTOS, photos);
    },

    getAllPhotos() {
        return this.loadData(this.STORAGE_KEYS.PHOTOS, []);
    },

    getPhotoById(photoId) {
        const photos = this.getAllPhotos();
        return photos.find(photo => photo.id === photoId);
    },

    deletePhoto(photoId) {
        const photos = this.getAllPhotos();
        const filteredPhotos = photos.filter(photo => photo.id !== photoId);
        return this.saveData(this.STORAGE_KEYS.PHOTOS, filteredPhotos);
    },

    saveSettings(settings) {
        return this.saveData(this.STORAGE_KEYS.SETTINGS, settings);
    },

    getSettings() {
        return this.loadData(this.STORAGE_KEYS.SETTINGS, {
            defaultFilter: 'none',
            defaultQuality: 0.9,
            autoSave: true,
            showGrid: false,
            theme: 'sepia'
        });
    },

    updateSettings(updatedSettings) {
        const currentSettings = this.getSettings();
        const newSettings = { ...currentSettings, ...updatedSettings };
        return this.saveSettings(newSettings);
    },

    exportData() {
        return {
            albums: this.getAllAlbums(),
            photos: this.getAllPhotos(),
            settings: this.getSettings(),
            exportDate: new Date().toISOString()
        };
    },

    importData(data) {
        try {
            if (data.albums) {
                this.saveData(this.STORAGE_KEYS.ALBUMS, data.albums);
            }
            if (data.photos) {
                this.saveData(this.STORAGE_KEYS.PHOTOS, data.photos);
            }
            if (data.settings) {
                this.saveData(this.STORAGE_KEYS.SETTINGS, data.settings);
            }
            return true;
        } catch (error) {
            console.error('导入数据失败:', error);
            return false;
        }
    },

    clearAllData() {
        Object.values(this.STORAGE_KEYS).forEach(key => {
            this.clearData(key);
        });
    },

    getStorageSize() {
        let totalSize = 0;
        
        Object.values(this.STORAGE_KEYS).forEach(key => {
            const data = localStorage.getItem(key);
            if (data) {
                totalSize += new Blob([data]).size;
            }
        });

        return {
            bytes: totalSize,
            kilobytes: (totalSize / 1024).toFixed(2),
            megabytes: (totalSize / (1024 * 1024)).toFixed(2)
        };
    },

    compressImageDataUrl(dataUrl, maxWidth = 1920, quality = 0.8) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                ctx.drawImage(img, 0, 0, width, height);

                const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
                resolve(compressedDataUrl);
            };
            img.src = dataUrl;
        });
    },

    async compressAndSavePhoto(photo) {
        if (photo.dataUrl) {
            photo.dataUrl = await this.compressImageDataUrl(photo.dataUrl);
        }
        return this.savePhoto(photo);
    },

    async compressAndSaveAlbum(album) {
        if (album.coverImage) {
            album.coverImage = await this.compressImageDataUrl(album.coverImage);
        }

        if (album.photos && Array.isArray(album.photos)) {
            for (let i = 0; i < album.photos.length; i++) {
                if (album.photos[i].dataUrl) {
                    album.photos[i].dataUrl = await this.compressImageDataUrl(album.photos[i].dataUrl);
                }
            }
        }

        return this.saveAlbum(album);
    }
};

export default StorageModule;
export const generateId = () => StorageModule.generateId();
export const saveAlbum = (album) => StorageModule.saveAlbum(album);
export const getAllAlbums = () => StorageModule.getAllAlbums();
export const getAlbumById = (albumId) => StorageModule.getAlbumById(albumId);
export const updateAlbum = (updatedAlbum) => StorageModule.updateAlbum(updatedAlbum);
export const deleteAlbum = (albumId) => StorageModule.deleteAlbum(albumId);
export const savePhoto = (photo) => StorageModule.savePhoto(photo);
export const getAllPhotos = () => StorageModule.getAllPhotos();
export const getPhotoById = (photoId) => StorageModule.getPhotoById(photoId);
export const deletePhoto = (photoId) => StorageModule.deletePhoto(photoId);
export const saveSettings = (settings) => StorageModule.saveSettings(settings);
export const getSettings = () => StorageModule.getSettings();
