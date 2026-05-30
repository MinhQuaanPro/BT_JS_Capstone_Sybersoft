// js/index.js

// ==================== GLOBAL VARIABLES ====================
let listProduct = []; // Danh sách sản phẩm gốc

// ==================== INIT PAGE ====================
async function initPage() {
    const container = document.getElementById('listProduct');
    
    // Hiển thị loading
    if (container) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2 text-muted">Đang tải sản phẩm...</p>
            </div>
        `;
    }
    
    try {
        // Lấy dữ liệu từ API (hàm getProducts() nằm trong product.js)
        listProduct = await getProducts();
        
        // Render ra giao diện
        renderProducts(listProduct);
        
        // ✅ QUAN TRỌNG: Export listProduct ra global để cart.js dùng được
        window.listProduct = listProduct;
        
        // Cập nhật số lượng giỏ hàng trên navbar
        updateCartCount();
        
        // Cập nhật số lượng sản phẩm hiển thị
        updateProductCount(listProduct.length);
        
    } catch (error) {
        console.error('❌ Lỗi load sản phẩm:', error);
        if (container) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <div class="alert alert-danger">
                        <i class="fas fa-exclamation-circle me-2"></i>
                        Không thể tải danh sách sản phẩm. Vui lòng thử lại!
                    </div>
                </div>
            `;
        }
    }
}

// ==================== RENDER PRODUCTS ====================
function renderProducts(data) {
    const container = document.getElementById('listProduct');
    if (!container) return;
    
    // Xử lý khi không có dữ liệu
    if (!data || data.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-box-open fa-3x text-muted mb-3"></i>
                <p class="text-muted fs-5">Không tìm thấy sản phẩm nào</p>
                <button class="btn btn-outline-primary" onclick="resetFilter()">
                    <i class="fas fa-redo me-1"></i>Đặt lại bộ lọc
                </button>
            </div>
        `;
        updateProductCount(0);
        return;
    }
    
    // Tạo HTML cho từng sản phẩm
    container.innerHTML = data.map(product => {
        const priceFormatted = parseInt(product.price).toLocaleString('vi-VN') + ' ₫';
        const badgeClass = product.type === 'iphone' ? 'bg-info' : 
                          (product.type === 'samsung' ? 'bg-warning' : 'bg-secondary');
        const badgeText = product.type ? product.type.toUpperCase() : 'OTHER';
        
        return `
            <div class="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                <div class="card product-card">
                    <img src="${product.img}" 
                         class="card-img-top" 
                         alt="${product.name}"
                         onerror="this.src='https://via.placeholder.com/200?text=No+Image'">
                    
                    <div class="card-body">
                        <span class="badge ${badgeClass} text-dark badge-type">
                            ${badgeText}
                        </span>
                        
                        <h5 class="card-title" title="${product.name}">
                            ${product.name}
                        </h5>
                        
                        <p class="price">${priceFormatted}</p>
                        
                        <p class="card-text small text-muted flex-grow-1">
                            ${product.desc ? product.desc.substring(0, 60) + '...' : ''}
                        </p>
                        
                        <div class="btn-group-custom">
                            <a href="detail.html?id=${product.id}" 
                               class="btn btn-outline-primary btn-sm">
                                <i class="fas fa-eye"></i> Xem
                            </a>
                            <button class="btn btn-primary btn-sm" 
                                    onclick="addToCart('${product.id}')">
                                <i class="fas fa-cart-plus"></i> Thêm
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    updateProductCount(data.length);
}

// ==================== FILTER & SORT ====================

// Setup event listeners cho filter và sort
function setupEventListeners() {
    // Filter theo loại
    const typeFilter = document.getElementById('typeFilter');
    if (typeFilter) {
        typeFilter.addEventListener('change', (e) => {
            applyFilterAndSort();
        });
    }
    
    // Sort theo giá/tên
    const sortFilter = document.getElementById('sortFilter');
    if (sortFilter) {
        sortFilter.addEventListener('change', (e) => {
            applyFilterAndSort();
        });
    }
    
    // Search form
    const searchForm = document.querySelector('.search-box');
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleSearch(e);
        });
    }
}

