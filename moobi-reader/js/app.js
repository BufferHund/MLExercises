// Moobi Reader - Main Application
class MoobiReader {
    constructor() {
        this.currentBook = null;
        this.currentFormat = null;
        this.currentPage = 0;
        this.totalPages = 0;
        this.currentBlobUrl = null; // For EPUB blob URL cleanup
        this.settings = {
            fontSize: 16,
            lineHeight: 1.6,
            theme: 'dark'
        };

        // EPUB variables
        this.epubBook = null;
        this.rendition = null;

        // PDF variables
        this.pdfDoc = null;
        this.pdfCanvas = null;
        this.pdfContext = null;

        this.init();
    }

    init() {
        // Set PDF.js worker
        if (typeof pdfjsLib !== 'undefined') {
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }

        // Load settings from localStorage
        this.loadSettings();

        // Initialize UI elements
        this.initializeElements();

        // Set up event listeners
        this.setupEventListeners();

        // Apply saved theme
        this.applyTheme(this.settings.theme);
    }

    initializeElements() {
        // Screens
        this.welcomeScreen = document.getElementById('welcomeScreen');
        this.readerScreen = document.getElementById('readerScreen');

        // Buttons
        this.fileInput = document.getElementById('fileInput');
        this.backButton = document.getElementById('backButton');
        this.settingsButton = document.getElementById('settingsButton');
        this.closeSettings = document.getElementById('closeSettings');
        this.prevButton = document.getElementById('prevButton');
        this.nextButton = document.getElementById('nextButton');

        // Book info
        this.bookTitle = document.getElementById('bookTitle');
        this.bookAuthor = document.getElementById('bookAuthor');

        // Progress
        this.progressSlider = document.getElementById('progressSlider');
        this.currentPageElement = document.getElementById('currentPage');
        this.totalPagesElement = document.getElementById('totalPages');

        // Viewers
        this.epubViewer = document.getElementById('epubViewer');
        this.epubArea = document.getElementById('epubArea');
        this.pdfViewer = document.getElementById('pdfViewer');
        this.pdfCanvas = document.getElementById('pdfCanvas');
        this.pdfContext = this.pdfCanvas.getContext('2d');

        // Settings
        this.settingsPanel = document.getElementById('settingsPanel');
        this.fontSizeSlider = document.getElementById('fontSizeSlider');
        this.lineHeightSlider = document.getElementById('lineHeightSlider');
        this.themeOptions = document.querySelectorAll('.theme-option');
    }

    setupEventListeners() {
        // File upload
        this.fileInput.addEventListener('change', (e) => this.handleFileUpload(e));

        // Navigation
        this.backButton.addEventListener('click', () => this.goToWelcomeScreen());
        this.prevButton.addEventListener('click', () => this.previousPage());
        this.nextButton.addEventListener('click', () => this.nextPage());

        // Progress slider
        this.progressSlider.addEventListener('input', (e) => this.goToPage(parseInt(e.target.value)));

        // Settings
        this.settingsButton.addEventListener('click', () => this.toggleSettings());
        this.closeSettings.addEventListener('click', () => this.toggleSettings());

        // Settings controls
        this.fontSizeSlider.addEventListener('input', (e) => this.changeFontSize(parseInt(e.target.value)));
        this.lineHeightSlider.addEventListener('input', (e) => this.changeLineHeight(parseFloat(e.target.value)));

        // Theme selector
        this.themeOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                const theme = e.target.dataset.theme;
                this.applyTheme(theme);
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const fileName = file.name.toLowerCase();

        if (fileName.endsWith('.epub')) {
            this.currentFormat = 'epub';
            this.loadEpub(file);
        } else if (fileName.endsWith('.pdf')) {
            this.currentFormat = 'pdf';
            this.loadPdf(file);
        } else {
            alert('不支持的文件格式。请选择 EPUB 或 PDF 文件。');
        }
    }

