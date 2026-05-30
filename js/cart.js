// js/cart.js

// ==================== GLOBAL VARIABLES ====================
let cart = [];

// ==================== CART ITEM CLASS ====================
class CartItem {
    constructor(product, quantity = 1) {
        this.product = {
            id: String(product.id),
            name: product.name,
            price: typeof product.price === 'number' ? product.price : parseInt(product.price),
            img: product.img,
            type: product.type,
            desc: product.desc || ''
        };
        this.quantity = quantity;
    }
    
    getSubtotal() {
        return this.product.price * this.quantity;
    }
}

// ==================== CART FUNCTIONS ====================

// 1. Thêm sản phẩm vào giỏ (ĐÃ SỬA: Có fallback API cho trang Detail)
async function addToCart(productId) {
    console.log('🛒 Đang thêm sản phẩm ID:', productId);
    
    loadCartFromLocalStorage();
    
    const pid = String(productId);
    let product = null;
    
    // ✅ CÁCH 1: Tìm trong window.listProduct (trang Index)
    if (window.listProduct && Array.isArray(window.listProduct)) {
        product = window.listProduct.find(p => String(p.id) === pid);
    }
    
    // ✅ CÁCH 2: Nếu không có, fetch từ API (trang Detail)
    // Dùng link trực tiếp để tránh lỗi trùng tên biến API_URL với product.js
    if (!product) {
        console.log('⚠️ Không tìm thấy trong listProduct, fetch từ API...');
        try {
            const response = await fetch(`https://6a1699a21b90031f81b138b7.mockapi.io/Product/${productId}`);
            if (response.ok) {
                const data = await response.json();
                product = {
                    id: String(data.id),
                    name: data.name,
                    price: typeof data.price === 'number' ? data.price : parseInt(data.price),
                    img: data.img,
                    type: data.type,
                    desc: data.desc || ''
                };
                console.log('✅ Đã load từ API:', product.name);
            }
        } catch (error) {
            console.error('❌ Lỗi fetch API:', error);
        }
    }
    
    // Nếu vẫn không tìm thấy sản phẩm
    if (!product) {
        alert('❌ Không tìm thấy sản phẩm! Vui lòng thử lại.');
        return;
    }
    
    // Kiểm tra xem sản phẩm đã có trong giỏ chưa
    const existing = cart.find(item => String(item.product.id) === pid);
    
    if (existing) {
        existing.quantity++;
        alert(`✅ Đã tăng "${product.name}" lên ${existing.quantity}`);
    } else {
        cart.push(new CartItem(product, 1));
        alert(`✅ Đã thêm "${product.name}" vào giỏ!`);
    }
    
    saveCartToLocalStorage();
    updateCartCount();
    
    if (document.getElementById('cartContainer')) {
        renderCart();
    }
}

// 2. Lưu giỏ hàng vào localStorage
function saveCartToLocalStorage() {
    try {
        const cartData = cart.map(item => ({
            product: item.product,
            quantity: item.quantity
        }));
        localStorage.setItem('cart', JSON.stringify(cartData));
    } catch (error) {
        console.error('Lỗi lưu cart:', error);
    }
}

// 3. Load giỏ hàng từ localStorage
function loadCartFromLocalStorage() {
    try {
        const data = localStorage.getItem('cart');
        if (data) {
            const parsed = JSON.parse(data);
            cart = parsed.map(item => new CartItem(item.product, item.quantity));
        }
    } catch (error) {
        console.error('Lỗi load cart:', error);
        cart = [];
    }
}

// 4. Render giỏ hàng
function renderCart() {
    const container = document.getElementById('cartContainer');
    const emptyCart = document.getElementById('emptyCart');
    
    if (!container) return;
    
    loadCartFromLocalStorage();
    
    if (cart.length === 0) {
        container.innerHTML = '';
        emptyCart.style.display = 'block';
        updateCartSummary(0);
        updateCartCount();
        return;
    }
    
    emptyCart.style.display = 'none';
    let total = 0;
    
    container.innerHTML = cart.map((item, index) => {
        const sub = item.getSubtotal();
        total += sub;
        
        const priceFmt = item.product.price.toLocaleString('vi-VN') + '₫';
        const subFmt = sub.toLocaleString('vi-VN') + '₫';
        const badgeClass = item.product.type === 'iphone' ? 'badge-iphone' : 'badge-samsung';
        const badgeText = item.product.type?.toUpperCase() || 'OTHER';
        
        return `
        <div class="cart-item">
            <input type="checkbox" class="item-checkbox" checked>
            
            <div class="item-image-wrapper">
                <img src="${item.product.img}" 
                     class="item-image" 
                     alt="${item.product.name}"
                     onerror="this.src='https://via.placeholder.com/120?text=No+Image'">
            </div>
            
            <div class="item-content">
                <div class="item-name" title="${item.product.name}">
                    ${item.product.name}
                </div>
                
                <div class="item-meta">
                    <span class="badge ${badgeClass}">${badgeText}</span>
                </div>
                
                <div class="item-price">${priceFmt}</div>
                
                <div class="item-controls">
                    <div class="qty-control">
                        <button class="qty-btn" onclick="updateQuantity(${index}, -1)" 
                                ${item.quantity <= 1 ? 'disabled' : ''}>−</button>
                        <input type="number" class="qty-input" value="${item.quantity}" readonly>
                        <button class="qty-btn" onclick="updateQuantity(${index}, 1)">+</button>
                    </div>
                    
                    <span class="item-total">${subFmt}</span>
                    
                    <button class="btn-remove" onclick="removeItem(${index})" title="Xóa">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        </div>`;
    }).join('');
    
    updateCartSummary(total);
    updateCartCount();
}

