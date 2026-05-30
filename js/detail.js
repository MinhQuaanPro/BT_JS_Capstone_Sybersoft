// js/detail.js

// ==================== GLOBAL VARIABLES ====================
let currentProduct = null;
let listProduct = []; // Lưu tất cả sản phẩm cho related products

// ==================== HELPER FUNCTIONS ====================

// Lấy ID sản phẩm từ URL
function getProductIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Gọi API lấy chi tiết 1 sản phẩm
async function getProductDetail(productId) {
    try {
        const API_URL = "https://6a1699a21b90031f81b138b7.mockapi.io/Product";
        const response = await fetch(`${API_URL}/${productId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // ✅ Sửa: blackCamera → backCamera
        return new Product(
            data.id,
            data.name,
            data.price,
            data.img,
            data.type,
            data.desc,
            data.screen,
            data.backCamera,  // ✅ Sửa ở đây
            data.frontCamera
        );
    } catch (error) {
        console.error('❌ Lỗi lấy chi tiết sản phẩm:', error);
        return null;
    }
}

// Gọi API lấy tất cả sản phẩm (cho related products)
async function getAllProducts() {
    try {
        const API_URL = "https://6a1699a21b90031f81b138b7.mockapi.io/Product";
        const response = await fetch(API_URL);
        const data = await response.json();
        
        return data.map(item => new Product(
            item.id,
            item.name,
            item.price,
            item.img,
            item.type,
            item.desc,
            item.screen,
            item.backCamera,  // ✅ Sửa ở đây
            item.frontCamera
        ));
    } catch (error) {
        console.error('❌ Lỗi lấy danh sách sản phẩm:', error);
        return [];
    }
}

// ==================== RENDER FUNCTIONS ====================

// Render chi tiết sản phẩm với giao diện mới
function renderProductDetail(product) {
    const container = document.getElementById('productDetail');
    if (!container) return;
    
    if (!product) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="alert alert-danger" role="alert">
                    <i class="fas fa-exclamation-triangle fa-3x mb-3 d-block"></i>
                    <h4>Không tìm thấy sản phẩm!</h4>
                    <p class="mb-0">Sản phẩm này không tồn tại hoặc đã bị xóa.</p>
                    <a href="index.html" class="btn btn-primary mt-3">
                        <i class="fas fa-arrow-left me-1"></i> Quay lại trang chủ
                    </a>
                </div>
            </div>
        `;
        return;
    }
    
    // Format giá tiền
    const priceFormatted = parseInt(product.price).toLocaleString('vi-VN');
    const oldPrice = Math.round(product.price * 1.1);
    const oldPriceFormatted = oldPrice.toLocaleString('vi-VN');
    
    // Badge class theo loại
    const badgeClass = product.type === 'iphone' ? 'bg-info' : 
                      (product.type === 'samsung' ? 'bg-warning' : 'bg-secondary');
    const badgeText = product.type?.toUpperCase() || 'OTHER';
    
    // Render HTML với classes khớp SCSS
    container.innerHTML = `
        <!-- Left: Image Gallery -->
        <div class="product-gallery">
            <div class="main-image-wrapper">
                <img src="${product.img}" 
                     alt="${product.name}" 
                     class="main-image" 
                     id="mainImage"
                     onerror="this.src='https://via.placeholder.com/400?text=No+Image'">
            </div>
            <div class="thumbnail-list">
                <img src="${product.img}" class="thumbnail active" onclick="changeImage(this)" alt="Thumb 1">
                <img src="${product.img}" class="thumbnail" onclick="changeImage(this)" alt="Thumb 2">
                <img src="${product.img}" class="thumbnail" onclick="changeImage(this)" alt="Thumb 3">
            </div>
        </div>
        
        <!-- Right: Product Info -->
        <div class="product-info-card">
            <h1 class="product-title">${product.name}</h1>
            
            <div class="product-rating">
                <div class="stars">
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star-half-alt"></i>
                </div>
                <span class="rating-count">(128 đánh giá)</span>
                <span class="stock-status"><i class="fas fa-check-circle"></i> Còn hàng</span>
            </div>
            
            <div class="price-box">
                <div class="price-label">Giá bán:</div>
                <div>
                    <span class="current-price">${priceFormatted}₫</span>
                    <span class="old-price">${oldPriceFormatted}₫</span>
                    <span class="discount-badge">-10%</span>
                </div>
                <div class="vat-note"><i class="fas fa-check-circle me-1"></i>Đã bao gồm VAT</div>
            </div>
            
            <div class="promotions-box">
                <div class="promotions-title">
                    <i class="fas fa-gift"></i> Khuyến mãi:
                </div>
                <div class="promotion-item">Giảm 500K khi mua kèm phụ kiện</div>
                <div class="promotion-item">Trả góp 0% qua thẻ tín dụng</div>
                <div class="promotion-item">Thu cũ đổi mới - Trợ giá đến 2 triệu</div>
            </div>
            
            <div class="quantity-selector">
                <span class="qty-label">Số lượng:</span>
                <div class="qty-control">
                    <button class="qty-btn" onclick="decreaseQty()">−</button>
                    <input type="number" class="qty-input" id="qtyInput" value="1" min="1" max="10" readonly>
                    <button class="qty-btn" onclick="increaseQty()">+</button>
                </div>
                <small class="stock-remaining">(Còn 50 sản phẩm)</small>
            </div>
            
            <div class="action-buttons">
                <button class="btn btn-primary btn-add-to-cart" onclick="addToCartWithQty('${product.id}')">
                    <i class="fas fa-cart-plus me-2"></i>Thêm vào giỏ
                </button>
                <button class="btn btn-danger btn-buy-now" onclick="buyNow('${product.id}')">
                    <i class="fas fa-bolt me-2"></i>Mua ngay
                </button>
            </div>
            
            <div class="product-features">
                <div class="feature-item text-success">
                    <i class="fas fa-truck"></i>Miễn phí vận chuyển nội thành
                </div>
                <div class="feature-item text-primary">
                    <i class="fas fa-shield-alt"></i>Bảo hành chính hãng 12 tháng
                </div>
                <div class="feature-item text-info">
                    <i class="fas fa-undo"></i>Đổi trả trong 30 ngày
                </div>
            </div>
        </div>
    `;
    
    // Render tabs content
    renderTabsContent(product);
}

// Render nội dung tabs (Mô tả/Thông số/Đánh giá)
function renderTabsContent(product) {
    // Description
    const descEl = document.getElementById('productDescription');
    if (descEl) {
        descEl.innerHTML = `
            <h5 class="fw-bold mb-3">Mô tả sản phẩm</h5>
            <p>${product.desc || 'Sản phẩm chính hãng, bảo hành đầy đủ.'}</p>
            <p class="mt-3">Đây là sản phẩm cao cấp với thiết kế hiện đại, tính năng vượt trội.</p>
        `;
    }
    
    // Specifications
    const specsEl = document.getElementById('productSpecs');
    if (specsEl) {
        specsEl.innerHTML = `
            <tr><td class="spec-label">Màn hình</td><td class="spec-value">${product.screen || '6.7 inch, Super Retina XDR OLED'}</td></tr>
            <tr><td class="spec-label">Camera sau</td><td class="spec-value">${product.backCamera || '48MP + 12MP + 12MP'}</td></tr>
            <tr><td class="spec-label">Camera trước</td><td class="spec-value">${product.frontCamera || '12MP TrueDepth'}</td></tr>
            <tr><td class="spec-label">Chip</td><td class="spec-value">A17 Pro</td></tr>
            <tr><td class="spec-label">RAM</td><td class="spec-value">8GB</td></tr>
            <tr><td class="spec-label">Bộ nhớ</td><td class="spec-value">256GB</td></tr>
            <tr><td class="spec-label">Pin</td><td class="spec-value">4422 mAh</td></tr>
            <tr><td class="spec-label">Hệ điều hành</td><td class="spec-value">iOS 17</td></tr>
        `;
    }
}

// Render sản phẩm liên quan
function renderRelatedProducts(products, currentId) {
    const container = document.getElementById('relatedProducts');
    if (!container) return;
    
    // Lọc 4 sản phẩm cùng loại, khác ID hiện tại
    const related = products
        .filter(p => p.type === currentProduct?.type && p.id !== currentId)
        .slice(0, 4);
    
    if (related.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center text-muted py-4">
                <i class="fas fa-box-open fa-2x mb-2"></i>
                <p>Không có sản phẩm liên quan</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = related.map(p => {
        const priceFmt = parseInt(p.price).toLocaleString('vi-VN');
        return `
        <div class="col-lg-3 col-md-4 col-6">
            <div class="related-card">
                <img src="${p.img}" class="card-img-top" alt="${p.name}"
                     onerror="this.src='https://via.placeholder.com/200?text=No+Image'">
                <div class="card-body">
                    <h6 class="card-title text-truncate" title="${p.name}">${p.name}</h6>
                    <p class="price">${priceFmt}₫</p>
                    <a href="detail.html?id=${p.id}" class="btn btn-outline-primary btn-sm w-100">
                        Xem chi tiết
                    </a>
                </div>
            </div>
        </div>`;
    }).join('');
}

// Cập nhật breadcrumb
function updateBreadcrumb(product) {
    const breadcrumb = document.getElementById('breadcrumbProduct');
    if (breadcrumb) {
        breadcrumb.textContent = product ? product.name : 'Không tìm thấy';
    }
}

// Cập nhật tiêu đề trang
function updatePageTitle(product) {
    const titleEl = document.getElementById('pageTitle');
    if (titleEl && product) {
        titleEl.textContent = product.name + ' - PhoneShop';
    }
}

// ==================== INTERACTION FUNCTIONS ====================

// Đổi ảnh chính khi click thumbnail
function changeImage(thumbnail) {
    // Remove active class từ tất cả thumbnails
    document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
    // Thêm active class cho thumbnail được click
    thumbnail.classList.add('active');
    // Đổi src của ảnh chính
    document.getElementById('mainImage').src = thumbnail.src;
}

// Tăng số lượng
function increaseQty() {
    const input = document.getElementById('qtyInput');
    if (input && parseInt(input.value) < 10) {
        input.value = parseInt(input.value) + 1;
    }
}

// Giảm số lượng
function decreaseQty() {
    const input = document.getElementById('qtyInput');
    if (input && parseInt(input.value) > 1) {
        input.value = parseInt(input.value) - 1;
    }
}

// Thêm vào giỏ với số lượng đã chọn
function addToCartWithQty(productId) {
    const qtyInput = document.getElementById('qtyInput');
    const qty = qtyInput ? parseInt(qtyInput.value) : 1;
    
    // Gọi hàm addToCart từ cart.js (số lần = quantity)
    for (let i = 0; i < qty; i++) {
        if (typeof addToCart === 'function') {
            addToCart(productId);
        }
    }
}

// Mua ngay: thêm vào giỏ + chuyển sang trang cart
function buyNow(productId) {
    addToCartWithQty(productId);
    // Delay nhỏ để cart.js kịp cập nhật localStorage
    setTimeout(() => {
        window.location.href = 'cart.html';
    }, 300);
}

// ==================== INITIALIZATION ====================

// Khởi tạo trang chi tiết
async function initDetailPage() {
    const productId = getProductIdFromUrl();
    
    if (!productId) {
        console.error('❌ Không tìm thấy ID sản phẩm trong URL');
        renderProductDetail(null);
        return;
    }
    
    console.log('🔄 Đang tải sản phẩm ID:', productId);
    
    try {
        // Load chi tiết sản phẩm
        currentProduct = await getProductDetail(productId);
        renderProductDetail(currentProduct);
        updateBreadcrumb(currentProduct);
        updatePageTitle(currentProduct);
        
        // Load sản phẩm liên quan
        listProduct = await getAllProducts();
        renderRelatedProducts(listProduct, productId);
        
        // Cập nhật cart count trên navbar
        if (typeof updateCartCount === 'function') {
            updateCartCount();
        }
        
        console.log('✅ Đã tải xong chi tiết sản phẩm');
        
    } catch (error) {
        console.error('❌ Lỗi khởi tạo trang:', error);
        renderProductDetail(null);
    }
}

// Chạy khi DOM sẵn sàng
document.addEventListener('DOMContentLoaded', initDetailPage);

// Export functions để dùng ở file khác (nếu cần)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        renderProductDetail,
        renderRelatedProducts,
        addToCartWithQty,
        buyNow
    };
}