import * as FilterModule from './filters.js';
import * as CanvasModule from './canvas.js';
import * as StorageModule from './storage.js';
import * as AlbumModule from './album.js';

const App = {
    currentPage: 'home-page',
    currentFilter: null,
    currentPhoto: null,
    originalPhotoData: null,
    cameraStream: null,
    facingMode: 'user',
    adjustments: {},

    init() {
        this.setupNavigation();
        this.setupCamera();
        this.setupFilters();
        this.setupAdjustments();
        this.setupFileUpload();
        this.setupButtons();
        this.setupModals();
        this.loadAlbums();
        this.updateStats();
    },

    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const pageId = item.dataset.page;
                this.switchPage(pageId);
                
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
            });
        });
    },

    switchPage(pageId) {
        const pages = document.querySelectorAll('.page');
        pages.forEach(page => {
            page.classList.remove('active');
        });
        
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
            this.currentPage = pageId;

            if (pageId === 'home-page') {
                this.loadAlbums();
            } else if (pageId === 'profile-page') {
                this.loadMyAlbums();
                this.loadMyPhotos();
                this.updateStats();
            }
        }
    },

    async setupCamera() {
        const video = document.getElementById('camera-video');
        const canvas = document.getElementById('photo-canvas');

        document.getElementById('toggle-camera').addEventListener('click', () => {
            this.toggleCameraMode();
        });

        document.getElementById('switch-camera').addEventListener('click', () => {
            this.switchCameraFacing();
        });

        document.getElementById('capture-photo').addEventListener('click', () => {
            this.capturePhoto();
        });

        this.showCameraPlaceholder();
    },

    showCameraPlaceholder() {
        const video = document.getElementById('camera-video');
        const canvas = document.getElementById('photo-canvas');
        const placeholder = document.getElementById('camera-placeholder');

        if (!this.cameraStream) {
            video.classList.add('hidden');
            canvas.classList.remove('active');
            if (placeholder) {
                placeholder.classList.remove('hidden');
            }
        }
    },

    async startCamera() {
        const video = document.getElementById('camera-video');
        
        if (this.cameraStream) {
            this.cameraStream.getTracks().forEach(track => track.stop());
        }

        const constraints = {
            video: {
                facingMode: this.facingMode,
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: false
        };

        try {
            this.cameraStream = await navigator.mediaDevices.getUserMedia(constraints);
            video.srcObject = this.cameraStream;
            video.classList.remove('hidden');
            document.getElementById('photo-canvas').classList.remove('active');
        } catch (error) {
            console.error('无法访问相机:', error);
            throw error;
        }
    },

    async toggleCameraMode() {
        const toggleBtn = document.getElementById('toggle-camera');
        const video = document.getElementById('camera-video');
        const canvas = document.getElementById('photo-canvas');
        const uploadBtn = document.getElementById('upload-photo');
        const placeholder = document.getElementById('camera-placeholder');

        if (toggleBtn.classList.contains('active') && this.cameraStream) {
            return;
        }

        toggleBtn.classList.add('active');
        uploadBtn.classList.remove('active');

        try {
            await this.startCamera();
            if (placeholder) {
                placeholder.classList.add('hidden');
            }
            video.classList.remove('hidden');
            canvas.classList.remove('active');
        } catch (error) {
            console.error('无法访问相机:', error);
            this.showToast('无法访问相机，请尝试上传照片');
            if (placeholder) {
                placeholder.classList.remove('hidden');
            }
        }

        document.getElementById('filter-overlay').classList.add('hidden');
    },

    async switchCameraFacing() {
        this.facingMode = this.facingMode === 'user' ? 'environment' : 'user';
        try {
            await this.startCamera();
        } catch (error) {
            console.error('切换摄像头失败:', error);
            this.facingMode = this.facingMode === 'user' ? 'environment' : 'user';
        }
    },

    capturePhoto() {
        const video = document.getElementById('camera-video');
        const canvas = document.getElementById('photo-canvas');
        
        if (video.classList.contains('hidden')) {
            return;
        }

        const context = canvas.getContext('2d');
        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;
        
        canvas.width = videoWidth;
        canvas.height = videoHeight;

        if (this.facingMode === 'user') {
            context.translate(canvas.width, 0);
            context.scale(-1, 1);
        }

        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        this.currentPhoto = canvas.toDataURL('image/png');
        this.originalPhotoData = canvas.toDataURL('image/png');
        
        this.showPhotoPreview();
        this.showFilterSection();
    },

    setupFileUpload() {
        const uploadBtn = document.getElementById('upload-photo');
        const fileInput = document.getElementById('file-input');

        uploadBtn.addEventListener('click', () => {
            fileInput.click();
            uploadBtn.classList.add('active');
            document.getElementById('toggle-camera').classList.remove('active');
        });

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.loadFile(file);
            }
            fileInput.value = '';
        });
    },

    loadFile(file) {
        if (!file.type.startsWith('image/')) {
            this.showToast('请选择图片文件');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.getElementById('photo-canvas');
                const context = canvas.getContext('2d');
                
                canvas.width = img.width;
                canvas.height = img.height;
                context.drawImage(img, 0, 0);

                this.currentPhoto = canvas.toDataURL('image/png');
                this.originalPhotoData = canvas.toDataURL('image/png');
                
                this.showPhotoPreview();
                this.showFilterSection();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    },

    showPhotoPreview() {
        const video = document.getElementById('camera-video');
        const canvas = document.getElementById('photo-canvas');

        video.classList.add('hidden');
        canvas.classList.add('active');

        if (this.cameraStream) {
            this.cameraStream.getTracks().forEach(track => track.stop());
            this.cameraStream = null;
        }
    },

    showFilterSection() {
        document.getElementById('filter-overlay').classList.remove('hidden');
        this.generateFilterPreviews();
        this.setupFilterTabs();
    },

    setupFilterTabs() {
        const tabs = document.querySelectorAll('.filter-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.dataset.tab;
                this.switchFilterTab(targetTab);
            });
        });
    },

    switchFilterTab(tabId) {
        const tabs = document.querySelectorAll('.filter-tab');
        const tabContents = document.querySelectorAll('.filter-tab-content');

        tabs.forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.tab === tabId) {
                tab.classList.add('active');
            }
        });

        tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === `tab-${tabId}`) {
                content.classList.add('active');
            }
        });
    },

    setupFilters() {
        this.loadFilterOptions();
    },

    loadFilterOptions() {
        const filterGrid = document.getElementById('filter-grid');
        filterGrid.innerHTML = '';

        const filters = FilterModule.getFilterList();
        
        filters.forEach((filter, index) => {
            const filterItem = document.createElement('div');
            filterItem.className = 'filter-item';
            filterItem.dataset.filter = filter.id;
            
            if (index === 0) {
                filterItem.classList.add('active');
                this.currentFilter = filter.id;
            }

            filterItem.innerHTML = `
                <div class="filter-preview">
                    <canvas id="preview-${filter.id}" width="80" height="80"></canvas>
                </div>
                <span class="filter-name">${filter.name}</span>
            `;

            filterItem.addEventListener('click', () => {
                this.selectFilter(filter.id);
            });

            filterGrid.appendChild(filterItem);
        });
    },

    generateFilterPreviews() {
        const originalCanvas = document.getElementById('photo-canvas');
        const originalContext = originalCanvas.getContext('2d');
        
        const filters = FilterModule.getFilterList();
        
        filters.forEach(filter => {
            const previewCanvas = document.getElementById(`preview-${filter.id}`);
            if (previewCanvas) {
                const previewContext = previewCanvas.getContext('2d');
                
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = originalCanvas.width;
                tempCanvas.height = originalCanvas.height;
                const tempContext = tempCanvas.getContext('2d');
                tempContext.drawImage(originalCanvas, 0, 0);

                const scale = Math.min(80 / tempCanvas.width, 80 / tempCanvas.height);
                const previewWidth = tempCanvas.width * scale;
                const previewHeight = tempCanvas.height * scale;
                
                previewCanvas.width = 80;
                previewCanvas.height = 80;
                
                if (filter.id === 'none') {
                    previewContext.drawImage(
                        tempCanvas,
                        (80 - previewWidth) / 2,
                        (80 - previewHeight) / 2,
                        previewWidth,
                        previewHeight
                    );
                } else {
                    const imageData = tempContext.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
                    const filteredData = FilterModule.applyFilter(filter.id, imageData, {});
                    tempContext.putImageData(filteredData, 0, 0);
                    
                    previewContext.drawImage(
                        tempCanvas,
                        (80 - previewWidth) / 2,
                        (80 - previewHeight) / 2,
                        previewWidth,
                        previewHeight
                    );
                }
            }
        });
    },

    selectFilter(filterId) {
        const filterItems = document.querySelectorAll('.filter-item');
        filterItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.filter === filterId) {
                item.classList.add('active');
            }
        });

        this.currentFilter = filterId;
        this.applyCurrentFilter();
        this.showAdjustmentSection(filterId);
    },

    showAdjustmentSection(filterId) {
        const adjustmentControls = document.getElementById('adjustment-controls');
        const adjustmentsTab = document.querySelector('.filter-tab[data-tab="adjustments"]');
        
        const filterConfig = FilterModule.getFilterConfig(filterId);
        
        if (filterConfig && filterConfig.adjustments) {
            adjustmentsTab.style.opacity = '1';
            adjustmentsTab.style.pointerEvents = 'auto';
            adjustmentControls.innerHTML = '';
            
            this.adjustments = {};
            
            filterConfig.adjustments.forEach(adj => {
                this.adjustments[adj.id] = adj.default;
                
                const adjItem = document.createElement('div');
                adjItem.className = 'adjustment-item';
                adjItem.innerHTML = `
                    <div class="adjustment-label">
                        <span>${adj.name}</span>
                        <span class="adjustment-value" id="value-${adj.id}">${adj.default}</span>
                    </div>
                    <input type="range" 
                           class="adjustment-slider" 
                           id="slider-${adj.id}"
                           min="${adj.min}" 
                           max="${adj.max}" 
                           value="${adj.default}"
                           step="${adj.step || 1}">
                `;
                
                adjustmentControls.appendChild(adjItem);
                
                const slider = document.getElementById(`slider-${adj.id}`);
                slider.addEventListener('input', (e) => {
                    const value = parseFloat(e.target.value);
                    this.adjustments[adj.id] = value;
                    document.getElementById(`value-${adj.id}`).textContent = value;
                    this.applyCurrentFilter();
                });
            });
        } else {
            adjustmentsTab.style.opacity = '0.5';
            adjustmentsTab.style.pointerEvents = 'none';
        }
    },

    applyCurrentFilter() {
        if (!this.currentPhoto || !this.originalPhotoData) return;

        const canvas = document.getElementById('photo-canvas');
        const context = canvas.getContext('2d');
        
        const img = new Image();
        img.onload = () => {
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(img, 0, 0);

            if (this.currentFilter && this.currentFilter !== 'none') {
                const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                const filteredData = FilterModule.applyFilter(this.currentFilter, imageData, this.adjustments);
                context.putImageData(filteredData, 0, 0);
            }

            this.currentPhoto = canvas.toDataURL('image/png');
        };
        img.src = this.originalPhotoData;
    },

    setupAdjustments() {
    },

    setupButtons() {
        document.getElementById('reset-filter').addEventListener('click', () => {
            this.resetFilter();
        });

        document.getElementById('save-photo').addEventListener('click', () => {
            this.savePhoto();
        });

        document.getElementById('create-album').addEventListener('click', () => {
            this.openAlbumModal();
        });

        document.getElementById('refresh-albums').addEventListener('click', () => {
            this.loadAlbums();
        });
    },

    resetFilter() {
        if (!this.originalPhotoData) return;

        const canvas = document.getElementById('photo-canvas');
        const context = canvas.getContext('2d');
        
        const img = new Image();
        img.onload = () => {
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(img, 0, 0);
            this.currentPhoto = canvas.toDataURL('image/png');
            
            this.currentFilter = 'none';
            this.adjustments = {};
            
            const filterItems = document.querySelectorAll('.filter-item');
            filterItems.forEach(item => {
                item.classList.remove('active');
                if (item.dataset.filter === 'none') {
                    item.classList.add('active');
                }
            });
            
            this.switchFilterTab('filters');
            this.showToast('已重置为原图');
        };
        img.src = this.originalPhotoData;
    },

    savePhoto() {
        if (!this.currentPhoto) {
            this.showToast('请先拍摄或上传照片');
            return;
        }

        const photoData = {
            id: StorageModule.generateId(),
            dataUrl: this.currentPhoto,
            filter: this.currentFilter,
            adjustments: { ...this.adjustments },
            createdAt: new Date().toISOString()
        };

        StorageModule.savePhoto(photoData);
        this.showToast('照片已保存');
        this.downloadPhoto();
    },

    downloadPhoto() {
        if (!this.currentPhoto) return;

        const link = document.createElement('a');
        link.download = `vintage-photo-${Date.now()}.png`;
        link.href = this.currentPhoto;
        link.click();
    },

    openAlbumModal() {
        if (!this.currentPhoto) {
            this.showToast('请先拍摄或上传照片');
            return;
        }

        const modal = document.getElementById('album-modal');
        const previewImage = document.getElementById('preview-image');
        
        previewImage.src = this.currentPhoto;
        
        document.getElementById('album-title').value = '';
        document.getElementById('album-description').value = '';
        
        modal.classList.remove('hidden');
    },

    setupModals() {
        document.getElementById('close-album-modal').addEventListener('click', () => {
            this.closeModal('album-modal');
        });

        document.getElementById('cancel-album').addEventListener('click', () => {
            this.closeModal('album-modal');
        });

        document.getElementById('confirm-album').addEventListener('click', () => {
            this.createAlbum();
        });

        document.getElementById('close-share-modal').addEventListener('click', () => {
            this.closeModal('share-modal');
        });

        document.querySelectorAll('.share-option').forEach(option => {
            option.addEventListener('click', () => {
                const platform = option.dataset.platform;
                this.shareToPlatform(platform);
            });
        });
    },

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.add('hidden');
    },

    createAlbum() {
        const title = document.getElementById('album-title').value.trim();
        const description = document.getElementById('album-description').value.trim();

        if (!title) {
            this.showToast('请输入相册标题');
            return;
        }

        if (!this.currentPhoto) {
            this.showToast('请先拍摄或上传照片');
            return;
        }

        const albumData = {
            id: StorageModule.generateId(),
            title: title,
            description: description,
            coverImage: this.currentPhoto,
            photos: [{
                id: StorageModule.generateId(),
                dataUrl: this.currentPhoto,
                filter: this.currentFilter,
                adjustments: { ...this.adjustments }
            }],
            likes: 0,
            isLiked: false,
            isFavorited: false,
            createdAt: new Date().toISOString()
        };

        StorageModule.saveAlbum(albumData);
        this.closeModal('album-modal');
        this.showToast('相册创建成功！');
        this.loadAlbums();
    },

    shareToPlatform(platform) {
        switch (platform) {
            case 'download':
                this.downloadPhoto();
                break;
            case 'copy':
                this.copyAlbumLink();
                break;
            default:
                this.showToast(`即将分享到${this.getPlatformName(platform)}...`);
                setTimeout(() => {
                    this.showToast('分享功能需要社交平台SDK支持');
                }, 1000);
        }
        
        this.closeModal('share-modal');
    },

    getPlatformName(platform) {
        const names = {
            wechat: '微信',
            weibo: '微博',
            qq: 'QQ',
            moments: '朋友圈'
        };
        return names[platform] || platform;
    },

    copyAlbumLink() {
        const link = window.location.href;
        navigator.clipboard.writeText(link).then(() => {
            this.showToast('链接已复制');
        }).catch(() => {
            this.showToast('复制失败，请手动复制');
        });
    },

    loadAlbums() {
        const albums = StorageModule.getAllAlbums();
        const albumList = document.getElementById('album-list');
        
        if (albums.length === 0) {
            albumList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon"><i class="fas fa-camera"></i></div>
                    <p>暂无相册，快去滤镜页面制作你的第一张复古照片吧！</p>
                </div>
            `;
            return;
        }

        albumList.innerHTML = albums.map(album => this.createAlbumCard(album)).join('');
        this.bindAlbumCardEvents();
    },

    createAlbumCard(album) {
        const date = new Date(album.createdAt);
        const formattedDate = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
        
        return `
            <div class="album-card" data-album-id="${album.id}">
                <div class="album-cover">
                    <img src="${album.coverImage}" alt="${album.title}">
                </div>
                <div class="album-info">
                    <h3 class="album-title">${this.escapeHtml(album.title)}</h3>
                    ${album.description ? `<p class="album-description">${this.escapeHtml(album.description)}</p>` : ''}
                    <div class="album-meta">
                        <span class="album-date">${formattedDate}</span>
                        <div class="album-actions">
                            <div class="action-icon like-btn ${album.isLiked ? 'liked' : ''}" data-album-id="${album.id}">
                                <i class="fas fa-heart"></i>
                                <span class="like-count">${album.likes}</span>
                            </div>
                            <div class="action-icon favorite-btn ${album.isFavorited ? 'favorited' : ''}" data-album-id="${album.id}">
                                <i class="fas fa-star"></i>
                            </div>
                            <div class="action-icon share-btn" data-album-id="${album.id}">
                                <i class="fas fa-share-alt"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    bindAlbumCardEvents() {
        document.querySelectorAll('.like-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const albumId = btn.dataset.albumId;
                this.toggleLike(albumId);
            });
        });

        document.querySelectorAll('.favorite-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const albumId = btn.dataset.albumId;
                this.toggleFavorite(albumId);
            });
        });

        document.querySelectorAll('.share-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const albumId = btn.dataset.albumId;
                this.openShareModal(albumId);
            });
        });
    },

    toggleLike(albumId) {
        const album = StorageModule.getAlbumById(albumId);
        if (album) {
            album.isLiked = !album.isLiked;
            album.likes += album.isLiked ? 1 : -1;
            StorageModule.updateAlbum(album);
            
            const likeBtn = document.querySelector(`.like-btn[data-album-id="${albumId}"]`);
            const likeCount = likeBtn.querySelector('.like-count');
            
            if (album.isLiked) {
                likeBtn.classList.add('liked');
            } else {
                likeBtn.classList.remove('liked');
            }
            likeCount.textContent = album.likes;
            
            this.updateStats();
        }
    },

    toggleFavorite(albumId) {
        const album = StorageModule.getAlbumById(albumId);
        if (album) {
            album.isFavorited = !album.isFavorited;
            StorageModule.updateAlbum(album);
            
            const favoriteBtn = document.querySelector(`.favorite-btn[data-album-id="${albumId}"]`);
            if (album.isFavorited) {
                favoriteBtn.classList.add('favorited');
            } else {
                favoriteBtn.classList.remove('favorited');
            }
        }
    },

    openShareModal(albumId) {
        const album = StorageModule.getAlbumById(albumId);
        if (album) {
            this.currentPhoto = album.coverImage;
            document.getElementById('share-modal').classList.remove('hidden');
        }
    },

    loadMyAlbums() {
        const albums = StorageModule.getAllAlbums();
        const albumList = document.getElementById('my-album-list');
        
        if (albums.length === 0) {
            albumList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon"><i class="fas fa-camera"></i></div>
                    <p>你还没有创建相册，快去滤镜页面制作第一张复古照片吧！</p>
                </div>
            `;
            return;
        }

        albumList.innerHTML = albums.map(album => this.createAlbumCard(album)).join('');
        this.bindAlbumCardEvents();
    },

    loadMyPhotos() {
        const photos = StorageModule.getAllPhotos();
        const photoList = document.getElementById('my-photo-list');
        
        if (photos.length === 0) {
            photoList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon"><i class="fas fa-image"></i></div>
                    <p>你还没有保存照片</p>
                </div>
            `;
            return;
        }

        photoList.innerHTML = photos.map(photo => `
            <div class="photo-item" data-photo-id="${photo.id}">
                <img src="${photo.dataUrl}" alt="照片">
            </div>
        `).join('');
    },

    updateStats() {
        const albums = StorageModule.getAllAlbums();
        const photos = StorageModule.getAllPhotos();
        
        const totalLikes = albums.reduce((sum, album) => sum + album.likes, 0);
        
        document.getElementById('album-count').textContent = albums.length;
        document.getElementById('photo-count').textContent = photos.length;
        document.getElementById('like-count').textContent = totalLikes;
    },

    showToast(message) {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toast-message');
        
        toastMessage.textContent = message;
        toast.classList.remove('hidden');
        
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 2500);
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

export default App;
