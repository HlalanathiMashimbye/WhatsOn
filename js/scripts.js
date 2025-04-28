/**  
 * Toggles the mobile nav menu open/closed  
 */ 
function toggleMenu() {
  const nav = document.querySelector('.nav');
  nav.classList.toggle('show');
}

// ========================= 
// Cart Functionality 
// ========================= 

/**
 * Add an item to the shopping cart
 * @param {string} itemName - Name of the event/item
 */
function addToCart(itemName) {
  // Extract event details from the page
  const eventCard = document.querySelector('.event-card');
  if (!eventCard) return;
  
  // Get price from the page
  const priceText = eventCard.querySelector('p strong:contains("Price:")').parentNode.textContent;
  const priceMatch = priceText.match(/R(\d+)/);
  const price = priceMatch ? parseInt(priceMatch[1]) : 100; // Default price if not found
  
  // Get image from the page
  const imgElement = eventCard.querySelector('img');
  const image = imgElement ? imgElement.src : "../images/event-placeholder.jpg";
  
  // Get venue from the page
  const locationText = eventCard.querySelector('p strong:contains("Location:")').parentNode.textContent;
  const locationMatch = locationText.match(/Location:\s*(.*?)(?:,|$)/);
  const venue = locationMatch ? locationMatch[1].trim() : "Venue";
  
  // Get current cart from localStorage or initialize empty array
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  // Check if item already exists in cart
  const existingItemIndex = cart.findIndex(item => item.name === itemName);
  
  if (existingItemIndex > -1) {
    // Item exists, increment quantity
    cart[existingItemIndex].quantity += 1;
  } else {
    // Add new item to cart
    cart.push({
      name: itemName,
      price: price,
      quantity: 1,
      image: image,
      venue: venue
    });
  }
  
  // Save updated cart back to localStorage
  localStorage.setItem('cart', JSON.stringify(cart));
  
  // Show confirmation message
  showNotification(`${itemName} added to cart!`);
  
  // Update cart count in UI
  updateCartCount();
}

/**
 * Fix for the CSS selector issue
 */
Element.prototype.contains = function(text) {
  return this.textContent.includes(text);
};

/**
 * Alternative implementation for addToCart that doesn't rely on CSS selectors
 * @param {string} itemName - Name of the event/item
 */
function addToCart(itemName) {
  // Extract event details from the page
  const eventCard = document.querySelector('.event-card');
  if (!eventCard) return;
  
  // Get all paragraphs in the event card
  const paragraphs = eventCard.querySelectorAll('p');
  
  // Initialize variables with default values
  let price = 100;
  let venue = "Venue";
  let image = "../images/event-placeholder.jpg";
  
  // Extract price and location from paragraphs
  paragraphs.forEach(p => {
    const text = p.textContent;
    
    // Check for price
    if (text.includes('Price:')) {
      const priceMatch = text.match(/R(\d+)/);
      if (priceMatch) price = parseInt(priceMatch[1]);
    }
    
    // Check for location/venue
    if (text.includes('Location:')) {
      const locationParts = text.split(':')[1].split(',');
      if (locationParts.length > 0) venue = locationParts[0].trim();
    }
  });
  
  // Get image from the event card
  const imgElement = eventCard.querySelector('img');
  if (imgElement && imgElement.src) {
    image = imgElement.src;
  }
  
  // Get current cart from localStorage or initialize empty array
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  // Check if item already exists in cart
  const existingItemIndex = cart.findIndex(item => item.name === itemName);
  
  if (existingItemIndex > -1) {
    // Item exists, increment quantity
    cart[existingItemIndex].quantity += 1;
  } else {
    // Add new item to cart with extracted details
    cart.push({
      name: itemName,
      price: price,
      quantity: 1,
      image: image,
      venue: venue
    });
  }
  
  // Save updated cart back to localStorage
  localStorage.setItem('cart', JSON.stringify(cart));
  
  // Show confirmation message
  showNotification(`${itemName} added to cart!`);
  
  // Update cart count in UI
  updateCartCount();
}

/**
 * Remove an item from the cart
 * @param {string} itemName - Name of item to remove
 */
