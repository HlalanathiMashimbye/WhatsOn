// scripts.js

// Retrieve cart from localStorage or initialize empty
function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
  }
  
  // Save cart back to localStorage
  function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
  }
  
  // Add item to cart
  function addToCart(item, price) {
    let cart = getCart();
    cart.push({ item, price });
    saveCart(cart);
    alert(`${item} added to cart!`);
    renderCart(); // Re-render cart after adding item
  }
  
  // Remove item from cart
  function removeFromCart(item) {
    let cart = getCart();
    cart = cart.filter(cartItem => cartItem.item !== item);
    saveCart(cart);
    alert(`${item} removed from cart.`);
    renderCart(); // Re-render cart after removing item
  }
  
  // Render cart items on the cart page
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
      total += item.price;
      const card = document.createElement('div');
      card.className = 'event-card';
      card.style.width = '600px';
      card.innerHTML = `
        <img src="../images/${item.item.toLowerCase().replace(/ /g, '')}.jpg" alt="${item.item}">
        <h3>${item.item}</h3>
        <p><strong>Price:</strong> R${item.price}</p>
        <button class="btn-secondary" onclick="removeFromCart('${item.item}')">Remove from Cart</button>
      `;
      cartContainer.appendChild(card);
    });
  
    checkoutContainer.innerHTML = `
      <p><strong>Total: </strong> R${total}</p>
      <a href="checkout.html" class="btn-primary">Proceed to Checkout</a>
    `;
  }
  
  // Initialize cart rendering when the page loads
  document.addEventListener('DOMContentLoaded', renderCart);
  
  
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
        const city = data.address.city || data.address.town || data.address.village || "your area";
        const state = data.address.state || "";
  
        const locationText = document.getElementById('location-text');
        const loadingSpinner = document.getElementById('loading-spinner');
  
        if (locationText) {
          locationText.textContent = `These are the events around ${city}, ${state}! 🎷`;
        }
        if (loadingSpinner) {
          loadingSpinner.style.display = 'none';
        }
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
  
  // =========================
  // Initialization
  // =========================
  
  document.addEventListener('DOMContentLoaded', function () {
    if (document.querySelector('.category-grid') && document.querySelector('.checkout')) {
      renderCart();
    }
  
    if (document.getElementById('location-heading')) {
      getLocation();
    }
  
    // Show Refresh Location Button after page loads
    const refreshButton = document.getElementById('refresh-location');
    if (refreshButton) {
      refreshButton.style.display = 'inline-block';
    }
  });
  