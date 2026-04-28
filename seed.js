require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/database');
const User = require('./models/User');
const Place = require('./models/Place');
const Route = require('./models/Route');
const Event = require('./models/Event');

const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        await connectDB();

        // Clear existing data
        console.log('Clearing existing data...');
        await User.deleteMany();
        await Place.deleteMany();
        await Route.deleteMany();
        await Event.deleteMany();

        // Create admin user
        console.log('Creating admin user...');
        const admin = await User.create({
            username: 'admin',
            password: 'admin123',
            role: 'admin',
        });
        console.log('✓ Admin user created');

        // Create places with real Fatsa data
        console.log('Creating places...');
        const places = await Place.create([
            {
                title: {
                    tr: 'Bolaman Kalesi',
                    en: 'Bolaman Castle',
                    ar: 'قلعة بولمان',
                },
                description: {
                    tr: 'Karadeniz kıyısında yer alan tarihi kale, içinde Osmanlı konağı müzesi bulunmaktadır. 19. yüzyıla ait tarihi yapı, deniz manzarası ve Osmanlı dönemi eşyalarıyla ziyaretçilerini büyülemektedir.',
                    en: 'A historic castle overlooking the Black Sea, featuring a traditional Ottoman mansion museum inside. The 19th-century structure captivates visitors with sea views and Ottoman-era artifacts.',
                    ar: 'قلعة تاريخية تطل على البحر الأسود، تحتوي على متحف قصر عثماني تقليدي. يسحر الهيكل الذي يعود إلى القرن التاسع عشر الزوار بإطلالات البحر والتحف من العصر العثماني.',
                },
                category: 'history',
                location: {
                    lat: 41.0125,
                    lng: 37.5503,
                    address: 'Bolaman Mahallesi, Fatsa, Ordu',
                },
                images: [],
                rating: 4.8,
                contactInfo: {
                    phone: '+90 452 400 00 00',
                    website: 'https://www.fatsa.bel.tr',
                },
            },
            {
                title: {
                    tr: 'Gaga Gölü',
                    en: 'Gaga Lake',
                    ar: 'بحيرة غاغا',
                },
                description: {
                    tr: 'Doğal bir harika olan Gaga Gölü, piknik ve doğa yürüyüşleri için mükemmel bir yerdir. Yemyeşil ormanlarla çevrili göl, kuş türleri açısından zengindir ve fotoğraf tutkunları için ideal bir destinasyondur.',
                    en: 'A serene natural wonder perfect for picnics and nature walks. Surrounded by lush greenery and diverse bird species, the lake offers an ideal destination for photography enthusiasts.',
                    ar: 'عجيبة طبيعية هادئة مثالية للنزهات والمشي في الطبيعة. تحيط بها الخضرة الوفيرة وأنواع الطيور المتنوعة، وتوفر البحيرة وجهة مثالية لعشاق التصوير الفوتوغرافي.',
                },
                category: 'nature',
                location: {
                    lat: 41.0253,
                    lng: 37.5124,
                    address: 'Gaga Köyü, Fatsa, Ordu',
                },
                images: [],
                rating: 4.9,
                contactInfo: {
                    phone: '',
                    website: '',
                },
            },
            {
                title: {
                    tr: 'Yalıköy Plajı',
                    en: 'Yalıköy Beach',
                    ar: 'شاطئ ياليكوي',
                },
                description: {
                    tr: 'Karadeniz\'in en güzel plajlarından biri olan Yalıköy Plajı, temiz kumlu sahili ve berrak denizi ile aileler için ideal bir tatil yeridir. Yaz aylarında oldukça popülerdir.',
                    en: 'One of the most beautiful beaches on the Black Sea, Yalıköy Beach is ideal for families with its clean sandy shore and crystal-clear waters. It is very popular during summer months.',
                    ar: 'أحد أجمل الشواطئ على البحر الأسود، شاطئ ياليكوي مثالي للعائلات بشاطئه الرملي النظيف ومياهه الصافية. إنه شائع جدًا خلال أشهر الصيف.',
                },
                category: 'nature',
                location: {
                    lat: 41.0501,
                    lng: 37.4803,
                    address: 'Yalıköy, Fatsa, Ordu',
                },
                images: [],
                rating: 4.7,
                contactInfo: {
                    phone: '',
                    website: '',
                },
            },
            {
                title: {
                    tr: 'Cıngırt Kaya Mezarları',
                    en: 'Cıngırt Rock Tombs',
                    ar: 'مقابر صخرة جينغيرت',
                },
                description: {
                    tr: 'Antik dönem kaya mezarları ve tünelleri, Fatsa vadisinin nefes kesici panoramik manzaralarını sunar. Doğa yürüyüşü severler için eşsiz bir deneyim. Tarihi dokusu ve doğal güzelliği bir arada sunar.',
                    en: 'Ancient rock tombs and tunnels offering breathtaking panoramic views of the Fatsa valley. An unparalleled experience for hiking enthusiasts, combining historical texture with natural beauty.',
                    ar: 'مقابر صخرية قديمة وأنفاق تقدم إطلالات بانورامية خلابة لوادي فاتسا. تجربة لا مثيل لها لعشاق المشي لمسافات طويلة، تجمع بين النسيج التاريخي والجمال الطبيعي.',
                },
                category: 'history',
                location: {
                    lat: 40.9853,
                    lng: 37.4901,
                    address: 'Cıngırt Köyü, Fatsa, Ordu',
                },
                images: [],
                rating: 4.7,
                contactInfo: {
                    phone: '',
                    website: '',
                },
            },
            {
                title: {
                    tr: 'Fatsa İskelesi',
                    en: 'Fatsa Pier',
                    ar: 'رصيف فاتسا',
                },
                description: {
                    tr: 'Karadeniz\'e nazır sahil yürüyüş alanı. Özellikle gün batımı saatlerinde romantik bir atmosfer sunar. Kafeler ve balık restoranları ile sosyal bir buluşma noktasıdır.',
                    en: 'A coastal promenade overlooking the Black Sea. Offers a romantic atmosphere, especially during sunset hours. A social meeting point with cafes and fish restaurants.',
                    ar: 'ممشى ساحلي يطل على البحر الأسود. يوفر جوًا رومانسيًا، خاصة خلال ساعات الغروب. نقطة التقاء اجتماعية مع المقاهي ومطاعم الأسماك.',
                },
                category: 'nature',
                location: {
                    lat: 41.0270,
                    lng: 37.5020,
                    address: 'Sahil, Fatsa, Ordu',
                },
                images: [],
                rating: 4.6,
                contactInfo: {
                    phone: '',
                    website: '',
                },
            },
        ]);
        console.log(`✓ ${places.length} places created`);

        // Create transportation routes
        console.log('Creating routes...');
        const routes = await Route.create([
            {
                name: 'Şehir Merkezi - Bolaman Kalesi',
                type: 'dolmus',
                stops: [
                    {
                        name: 'Fatsa Merkez',
                        time: '09:00',
                        location: { lat: 41.0270, lng: 37.5020 },
                    },
                    {
                        name: 'Bolaman Kavşağı',
                        time: '09:15',
                        location: { lat: 41.0180, lng: 37.5250 },
                    },
                    {
                        name: 'Bolaman Kalesi',
                        time: '09:30',
                        location: { lat: 41.0125, lng: 37.5503 },
                    },
                ],
            },
            {
                name: 'Sahil Yürüyüş Turu',
                type: 'walking_tour',
                stops: [
                    {
                        name: 'Fatsa İskelesi',
                        time: '10:00',
                        location: { lat: 41.0270, lng: 37.5020 },
                    },
                    {
                        name: 'Sahil Parkı',
                        time: '10:30',
                        location: { lat: 41.0285, lng: 37.5035 },
                    },
                    {
                        name: 'Balık Restoranları',
                        time: '11:00',
                        location: { lat: 41.0300, lng: 37.5050 },
                    },
                ],
            },
            {
                name: 'Gaga Gölü Hattı',
                type: 'bus',
                stops: [
                    {
                        name: 'Fatsa Otogar',
                        time: '08:00',
                        location: { lat: 41.0240, lng: 37.4980 },
                    },
                    {
                        name: 'Gaga Köyü Girişi',
                        time: '08:30',
                        location: { lat: 41.0220, lng: 37.5080 },
                    },
                    {
                        name: 'Gaga Gölü',
                        time: '08:45',
                        location: { lat: 41.0253, lng: 37.5124 },
                    },
                ],
            },
        ]);
        console.log(`✓ ${routes.length} routes created`);

        // Create events
        console.log('Creating events...');
        const events = await Event.create([
            {
                title: {
                    tr: 'Fındık Festivali',
                    en: 'Hazelnut Festival',
                    ar: 'مهرجان البندق',
                },
                description: {
                    tr: 'Ordu\'nun ünlü fındıklarını kutlayan geleneksel festival. Yerel ürünler, müzik ve dans gösterileri ile dolu bir gün.',
                    en: 'Traditional festival celebrating Ordu\'s famous hazelnuts. A day full of local products, music, and dance performances.',
                    ar: 'مهرجان تقليدي يحتفل بالبندق الشهير في أوردو. يوم مليء بالمنتجات المحلية والموسيقى وعروض الرقص.',
                },
                date: new Date('2026-07-12'),
                location: 'Şehir Merkezi Parkı',
                image: '',
            },
            {
                title: {
                    tr: 'Sahil Caz Gecesi',
                    en: 'Coastal Jazz Night',
                    ar: 'ليلة الجاز الساحلية',
                },
                description: {
                    tr: 'Karadeniz kıyısında canlı caz müziği ile unutulmaz bir akşam. Yerli ve yabancı sanatçılar sahne alacak.',
                    en: 'An unforgettable evening with live jazz music by the Black Sea. Local and international artists will perform.',
                    ar: 'أمسية لا تُنسى مع موسيقى الجاز الحية بجانب البحر الأسود. سيؤدي فنانون محليون ودوليون.',
                },
                date: new Date('2026-08-05'),
                location: 'Fatsa İskelesi',
                image: '',
            },
            {
                title: {
                    tr: 'Geleneksel Mutfak Fuarı',
                    en: 'Traditional Cuisine Fair',
                    ar: 'معرض المطبخ التقليدي',
                },
                description: {
                    tr: 'Karadeniz mutfağının en lezzetli yemeklerini tatma fırsatı. Hamsi, mısır ekmeği ve daha fazlası!',
                    en: 'An opportunity to taste the most delicious dishes of Black Sea cuisine. Anchovies, corn bread, and more!',
                    ar: 'فرصة لتذوق أشهى أطباق مطبخ البحر الأسود. الأنشوجة وخبز الذرة والمزيد!',
                },
                date: new Date('2026-08-18'),
                location: 'Belediye Meydanı',
                image: '',
            },
        ]);
        console.log(`✓ ${events.length} events created`);

        console.log('\n✅ Database seeded successfully!');
        console.log('\nCreated:');
        console.log(`- 1 admin user (username: admin, password: admin123)`);
        console.log(`- ${places.length} places`);
        console.log(`- ${routes.length} routes`);
        console.log(`- ${events.length} events`);

        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