    // EPUB Functions
    async loadEpub(file) {
        try {
            // Show reader screen first
            this.showReaderScreen();

            // Check if ePub is available
            if (typeof ePub === 'undefined') {
                throw new Error('ePub library not loaded');
            }

            // Create a Blob URL to avoid CORS issues
            const blob = new Blob([file], { type: 'application/epub+zip' });
            const blobUrl = URL.createObjectURL(blob);

            // Store the blob URL for cleanup
            this.currentBlobUrl = blobUrl;

            // Initialize ePub book with Blob URL
            this.epubBook = ePub(blobUrl);

            // Wait for book to be opened
            await this.epubBook.ready;

            // Create rendition with fixed dimensions
            const viewerWidth = this.epubArea.clientWidth || 800;
            const viewerHeight = this.epubArea.clientHeight || 600;

            this.rendition = this.epubBook.renderTo(this.epubArea, {
                width: viewerWidth,
                height: viewerHeight,
                spread: 'none',
                flow: 'paginated',
                manager: 'default',
                allowScriptedContent: true
            });

            // Display the book
            await this.rendition.display();

            // Load metadata
            const metadata = await this.epubBook.loaded.metadata;
            this.bookTitle.textContent = metadata.title || file.name;
            this.bookAuthor.textContent = metadata.creator || '未知作者';

            // Generate locations for progress tracking
            this.epubBook.locations.generate(1600).then(() => {
                this.totalPages = this.epubBook.locations.total || 100;
                this.currentPage = 1;
                this.updateProgress();
            }).catch(() => {
                // If locations generation fails, use a default
                this.totalPages = 100;
                this.currentPage = 1;
                this.updateProgress();
            });

            // Navigation events
            this.rendition.on('relocated', (location) => {
                if (location.start) {
                    const currentLocation = this.epubBook.locations.locationFromCfi(location.start.cfi);
                    this.currentPage = currentLocation || 1;
                    this.updateProgress();
                }
            });

            // Apply theme styles to epub
            this.applyEpubStyles();

            // Handle resize
            window.addEventListener('resize', () => {
                if (this.rendition && this.currentFormat === 'epub') {
                    const newWidth = this.epubArea.clientWidth;
                    const newHeight = this.epubArea.clientHeight;
                    this.rendition.resize(newWidth, newHeight);
                }
            });

            // Notify enhanced features
            this.notifyBookLoaded(file.name);

        } catch (error) {
            console.error('Error loading EPUB:', error);
            alert('加载 EPUB 文件时出错：' + error.message + '\n请确保这是一个有效的 EPUB 文件。');
            this.goToWelcomeScreen();
        }
    }

    applyEpubStyles() {
        if (!this.rendition) return;

        const fontSize = this.settings.fontSize;
        const lineHeight = this.settings.lineHeight;
        const theme = this.settings.theme;

        let backgroundColor, textColor;

        switch (theme) {
            case 'light':
                backgroundColor = '#FFFFFF';
                textColor = '#000000';
                break;
            case 'sepia':
                backgroundColor = '#F4ECD8';
                textColor = '#5F4B32';
                break;
            default: // dark
                backgroundColor = '#1C1C1E';
                textColor = '#FFFFFF';
        }

        this.rendition.themes.default({
            body: {
                'font-size': `${fontSize}px !important`,
                'line-height': `${lineHeight} !important`,
                'color': `${textColor} !important`,
                'background-color': `${backgroundColor} !important`,
                'padding': '20px !important'
            },
            'p': {
                'margin-bottom': '1em !important'
            },
            'h1, h2, h3, h4, h5, h6': {
                'margin-top': '1.5em !important',
                'margin-bottom': '0.5em !important'
            }
        });
    }

