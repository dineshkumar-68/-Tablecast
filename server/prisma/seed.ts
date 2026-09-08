import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Tenant-Ready EMBER & PLATE database seed...');

  // 1. Clean existing database records
  await prisma.tableCall.deleteMany({});
  await prisma.customerSession.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.menuItemAddon.deleteMany({});
  await prisma.menuItem.deleteMany({});
  await prisma.menuCategory.deleteMany({});
  await prisma.restaurantTable.deleteMany({});
  await prisma.adminUser.deleteMany({});
  await prisma.restaurant.deleteMany({});

  console.log('🧹 Cleaned existing database tables');

  // 2. Seed Restaurant Profile
  const restaurant = await prisma.restaurant.create({
    data: {
      name: 'EMBER & PLATE',
      tagline: 'DINE SMART',
      address: 'Plot 42, Artisanal Culinary Avenue, Gourmet District',
      currency: 'INR',
      taxRate: 5.0, // 5% GST
    },
  });
  console.log(`✅ Seeded Restaurant: ${restaurant.name} (ID: ${restaurant.id})`);

  // 3. Seed Role-Based Staff Accounts
  const defaultPasswordHash = await bcrypt.hash('Admin@12345', 10);
  
  const adminUsers = [
    {
      restaurantId: restaurant.id,
      name: 'Executive Chef Vikram',
      email: 'admin@emberandplate.com',
      passwordHash: defaultPasswordHash,
      role: 'ADMIN',
    },
    {
      restaurantId: restaurant.id,
      name: 'Manager Rajesh',
      email: 'manager@emberandplate.com',
      passwordHash: defaultPasswordHash,
      role: 'MANAGER',
    },
    {
      restaurantId: restaurant.id,
      name: 'Head Chef Suresh',
      email: 'chef@emberandplate.com',
      passwordHash: defaultPasswordHash,
      role: 'CHEF',
    },
    {
      restaurantId: restaurant.id,
      name: 'Head Waiter Priya',
      email: 'waiter@emberandplate.com',
      passwordHash: defaultPasswordHash,
      role: 'WAITER',
    },
  ];

  for (const staff of adminUsers) {
    await prisma.adminUser.create({ data: staff });
  }
  console.log(`✅ Seeded ${adminUsers.length} Staff Accounts (Admin, Manager, Chef, Waiter)`);

  // 4. Seed Tables (Table 01 to Table 12)
  const tablesData = [
    { tableNumber: 'Table 01', qrToken: 'tbl_01_tok_84f9a1', capacity: 2, status: 'AVAILABLE' },
    { tableNumber: 'Table 02', qrToken: 'tbl_02_tok_93e7b2', capacity: 4, status: 'OCCUPIED' },
    { tableNumber: 'Table 03', qrToken: 'tbl_03_tok_12c4d5', capacity: 4, status: 'OCCUPIED' },
    { tableNumber: 'Table 04', qrToken: 'tbl_04_tok_76d8e9', capacity: 6, status: 'AVAILABLE' },
    { tableNumber: 'Table 05', qrToken: 'tbl_05_tok_38a9d1', capacity: 4, status: 'AVAILABLE' }, // DEMO TABLE
    { tableNumber: 'Table 06', qrToken: 'tbl_06_tok_51f0a2', capacity: 2, status: 'AVAILABLE' },
    { tableNumber: 'Table 07', qrToken: 'tbl_07_tok_63b1c3', capacity: 4, status: 'OCCUPIED' },
    { tableNumber: 'Table 08', qrToken: 'tbl_08_tok_94c2d4', capacity: 6, status: 'OCCUPIED' },
    { tableNumber: 'Table 09', qrToken: 'tbl_09_tok_25d3e5', capacity: 4, status: 'AVAILABLE' },
    { tableNumber: 'Table 10', qrToken: 'tbl_10_tok_36e4f6', capacity: 8, status: 'AVAILABLE' },
    { tableNumber: 'Table 11', qrToken: 'tbl_11_tok_47f5a7', capacity: 2, status: 'AVAILABLE' },
    { tableNumber: 'Table 12', qrToken: 'tbl_12_tok_58a6b8', capacity: 4, status: 'OCCUPIED' },
  ];

  const createdTables = new Map<string, any>();
  for (const t of tablesData) {
    const table = await prisma.restaurantTable.create({
      data: {
        ...t,
        restaurantId: restaurant.id,
      },
    });
    createdTables.set(t.tableNumber, table);
  }
  console.log(`✅ Seeded ${createdTables.size} Dining Tables (Demo Table: Table 05)`);

  // 5. Seed 6 Menu Categories
  const categoriesData = [
    { name: 'Starters', slug: 'starters', displayOrder: 1 },
    { name: 'Main Course', slug: 'main-course', displayOrder: 2 },
    { name: 'Pizza', slug: 'pizza', displayOrder: 3 },
    { name: 'Burgers', slug: 'burgers', displayOrder: 4 },
    { name: 'Drinks', slug: 'drinks', displayOrder: 5 },
    { name: 'Desserts', slug: 'desserts', displayOrder: 6 },
  ];

  const createdCategories = new Map<string, any>();
  for (const c of categoriesData) {
    const cat = await prisma.menuCategory.create({
      data: {
        ...c,
        restaurantId: restaurant.id,
      },
    });
    createdCategories.set(c.slug, cat);
  }
  console.log(`✅ Seeded ${createdCategories.size} Menu Categories`);

  // 6. Seed Items with Dietary Tags, Spice Levels, & Cost Prices
  const itemsData = [
    {
      categorySlug: 'burgers',
      name: 'Cheese Burger',
      description: 'Juicy grilled burger with cheese & veggies',
      price: 180,
      costPrice: 70,
      imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80',
      isVeg: false,
      isJain: false,
      isVegan: false,
      allergensJson: JSON.stringify(['Dairy', 'Gluten']),
      isPopular: true,
      isAvailable: true,
      prepTimeMinutes: 15,
      addons: [
        { name: 'Extra Cheese', price: 30 },
        { name: 'Extra Patty', price: 70 },
      ],
    },
    {
      categorySlug: 'burgers',
      name: 'Peri Peri Sandwich',
      description: 'Crispy grilled sourdough stuffed with spicy peri-peri cottage cheese & bell peppers',
      price: 160,
      costPrice: 55,
      imageUrl: 'https://images.unsplash.com/photo-1528736235302-52922df5c122?auto=format&fit=crop&w=800&q=80',
      isVeg: true,
      isJain: false,
      isVegan: false,
      allergensJson: JSON.stringify(['Dairy', 'Gluten']),
      isPopular: false,
      isAvailable: true,
      prepTimeMinutes: 12,
      addons: [{ name: 'Extra Cheese', price: 30 }],
    },
    {
      categorySlug: 'starters',
      name: 'Paneer Tikka',
      description: 'Cottage cheese cubes marinated in spices & grilled in woodfire oven',
      price: 220,
      costPrice: 85,
      imageUrl: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=800&q=80',
      isVeg: true,
      isJain: true,
      isVegan: false,
      allergensJson: JSON.stringify(['Dairy']),
      isPopular: true,
      isAvailable: true,
      prepTimeMinutes: 15,
      addons: [
        { name: 'Extra Mint Chutney', price: 20 },
        { name: 'Extra Lemon Butter', price: 30 },
      ],
    },
    {
      categorySlug: 'starters',
      name: 'French Fries',
      description: 'Golden crispy potato fries seasoned with chef signature herb sea salt',
      price: 120,
      costPrice: 30,
      imageUrl: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=800&q=80',
      isVeg: true,
      isJain: false,
      isVegan: true,
      allergensJson: JSON.stringify([]),
      isPopular: true,
      isAvailable: true,
      prepTimeMinutes: 10,
      addons: [
        { name: 'Cheese Dip', price: 30 },
        { name: 'Peri Peri Spice Dust', price: 20 },
      ],
    },
    {
      categorySlug: 'starters',
      name: 'Garlic Bread',
      description: 'Toasted baguette slathered with roasted garlic butter and melted mozzarella',
      price: 110,
      costPrice: 40,
      imageUrl: 'https://images.unsplash.com/photo-1619895092538-128341789043?auto=format&fit=crop&w=800&q=80',
      isVeg: true,
      isJain: false,
      isVegan: false,
      allergensJson: JSON.stringify(['Dairy', 'Gluten']),
      isPopular: false,
      isAvailable: true,
      prepTimeMinutes: 10,
      addons: [{ name: 'Jalapeno Topping', price: 25 }],
    },
    {
      categorySlug: 'pizza',
      name: 'Margherita Pizza',
      description: 'Classic delight with fresh basil & mozzarella on a thin woodfire crust',
      price: 250,
      costPrice: 90,
      imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80',
      isVeg: true,
      isJain: true,
      isVegan: false,
      allergensJson: JSON.stringify(['Dairy', 'Gluten']),
      isPopular: true,
      isAvailable: true,
      prepTimeMinutes: 20,
      addons: [
        { name: 'Extra Mozzarella', price: 50 },
        { name: 'Olives & Jalapenos', price: 40 },
      ],
    },
    {
      categorySlug: 'pizza',
      name: 'Farmhouse Special Pizza',
      description: 'Loaded with capsicum, grilled mushroom, sweet corn, red onion and smoked paprika',
      price: 280,
      costPrice: 100,
      imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80',
      isVeg: true,
      isJain: false,
      isVegan: false,
      allergensJson: JSON.stringify(['Dairy', 'Gluten']),
      isPopular: false,
      isAvailable: true,
      prepTimeMinutes: 20,
      addons: [{ name: 'Extra Cheese', price: 50 }],
    },
    {
      categorySlug: 'main-course',
      name: 'Woodfire Pasta',
      description: 'Al dente penne in creamy smoked tomato arrabbiata sauce with parmesan',
      price: 240,
      costPrice: 80,
      imageUrl: 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?auto=format&fit=crop&w=800&q=80',
      isVeg: true,
      isJain: false,
      isVegan: false,
      allergensJson: JSON.stringify(['Dairy', 'Gluten']),
      isPopular: true,
      isAvailable: true,
      prepTimeMinutes: 18,
      addons: [{ name: 'Extra Parmesan Cheese', price: 35 }],
    },
    {
      categorySlug: 'main-course',
      name: 'Butter Naan',
      description: 'Traditional woodfire clay oven leavened flatbread brushed with butter',
      price: 50,
      costPrice: 12,
      imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
      isVeg: true,
      isJain: true,
      isVegan: false,
      allergensJson: JSON.stringify(['Dairy', 'Gluten']),
      isPopular: false,
      isAvailable: true,
      prepTimeMinutes: 8,
      addons: [{ name: 'Garlic Butter Brush', price: 15 }],
    },
    {
      categorySlug: 'main-course',
      name: 'Truffle Mushroom Risotto',
      description: 'Slow cooked arborio rice with wild forest mushrooms, herbs and white truffle essence',
      price: 320,
      costPrice: 120,
      imageUrl: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=800&q=80',
      isVeg: true,
      isJain: false,
      isVegan: true,
      allergensJson: JSON.stringify([]),
      isPopular: false,
      isAvailable: true,
      prepTimeMinutes: 22,
      addons: [],
    },
    {
      categorySlug: 'drinks',
      name: 'Cold Coffee',
      description: 'Chilled coffee with a hint of chocolate & cream, blended to perfection',
      price: 120,
      costPrice: 35,
      imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=800&q=80',
      isVeg: true,
      isJain: true,
      isVegan: false,
      allergensJson: JSON.stringify(['Dairy']),
      isPopular: true,
      isAvailable: true,
      prepTimeMinutes: 6,
      addons: [
        { name: 'Vanilla Ice Cream Scoop', price: 40 },
        { name: 'Caramel Drizzle', price: 20 },
      ],
    },
    {
      categorySlug: 'drinks',
      name: 'Classic Coke',
      description: 'Chilled refreshing Coca-Cola can served with lemon slice and ice',
      price: 60,
      costPrice: 25,
      imageUrl: 'https://images.unsplash.com/photo-1581636625402-29b2a704ef13?auto=format&fit=crop&w=800&q=80',
      isVeg: true,
      isJain: true,
      isVegan: true,
      allergensJson: JSON.stringify([]),
      isPopular: false,
      isAvailable: true,
      prepTimeMinutes: 3,
      addons: [],
    },
    {
      categorySlug: 'drinks',
      name: 'Fresh Mint Lime Soda',
      description: 'Sparkling mineral soda infused with fresh garden mint, crushed lime and rock salt',
      price: 90,
      costPrice: 20,
      imageUrl: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=800&q=80',
      isVeg: true,
      isJain: true,
      isVegan: true,
      allergensJson: JSON.stringify([]),
      isPopular: false,
      isAvailable: true,
      prepTimeMinutes: 5,
      addons: [],
    },
    {
      categorySlug: 'desserts',
      name: 'Belgian Chocolate Lava Cake',
      description: 'Warm dark chocolate molten cake with a gooey rich truffle core',
      price: 150,
      costPrice: 50,
      imageUrl: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?auto=format&fit=crop&w=800&q=80',
      isVeg: true,
      isJain: true,
      isVegan: false,
      allergensJson: JSON.stringify(['Dairy', 'Gluten']),
      isPopular: true,
      isAvailable: true,
      prepTimeMinutes: 12,
      addons: [{ name: 'Vanilla Gelato Scoop', price: 40 }],
    },
    {
      categorySlug: 'desserts',
      name: 'Gulab Jamun with Ice Cream',
      description: 'Two hot cardamom-syrup soaked gulab jamuns paired with artisanal vanilla bean ice cream',
      price: 130,
      costPrice: 45,
      imageUrl: 'https://images.unsplash.com/photo-1666195380545-a83464a57f26?auto=format&fit=crop&w=800&q=80',
      isVeg: true,
      isJain: true,
      isVegan: false,
      allergensJson: JSON.stringify(['Dairy', 'Gluten', 'Nuts']),
      isPopular: false,
      isAvailable: true,
      prepTimeMinutes: 8,
      addons: [],
    },
  ];

  const createdItems = new Map<string, any>();
  for (const item of itemsData) {
    const category = createdCategories.get(item.categorySlug);
    const createdItem = await prisma.menuItem.create({
      data: {
        restaurantId: restaurant.id,
        categoryId: category.id,
        name: item.name,
        description: item.description,
        price: item.price,
        costPrice: item.costPrice,
        imageUrl: item.imageUrl,
        isVeg: item.isVeg,
        isJain: item.isJain,
        isVegan: item.isVegan,
        allergensJson: item.allergensJson,
        isPopular: item.isPopular,
        isAvailable: item.isAvailable,
        prepTimeMinutes: item.prepTimeMinutes,
        addons: {
          create: item.addons,
        },
      },
      include: {
        addons: true,
      },
    });
    createdItems.set(item.name, createdItem);
  }
  console.log(`✅ Seeded ${createdItems.size} Menu Items with Dietary & Margin Data`);

  // 7. Seed Orders with Customer Mobile Numbers for Reordering & Segmentation
  const historicalOrdersData = [
    {
      orderNumber: 'EP-1038',
      tableNumber: 'Table 01',
      customerMobile: '+919876543210',
      customerName: 'Aarav Sharma',
      status: 'SERVED',
      paymentStatus: 'PAID',
      paymentMethod: 'UPI',
      chefAssigned: 'Chef Suresh',
      servedAt: new Date(Date.now() - 3600000 * 2),
      customerNotes: 'Please serve quickly.',
      items: [
        { itemName: 'Woodfire Pasta', qty: 1, addedByName: 'Aarav' },
        { itemName: 'Classic Coke', qty: 1, addedByName: 'Aarav' },
      ],
    },
    {
      orderNumber: 'EP-1039',
      tableNumber: 'Table 04',
      customerMobile: '+919876543211',
      customerName: 'Neha Patel',
      status: 'SERVED',
      paymentStatus: 'PAID',
      paymentMethod: 'CARD',
      chefAssigned: 'Chef Rahul',
      servedAt: new Date(Date.now() - 3600000 * 1.8),
      customerNotes: null,
      items: [
        { itemName: 'Margherita Pizza', qty: 1, addedByName: 'Neha' },
        { itemName: 'Garlic Bread', qty: 1, addedByName: 'Neha' },
      ],
    },
    {
      orderNumber: 'EP-1040',
      tableNumber: 'Table 08',
      customerMobile: '+919876543212',
      customerName: 'Rohan Gupta',
      status: 'READY',
      paymentStatus: 'PENDING',
      chefAssigned: 'Chef Suresh',
      servedAt: null,
      customerNotes: 'Extra crispy fries requested.',
      items: [
        { itemName: 'Cheese Burger', qty: 1, addedByName: 'Rohan' },
        { itemName: 'French Fries', qty: 1, addedByName: 'Rohan' },
        { itemName: 'Classic Coke', qty: 1, addedByName: 'Rohan' },
      ],
    },
    {
      orderNumber: 'EP-1041',
      tableNumber: 'Table 03',
      customerMobile: '+919876543210', // Repeat customer!
      customerName: 'Aarav Sharma',
      status: 'READY',
      paymentStatus: 'PENDING',
      chefAssigned: 'Chef Suresh',
      servedAt: null,
      customerNotes: 'Medium spicy paneer tikka.',
      items: [
        { itemName: 'Paneer Tikka', qty: 1, addedByName: 'Aarav' },
        { itemName: 'Butter Naan', qty: 2, addedByName: 'Aarav' },
      ],
    },
    {
      orderNumber: 'EP-1043',
      tableNumber: 'Table 02',
      customerMobile: '+919876543213',
      customerName: 'Kavita Verma',
      status: 'PREPARING',
      paymentStatus: 'PENDING',
      chefAssigned: 'Chef Rahul',
      servedAt: null,
      customerNotes: 'Less chili on pasta please.',
      items: [
        { itemName: 'Margherita Pizza', qty: 1, addedByName: 'Kavita' },
        { itemName: 'Woodfire Pasta', qty: 1, addedByName: 'Kavita' },
      ],
    },
    {
      orderNumber: 'EP-1044',
      tableNumber: 'Table 07',
      customerMobile: '+919876543214',
      customerName: 'Siddharth Roy',
      status: 'PREPARING',
      paymentStatus: 'PENDING',
      chefAssigned: 'Chef Amit',
      servedAt: null,
      customerNotes: 'Cold coffee with less sugar.',
      items: [
        { itemName: 'Peri Peri Sandwich', qty: 2, addedByName: 'Siddharth' },
        { itemName: 'Cold Coffee', qty: 1, addedByName: 'Siddharth' },
      ],
    },
    {
      orderNumber: 'EP-1045',
      tableNumber: 'Table 05',
      customerMobile: '+919876543215',
      customerName: 'Pooja Bhatia',
      status: 'PLACED',
      paymentStatus: 'PENDING',
      chefAssigned: null,
      servedAt: null,
      customerNotes: 'Burger with extra napkins.',
      items: [
        { itemName: 'Cheese Burger', qty: 2, addedByName: 'Pooja' },
        { itemName: 'French Fries', qty: 1, addedByName: 'Ritik' },
        { itemName: 'Classic Coke', qty: 2, addedByName: 'Pooja' },
      ],
    },
    {
      orderNumber: 'EP-1046',
      tableNumber: 'Table 12',
      customerMobile: '+919876543216',
      customerName: 'Vikramaditya',
      status: 'PLACED',
      paymentStatus: 'PENDING',
      chefAssigned: null,
      servedAt: null,
      customerNotes: null,
      items: [
        { itemName: 'Woodfire Pasta', qty: 1, addedByName: 'Vikram' },
        { itemName: 'Garlic Bread', qty: 1, addedByName: 'Vikram' },
      ],
    },
  ];

  for (const ord of historicalOrdersData) {
    const table = createdTables.get(ord.tableNumber);
    let subtotal = 0;

    const orderItemsPayload = [];
    for (const itemRef of ord.items) {
      const dbItem = createdItems.get(itemRef.itemName);
      if (dbItem) {
        const itemSubtotal = dbItem.price * itemRef.qty;
        subtotal += itemSubtotal;
        orderItemsPayload.push({
          menuItemId: dbItem.id,
          quantity: itemRef.qty,
          unitPrice: dbItem.price,
          subtotal: itemSubtotal,
          addonsJson: null,
          addedByName: itemRef.addedByName,
        });
      }
    }

    const taxes = Math.round(subtotal * 0.05); // 5% GST
    const total = subtotal + taxes;

    await prisma.order.create({
      data: {
        restaurantId: restaurant.id,
        orderNumber: ord.orderNumber,
        tableId: table.id,
        trackingToken: `trk_${Math.random().toString(36).substring(2, 10)}_${Date.now()}`,
        customerMobile: ord.customerMobile,
        customerName: ord.customerName,
        status: ord.status,
        paymentStatus: ord.paymentStatus,
        paymentMethod: ord.paymentMethod || null,
        subtotalAmount: subtotal,
        taxesAndCharges: taxes,
        totalAmount: total,
        customerNotes: ord.customerNotes,
        chefAssigned: ord.chefAssigned,
        servedAt: ord.servedAt,
        items: {
          create: orderItemsPayload,
        },
      },
    });
  }

  console.log(`✅ Seeded ${historicalOrdersData.length} Orders with Multi-Guest and Payment metadata`);
  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
