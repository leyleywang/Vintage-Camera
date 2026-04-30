import * as CanvasModule from './canvas.js';
import * as StorageModule from './storage.js';

const AlbumModule = {
    createAlbum(title, description, photos = []) {
        return {
            id: StorageModule.generateId(),
            title: title,
            description: description,
            coverImage: photos.length > 0 ? photos[0].dataUrl : null,
            photos: photos,
            likes: 0,
            isLiked: false,
            isFavorited: false,
            createdAt: new Date().toISOString()
        };
    },

    addPhotoToAlbum(albumId, photo) {
        return StorageModule.addPhotoToAlbum(albumId, photo);
    },

    removePhotoFromAlbum(albumId, photoId) {
        return StorageModule.removePhotoFromAlbum(albumId, photoId);
    },

    toggleLike(albumId) {
        const album = StorageModule.getAlbumById(albumId);
        if (album) {
            album.isLiked = !album.isLiked;
            album.likes += album.isLiked ? 1 : -1;
            return StorageModule.updateAlbum(album);
        }
        return false;
    },

    toggleFavorite(albumId) {
        const album = StorageModule.getAlbumById(albumId);
        if (album) {
            album.isFavorited = !album.isFavorited;
            return StorageModule.updateAlbum(album);
        }
        return false;
    },

    getAllAlbums() {
        return StorageModule.getAllAlbums();
    },

    getFavoritedAlbums() {
        const albums = StorageModule.getAllAlbums();
        return albums.filter(album => album.isFavorited);
    },

    getRecentAlbums(limit = 10) {
        const albums = StorageModule.getAllAlbums();
        return albums.slice(0, limit);
    },

    getAlbumById(albumId) {
        return StorageModule.getAlbumById(albumId);
    },

    deleteAlbum(albumId) {
        return StorageModule.deleteAlbum(albumId);
    },

    async createAlbumCollage(albumId, layout = 'grid') {
        const album = StorageModule.getAlbumById(albumId);
        if (!album || !album.photos || album.photos.length === 0) {
            return null;
        }

        const canvases = [];
        for (const photo of album.photos) {
            try {
                const canvas = await CanvasModule.dataUrlToCanvas(photo.dataUrl);
                canvases.push(canvas);
            } catch (error) {
                console.error('加载照片失败:', error);
            }
        }

        if (canvases.length === 0) {
            return null;
        }

        return CanvasModule.createCollage(canvases, layout);
    },

    async addPolaroidEffect(photoDataUrl, bottomText = '') {
        const canvas = await CanvasModule.dataUrlToCanvas(photoDataUrl);
        const polaroidCanvas = CanvasModule.addPolaroidBorder(canvas, bottomText);
        return CanvasModule.canvasToDataUrl(polaroidCanvas);
    },

    async addDateStamp(photoDataUrl, date = new Date()) {
        const canvas = await CanvasModule.dataUrlToCanvas(photoDataUrl);
        const datedCanvas = CanvasModule.addDateStamp(canvas, date);
        return CanvasModule.canvasToDataUrl(datedCanvas);
    },

    async createThumbnail(photoDataUrl, maxSize = 200) {
        const canvas = await CanvasModule.dataUrlToCanvas(photoDataUrl);
        const thumbnailCanvas = CanvasModule.createThumbnail(canvas, maxSize);
        return CanvasModule.canvasToDataUrl(thumbnailCanvas);
    },

    formatDate(isoDateString) {
        const date = new Date(isoDateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return {
            full: `${year}-${month}-${day} ${hours}:${minutes}`,
            short: `${year}.${month}.${day}`,
            time: `${hours}:${minutes}`
        };
    },

    getStats() {
        const albums = StorageModule.getAllAlbums();
        const photos = StorageModule.getAllPhotos();
        
        const totalLikes = albums.reduce((sum, album) => sum + album.likes, 0);
        const favoritedCount = albums.filter(album => album.isFavorited).length;
        const totalPhotosInAlbums = albums.reduce((sum, album) => sum + (album.photos ? album.photos.length : 0), 0);

        return {
            totalAlbums: albums.length,
            totalPhotos: photos.length,
            totalPhotosInAlbums: totalPhotosInAlbums,
            totalLikes: totalLikes,
            favoritedCount: favoritedCount
        };
    },

    searchAlbums(query) {
        const albums = StorageModule.getAllAlbums();
        const lowerQuery = query.toLowerCase();
        
        return albums.filter(album => {
            return album.title.toLowerCase().includes(lowerQuery) ||
                   (album.description && album.description.toLowerCase().includes(lowerQuery));
        });
    },

    sortAlbums(albums, sortBy = 'date', ascending = false) {
        const sorted = [...albums];
        
        switch (sortBy) {
            case 'date':
                sorted.sort((a, b) => {
                    const dateA = new Date(a.createdAt).getTime();
                    const dateB = new Date(b.createdAt).getTime();
                    return ascending ? dateA - dateB : dateB - dateA;
                });
                break;
            case 'likes':
                sorted.sort((a, b) => {
                    return ascending ? a.likes - b.likes : b.likes - a.likes;
                });
                break;
            case 'title':
                sorted.sort((a, b) => {
                    const titleA = a.title.toLowerCase();
                    const titleB = b.title.toLowerCase();
                    return ascending ? titleA.localeCompare(titleB) : titleB.localeCompare(titleA);
                });
                break;
        }
        
        return sorted;
    },

    async exportAlbum(albumId, format = 'json') {
        const album = StorageModule.getAlbumById(albumId);
        if (!album) return null;

        if (format === 'json') {
            return JSON.stringify(album, null, 2);
        } else if (format === 'collage') {
            const collageCanvas = await this.createAlbumCollage(albumId, 'grid');
            return collageCanvas ? CanvasModule.canvasToDataUrl(collageCanvas) : null;
        }

        return null;
    },

    importAlbum(albumData) {
        try {
            const album = typeof albumData === 'string' ? JSON.parse(albumData) : albumData;
            
            if (!album.id || !album.title) {
                return { success: false, error: '相册数据格式不正确' };
            }

            const existingAlbum = StorageModule.getAlbumById(album.id);
            if (existingAlbum) {
                return { success: false, error: '相册已存在' };
            }

            StorageModule.saveAlbum(album);
            return { success: true, album: album };
        } catch (error) {
            return { success: false, error: '解析相册数据失败' };
        }
    },

    duplicateAlbum(albumId) {
        const album = StorageModule.getAlbumById(albumId);
        if (!album) return null;

        const duplicatedAlbum = {
            ...album,
            id: StorageModule.generateId(),
            title: `${album.title} (副本)`,
            likes: 0,
            isLiked: false,
            isFavorited: false,
            createdAt: new Date().toISOString()
        };

        if (duplicatedAlbum.photos) {
            duplicatedAlbum.photos = duplicatedAlbum.photos.map(photo => ({
                ...photo,
                id: StorageModule.generateId()
            }));
        }

        StorageModule.saveAlbum(duplicatedAlbum);
        return duplicatedAlbum;
    }
};

export default AlbumModule;
export const createAlbum = (title, description, photos) => AlbumModule.createAlbum(title, description, photos);
export const addPhotoToAlbum = (albumId, photo) => AlbumModule.addPhotoToAlbum(albumId, photo);
export const removePhotoFromAlbum = (albumId, photoId) => AlbumModule.removePhotoFromAlbum(albumId, photoId);
export const toggleLike = (albumId) => AlbumModule.toggleLike(albumId);
export const toggleFavorite = (albumId) => AlbumModule.toggleFavorite(albumId);
export const getAllAlbums = () => AlbumModule.getAllAlbums();
export const getFavoritedAlbums = () => AlbumModule.getFavoritedAlbums();
export const getRecentAlbums = (limit) => AlbumModule.getRecentAlbums(limit);
export const getAlbumById = (albumId) => AlbumModule.getAlbumById(albumId);
export const deleteAlbum = (albumId) => AlbumModule.deleteAlbum(albumId);
