// js/search.js
// Module tìm kiếm sản phẩm - Đã fix lỗi kết nối
(function() {
    'use strict';
    
    const searchForm = document.querySelector('.search-box');
    const searchInput = document.getElementById('searchInput');
    const resultsContainer = document.getElementById('searchResults');
    const carouselSections = document.querySelectorAll('.product-carousel-section');
    const filterSection = document.querySelector('.card.border-0.shadow-sm');
    
    if (!searchForm || !searchInput) {
        console.warn('⚠️ Search form not found');
        return;
    }

    // API URL
    const API_URL = "https://6a1699a21b90031f81b138b7.mockapi.io/Product";

    // Xử lý submit form
    searchForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const query = searchInput.value.trim().toLowerCase();
        
        if (!query) {
            clearSearch();
            return;
        }
        
        await performSearch(query);
    });

    // Tìm realtime với debounce
    let debounceTimer;
    searchInput.addEventListener('input', function() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const query = this.value.trim().toLowerCase();
            if (query.length >= 2) {
                performSearch(query);
            } else if (query === '') {
                clearSearch();
            }
        }, 300);
    });

    // Hàm fetch sản phẩm từ API
    async function fetchProducts() {
        try {
            // Ưu tiên cache
            if (window.listProduct && window.listProduct.length > 0) {
                console.log('✅ Using cached products:', window.listProduct.length);
                return window.listProduct;
            }
            
            console.log('🔄 Fetching from API...');
            const response = await fetch(API_URL);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Convert thành Product objects (giống product.js)
            const products = data.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                img: item.img,
                type: item.type,
                desc: item.desc || '',
                screen: item.screen,
                backCamera: item.backCamera || item.blackCamera,
                frontCamera: item.frontCamera
            }));
            
            window.listProduct = products; // Cache
            console.log('✅ Fetched', products.length, 'products');
            return products;
            
        } catch (error) {
            console.error('❌ Error fetching products:', error);
            throw error;
        }
    }

    // Hàm thực hiện tìm kiếm
    async function performSearch(query) {
        console.log('🔍 Searching for:', query);
        
        if (!resultsContainer) {
            console.error('❌ resultsContainer not found');
            return;
        }
        
        // Hiển thị loading
        resultsContainer.style.display = 'grid';
        resultsContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="spinner-border text-primary" role="status"></div>
                <p class="mt-2 text-muted">Đang tìm "${query}"...</p>
            </div>`;
        
        // Ẩn carousel
        carouselSections.forEach(sec => sec.style.display = 'none');
        if (filterSection) filterSection.style.display = 'none';

        try {
            const products = await fetchProducts();
            
            // Lọc sản phẩm
            const filtered = products.filter(p => {
                const name = (p.name || '').toLowerCase();
                const type = (p.type || '').toLowerCase();
                const desc = (p.desc || '').toLowerCase();
                
                return name.includes(query) || 
                       type.includes(query) || 
                       desc.includes(query);
            });

            console.log(`📦 Found ${filtered.length} results`);
            renderResults(filtered, query);
            
        } catch (error) {
            console.error('❌ Search error:', error);
            resultsContainer.innerHTML = `
                <div class="col-12 text-center text-danger py-5">
                    <i class="fas fa-exclamation-triangle fa-3x mb-3"></i>
                    <h5>Không thể kết nối</h5>
                    <p class="text-muted mb-4">Vui lòng kiểm tra kết nối internet hoặc thử lại sau</p>
                    <div class="d-flex gap-2 justify-content-center">
                        <button class="btn btn-outline-primary" onclick="performSearch('${query}')">
                            <i class="fas fa-redo me-1"></i>Thử lại
                        </button>
                        <button class="btn btn-outline-secondary" onclick="clearSearch()">
                            <i class="fas fa-times me-1"></i>Hủy
                        </button>
                    </div>
                    <small class="text-muted d-block mt-3">
                        Lỗi: ${error.message}
                    </small>
                </div>`;
        }
    }

    // Render kết quả
    function renderResults(products, query) {
        if (!resultsContainer) return;
        
        if (products.length === 0) {
            resultsContainer.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="fas fa-search fa-3x text-muted mb-3"></i>
                    <h5>Không tìm thấy "<strong>${query}</strong>"</h5>
                    <p class="text-muted mb-4">Thử từ khóa khác như: iphone, samsung, galaxy...</p>
                    <button class="btn btn-outline-primary" onclick="clearSearch()">
                        <i class="fas fa-times me-1"></i>Xóa tìm kiếm
                    </button>
                </div>`;
            return;
        }

        const header = `
            <div class="col-12 mb-3">
                <h6 class="text-muted mb-0">
                    <i class="fas fa-check-circle text-success me-1"></i>
                    Tìm thấy <strong>${products.length}</strong> sản phẩm cho "${query}"
                    <button class="btn btn-sm btn-link text-danger p-0 ms-2" onclick="clearSearch()">
                        <i class="fas fa-times"></i> Xóa
                    </button>
                </h6>
            </div>`;

        const cards = products.map(p => {
            const price = parseInt(p.price);
            const priceFmt = price.toLocaleString('vi-VN');
            const badgeClass = p.type === 'iphone' ? 'bg-info' : 
                              (p.type === 'samsung' ? 'bg-warning' : 'bg-secondary');
            const badgeText = p.type?.toUpperCase() || 'OTHER';
            
            return `
            <div class="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                <div class="card product-card h-100">
                    <div class="card-img-wrapper position-relative">
                        <img src="${p.img}" 
                             class="card-img-top" 
                             alt="${p.name}"
                             style="height: 200px; object-fit: contain; padding: 10px;"
                             onerror="this.src='https://via.placeholder.com/200?text=No+Image'">
                        <span class="badge ${badgeClass} text-dark position-absolute top-0 start-0 m-2">
                            ${badgeText}
                        </span>
                    </div>
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title text-truncate" title="${p.name}">${p.name}</h5>
                        <p class="card-text text-primary fw-bold mb-2">${priceFmt} ₫</p>
                        <div class="mt-auto d-flex gap-2">
                            <a href="detail.html?id=${p.id}" 
                               class="btn btn-outline-primary btn-sm flex-grow-1">
                                <i class="fas fa-eye"></i> Xem
                            </a>
                            <button class="btn btn-primary btn-sm flex-grow-1" 
                                    onclick="addToCart('${p.id}')">
                                <i class="fas fa-cart-plus"></i> Thêm
                            </button>
                        </div>
                    </div>
                </div>
            </div>`;
        }).join('');

        resultsContainer.innerHTML = header + cards;
    }

    // Xóa kết quả
    function clearSearch() {
        if (resultsContainer) {
            resultsContainer.style.display = 'none';
            resultsContainer.innerHTML = '';
        }
        
        carouselSections.forEach(sec => sec.style.display = 'block');
        if (filterSection) filterSection.style.display = 'block';
        
        if (searchInput) {
            searchInput.value = '';
            searchInput.focus();
        }
    }

    // Export ra global
    window.clearSearch = clearSearch;
    window.performSearch = performSearch;
    
    console.log('🔍 Search module loaded successfully');
})();