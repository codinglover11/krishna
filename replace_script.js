const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  for (const [search, replace] of replacements) {
    content = content.split(search).join(replace);
  }
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated:', filePath);
  }
}

// 1. Replace Unisex with None
const unisexReplacements = [
  ["{ value: 'Unisex', label: 'Unisex' }", "{ value: 'None', label: 'None' }"],
  ["'All', 'Men', 'Women', 'Unisex', 'Boys', 'Girls'", "'All', 'Men', 'Women', 'None', 'Boys', 'Girls'"]
];

replaceInFile('e:/KrishnaFootwear/KrishnaAdminFrontend/src/pages/AddProduct.jsx', unisexReplacements);
replaceInFile('e:/KrishnaFootwear/KrishnaAdminFrontend/src/pages/EditProduct.jsx', unisexReplacements);
replaceInFile('e:/KrishnaFootwear/KrishnaFrontend/src/pages/ProductListing.jsx', unisexReplacements);

// 2. Replace $ with ₹ or Rs
const priceReplacements = [
  ["Price ($)", "Price (₹)"], // Admin forms
  ["Price Range ($)", "Price Range (₹)"], // Frontend Sidebar
  [">$", ">₹"], // JSX Text $100 -> ₹100
  ["${", "₹{"], // JSX Text ${price} -> ₹{price} (Only outside backticks normally)
  ["${discountPrice", "₹{discountPrice"],
  ["${price", "₹{price"],
  ["${item.price", "₹{item.price"],
  ["${order.total", "₹{order.total"],
  ["${product.price", "₹{product.price"],
  ["${product.discount_price", "₹{product.discount_price"]
];

const allFrontendFiles = [
  'e:/KrishnaFootwear/KrishnaAdminFrontend/src/pages/AddProduct.jsx',
  'e:/KrishnaFootwear/KrishnaAdminFrontend/src/pages/EditProduct.jsx',
  'e:/KrishnaFootwear/KrishnaFrontend/src/pages/ProductListing.jsx',
  'e:/KrishnaFootwear/KrishnaFrontend/src/components/product/ProductCard.jsx',
  'e:/KrishnaFootwear/KrishnaFrontend/src/pages/Cart.jsx',
  'e:/KrishnaFootwear/KrishnaFrontend/src/pages/ProductDetail.jsx',
  'e:/KrishnaFootwear/KrishnaFrontend/src/pages/Checkout.jsx',
  'e:/KrishnaFootwear/KrishnaFrontend/src/pages/Order.jsx',
  'e:/KrishnaFootwear/KrishnaFrontend/src/pages/OrderDetail.jsx',
  'e:/KrishnaFootwear/KrishnaFrontend/src/pages/MyOrders.jsx',
  'e:/KrishnaFootwear/KrishnaFrontend/src/components/common/WhatsAppOrderModal.jsx'
];

allFrontendFiles.forEach(file => {
  replaceInFile(file, priceReplacements);
});
