const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Prisma
const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' });
const prisma = new PrismaClient({ adapter });

// Middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// View engine setup
app.set('view engine', 'ejs');
app.set('views', './views');

// Helper category names mapper
const categoryMap = {
  sale: 'Продаж',
  rent: 'Оренда',
  buy: 'Купівля',
  service: 'Послуги',
  other: 'Інше'
};

// Routes
// 1. Home page (list with search, sorting, pagination)
app.get('/', async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    if (page < 1) page = 1;
    
    const search = req.query.search || '';
    const sort = req.query.sort || 'newest';
    const limit = 10;
    const skip = (page - 1) * limit;

    const where = {};
    if (search.trim() !== '') {
      where.title = {
        contains: search.trim()
      };
    }

    const totalCount = await prisma.announcement.count({ where });
    const totalPages = Math.ceil(totalCount / limit) || 1;

    const announcements = await prisma.announcement.findMany({
      where,
      orderBy: {
        createdAt: sort === 'oldest' ? 'asc' : 'desc'
      },
      skip,
      take: limit
    });

    // Map categories and truncate description
    const processedAnnouncements = announcements.map(ann => {
      let shortDesc = ann.description;
      if (shortDesc.length > 100) {
        shortDesc = shortDesc.substring(0, 100) + '...';
      }
      return {
        ...ann,
        shortDescription: shortDesc,
        categoryName: categoryMap[ann.category] || ann.category
      };
    });

    res.render('index', {
      announcements: processedAnnouncements,
      page,
      totalPages,
      search,
      sort,
      categoryMap
    });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).send('Внутрішня помилка сервера');
  }
});

// 2. Render creation form
app.get('/announcements/create', (req, res) => {
  res.render('create', {
    data: {},
    errors: {},
    categoryMap
  });
});

// 3. Create announcement (form POST handler)
app.post('/announcements', async (req, res) => {
  const { category, title, description, price, contactInfo } = req.body;
  const errors = {};

  // Server-side validation
  const validCategories = ['sale', 'rent', 'buy', 'service', 'other'];
  if (!category || !validCategories.includes(category)) {
    errors.category = 'Будь ласка, виберіть коректну категорію';
  }

  if (!title || title.trim().length < 10) {
    errors.title = 'Назва повинна бути не менше 10 символів';
  }

  if (!description || description.trim().length < 20) {
    errors.description = 'Опис повинен бути не менше 20 символів';
  }

  if (!contactInfo || contactInfo.trim().length < 10) {
    errors.contactInfo = 'Контакти повинні бути не менше 10 символів';
  }

  const parsedPrice = parseFloat(price);
  if (isNaN(parsedPrice) || parsedPrice < 0) {
    errors.price = 'Ціна повинна бути невід’ємним числом';
  }

  // If there are errors, render form again with errors & previous input
  if (Object.keys(errors).length > 0) {
    return res.status(400).render('create', {
      data: req.body,
      errors,
      categoryMap
    });
  }

  try {
    await prisma.announcement.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        price: parsedPrice,
        category,
        contactInfo: contactInfo.trim()
      }
    });
    res.redirect('/');
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).send('Помилка при створенні оголошення');
  }
});

// 4. View single announcement
app.get('/announcements/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(404).render('404');
  }

  try {
    const announcement = await prisma.announcement.findUnique({
      where: { id }
    });

    if (!announcement) {
      return res.status(404).render('404');
    }

    res.render('show', {
      announcement: {
        ...announcement,
        categoryName: categoryMap[announcement.category] || announcement.category
      }
    });
  } catch (error) {
    console.error('Error showing announcement:', error);
    res.status(500).send('Помилка при завантаженні оголошення');
  }
});

// 5. Delete announcement (AJAX delete handler)
app.delete('/announcements/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).send('Некоректний ID');
  }

  try {
    const announcement = await prisma.announcement.findUnique({
      where: { id }
    });

    if (!announcement) {
      return res.status(404).send('Оголошення не знайдено');
    }

    await prisma.announcement.delete({
      where: { id }
    });

    res.status(204).end();
  } catch (error) {
    console.error('Error deleting announcement:', error);
    res.status(500).send('Помилка при видаленні оголошення');
  }
});

// Global 404 catch-all
app.use((req, res) => {
  res.status(404).render('404');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