    // PDF Functions
    async loadPdf(file) {
        try {
            // Show reader screen first
            this.showReaderScreen();

            const arrayBuffer = await file.arrayBuffer();

            // Load PDF document
            const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
            this.pdfDoc = await loadingTask.promise;

            this.totalPages = this.pdfDoc.numPages;
            this.currentPage = 1;

            // Set book info
            const metadata = await this.pdfDoc.getMetadata();
            this.bookTitle.textContent = metadata.info.Title || file.name;
            this.bookAuthor.textContent = metadata.info.Author || '未知作者';

            this.updateProgress();

            // Render first page after a short delay to ensure container is ready
            setTimeout(() => {
                this.renderPdfPage(1);
            }, 100);

            // Handle window resize
            let resizeTimeout;
            window.addEventListener('resize', () => {
                if (this.currentFormat === 'pdf' && this.pdfDoc) {
                    clearTimeout(resizeTimeout);
                    resizeTimeout = setTimeout(() => {
                        this.renderPdfPage(this.currentPage);
                    }, 300);
                }
            });

            // Notify enhanced features
            this.notifyBookLoaded(file.name);

        } catch (error) {
            console.error('Error loading PDF:', error);
            alert('加载 PDF 文件时出错。请尝试其他文件。');
            this.goToWelcomeScreen();
        }
    }

    async renderPdfPage(pageNum) {
        if (!this.pdfDoc || pageNum < 1 || pageNum > this.totalPages) return;

        try {
            const page = await this.pdfDoc.getPage(pageNum);

            // Get container dimensions
            const container = this.pdfViewer;
            const containerWidth = container.clientWidth - 40; // Account for padding
            const containerHeight = container.clientHeight - 40;

            // Calculate optimal scale to fit the container
            const viewport = page.getViewport({ scale: 1.0 });
            const scaleX = containerWidth / viewport.width;
            const scaleY = containerHeight / viewport.height;
            const scale = Math.min(scaleX, scaleY, 2.5); // Cap at 2.5x for quality

            // Get scaled viewport
            const scaledViewport = page.getViewport({ scale: scale });

            // Use device pixel ratio for retina displays (Mac)
            const outputScale = window.devicePixelRatio || 1;

            // Set canvas dimensions
            this.pdfCanvas.width = Math.floor(scaledViewport.width * outputScale);
            this.pdfCanvas.height = Math.floor(scaledViewport.height * outputScale);

            // Set display size (CSS pixels)
            this.pdfCanvas.style.width = Math.floor(scaledViewport.width) + 'px';
            this.pdfCanvas.style.height = Math.floor(scaledViewport.height) + 'px';

            // Scale context to match device pixel ratio
            const transform = outputScale !== 1
                ? [outputScale, 0, 0, outputScale, 0, 0]
                : null;

            // Render PDF page with high quality
            const renderContext = {
                canvasContext: this.pdfContext,
                viewport: scaledViewport,
                transform: transform
            };

            await page.render(renderContext).promise;
            this.currentPage = pageNum;
            this.updateProgress();
        } catch (error) {
            console.error('Error rendering PDF page:', error);
        }
    }

    // Navigation Functions
    previousPage() {
        if (this.currentFormat === 'epub' && this.rendition) {
            this.rendition.prev();
        } else if (this.currentFormat === 'pdf') {
            if (this.currentPage > 1) {
                this.renderPdfPage(this.currentPage - 1);
            }
        }
    }

    nextPage() {
        if (this.currentFormat === 'epub' && this.rendition) {
            this.rendition.next();
        } else if (this.currentFormat === 'pdf') {
            if (this.currentPage < this.totalPages) {
                this.renderPdfPage(this.currentPage + 1);
            }
        }
    }

    goToPage(pageNum) {
        if (this.currentFormat === 'epub' && this.rendition) {
            const location = this.epubBook.locations.cfiFromPercentage(pageNum / 100);
            this.rendition.display(location);
        } else if (this.currentFormat === 'pdf') {
            const actualPage = Math.max(1, Math.min(this.totalPages, Math.round((pageNum / 100) * this.totalPages)));
            this.renderPdfPage(actualPage);
        }
    }

    updateProgress() {
        this.currentPageElement.textContent = this.currentPage;
        this.totalPagesElement.textContent = this.totalPages;

        const percentage = this.totalPages > 0 ? (this.currentPage / this.totalPages) * 100 : 0;
        this.progressSlider.value = percentage;

        // Update bookshelf progress
        if (window.moobiFeatures && this.currentBook) {
            const bookData = {
                id: this.bookTitle.textContent,
                title: this.bookTitle.textContent,
                author: this.bookAuthor.textContent,
                format: this.currentFormat,
                progress: Math.round(percentage),
                currentPage: this.currentPage,
                totalPages: this.totalPages,
                lastRead: new Date().toISOString()
            };
            window.moobiFeatures.addToBookshelf(bookData);
        }
    }

