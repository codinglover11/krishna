export const INITIAL_PRODUCTS = [
  {
    id: "p1",
    name: "Classic Sports Sneaker v2",
    category: "Sports",
    price: 89.99,
    discount: 10, // percentage
    stock: 45,
    description: "Premium breathable running shoes with cloud foam cushion soles.",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80",
    sales: 124,
    rating: 4.6,
  },
  {
    id: "p2",
    name: "Executive Leather Loafers",
    category: "Formal",
    price: 129.99,
    discount: 0,
    stock: 18,
    description: "Handcrafted pure Italian leather loafers suitable for formal corporate meetings.",
    image: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=400&q=80",
    sales: 82,
    rating: 4.8,
  },
  {
    id: "p3",
    name: "Urban Canvas High Tops",
    category: "Casual",
    price: 59.99,
    discount: 15,
    stock: 62,
    description: "Classic high top canvas design with durable vulcanized rubber soles.",
    image: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&q=80",
    sales: 245,
    rating: 4.3,
  },
  {
    id: "p4",
    name: "Trekker Waterproof Boots",
    category: "Outdoor",
    price: 149.99,
    discount: 5,
    stock: 12,
    description: "Heavy-duty outdoor mountain hiking boots with multi-directional traction lugs.",
    image: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=400&q=80",
    sales: 64,
    rating: 4.7,
  },
  {
    id: "p5",
    name: "Active Comfort Slip-Ons",
    category: "Casual",
    price: 49.99,
    discount: 20,
    stock: 8,
    description: "Extremely lightweight mesh slip-on shoes for casual walking.",
    image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400&q=80",
    sales: 312,
    rating: 4.5,
  }
];

export const INITIAL_CATEGORIES = [
  { id: "c1", name: "Sports", description: "Running, workout, and training footwear", count: 18 },
  { id: "c2", name: "Formal", description: "Elegant leather oxfords, derbys, and loafers", count: 12 },
  { id: "c3", name: "Casual", description: "Everyday sneakers, flats, slip-ons, and canvas shoes", count: 32 },
  { id: "c4", name: "Outdoor", description: "Hike boots, sandals, and winter footwear", count: 9 },
  { id: "c5", name: "Kids", description: "Cute, soft, and durable footwear for children", count: 14 }
];

export const INITIAL_ORDERS = [
  {
    id: "ORD-9824",
    customer: "Amit Sharma",
    email: "amit.sharma@example.com",
    date: "2026-07-23",
    items: [
      { productId: "p1", name: "Classic Sports Sneaker v2", qty: 1, price: 80.99 }
    ],
    total: 80.99,
    status: "Delivered",
    paymentMethod: "UPI",
    address: "24-A Block, Sector 62, Noida, UP, 201301"
  },
  {
    id: "ORD-9825",
    customer: "Priya Patel",
    email: "priya.p@example.com",
    date: "2026-07-23",
    items: [
      { productId: "p3", name: "Urban Canvas High Tops", qty: 2, price: 50.99 }
    ],
    total: 101.98,
    status: "Shipped",
    paymentMethod: "Credit Card",
    address: "Flat 402, Lotus Towers, Andheri West, Mumbai, MH, 400053"
  },
  {
    id: "ORD-9826",
    customer: "Rahul Verma",
    email: "rahul.v@example.com",
    date: "2026-07-22",
    items: [
      { productId: "p2", name: "Executive Leather Loafers", qty: 1, price: 129.99 },
      { productId: "p5", name: "Active Comfort Slip-Ons", qty: 1, price: 39.99 }
    ],
    total: 169.98,
    status: "Pending",
    paymentMethod: "COD",
    address: "House 12, Lane 3, Shanti Kunj, New Delhi, DL, 110025"
  },
  {
    id: "ORD-9827",
    customer: "Sneha Reddy",
    email: "sneha.reddy@example.com",
    date: "2026-07-21",
    items: [
      { productId: "p4", name: "Trekker Waterproof Boots", qty: 1, price: 142.49 }
    ],
    total: 142.49,
    status: "Cancelled",
    paymentMethod: "Net Banking",
    address: "Plot 89, Hitech City, Hyderabad, TS, 500081"
  }
];