// Hàm áp dụng filter và sort cùng lúc
function applyFilterAndSort() {
    const typeValue = document.getElementById('typeFilter')?.value || '';
    const sortValue = document.getElementById('sortFilter')?.value || 'default';
    
    let filtered = [...listProduct]; // Copy mảng gốc
    
    // 1. Filter theo loại
    if (typeValue && typeValue !== '') {
        filtered = filtered.filter(p => 
            p.type?.toLowerCase() === typeValue.toLowerCase()
        );
    }
    
    // 2. Sort
    if (sortValue === 'price-asc') {
        filtered.sort((a, b) => parseInt(a.price) - parseInt(b.price));
    } else if (sortValue === 'price-desc') {
        filtered.sort((a, b) => parseInt(b.price) - parseInt(a.price));
    } else if (sortValue === 'name-asc') {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    // 3. Render lại
    renderProducts(filtered);
}

// Reset tất cả filter về mặc định
function resetFilter() {
    const typeSelect = document.getElementById('typeFilter');
    const sortSelect = document.getElementById('sortFilter');
    const searchInput = document.getElementById('searchInput');
    
    if (typeSelect) typeSelect.value = '';
    if (sortSelect) sortSelect.value = 'default';
    if (searchInput) searchInput.value = '';
    
    // Render lại danh sách gốc
    renderProducts(listProduct);
}

// Xử lý tìm kiếm
function handleSearch(e) {
    if (e) e.preventDefault();
    
    const keyword = document.getElementById('searchInput')?.value.trim().toLowerCase() || '';
    
    if (!keyword) {
        renderProducts(listProduct);
        return;
    }
    
    const filtered = listProduct.filter(p => 
        p.name.toLowerCase().includes(keyword) ||
        p.desc?.toLowerCase().includes(keyword) ||
        p.type?.toLowerCase().includes(keyword)
    );
    
    renderProducts(filtered);
}

// Cập nhật số lượng sản phẩm hiển thị
function updateProductCount(count) {
    const el = document.getElementById('productCount');
    if (el) {
        el.textContent = `${count} sản phẩm`;
    }
}

// Cập nhật số lượng giỏ hàng trên navbar
function updateCartCount() {
    try {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        
        const badges = document.querySelectorAll('#cartCount');
        badges.forEach(badge => {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'inline-block' : 'none';
        });
    } catch (e) {
        console.log('Lỗi cập nhật giỏ hàng:', e);
    }
}

// ==================== INITIALIZATION ====================

// Chạy khi DOM sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
    // Chỉ init page nếu đang ở trang chủ (có element listProduct)
    if (document.getElementById('listProduct')) {
        initPage();
        setupEventListeners(); // ✅ Gán sự kiện cho filter/sort
    }
    
    // Luôn cập nhật cart count trên navbar (dù ở trang nào)
    updateCartCount();
});

// ==================== CAROUSEL RENDER FUNCTIONS ====================