    // Settings Functions
    toggleSettings() {
        if (window.moobiFeatures) {
            window.moobiFeatures.togglePanel('settingsPanel');
        } else {
            this.settingsPanel.classList.toggle('active');
        }
    }

    changeFontSize(size) {
        this.settings.fontSize = size;
        this.saveSettings();

        if (this.currentFormat === 'epub') {
            this.applyEpubStyles();
        }
    }

    changeLineHeight(height) {
        this.settings.lineHeight = height;
        this.saveSettings();

        if (this.currentFormat === 'epub') {
            this.applyEpubStyles();
        }
    }

    applyTheme(theme) {
        this.settings.theme = theme;
        document.body.setAttribute('data-theme', theme);

        // Update active theme button
        this.themeOptions.forEach(option => {
            if (option.dataset.theme === theme) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });

        // Apply to EPUB if loaded
        if (this.currentFormat === 'epub') {
            this.applyEpubStyles();
        }

        this.saveSettings();
    }

    // Screen Management
    showReaderScreen() {
        this.welcomeScreen.classList.remove('active');

        setTimeout(() => {
            this.readerScreen.classList.add('active');

            // Show appropriate viewer
            if (this.currentFormat === 'epub') {
                this.epubViewer.style.display = 'block';
                this.pdfViewer.style.display = 'none';
            } else if (this.currentFormat === 'pdf') {
                this.epubViewer.style.display = 'none';
                this.pdfViewer.style.display = 'block';
            }
        }, 100);
    }

    goToWelcomeScreen() {
        this.readerScreen.classList.remove('active');

        setTimeout(() => {
            this.welcomeScreen.classList.add('active');

            // Clean up
            if (this.rendition) {
                this.rendition.destroy();
                this.rendition = null;
            }
            if (this.epubBook) {
                this.epubBook.destroy();
                this.epubBook = null;
            }

            // Release Blob URL to free memory
            if (this.currentBlobUrl) {
                URL.revokeObjectURL(this.currentBlobUrl);
                this.currentBlobUrl = null;
            }

            this.pdfDoc = null;

            // Reset file input
            this.fileInput.value = '';

            // Notify enhanced features
            if (window.moobiFeatures) {
                window.moobiFeatures.onBookClosed();
            }
        }, 100);
    }

    // Notify book loaded
    notifyBookLoaded(fileName) {
        if (window.moobiFeatures) {
            const bookData = {
                id: this.bookTitle.textContent,
                title: this.bookTitle.textContent,
                author: this.bookAuthor.textContent,
                format: this.currentFormat,
                progress: 0,
                currentPage: this.currentPage,
                totalPages: this.totalPages,
                lastRead: new Date().toISOString()
            };
            window.moobiFeatures.onBookLoaded(bookData);
        }
    }

    // Keyboard Shortcuts
    handleKeyboard(event) {
        if (!this.readerScreen.classList.contains('active')) return;

        switch (event.key) {
            case 'ArrowLeft':
                event.preventDefault();
                this.previousPage();
                break;
            case 'ArrowRight':
                event.preventDefault();
                this.nextPage();
                break;
            case 'Escape':
                if (this.settingsPanel.classList.contains('active')) {
                    this.toggleSettings();
                } else {
                    this.goToWelcomeScreen();
                }
                break;
        }
    }

    // Local Storage
    saveSettings() {
        localStorage.setItem('moobiSettings', JSON.stringify(this.settings));
    }

    loadSettings() {
        const saved = localStorage.getItem('moobiSettings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };

            // Update UI elements
            if (this.fontSizeSlider) {
                this.fontSizeSlider.value = this.settings.fontSize;
            }
            if (this.lineHeightSlider) {
                this.lineHeightSlider.value = this.settings.lineHeight;
            }
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.moobiReader = new MoobiReader();
});