// Thêm hàm xóa toàn bộ giỏ
function clearCart() {
    if(confirm('Xóa toàn bộ giỏ hàng?')) {
        cart = [];
        saveCartToLocalStorage();
        renderCart();
    }
}

// 5. Cập nhật số lượng
function updateQuantity(index, change) {
    loadCartFromLocalStorage();
    if (!cart[index]) return;
    
    const newQty = cart[index].quantity + change;
    if (newQty <= 0) {
        if (confirm('Xóa sản phẩm này?')) {
            removeItem(index);
        }
        return;
    }
    
    cart[index].quantity = newQty;
    saveCartToLocalStorage();
    renderCart();
}

// 6. Xóa sản phẩm
function removeItem(index) {
    loadCartFromLocalStorage();
    if (!cart[index]) return;
    
    if (confirm(`Xóa "${cart[index].product.name}" khỏi giỏ?`)) {
        cart.splice(index, 1);
        saveCartToLocalStorage();
        renderCart();
    }
}

// 7. Cập nhật tổng kết
function updateCartSummary(subtotal) {
    const elSubtotal = document.getElementById('subtotal');
    const elTotal = document.getElementById('totalPrice');
    const elCount = document.getElementById('cartItemCount');
    
    if (elSubtotal) {
        elSubtotal.textContent = subtotal.toLocaleString('vi-VN') + ' ₫';
    }
    if (elTotal) {
        elTotal.textContent = subtotal.toLocaleString('vi-VN') + ' ₫';
    }
    if (elCount) {
        const count = cart.reduce((sum, item) => sum + item.quantity, 0);
        elCount.textContent = count;
    }
}

// 8. Cập nhật cart count trên navbar
function updateCartCount() {
    loadCartFromLocalStorage();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    const badges = document.querySelectorAll('#cartCount');
    badges.forEach(badge => {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'inline-block' : 'none';
    });
}

// 9. Áp mã giảm giá
function applyPromo() {
    const codeInput = document.getElementById('promoCode');
    if (!codeInput) return;
    
    const code = codeInput.value.trim().toUpperCase();
    if (!code) {
        alert('⚠️ Vui lòng nhập mã giảm giá');
        return;
    }
    
    const validCodes = {
        'CAPSTONE10': 'Giảm 10%',
        'WELCOME50K': 'Giảm 50K'
    };
    
    if (validCodes[code]) {
        alert(`🎉 Mã "${code}" hợp lệ: ${validCodes[code]}`);
        codeInput.value = '';
    } else {
        alert('❌ Mã không hợp lệ');
    }
}

// 10. Thanh toán (Hiển thị thông báo thành công)
function checkout() {
    loadCartFromLocalStorage();
    
    // Kiểm tra giỏ hàng trống
    if (cart.length === 0) {
        alert('⚠️ Giỏ hàng trống!');
        return;
    }
    
    // Tính tổng tiền
    const total = cart.reduce((sum, item) => sum + item.getSubtotal(), 0);
    const totalFmt = total.toLocaleString('vi-VN');
    
    // ✅ HIỂN THỊ THÔNG BÁO THÀNH CÔNG (Thay vì chuyển trang)
    const message = `🎉 Chúc mừng!
    
✅ Đặt hàng thành công!
💰 Tổng tiền: ${totalFmt}₫
📦 Đơn hàng sẽ được giao trong 2-3 ngày.

Cảm ơn bạn đã mua sắm tại PhoneShop! 🛍️`;
    
    alert(message);
    
    // ✅ Xóa giỏ hàng sau khi mua thành công (tùy chọn)
    cart = [];
    saveCartToLocalStorage();
    renderCart();
    updateCartCount();
}
// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('cartContainer')) {
        loadCartFromLocalStorage();
        renderCart();
    }
    updateCartCount();
});