// Render sản phẩm vào carousel track
function renderCarouselTrack(products, trackId, isSuggestion = false) {
    const track = document.getElementById(trackId);
    if (!track) return;
    
    // Lấy 8 sản phẩm để hiển thị
    const displayProducts = products.slice(0, 8);
    
    if (displayProducts.length === 0) {
        track.innerHTML = '<div class="col-12 text-center text-muted py-3">Không có sản phẩm</div>';
        return;
    }
    
    track.innerHTML = displayProducts.map(p => {
        const price = parseInt(p.price);
        const priceFmt = price.toLocaleString('vi-VN');
        const oldPrice = Math.round(price * 1.15);
        const studentPrice = Math.round(price * 0.92);
        const discount = Math.round(((oldPrice - price) / oldPrice) * 100);
        
        return `
        <div class="product-card-carousel" onclick="window.location.href='detail.html?id=${p.id}'">
            <span class="discount-badge">-${discount}%</span>
            <span class="install-badge">Trả góp 0%</span>
            <div class="card-img-wrapper">
                <img src="${p.img}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/150?text=No+Image'">
            </div>
            <h6 class="card-title">${p.name}</h6>
            <div class="price">${priceFmt}₫</div>
            <div class="old-price">${oldPrice.toLocaleString('vi-VN')}₫</div>
            ${isSuggestion ? `<div class="promo-text">Giá S-Student ${studentPrice.toLocaleString('vi-VN')}₫</div>` : ''}
            <div class="card-footer-info">
                <span class="install-tag"><i class="fas fa-credit-card me-1"></i>2 Giờ</span>
                <span><i class="fas fa-map-marker-alt me-1"></i>HCM</span>
                <button class="wishlist-btn" onclick="event.stopPropagation(); alert('Đã thêm vào yêu thích!')">
                    <i class="far fa-heart"></i>
                </button>
            </div>
        </div>`;
    }).join('');
}

// Khởi tạo scroll cho carousel
function initCarouselScroll() {
    document.querySelectorAll('.carousel-container').forEach(container => {
        const track = container.querySelector('.carousel-track');
        const prev = container.querySelector('.prev');
        const next = container.querySelector('.next');
        
        if (prev && next && track) {
            prev.onclick = () => track.scrollBy({ left: -230, behavior: 'smooth' });
            next.onclick = () => track.scrollBy({ left: 230, behavior: 'smooth' });
        }
    });
}

// Render 3 khung carousel
// ==================== CAROUSEL RENDER FUNCTIONS ====================

// Render sản phẩm vào carousel track
function renderCarouselTrack(products, trackId, isSuggestion = false, sectionName = '') {
    const track = document.getElementById(trackId);
    if (!track) return;
    
    console.log(`📊 ${sectionName}: ${products.length} sản phẩm`);
    
    if (products.length === 0) {
        track.innerHTML = `
            <div class="col-12 text-center text-muted py-4">
                <i class="fas fa-box-open fa-2x mb-2 d-block"></i>
                <p class="mb-0">Không có sản phẩm</p>
                <small class="text-muted">Vui lòng thêm sản phẩm vào Admin</small>
            </div>
        `;
        return;
    }
    
    // Lấy 8 sản phẩm để hiển thị
    const displayProducts = products.slice(0, 8);
    
    track.innerHTML = displayProducts.map(p => {
        const price = parseInt(p.price);
        const priceFmt = price.toLocaleString('vi-VN');
        const oldPrice = Math.round(price * 1.15);
        const studentPrice = Math.round(price * 0.92);
        const discount = Math.round(((oldPrice - price) / oldPrice) * 100);
        
        return `
        <div class="product-card-carousel" onclick="window.location.href='detail.html?id=${p.id}'">
            <span class="discount-badge">-${discount}%</span>
            <span class="install-badge">Trả góp 0%</span>
            <div class="card-img-wrapper">
                <img src="${p.img}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/150?text=No+Image'">
            </div>
            <h6 class="card-title">${p.name}</h6>
            <div class="price">${priceFmt}₫</div>
            <div class="old-price">${oldPrice.toLocaleString('vi-VN')}₫</div>
            ${isSuggestion ? `<div class="promo-text">Giá S-Student ${studentPrice.toLocaleString('vi-VN')}₫</div>` : ''}
            <div class="card-footer-info">
                <span class="install-tag"><i class="fas fa-credit-card me-1"></i>2 Giờ</span>
                <span><i class="fas fa-map-marker-alt me-1"></i>HCM</span>
                <button class="wishlist-btn" onclick="event.stopPropagation(); alert('Đã thêm vào yêu thích!')">
                    <i class="far fa-heart"></i>
                </button>
            </div>
        </div>`;
    }).join('');
}

