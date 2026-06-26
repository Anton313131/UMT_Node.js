const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const bcrypt = require('bcryptjs');

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.refreshToken.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('qwerty123', 10);
  const demoUser = await prisma.user.create({
    data: {
      username: 'ivan_petrenko',
      name: 'Ivan',
      password: passwordHash,
    },
  });

  const announcements = [
    {
      title: "Продам iPhone 13 Pro Max",
      description: "Чудовий стан, 256 ГБ, синій колір. Батарея 88%. У комплекті оригінальний кабель та коробка. Без ремонтів та пошкоджень.",
      price: 22000,
      category: "sale",
      contactInfo: "+380971111111",
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
    },
    {
      title: "Оренда 2-кімнатної квартири",
      description: "Здається затишна 2-кімнатна квартира в центрі міста. Сучасний ремонт, вся необхідна побутова техніка, інтернет. Поруч парк та метро.",
      price: 15000,
      category: "rent",
      contactInfo: "+380632222222",
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
    },
    {
      title: "Куплю велосипед Gravel",
      description: "Шукаю гравійний велосипед у хорошому стані. Ростовка L/XL. Бажано на трансмісії Shimano GRX або SRAM Apex. Розгляну всі пропозиції.",
      price: 35000,
      category: "buy",
      contactInfo: "+380503333333",
      createdAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000)
    },
    {
      title: "Послуги репетитора з математики",
      description: "Індивідуальні заняття з математики для учнів 5-11 класів. Підготовка до ЗНО, ДПА та допомога з домашніми завданнями. Досвід роботи 5 років.",
      price: 300,
      category: "service",
      contactInfo: "+380934444444",
      createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000)
    },
    {
      title: "Знайдено ключ від авто BMW",
      description: "У парку Шевченка знайдено ключ від автомобіля BMW. Поверну власнику при підтвердженні власності (опис брелока або номер авто).",
      price: 0,
      category: "other",
      contactInfo: "+380995555555",
      createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000)
    },
    {
      title: "Продаж ноутбука MacBook Pro M1",
      description: "MacBook Pro 13 M1, 8GB RAM, 256GB SSD, Space Gray. Стан ідеальний, 120 циклів зарядки. Купувався в офіційному магазині.",
      price: 32000,
      category: "sale",
      contactInfo: "+380676666666",
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
    },
    {
      title: "Здам в оренду гараж",
      description: "Сухий цегляний гараж в кооперативі 'Автомобіліст'. Є оглядова яма, світло, цілодобова охорона. Зручний заїзд.",
      price: 2000,
      category: "rent",
      contactInfo: "+380987777777",
      createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000)
    },
    {
      title: "Куплю відеокарту RTX 3080",
      description: "Цікавить покупка відеокарти NVIDIA RTX 3080 або RTX 4070. Тільки з перевіркою та в хорошому стані, не після майнінгу.",
      price: 18000,
      category: "buy",
      contactInfo: "+380638888888",
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
    },
    {
      title: "Ремонт пральних машин на дому",
      description: "Швидкий та якісний ремонт пральних машин будь-якої складності. Виїзд майстра в день виклику. Гарантія на виконані роботи та запчастини.",
      price: 500,
      category: "service",
      contactInfo: "+380509999999",
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    },
    {
      title: "Віддам безкоштовно кошенят",
      description: "Двоє милих кошенят шукають турботливу родину. Народилися 1 місяць тому, вже самостійно їдять та привчені до лотка. Дуже грайливі.",
      price: 0,
      category: "other",
      contactInfo: "+380971234567",
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
    },
    {
      title: "Продам шкіряну куртку",
      description: "Чоловіча шкіряна куртка, розмір L. Колір чорний. Натуральна м'яка шкіра, стан нової речі. Купувалась за кордоном, не підійшов розмір.",
      price: 4500,
      category: "sale",
      contactInfo: "+380951112233",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    },
    {
      title: "Оренда робочого місця в коворкінгу",
      description: "Зручне робоче місце у сучасному коворкінгу. Безперебійний інтернет (Starlink), генератор, чай/кава входять у вартість. Доступ 24/7.",
      price: 4000,
      category: "rent",
      contactInfo: "+380932223344",
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
    },
    {
      title: "Куплю дитяче ліжечко",
      description: "Шукаю дерев'яне дитяче ліжечко з маятниковим механізмом та матрацом. Бажано білого або світлого кольору в хорошому стані.",
      price: 2500,
      category: "buy",
      contactInfo: "+380963334455",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    },
    {
      title: "Професійний переклад текстів",
      description: "Переклад текстів будь-якої складності з/на англійську, німецьку та польську мови. Технічні, медичні та юридичні документи. Досвід 8 років.",
      price: 150,
      category: "service",
      contactInfo: "+380634445566",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      title: "Шукаю попутників до Львова",
      description: "Їду автомобілем Київ - Львів у п'ятницю після обіду (близько 16:00). Є 3 вільних місця, великий багажник. Пишіть або дзвоніть.",
      price: 350,
      category: "other",
      contactInfo: "+380505556677",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    }
  ];

  for (const item of announcements) {
    await prisma.announcement.create({
      data: { ...item, userId: demoUser.id }
    });
  }

  console.log(`Seeding finished. Created user ${demoUser.username} and 15 announcements.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