function removeFromCart(itemName) {
  // Get current cart
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  // Filter out the item to remove
  cart = cart.filter(item => item.name !== itemName);
  
  // Save updated cart
  localStorage.setItem('cart', JSON.stringify(cart));
  
  // Re-render the cart
  renderCart();
  
  // Update cart count
  updateCartCount();
}

/**
 * Change quantity of an item in the cart
 * @param {string} itemName - Name of the item
 * @param {number} newQuantity - New quantity value
 */
function updateQuantity(itemName, newQuantity) {
  // Get current cart
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  // Find the item
  const itemIndex = cart.findIndex(item => item.name === itemName);
  
  if (itemIndex > -1) {
    if (newQuantity <= 0) {
      // Remove item if quantity is zero or negative
      removeFromCart(itemName);
    } else {
      // Update quantity
      cart[itemIndex].quantity = newQuantity;
      localStorage.setItem('cart', JSON.stringify(cart));
      
      // Re-render cart with updated quantities
      renderCart();
    }
  }
  
  // Update cart count
  updateCartCount();
}

/**
 * Calculate the total price of all items in cart
 * @returns {number} Total price
 */
function calculateTotal() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

/**
 * Display a notification message
 * @param {string} message - Message to display
 */
function showNotification(message) {
  // Create notification element if it doesn't exist
  let notification = document.getElementById('cart-notification');
  
  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'cart-notification';
    notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 15px 20px;
      background-color: #2ecc71;
      color: white;
      border-radius: 5px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
      z-index: 1000;
      opacity: 0;
      transform: translateY(20px);
      transition: all 0.3s ease;
    `;
    document.body.appendChild(notification);
  }
  
  // Set notification message
  notification.textContent = message;
  
  // Show notification
  setTimeout(() => {
    notification.style.opacity = '1';
    notification.style.transform = 'translateY(0)';
  }, 10);
  
  // Hide notification after delay
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(20px)';
  }, 3000);
}

/**
 * Update the cart count badge in the navigation
 */
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const itemCount = cart.reduce((count, item) => count + item.quantity, 0);
  
  // Find or create cart count element
  let cartCountBadge = document.querySelector('.cart-count');
  
  if (!cartCountBadge) {
    // Find cart link
    const cartLinks = document.querySelectorAll('a[href*="cart.html"]');
    
    cartLinks.forEach(link => {
      cartCountBadge = document.createElement('span');
      cartCountBadge.className = 'cart-count';
      cartCountBadge.style.cssText = `
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background-color: #e74c3c;
        color: white;
        border-radius: 50%;
        width: 18px;
        height: 18px;
        font-size: 12px;
        position: relative;
        top: -10px;
        left: 2px;
        font-weight: bold;
      `;
      link.appendChild(cartCountBadge);
    });
  }
  
  // Update the count
  if (cartCountBadge) {
    if (itemCount > 0) {
      cartCountBadge.textContent = itemCount;
      cartCountBadge.style.display = 'inline-flex';
    } else {
      cartCountBadge.style.display = 'none';
    }
  }
}

/**
 * Render the cart items on the cart page
 */
function renderCart() {
  const cartGrid = document.querySelector('.category-grid');
  const checkoutSection = document.querySelector('.checkout');
  
  if (!cartGrid || !checkoutSection) return;
  
  // Get cart data
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  // Clear current content
  cartGrid.innerHTML = '';
  
  if (cart.length === 0) {
    // Cart is empty
    cartGrid.innerHTML = `
      <div class="empty-cart">
        <h3>Your cart is empty</h3>
        <p>Explore events to add them to your cart!</p>
        <a href="../eventfind/events.html" class="btn-primary">Browse Events</a>
      </div>
    `;
    checkoutSection.innerHTML = '';
    return;
  }
  
  // Render each cart item
  cart.forEach(item => {
    const itemElement = document.createElement('div');
    itemElement.className = 'cart-item';
    itemElement.innerHTML = `
      <div class="cart-item-image">
        <img src="${item.image}" alt="${item.name}">
      </div>
      <div class="cart-item-details">
        <h3>${item.name}</h3>
        <p>Venue: ${item.venue}</p>
        <p>Price: R${item.price}</p>
        <div class="quantity-controls">
          <button class="quantity-btn minus" onclick="updateQuantity('${item.name}', ${item.quantity - 1})">-</button>
          <span class="quantity">${item.quantity}</span>
          <button class="quantity-btn plus" onclick="updateQuantity('${item.name}', ${item.quantity + 1})">+</button>
        </div>
      </div>
      <div class="cart-item-subtotal">
        <p>R${item.price * item.quantity}</p>
        <button class="remove-btn" onclick="removeFromCart('${item.name}')">Remove</button>
      </div>
    `;
    cartGrid.appendChild(itemElement);
  });
  
  // Add styles for cart items
  const style = document.createElement('style');
  style.textContent = `
    .cart-item {
      display: flex;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 15px;
      background-color: #fff;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      width: 100%;
    }
    
    .cart-item-image {
      width: 100px;
      height: 100px;
      overflow: hidden;
      border-radius: 5px;
      margin-right: 15px;
    }
    
    .cart-item-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .cart-item-details {
      flex-grow: 1;
    }
    
    .cart-item-details h3 {
      margin-top: 0;
      color: #333;
    }
    
    .quantity-controls {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 10px;
    }
    
    .quantity-btn {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      border: 1px solid #ddd;
      background-color: #f5f5f5;
      font-size: 16px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .quantity {
      font-weight: bold;
    }
    
    .cart-item-subtotal {
      text-align: right;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: flex-end;
    }
    
    .cart-item-subtotal p {
      font-weight: bold;
      font-size: 18px;
      margin: 0;
    }
    
    .remove-btn {
      background-color: #ff6b6b;
      color: white;
      border: none;
      padding: 8px 12px;
      border-radius: 4px;
      cursor: pointer;
      margin-top: 10px;
    }
    
    .empty-cart {
      text-align: center;
      padding: 40px;
      width: 100%;
    }
    
    @media (max-width: 768px) {
      .cart-item {
        flex-direction: column;
      }
      
      .cart-item-image {
        width: 100%;
        height: 150px;
        margin-right: 0;
        margin-bottom: 15px;
      }
      
      .cart-item-subtotal {
        align-items: flex-start;
        margin-top: 10px;
      }
    }
  `;
  document.head.appendChild(style);
  
  // Calculate and display total
  const total = calculateTotal();
  checkoutSection.innerHTML = `
    <div class="cart-summary">
      <h3>Order Summary</h3>
      <div class="summary-row">
        <span>Subtotal:</span>
        <span>R${total}</span>
      </div>
      <div class="summary-row">
        <span>VAT (15%):</span>
        <span>R${(total * 0.15).toFixed(2)}</span>
      </div>
      <div class="summary-row total">
        <span>Total:</span>
        <span>R${(total * 1.15).toFixed(2)}</span>
      </div>
      <button class="checkout-btn" onclick="processCheckout()">Proceed to Checkout</button>
      <button class="clear-cart-btn" onclick="clearCart()">Clear Cart</button>
    </div>
  `;
  
  // Add styles for checkout section
  const checkoutStyle = document.createElement('style');
  checkoutStyle.textContent = `
    .cart-summary {
      background-color: #f9f9f9;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      margin-top: 20px;
    }
    
    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #eee;
    }
    
    .summary-row.total {
      font-weight: bold;
      font-size: 18px;
      border-top: 2px solid #ddd;
      border-bottom: none;
      padding-top: 15px;
    }
    
    .checkout-btn {
      background-color: #2ecc71;
      color: white;
      border: none;
      padding: 12px;
      width: 100%;
      border-radius: 6px;
      margin-top: 15px;
      font-size: 16px;
      cursor: pointer;
      font-weight: bold;
    }
    
    .clear-cart-btn {
      background-color: #7f8c8d;
      color: white;
      border: none;
      padding: 10px;
      width: 100%;
      border-radius: 6px;
      margin-top: 10px;
      font-size: 14px;
      cursor: pointer;
    }
  `;
  document.head.appendChild(checkoutStyle);
}

/**
 * Clear all items from cart
 */
function clearCart() {
  if (confirm('Are you sure you want to clear your cart?')) {
    localStorage.removeItem('cart');
    renderCart();
    updateCartCount();
    showNotification('Cart cleared!');
  }
}

/**
 * Handle checkout process
 */
function processCheckout() {
  // This would typically connect to a payment gateway
  // For now, we'll just simulate the process
  alert('Proceeding to payment gateway...');
  
  // Here you would redirect to a payment page or show a payment form
  // For demo purposes, we'll just clear the cart
  localStorage.removeItem('cart');
  renderCart();
  updateCartCount();
  showNotification('Thank you for your purchase!');
}

// ========================= 
// Location Handling 
// ========================= 

function getLocation() {
    const locationHeading = document.getElementById('location-heading');
    const locationText = document.getElementById('location-text');
    const loadingSpinner = document.getElementById('loading-spinner');
    
    if (!locationHeading) return;
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
        if (locationText) locationText.textContent = "Finding events near you... 🎷";
        if (loadingSpinner) loadingSpinner.style.display = 'inline-block';
    } else {
        if (locationText) locationText.textContent = "Geolocation is not supported by your browser.";
        if (loadingSpinner) loadingSpinner.style.display = 'none';
    }
}

function showPosition(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
        .then(response => response.json())
        .then(data => {
            // Get simplified location details
            const suburb = data.address.suburb || data.address.neighbourhood || "";
            const city = data.address.city || data.address.town || data.address.village || "your area";
            
            // Create simplified location string (just suburb and city)
            let simpleLocation = "";
            
            if (suburb) simpleLocation += `${suburb}, `;
            simpleLocation += city;
            
            const locationText = document.getElementById('location-text');
            const loadingSpinner = document.getElementById('loading-spinner');
            
            if (locationText) {
                locationText.textContent = `These are the events around ${simpleLocation}! 🎷`;
            }
            if (loadingSpinner) {
                loadingSpinner.style.display = 'none';
            }
            
            // Store the location in session storage
            sessionStorage.setItem('userLocation', JSON.stringify({
                lat: lat,
                lon: lon,
                simpleLocation: simpleLocation
            }));
        })
        .catch(error => {
            console.error(error);
            const locationText = document.getElementById('location-text');
            const loadingSpinner = document.getElementById('loading-spinner');
            
            if (locationText) {
                locationText.textContent = "Unable to fetch location.";
            }
            if (loadingSpinner) {
                loadingSpinner.style.display = 'none';
            }
        });
}

function showError(error) {
    const locationText = document.getElementById('location-text');
    const loadingSpinner = document.getElementById('loading-spinner');
    
    if (locationText) locationText.textContent = "Unable to fetch location.";
    if (loadingSpinner) loadingSpinner.style.display = 'none';
    
    switch (error.code) {
        case error.PERMISSION_DENIED:
            alert("User denied the request for Geolocation.");
            break;
        case error.POSITION_UNAVAILABLE:
            alert("Location information is unavailable.");
            break;
        case error.TIMEOUT:
            alert("The request to get user location timed out.");
            break;
        case error.UNKNOWN_ERROR:
            alert("An unknown error occurred.");
            break;
    }
}

// Function to refresh location
function refreshLocation() {
    const refreshButton = document.getElementById('refresh-location');
    if (refreshButton) {
        refreshButton.textContent = "Refreshing...";
        refreshButton.disabled = true;
    }
    
    // Get fresh location
    getLocation();
    
    // Reset button after a short delay
    setTimeout(() => {
        if (refreshButton) {
            refreshButton.textContent = "Refresh Location";
            refreshButton.disabled = false;
        }
    }, 2000);
}

// ========================= 
// Initialization 
// ========================= 

document.addEventListener('DOMContentLoaded', function () {
    // Initialize cart functionality
    if (document.querySelector('.category-grid') && document.querySelector('.checkout')) {
        renderCart();
    }
    
    // Initialize location functionality
    if (document.getElementById('location-heading')) {
        getLocation();
    }
    
    // Show Refresh Location Button after page loads
    const refreshButton = document.getElementById('refresh-location');
    if (refreshButton) {
        refreshButton.style.display = 'inline-block';
        refreshButton.addEventListener('click', refreshLocation);
    }
    
    // Update cart count badge on all pages
    updateCartCount();
});