export const INITIAL_COUPONS = [
  { id: "cp1", code: "KRISHNA10", discount: 10, type: "percentage", minPurchase: 50, expiry: "2026-12-31", active: true, uses: 145 },
  { id: "cp2", code: "FESTIVE20", discount: 20, type: "percentage", minPurchase: 100, expiry: "2026-08-30", active: true, uses: 92 },
  { id: "cp3", code: "WELCOME15", discount: 15, type: "fixed", minPurchase: 30, expiry: "2027-01-01", active: true, uses: 320 },
  { id: "cp4", code: "FLASH30", discount: 30, type: "percentage", minPurchase: 150, expiry: "2026-07-31", active: false, uses: 48 }
];

export const INITIAL_OFFERS = [
  { id: "of1", title: "Monsoon Footwear Sale", discountText: "Up to 50% Off", productsCount: 14, active: true, banner: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80" },
  { id: "of2", title: "Buy 1 Get 1 Free on Formals", discountText: "BOGO", productsCount: 8, active: false, banner: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=800&q=80" },
  { id: "of3", title: "First Order Discount", discountText: "Flat ₹500 Off", productsCount: 120, active: true, banner: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800&q=80" }
];

export const INITIAL_BANNERS = [
  { id: "b1", title: "Step into Comfort", subtitle: "New Summer Sneakers Collection", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=80", link: "/products", active: true },
  { id: "b2", title: "Walk with Pride", subtitle: "Premium Leather Shoes for Men", image: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=1200&q=80", link: "/products?category=Formal", active: true },
  { id: "b3", title: "Adventure Awaits", subtitle: "Waterproof Hiking & Trekking Boots", image: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=1200&q=80", link: "/products?category=Outdoor", active: false }
];

export const INITIAL_REVIEWS = [
  { id: "r1", customer: "Vikram Roy", rating: 5, comment: "Amazing fit! Super lightweight and design is very premium.", product: "Classic Sports Sneaker v2", date: "2026-07-22", status: "Approved" },
  { id: "r2", customer: "Anjali Mehta", rating: 4, comment: "Loafers look extremely classy. Leather is nice. Fit is slightly tight around the toes.", product: "Executive Leather Loafers", date: "2026-07-21", status: "Approved" },
  { id: "r3", customer: "Karan Singh", rating: 2, comment: "The color of the canvas shoes was slightly lighter than shown in the picture.", product: "Urban Canvas High Tops", date: "2026-07-20", status: "Pending" }
];

export const REPORT_DATA = {
  salesByMonth: [
    { month: "Jan", sales: 12000, profit: 4500, orders: 150 },
    { month: "Feb", sales: 15000, profit: 5800, orders: 190 },
    { month: "Mar", sales: 18000, profit: 7100, orders: 230 },
    { month: "Apr", sales: 16000, profit: 6200, orders: 210 },
    { month: "May", sales: 22000, profit: 9000, orders: 280 },
    { month: "Jun", sales: 26000, profit: 11000, orders: 340 },
    { month: "Jul", sales: 31000, profit: 13500, orders: 410 }
  ],
  topProducts: [
    { name: "Active Comfort Slip-Ons", sales: 312, revenue: 15600 },
    { name: "Urban Canvas High Tops", sales: 245, revenue: 14700 },
    { name: "Classic Sports Sneaker v2", sales: 124, revenue: 11158 },
    { name: "Executive Leather Loafers", sales: 82, revenue: 10659 }
  ],
  recentActivity: [
    { id: "act1", type: "order", text: "New order ORD-9826 received from Rahul Verma", time: "5 mins ago" },
    { id: "act2", type: "product", text: "Classic Sports Sneaker v2 stock reached low limit (8 items left)", time: "1 hour ago" },
    { id: "act3", type: "review", text: "New 5-star review submitted by Vikram Roy", time: "3 hours ago" },
    { id: "act4", type: "coupon", text: "Coupon FESTIVE20 was deactivated by system", time: "1 day ago" }
  ]
};

export const INITIAL_SETTINGS = {
  shopName: "Krishna Footwear",
  ownerName: "Krishna Kumar",
  contactEmail: "contact@krishnafootwear.com",
  contactPhone: "+91 98765 43210",
  currency: "INR (₹)",
  taxRate: 18,
  shippingCharge: 99,
  address: "105, Footwear Plaza, Karol Bagh, New Delhi, India - 110005",
  lowStockAlert: 10,
  enableReviews: true,
  maintenanceMode: false
};
