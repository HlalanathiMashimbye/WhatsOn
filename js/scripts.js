// Functionality for adding/removing items to/from cart
// and rendering cart items on cart.html
// This script handles the cart functionality for an e-commerce site.
// It allows users to add items to their cart, remove items from the cart,
// and view the cart contents on a separate cart page.



// Retrieve cart from localStorage or initialize empty
function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

// Save cart back to localStorage
function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Add item to cart
function addToCart(item) {
    let cart = getCart();
    cart.push(item);
    saveCart(cart);
    alert(item + " added to cart!");
}

// Remove item from cart
function removeFromCart(item) {
    let cart = getCart();
    const index = cart.indexOf(item);
    if (index > -1) {
        cart.splice(index, 1);
        saveCart(cart);
        alert(item + " removed from cart.");
        // Reload cart page to update view
        location.reload();
    }
}

// Render cart items on cart.html
function renderCart() {
    const cartContainer = document.querySelector('.category-grid');
    const checkoutContainer = document.querySelector('.checkout');
    if (!cartContainer || !checkoutContainer) return;

    const cart = getCart();
    cartContainer.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        cartContainer.innerHTML = '<p>Your cart is empty.</p>';
        checkoutContainer.style.display = 'none';
        return;
    }

    cart.forEach(item => {
        // Simplistic price extraction for demo (assumes "R" and number in string)
        let price = 0;
        const match = item.match(/R(\d+(\.\d+)?)/);
        if (match) {
            price = parseFloat(match[1]);
        }
        total += price;

        // Create card
        const card = document.createElement('div');
        card.className = 'event-card';
        card.style.width = '600px';
        card.innerHTML = `
            <h3>${item}</h3>
            <p><strong>Price:</strong> R${price}</p>
            <button class="btn-secondary" onclick="removeFromCart('${item}')">Remove</button>
        `;
        cartContainer.appendChild(card);
    });

    // Update checkout section
    checkoutContainer.innerHTML = `
        <p><strong>Total: </strong> R${total}</p>
        <a href="checkout.html" class="btn-primary">Proceed to Checkout</a>
    `;
}

// Initialize JS on page load
document.addEventListener('DOMContentLoaded', function() {
    renderCart();
});