// Khởi tạo scroll cho carousel
function initCarouselScroll() {
    document.querySelectorAll('.carousel-container').forEach(container => {
        const track = container.querySelector('.carousel-track');
        const prev = container.querySelector('.prev');
        const next = container.querySelector('.next');
        
        if (prev && next && track) {
            prev.onclick = () => track.scrollBy({ left: -230, behavior: 'smooth' });
            next.onclick = () => track.scrollBy({ left: 230, behavior: 'smooth' });
        }
    });
}

// Render 3 khung carousel
async function renderCarouselSections() {
    try {
        const products = await getProducts();
        
        console.log('📦 Tổng số sản phẩm:', products.length);
        console.log('📋 Các type có sẵn:', [...new Set(products.map(p => p.type))]);
        
        // ✅ CẢI TIẾN: Filter case-insensitive (không phân biệt hoa/thường)
        const iphone = products.filter(p => {
            const type = (p.type || '').toLowerCase();
            return type === 'iphone' || type.includes('iphone');
        });
        
        const samsung = products.filter(p => {
            const type = (p.type || '').toLowerCase();
            return type === 'samsung' || type === 'samsung-galaxy' || type.includes('samsung');
        });
        
        const others = products.filter(p => {
            const type = (p.type || '').toLowerCase();
            return !type.includes('iphone') && !type.includes('samsung');
        });
        
        // Render từng section
        renderCarouselTrack(iphone, 'iphoneTrack', false, 'iPhone');
        renderCarouselTrack(samsung, 'samsungTrack', false, 'Samsung');
        
        // Gợi ý: trộn iPhone + Samsung + Others
        const suggestion = [
            ...iphone.slice(0, 6), 
            ...samsung.slice(0, 6), 
            ...others.slice(0, 12)
        ];
        renderCarouselTrack(suggestion, 'suggestionTrack', true, 'Gợi ý');
        
        // Init scroll buttons
        initCarouselScroll();
        
        console.log('✅ Đã render carousel sections');
        
    } catch (error) {
        console.error('❌ Lỗi render carousel:', error);
    }
}

// Filter theo type (dùng cho nút "Xem tất cả")
function filterByType(type) {
    document.getElementById('typeFilter').value = type;
    if (typeof applyFilterAndSort === 'function') {
        applyFilterAndSort();
    }
    // Scroll lên filter section
    document.querySelector('.card.border-0.shadow-sm')?.scrollIntoView({ behavior: 'smooth' });
}

// Filter theo type (dùng cho nút "Xem tất cả")
function filterByType(type) {
    document.getElementById('typeFilter').value = type;
    if (typeof applyFilterAndSort === 'function') {
        applyFilterAndSort();
    }
    // Scroll lên filter section
    document.querySelector('.card.border-0.shadow-sm')?.scrollIntoView({ behavior: 'smooth' });
}

// ==================== OVERRIDE INIT PAGE ====================
// Giữ logic cũ nhưng ưu tiên render carousel nếu có element

const originalInitPage = typeof initPage === 'function' ? initPage : null;

async function initPage() {
    // Nếu có carousel sections thì render carousel, không thì dùng logic cũ
    if (document.getElementById('iphoneTrack')) {
        await renderCarouselSections();
        updateCartCount();
    } else if (originalInitPage) {
        await originalInitPage();
    }
}

// ==================== DOM READY ====================
document.addEventListener('DOMContentLoaded', () => {
    // Init page (carousel hoặc fallback)
    if (typeof initPage === 'function') {
        initPage();
    }
    
    // Luôn update cart count
    if (typeof updateCartCount === 'function') {
        updateCartCount();
    }
    
    // Setup event listeners cho filter/sort (giữ logic cũ)
    if (typeof setupEventListeners === 'function') {
        setupEventListeners();
    }
});