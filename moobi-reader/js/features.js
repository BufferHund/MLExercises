// Moobi Reader - Enhanced Features
// This file extends the main app with additional functionality

class EnhancedFeatures {
    constructor(reader) {
        this.reader = reader;
        this.bookshelf = [];
        this.bookmarks = [];
        this.readingStats = {
            startTime: null,
            totalTime: 0,
            pagesRead: 0,
            sessionTime: 0
        };
        this.searchResults = [];

        this.init();
    }

    init() {
        // Load saved data
        this.loadBookshelf();
        this.loadBookmarks();
        this.loadStats();

        // Initialize UI
        this.initializePanels();
        this.setupEventListeners();
        this.renderRecentFiles();

        // Start reading timer
        this.startReadingTimer();
    }

    initializePanels() {
        // Panel elements
        this.tocPanel = document.getElementById('tocPanel');
        this.bookmarksPanel = document.getElementById('bookmarksPanel');
        this.searchPanel = document.getElementById('searchPanel');
        this.statsPanel = document.getElementById('statsPanel');
        this.helpOverlay = document.getElementById('helpOverlay');

        // Close panel buttons
        document.querySelectorAll('.close-panel').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const panelId = e.currentTarget.dataset.panel;
                this.closePanel(panelId);
            });
        });
    }

    setupEventListeners() {
        // Top bar buttons
        document.getElementById('tocButton')?.addEventListener('click', () => this.togglePanel('tocPanel'));
        document.getElementById('bookmarkButton')?.addEventListener('click', () => this.togglePanel('bookmarksPanel'));
        document.getElementById('searchButton')?.addEventListener('click', () => this.togglePanel('searchPanel'));
        document.getElementById('statsButton')?.addEventListener('click', () => this.togglePanel('statsPanel'));

        // Bookmark actions
        document.getElementById('addBookmarkButton')?.addEventListener('click', () => this.addBookmark());

        // Search
        document.getElementById('executeSearch')?.addEventListener('click', () => this.performSearch());
        document.getElementById('searchInput')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.performSearch();
        });

        // Help overlay
        document.getElementById('closeHelp')?.addEventListener('click', () => this.closeHelp());

        // Enhanced keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleEnhancedKeyboard(e));

        // Drag and drop
        this.setupDragAndDrop();
    }

    // Panel Management
    togglePanel(panelId) {
        const panel = document.getElementById(panelId);
        if (!panel) return;

        // Close all other panels
        document.querySelectorAll('.side-panel').forEach(p => {
            if (p.id !== panelId) {
                p.classList.remove('active');
            }
        });

        panel.classList.toggle('active');

        // Load specific panel content
        if (panel.classList.contains('active')) {
            this.loadPanelContent(panelId);
        }
    }

    closePanel(panelId) {
        document.getElementById(panelId)?.classList.remove('active');
    }

    closeAllPanels() {
        document.querySelectorAll('.side-panel').forEach(p => {
            p.classList.remove('active');
        });
    }

    loadPanelContent(panelId) {
        switch (panelId) {
            case 'tocPanel':
                this.loadTableOfContents();
                break;
            case 'bookmarksPanel':
                this.renderBookmarks();
                break;
            case 'statsPanel':
                this.updateStatsDisplay();
                break;
        }
    }

    // Table of Contents
    async loadTableOfContents() {
        const tocContent = document.getElementById('tocContent');
        if (!tocContent) return;

        if (this.reader.currentFormat === 'epub' && this.reader.epubBook) {
            try {
                const navigation = await this.reader.epubBook.loaded.navigation;
                const toc = navigation.toc;

                if (toc && toc.length > 0) {
                    tocContent.innerHTML = '';
                    this.renderTocItems(toc, tocContent);
                } else {
                    tocContent.innerHTML = '<p class="empty-message">当前文件没有目录</p>';
                }
            } catch (error) {
                console.error('Error loading TOC:', error);
                tocContent.innerHTML = '<p class="empty-message">无法加载目录</p>';
            }
        } else {
            tocContent.innerHTML = '<p class="empty-message">PDF 文件不支持目录导航</p>';
        }
    }

    renderTocItems(items, container, level = 0) {
        items.forEach(item => {
            const tocItem = document.createElement('div');
            tocItem.className = 'toc-item';
            if (level > 0) {
                tocItem.classList.add('toc-item-sublevel');
                tocItem.style.marginLeft = `${level * 20}px`;
            }

            const label = document.createElement('div');
            label.className = 'toc-item-label';
            label.textContent = item.label;
            tocItem.appendChild(label);

            tocItem.addEventListener('click', () => {
                if (this.reader.rendition && item.href) {
                    this.reader.rendition.display(item.href);
                    this.closePanel('tocPanel');
                    this.showToast('已跳转到：' + item.label, 'info');
                }
            });

            container.appendChild(tocItem);

            // Render subitems
            if (item.subitems && item.subitems.length > 0) {
                this.renderTocItems(item.subitems, container, level + 1);
            }
        });
    }

    // Bookmarks
    addBookmark() {
        if (!this.reader.currentBook) {
            this.showToast('请先打开一本书', 'error');
            return;
        }

        const bookmark = {
            id: Date.now(),
            bookId: this.getBookId(),
            bookTitle: this.reader.bookTitle?.textContent || '未知书名',
            page: this.reader.currentPage,
            totalPages: this.reader.totalPages,
            timestamp: new Date().toISOString(),
            format: this.reader.currentFormat
        };

        // Get current location for EPUB
        if (this.reader.currentFormat === 'epub' && this.reader.rendition) {
            const location = this.reader.rendition.currentLocation();
            if (location) {
                bookmark.cfi = location.start.cfi;
            }
        }

        this.bookmarks.push(bookmark);
        this.saveBookmarks();
        this.renderBookmarks();
        this.showToast('书签已添加', 'success');
    }

    renderBookmarks() {
        const bookmarksList = document.getElementById('bookmarksList');
        if (!bookmarksList) return;

        // Filter bookmarks for current book
        const currentBookId = this.getBookId();
        const currentBookmarks = this.bookmarks.filter(b => b.bookId === currentBookId);

        if (currentBookmarks.length === 0) {
            bookmarksList.innerHTML = '<p class="empty-message">还没有添加书签</p>';
            return;
        }

        bookmarksList.innerHTML = '';
        currentBookmarks.forEach(bookmark => {
            const item = document.createElement('div');
            item.className = 'list-item';
            item.innerHTML = `
                <div class="list-item-title">第 ${bookmark.page} 页</div>
                <div class="list-item-meta">${this.formatDate(bookmark.timestamp)}</div>
                <button class="list-item-delete" data-bookmark-id="${bookmark.id}">×</button>
            `;

            item.addEventListener('click', (e) => {
                if (!e.target.classList.contains('list-item-delete')) {
                    this.goToBookmark(bookmark);
                }
            });

            item.querySelector('.list-item-delete').addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteBookmark(bookmark.id);
            });

            bookmarksList.appendChild(item);
        });
    }

    goToBookmark(bookmark) {
        if (this.reader.currentFormat === 'epub' && bookmark.cfi && this.reader.rendition) {
            this.reader.rendition.display(bookmark.cfi);
        } else if (this.reader.currentFormat === 'pdf') {
            this.reader.renderPdfPage(bookmark.page);
        }
        this.closePanel('bookmarksPanel');
        this.showToast('已跳转到书签', 'success');
    }

    deleteBookmark(id) {
        this.bookmarks = this.bookmarks.filter(b => b.id !== id);
        this.saveBookmarks();
        this.renderBookmarks();
        this.showToast('书签已删除', 'info');
    }

    // Search
    async performSearch() {
        const searchInput = document.getElementById('searchInput');
        const searchResults = document.getElementById('searchResults');
        const query = searchInput?.value.trim();

        if (!query) {
            this.showToast('请输入搜索关键词', 'error');
            return;
        }

        if (!this.reader.epubBook) {
            searchResults.innerHTML = '<p class="empty-message">搜索功能仅支持 EPUB 格式</p>';
            return;
        }

        searchResults.innerHTML = '<p class="empty-message">搜索中...</p>';

        try {
            const results = await this.reader.epubBook.spine.spineItems.reduce(async (acc, item) => {
                const accumulated = await acc;
                const doc = await item.load(this.reader.epubBook.load.bind(this.reader.epubBook));
                const text = doc.textContent || '';

                // Simple search implementation
                const regex = new RegExp(query, 'gi');
                let match;
                while ((match = regex.exec(text)) !== null) {
                    const start = Math.max(0, match.index - 50);
                    const end = Math.min(text.length, match.index + query.length + 50);
                    const excerpt = text.substring(start, end);

                    accumulated.push({
                        cfi: item.cfi,
                        excerpt: excerpt,
                        query: query
                    });
                }

                return accumulated;
            }, Promise.resolve([]));

            this.searchResults = results;
            this.renderSearchResults();

        } catch (error) {
            console.error('Search error:', error);
            searchResults.innerHTML = '<p class="empty-message">搜索出错，请重试</p>';
        }
    }

    renderSearchResults() {
        const searchResults = document.getElementById('searchResults');
        if (!searchResults) return;

        if (this.searchResults.length === 0) {
            searchResults.innerHTML = '<p class="empty-message">未找到匹配结果</p>';
            return;
        }

        searchResults.innerHTML = '';
        this.searchResults.forEach((result, index) => {
            const item = document.createElement('div');
            item.className = 'search-result-item';

            const text = document.createElement('div');
            text.className = 'search-result-text';
            text.innerHTML = this.highlightText(result.excerpt, result.query);

            const location = document.createElement('div');
            location.className = 'search-result-location';
            location.textContent = `结果 ${index + 1}`;

            item.appendChild(text);
            item.appendChild(location);

            item.addEventListener('click', () => {
                if (this.reader.rendition) {
                    this.reader.rendition.display(result.cfi);
                    this.closePanel('searchPanel');
                }
            });

            searchResults.appendChild(item);
        });
    }

    highlightText(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<span class="highlight">$1</span>');
    }

    // Reading Statistics
    startReadingTimer() {
        this.readingStats.startTime = Date.now();

        setInterval(() => {
            if (this.reader.readerScreen?.classList.contains('active')) {
                this.readingStats.sessionTime += 1;
                this.updateReadingTimeDisplay();
            }
        }, 60000); // Update every minute
    }

    updateReadingTimeDisplay() {
        const readingTime = document.getElementById('readingTime');
        if (readingTime) {
            const minutes = this.readingStats.sessionTime;
            readingTime.textContent = `${minutes}分钟`;
        }
    }

    updateStatsDisplay() {
        const progress = this.reader.totalPages > 0
            ? Math.round((this.reader.currentPage / this.reader.totalPages) * 100)
            : 0;

        document.getElementById('statProgress').textContent = `${progress}%`;
        document.getElementById('statReadTime').textContent = `${this.readingStats.sessionTime}分钟`;
        document.getElementById('statTotalTime').textContent = `${this.readingStats.totalTime + this.readingStats.sessionTime}分钟`;
        document.getElementById('statPagesRead').textContent = this.reader.currentPage;
    }

    // Bookshelf Management
    addToBookshelf(bookData) {
        const existingIndex = this.bookshelf.findIndex(b => b.id === bookData.id);

        if (existingIndex !== -1) {
            // Update existing entry
            this.bookshelf[existingIndex] = {
                ...this.bookshelf[existingIndex],
                ...bookData,
                lastRead: new Date().toISOString()
            };
        } else {
            // Add new entry
            this.bookshelf.unshift(bookData);
        }

        // Keep only last 10 books
        if (this.bookshelf.length > 10) {
            this.bookshelf = this.bookshelf.slice(0, 10);
        }

        this.saveBookshelf();
        this.renderRecentFiles();
    }

    renderRecentFiles() {
        const recentFilesList = document.getElementById('recentFilesList');
        if (!recentFilesList) return;

        if (this.bookshelf.length === 0) {
            recentFilesList.innerHTML = '<p class="empty-message">还没有阅读记录</p>';
            return;
        }

        recentFilesList.innerHTML = '';
        this.bookshelf.slice(0, 5).forEach(book => {
            const item = document.createElement('div');
            item.className = 'recent-file-item';
            item.innerHTML = `
                <div class="recent-file-icon">${book.format === 'epub' ? '📖' : '📄'}</div>
                <div class="recent-file-info">
                    <div class="recent-file-name">${book.title}</div>
                    <div class="recent-file-meta">进度: ${book.progress}% · ${this.formatDate(book.lastRead)}</div>
                </div>
            `;

            item.addEventListener('click', () => {
                this.showToast('请重新上传文件继续阅读', 'info');
            });

            recentFilesList.appendChild(item);
        });
    }

    // Helper Functions
    getBookId() {
        // Generate a simple book ID based on title
        return this.reader.bookTitle?.textContent || 'unknown';
    }

    formatDate(isoString) {
        const date = new Date(isoString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return '刚刚';
        if (diffMins < 60) return `${diffMins}分钟前`;
        if (diffHours < 24) return `${diffHours}小时前`;
        if (diffDays < 7) return `${diffDays}天前`;

        return date.toLocaleDateString('zh-CN');
    }

    showToast(message, type = 'info') {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        // Show toast
        setTimeout(() => toast.classList.add('active'), 100);

        // Hide and remove toast
        setTimeout(() => {
            toast.classList.remove('active');
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    }

    // Enhanced Keyboard Shortcuts
    handleEnhancedKeyboard(event) {
        // Don't trigger if typing in input
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }

        switch (event.key.toLowerCase()) {
            case '?':
                event.preventDefault();
                this.showHelp();
                break;
            case 'b':
                event.preventDefault();
                this.addBookmark();
                break;
            case 's':
                event.preventDefault();
                this.togglePanel('settingsPanel');
                break;
            case 't':
                event.preventDefault();
                this.togglePanel('tocPanel');
                break;
            case 'f':
                event.preventDefault();
                this.togglePanel('searchPanel');
                document.getElementById('searchInput')?.focus();
                break;
        }
    }

    showHelp() {
        const helpOverlay = document.getElementById('helpOverlay');
        if (helpOverlay) {
            helpOverlay.classList.add('active');
        }
    }

    closeHelp() {
        const helpOverlay = document.getElementById('helpOverlay');
        if (helpOverlay) {
            helpOverlay.classList.remove('active');
        }
    }

    // Drag and Drop
    setupDragAndDrop() {
        const body = document.body;

        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            body.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        // Handle drag enter/over
        ['dragenter', 'dragover'].forEach(eventName => {
            body.addEventListener(eventName, () => {
                if (this.reader.welcomeScreen?.classList.contains('active')) {
                    this.showDragOverlay();
                }
            });
        });

        // Handle drag leave
        body.addEventListener('dragleave', (e) => {
            if (e.target === body) {
                this.hideDragOverlay();
            }
        });

        // Handle drop
        body.addEventListener('drop', (e) => {
            this.hideDragOverlay();

            const files = e.dataTransfer.files;
            if (files.length > 0) {
                const file = files[0];
                const fileName = file.name.toLowerCase();

                if (fileName.endsWith('.epub') || fileName.endsWith('.pdf')) {
                    // Simulate file input change
                    this.reader.fileInput.files = files;
                    this.reader.handleFileUpload({ target: { files: [file] } });
                } else {
                    this.showToast('请拖放 EPUB 或 PDF 文件', 'error');
                }
            }
        });
    }

    showDragOverlay() {
        let overlay = document.getElementById('dragOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'dragOverlay';
            overlay.className = 'drag-overlay';
            overlay.innerHTML = '<div class="drag-message">📚 拖放文件到这里</div>';
            document.body.appendChild(overlay);
        }
        overlay.classList.add('active');
    }

    hideDragOverlay() {
        const overlay = document.getElementById('dragOverlay');
        if (overlay) {
            overlay.classList.remove('active');
        }
    }

    // Data Persistence
    saveBookshelf() {
        localStorage.setItem('moobiBookshelf', JSON.stringify(this.bookshelf));
    }

    loadBookshelf() {
        const saved = localStorage.getItem('moobiBookshelf');
        if (saved) {
            this.bookshelf = JSON.parse(saved);
        }
    }

    saveBookmarks() {
        localStorage.setItem('moobiBookmarks', JSON.stringify(this.bookmarks));
    }

    loadBookmarks() {
        const saved = localStorage.getItem('moobiBookmarks');
        if (saved) {
            this.bookmarks = JSON.parse(saved);
        }
    }

    saveStats() {
        const statsToSave = {
            totalTime: this.readingStats.totalTime + this.readingStats.sessionTime,
            lastSaved: new Date().toISOString()
        };
        localStorage.setItem('moobiStats', JSON.stringify(statsToSave));
    }

    loadStats() {
        const saved = localStorage.getItem('moobiStats');
        if (saved) {
            const data = JSON.parse(saved);
            this.readingStats.totalTime = data.totalTime || 0;
        }
    }

    // Called when book is loaded
    onBookLoaded(bookData) {
        this.addToBookshelf(bookData);
        this.loadBookmarks();
        this.renderBookmarks();
        this.readingStats.sessionTime = 0;
        this.readingStats.startTime = Date.now();
    }

    // Called when leaving reader
    onBookClosed() {
        this.saveStats();
        this.closeAllPanels();
        this.searchResults = [];
    }
}

// Initialize enhanced features when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait for main reader to initialize
    setTimeout(() => {
        if (window.moobiReader) {
            window.moobiFeatures = new EnhancedFeatures(window.moobiReader);
        }
    }, 100);
});
