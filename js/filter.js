// ==================== FILTER FUNCTIONALITY ====================
(function() {
    const typeFilter = document.getElementById('typeFilter');
    const sortFilter = document.getElementById('sortFilter');
    const resetBtn = document.querySelector('button[onclick="resetFilter()"]');
    const resultsContainer = document.getElementById('searchResults');
    const carouselSections = document.querySelectorAll('.product-carousel-section');
    const filterSection = document.querySelector('.card.border-0.shadow-sm');

    if (!typeFilter || !sortFilter || !resultsContainer) {
        console.warn('⚠️ Filter elements not found');
        return;
    }

    // Xử lý khi thay đổi filter
    typeFilter.addEventListener('change', applyFilters);
    sortFilter.addEventListener('change', applyFilters);

    // Hàm reset filter
    window.resetFilter = function() {
        typeFilter.value = '';
        sortFilter.value = 'default';
        clearSearchResults();
        console.log('✅ Filter reset');
    };

    // Hàm áp dụng filter và sort
// Hàm áp dụng filter và sort
async function applyFilters() {
    const type = typeFilter.value.toLowerCase();
    const sort = sortFilter.value;

    console.log('🔍 Filter:', type, 'Sort:', sort);

    if (!type && sort === 'default') {
        clearSearchResults();
        return;
    }

    showLoading('Đang lọc sản phẩm...');

    try {
        // ⚠️ KIỂM TRA KỸ window.listProduct
        let products = [];
        
        // Nếu window.listProduct tồn tại VÀ là Array
        if (window.listProduct && Array.isArray(window.listProduct)) {
            products = window.listProduct;
            console.log('✅ Using cached products:', products.length);
        } else {
            // Nếu không phải array (có thể là DOM element) → Fetch từ API
            console.warn('⚠️ window.listProduct is not valid. Fetching from API...');
            console.log('Current value:', window.listProduct);
            
            const API_URL = "https://6a1699a21b90031f81b138b7.mockapi.io/Product";
            const response = await fetch(API_URL);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Raw API data type:', Array.isArray(data) ? 'Array' : typeof data);
            
            // Convert thành array nếu cần
            if (Array.isArray(data)) {
                products = data.map(item => convertToProduct(item));
            } else if (data && typeof data === 'object') {
                products = Object.values(data).map(item => convertToProduct(item));
            } else {
                throw new Error('Invalid data format');
            }
            
            // ✅ GÁN ĐÚNG: Array, không phải DOM element
            window.listProduct = products;
            console.log('✅ Fetched and cached:', products.length, 'products');
        }

        // Double check
        if (!Array.isArray(products)) {
            throw new Error('Dữ liệu sản phẩm không phải là mảng');
        }

        // Lọc theo loại
        if (type) {
            console.log('📱 Filtering by type:', type);
            products = products.filter(p => {
                const productType = (p.type || '').toLowerCase();
                return productType === type;
            });
            console.log('📊 Filtered:', products.length, 'products');
        }

        // Sắp xếp
        products = sortProducts(products, sort);

        // Hiển thị kết quả
        renderFilterResults(products, type);

    } catch (error) {
        console.error('❌ Filter error:', error);
        showError('Không thể lọc sản phẩm. ' + error.message);
    }
}

// Hàm convert
function convertToProduct(item) {
    return {
        id: item.id,
        name: item.name,
        price: item.price,
        img: item.img,
        type: item.type,
        desc: item.desc || '',
        screen: item.screen,
        backCamera: item.backCamera || item.blackCamera,
        frontCamera: item.frontCamera
    };
}

    // Hàm sắp xếp sản phẩm
    function sortProducts(products, sortType) {
        const sorted = [...products];

        switch (sortType) {
            case 'price-asc':
                return sorted.sort((a, b) => parseInt(a.price) - parseInt(b.price));
            
            case 'price-desc':
                return sorted.sort((a, b) => parseInt(b.price) - parseInt(a.price));
            
            case 'name-asc':
                return sorted.sort((a, b) => a.name.localeCompare(b.name));
            
            default:
                return sorted;
        }
    }

    // Hiển thị kết quả filter (giống search)
    function renderFilterResults(products, type) {
        if (products.length === 0) {
            resultsContainer.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="fas fa-search fa-3x text-muted mb-3"></i>
                    <h5>Không tìm thấy sản phẩm ${type ? `"${type}"` : ''}</h5>
                    <p class="text-muted mb-4">Thử bộ lọc khác hoặc đặt lại bộ lọc</p>
                    <button class="btn btn-outline-primary" onclick="resetFilter()">
                        <i class="fas fa-redo me-1"></i>Đặt lại bộ lọc
                    </button>
                </div>`;
            return;
        }

        const typeName = type === 'iphone' ? 'iPhone' : 
                        type === 'samsung' ? 'Samsung' : 
                        type === 'xiaomi' ? 'Xiaomi' : 'Sản phẩm';

        const header = `
            <div class="col-12 mb-3">
                <h6 class="text-muted mb-0">
                    <i class="fas fa-filter me-1"></i>
                    Tìm thấy <strong>${products.length}</strong> ${typeName}
                    <button class="btn btn-sm btn-link text-danger p-0 ms-2" onclick="resetFilter()">
                        <i class="fas fa-times"></i> Xóa bộ lọc
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
                             style="height: 220px; object-fit: contain; padding: 15px;"
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

    // Hiển thị loading
    function showLoading(message) {
        resultsContainer.style.display = 'grid';
        resultsContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="spinner-border text-primary" role="status"></div>
                <p class="mt-2 text-muted">${message}</p>
            </div>`;
        
        carouselSections.forEach(sec => sec.style.display = 'none');
        if (filterSection) filterSection.style.display = 'block';
    }

    // Hiển thị lỗi
    function showError(message) {
        resultsContainer.innerHTML = `
            <div class="col-12 text-center text-danger py-5">
                <i class="fas fa-exclamation-triangle fa-3x mb-3"></i>
                <h5>Lỗi</h5>
                <p class="mb-4">${message}</p>
                <button class="btn btn-outline-primary btn-sm" onclick="applyFilters()">
                    <i class="fas fa-redo me-1"></i>Thử lại
                </button>
            </div>`;
    }

    // Xóa kết quả filter
    function clearSearchResults() {
        resultsContainer.style.display = 'none';
        resultsContainer.innerHTML = '';
        
        carouselSections.forEach(sec => sec.style.display = 'block');
        if (filterSection) filterSection.style.display = 'block';
    }

    console.log('✅ Filter module loaded successfully');
})();