// Dutch (Nederlands) translations for NaturallyU.
//
// This dictionary is keyed by the ENGLISH SOURCE STRING. The app's t()
// helper (see LanguageContext.jsx) looks up the exact English text a
// component renders — whether it's hardcoded UI chrome or content coming
// from the CMS/API — and returns the Dutch equivalent. Anything without an
// entry here falls back to the original English, so partial coverage still
// renders cleanly.
//
// IMPORTANT: keys must match the source text byte-for-byte, including
// punctuation (curly apostrophes ’, ellipsis …, the ♥ symbol) and any
// embedded "\n" line breaks — otherwise the lookup misses.
//
// This module holds UI chrome + storefront CMS content. Two sibling
// modules are merged in below: nl.catalog.js (product data + customer
// testimonials) and nl.admin.js (the admin panel). Later spreads win, but
// keys are disjoint by design.

import catalog from './nl.catalog.js';
import admin from './nl.admin.js';

const strings = {
  // ── Header / navigation ────────────────────────────────────────────
  'Shop': 'Winkel',
  'Gift Sets': 'Cadeausets',
  'About': 'Over ons',
  'Workshops': 'Workshops',
  'Contact': 'Contact',
  'Search the site…': 'Doorzoek de site…',
  'Toggle menu': 'Menu openen/sluiten',
  'Search': 'Zoeken',
  'Close search': 'Zoeken sluiten',
  'Cart': 'Winkelwagen',
  'Dismiss announcement': 'Melding sluiten',

  // ── Generic / shared ───────────────────────────────────────────────
  'Loading…': 'Laden…',
  'Loading products…': 'Producten laden…',
  'Unable to load page content.': 'Kan de pagina-inhoud niet laden.',
  'View All Products': 'Bekijk alle producten',
  'View all': 'Bekijk alles',
  'Shop All Products': 'Bekijk alle producten',
  'Shop Now': 'Nu winkelen',
  'Add to Cart': 'In winkelwagen',
  'Add to cart': 'In winkelwagen',
  'Go Home': 'Naar startpagina',

  // ── Hero trust badges (HeroBlock) ──────────────────────────────────
  'Natural\nIngredients': 'Natuurlijke\nIngrediënten',
  'Handmade in\nSmall Batches': 'Handgemaakt in\nKleine Batches',
  'Cruelty\nFree': 'Dierproefvrij',
  'Eco Friendly\nPackaging': 'Milieuvriendelijke\nVerpakking',

  // ── Footer ─────────────────────────────────────────────────────────
  'Handmade soaps & skin care crafted with nature’s goodness.':
    'Handgemaakte zeep en huidverzorging, gemaakt met het beste van de natuur.',
  'Customer Care': 'Klantenservice',
  'Connect': 'Contact',
  'We ship worldwide': 'Wij verzenden wereldwijd',
  'All Products': 'Alle producten',
  'Soaps': 'Zepen',
  'Skincare': 'Huidverzorging',
  'New Arrivals': 'Nieuwe producten',
  'Shipping & Returns': 'Verzending & Retouren',
  'Privacy Policy': 'Privacybeleid',
  'Terms & Conditions': 'Algemene voorwaarden',
  '© 2026 NaturallyU. All rights reserved.':
    '© 2026 NaturallyU. Alle rechten voorbehouden.',

  // ── Announcement bar (Settings) ────────────────────────────────────
  'Free shipping on orders over €75': 'Gratis verzending bij bestellingen boven €75',
  'Handcrafted in small batches with love': 'Met liefde handgemaakt in kleine batches',
  '15% OFF your first order — NATURALLY15': '15% KORTING op je eerste bestelling — NATURALLY15',

  // ── RichText eyebrows (hardcoded) ──────────────────────────────────
  'Our roots': 'Onze wortels',
  'Pure & natural': 'Puur & natuurlijk',

  // ── Newsletter ─────────────────────────────────────────────────────
  'Enter your email': 'Vul je e-mailadres in',
  'Join Us': 'Doe mee',
  'You are subscribed!': 'Je bent aangemeld!',
  'Something went wrong. Please try again.': 'Er ging iets mis. Probeer het opnieuw.',

  // ── Product card / product page ────────────────────────────────────
  'In stock': 'Op voorraad',
  'Out of stock': 'Niet op voorraad',
  'Out of Stock': 'Niet op voorraad',
  'Sales tax included.': 'Inclusief btw.',
  'Product Info': 'Productinformatie',
  'Made': 'Gemaakt',
  'Ingredients': 'Ingrediënten',
  'See product description above': 'Zie de productbeschrijving hierboven',
  'Free from': 'Vrij van',
  'How to Use': 'Gebruiksaanwijzing',
  'Shipping Info': 'Verzendinformatie',
  'Full shipping details →': 'Volledige verzendinformatie →',
  'Return & Refund Policy': 'Retour- en terugbetalingsbeleid',
  'Contact us →': 'Neem contact op →',

  // ── Shop page ──────────────────────────────────────────────────────
  'Best Sellers': 'Bestsellers',
  'Results for': 'Resultaten voor',
  'No products found': 'Geen producten gevonden',
  'Sort: Featured': 'Sorteren: Uitgelicht',
  'Newest': 'Nieuwste',
  'Price: Low to High': 'Prijs: laag naar hoog',
  'Price: High to Low': 'Prijs: hoog naar laag',

  // ── Cart page ──────────────────────────────────────────────────────
  'Order Summary': 'Besteloverzicht',
  'Subtotal': 'Subtotaal',

  // ── Checkout page ──────────────────────────────────────────────────
  'Full Name': 'Volledige naam',
  'Email': 'E-mail',
  'Phone': 'Telefoon',
  'Address': 'Adres',
  'City': 'Plaats',
  'State / Province': 'Provincie',
  'Postal Code': 'Postcode',
  'Country': 'Land',
  'Shipping Address': 'Verzendadres',
  'Placing order…': 'Bestelling plaatsen…',
  'Place Order': 'Bestelling plaatsen',
  'Total': 'Totaal',
  'Order placed!': 'Bestelling geplaatst!',
  'Checkout failed. Please try again.': 'Afrekenen mislukt. Probeer het opnieuw.',

  // ── Contact page ───────────────────────────────────────────────────
  'Location': 'Locatie',
  'Name': 'Naam',
  'Message': 'Bericht',
  'Sending…': 'Verzenden…',
  'Send Message': 'Bericht verzenden',
  "Message sent! We'll get back to you soon.":
    'Bericht verzonden! We nemen snel contact met je op.',

  // ── Search page ────────────────────────────────────────────────────
  'Searching…': 'Zoeken…',
  'result': 'resultaat',
  'results': 'resultaten',
  'across products and pages': 'in producten en pagina’s',
  'No results found for': 'Geen resultaten gevonden voor',
  'Pages': 'Pagina’s',
  'Products': 'Producten',

  // ── Track order page ───────────────────────────────────────────────
  'Processing': 'In behandeling',
  'Shipped': 'Verzonden',
  'Delivered': 'Bezorgd',
  'Cancelled': 'Geannuleerd',
  'Order ID': 'Bestelnummer',
  'Track': 'Volgen',
  'No order found with that ID.': 'Geen bestelling gevonden met dat nummer.',
  'Placed': 'Geplaatst op',

  // ── 404 ────────────────────────────────────────────────────────────
  "We couldn't find the page you're looking for.":
    'We konden de pagina die je zoekt niet vinden.',

  // ═══════════════════════════════════════════════════════════════════
  //  CMS CONTENT (Page documents / Settings)
  // ═══════════════════════════════════════════════════════════════════

  // ── Home: hero + feature strip + section headings ──────────────────
  'Handmade care\nfrom nature, for you.': 'Handgemaakte verzorging\nuit de natuur, voor jou.',
  'Pure ingredients. Gentle on skin.\nMade with love. ♥':
    'Pure ingrediënten. Zacht voor de huid.\nMet liefde gemaakt. ♥',
  'Shop Handmade Care': 'Shop handgemaakte verzorging',
  'Explore Gift Sets': 'Ontdek cadeausets',
  'Pure & Safe': 'Puur & Veilig',
  'No harsh chemicals, just nature.': 'Geen agressieve chemicaliën, alleen natuur.',
  'Made with Love': 'Met liefde gemaakt',
  'Thoughtfully handcrafted in small batches.': 'Zorgvuldig handgemaakt in kleine batches.',
  'Sustainable': 'Duurzaam',
  'Eco-friendly packaging and mindful choices.': 'Milieuvriendelijke verpakking en bewuste keuzes.',
  'For Every Skin': 'Voor elke huid',
  'Gentle care for you and your loved ones.': 'Zachte verzorging voor jou en je dierbaren.',
  'Bestsellers': 'Bestsellers',
  'Nature’s Superfoods for your precious Skin & Hair!':
    'Superfoods uit de natuur voor je kostbare huid & haar!',
  'NaturallyU is a handmade soaps and cosmetics business with a mind-blowing collection of skin and hair care products made from all-natural ingredients and ZERO chemicals or artificial flavours (No Paraben or SLS). We can also make our products custom-made according to your preferences, fresh and local!':
    'NaturallyU is een bedrijf in handgemaakte zeep en cosmetica met een verbluffende collectie huid- en haarverzorgingsproducten, gemaakt van puur natuurlijke ingrediënten en ZONDER chemicaliën of kunstmatige geurstoffen (geen parabenen of SLS). We maken onze producten ook op maat naar jouw voorkeuren, vers en lokaal!',
  'EXPLORE OUR STUNNING LINE OF PRODUCTS!': 'ONTDEK ONZE PRACHTIGE PRODUCTLIJN!',
  'Our Story': 'Ons verhaal',
  'We started in 2018 with the purpose of bringing timeless Indian beauty secrets and techniques to European homes in a hassle-free format. With time, NaturallyU has expanded its line of products to include ancient beauty secrets from Europe so that we can offer the BEST of nature’s precious gifts to our customers.':
    'We begonnen in 2018 met het doel om tijdloze Indiase schoonheidsgeheimen en -technieken op een moeiteloze manier naar Europese huizen te brengen. In de loop der tijd heeft NaturallyU haar productlijn uitgebreid met eeuwenoude schoonheidsgeheimen uit Europa, zodat we onze klanten het BESTE van de kostbare geschenken van de natuur kunnen bieden.',

  // ── Home: YES/NO pledges ───────────────────────────────────────────
  'YES': 'JA',
  'NO': 'NEE',
  'OUR YES’s & NO’s': 'ONZE JA’s & NEE’s',
  'We say NO to MASS PRODUCTION!': 'Wij zeggen NEE tegen MASSAPRODUCTIE!',
  'In line with our sustainability goal, we create only when there is a demand. Mass production involves the bulk purchase of raw materials, the use of chemicals, and huge storage spaces. Since we create ONLY when there is a direct demand from YOU, our customer, there is no question of storing products for months before they reach you. All our products are freshly hand-crafted specially for you.':
    'In lijn met ons duurzaamheidsdoel maken we alleen wanneer er vraag is. Massaproductie betekent de bulkaankoop van grondstoffen, het gebruik van chemicaliën en enorme opslagruimtes. Omdat wij ALLEEN maken wanneer er een directe vraag van JOU, onze klant, is, hoeven producten niet maandenlang opgeslagen te worden voordat ze bij je aankomen. Al onze producten worden vers en met de hand speciaal voor jou gemaakt.',
  'We say YES to SELF-LOVE!': 'Wij zeggen JA tegen ZELFLIEFDE!',
  'With the advent of cold, winter months, your skin longs for some extra Tender. Loving. Care. If you have always wondered about ancient Indian wisdom and beauty practices but did not know how to adopt them, YOU are in luck! Deepti, NaturallyU’s founder and creator of these products is a trained Ayurveda practitioner and combines her training with her extensive knowledge of herbs and oils. Bring a little tradition into your homes and make bath time an absolute bliss…':
    'Met de komst van de koude wintermaanden verlangt je huid naar wat extra Tedere. Liefdevolle. Zorg. Als je je altijd hebt afgevraagd naar eeuwenoude Indiase wijsheid en schoonheidsrituelen, maar niet wist hoe je ze moest toepassen, dan heb JIJ geluk! Deepti, oprichter van NaturallyU en maker van deze producten, is een opgeleide Ayurveda-therapeut en combineert haar opleiding met haar uitgebreide kennis van kruiden en oliën. Breng een beetje traditie in huis en maak van het badmoment een absolute verwennerij…',
  'We say NO to ANIMAL TESTING!': 'Wij zeggen NEE tegen DIERPROEVEN!',
  'We believe in cruelty-free trade. Our products are made from all-natural ingredients, and we do recommend a patch-test. We DO NOT test our products on animals.':
    'Wij geloven in dierproefvrije handel. Onze producten zijn gemaakt van puur natuurlijke ingrediënten en we raden een huidtest aan. We testen onze producten NIET op dieren.',
  'We say YES TO SUSTAINABLE GIFTING!': 'Wij zeggen JA tegen DUURZAAM SCHENKEN!',
  'With the holiday season around the corner, try showing your favourite people that you truly care! They can be your friends, family, your partners, or even your task force at work who help you run the business as usual throughout the year… Our SUPER-LUXURIOUS pre-curated beauty boxes reach your loved ones wrapped in eco-friendly packaging and make them feel special and valued each time they use it. That’s a WIN for you too!':
    'Nu de feestdagen voor de deur staan, laat je favoriete mensen zien dat je echt om ze geeft! Dat kunnen je vrienden zijn, je familie, je partner, of zelfs je collega’s die je het hele jaar door helpen de zaak draaiende te houden… Onze SUPER-LUXE samengestelde beautyboxen bereiken je dierbaren verpakt in milieuvriendelijk materiaal en geven ze een speciaal en gewaardeerd gevoel bij elk gebruik. Dat is ook een WINST voor jou!',

  // ── Home: gift banner + value props + newsletter + disclaimer ──────
  'Thoughtful by nature.\nPerfect for every occasion.':
    'Attent van nature.\nPerfect voor elke gelegenheid.',
  'Curated gift sets with handcrafted\ngoodness and beautiful packaging.':
    'Samengestelde cadeausets met handgemaakte\nkwaliteit en prachtige verpakking.',
  'Natural Ingredients': 'Natuurlijke ingrediënten',
  'Carefully sourced from nature.': 'Zorgvuldig uit de natuur gehaald.',
  'Handcrafted': 'Handgemaakt',
  'Made in small batches with love and care.': 'Gemaakt in kleine batches met liefde en zorg.',
  'Real Results': 'Echte resultaten',
  'Gentle, effective & trusted by many.': 'Zacht, effectief & vertrouwd door velen.',
  'Global Love': 'Wereldwijd geliefd',
  'Loved by customers around the world.': 'Geliefd bij klanten over de hele wereld.',
  'Start Your Natural Routine': 'Begin je natuurlijke routine',
  'Join our community for tips, offers & natural living inspiration.':
    'Word lid van onze community voor tips, aanbiedingen & inspiratie voor natuurlijk leven.',
  'Disclaimer: These are not prescription products with 100% medical results. Rather, they are timeless beauty secrets extracted from nature’s best resources which are known to work for most people with varied skin types. NaturallyU makes no medical claim of any skin treatment. While we guarantee ZERO use of chemicals and artificial colour or fragrance, a patch-test is recommended for every product.':
    'Disclaimer: Dit zijn geen voorgeschreven producten met 100% medische resultaten. Het zijn tijdloze schoonheidsgeheimen, gewonnen uit de beste bronnen van de natuur, waarvan bekend is dat ze werken voor de meeste mensen met uiteenlopende huidtypes. NaturallyU doet geen enkele medische claim over huidbehandelingen. Hoewel we ZERO gebruik van chemicaliën en kunstmatige kleur- of geurstoffen garanderen, wordt voor elk product een huidtest aanbevolen.',

  // ── About the Maker ────────────────────────────────────────────────
  'About the Maker': 'Over de maker',
  'Meet the maker': 'Maak kennis met de maker',
  'With NaturallyU, explore Mother Earth’s precious gifts of beauty!':
    'Ontdek met NaturallyU de kostbare schoonheidsgeschenken van Moeder Aarde!',
  'Ayurveda practitioner': 'Ayurveda-therapeut',
  'Meet Deepti': 'Maak kennis met Deepti',
  'Hello! I am Deepti, a trained Ayurveda practitioner for skin, hair, and body care and well-being. Ayurveda is a remedial science from ancient India which explores the therapeutic and medicinal properties of the local fauna and flora. For centuries, before the arrival of modern western medicine in India, people trusted Ayurveda as their only source of treatment.\n\nMy grandfather was an Ayurvedic healer who lived in Ujjain, a pilgrim city situated in Madhya Pradesh, Central India. He would cure people with nothing but his extensive knowledge of Ayurveda and medicinal herbs. My grandmother would make all the medicines in her own kitchen. As a child, I spent a lot of time at my grandparents’ home. Hence, most of my childhood memories are with them…my love for natural herbs comes from those evening memories when I spent hours observing my grandparents serving long queues of sick people free of charge, concocting magic potions in their laboratory, their home kitchen! I was drawn unknowingly into the process and that fascination stayed with me…':
    'Hallo! Ik ben Deepti, een opgeleide Ayurveda-therapeut voor huid-, haar- en lichaamsverzorging en welzijn. Ayurveda is een geneeskundige wetenschap uit het oude India die de therapeutische en geneeskrachtige eigenschappen van de lokale fauna en flora onderzoekt. Eeuwenlang, vóór de komst van de moderne westerse geneeskunde in India, vertrouwden mensen op Ayurveda als hun enige bron van behandeling.\n\nMijn grootvader was een Ayurvedische genezer die in Ujjain woonde, een bedevaartsstad in Madhya Pradesh, Centraal-India. Hij genas mensen met niets anders dan zijn uitgebreide kennis van Ayurveda en geneeskrachtige kruiden. Mijn grootmoeder maakte alle medicijnen in haar eigen keuken. Als kind bracht ik veel tijd door bij mijn grootouders. Daarom zijn de meeste herinneringen aan mijn jeugd met hen…mijn liefde voor natuurlijke kruiden komt voort uit die avondherinneringen, toen ik urenlang toekeek hoe mijn grootouders lange rijen zieke mensen gratis hielpen en toverdrankjes brouwden in hun laboratorium, hun eigen keuken! Ik werd onbewust in het proces meegezogen en die fascinatie is altijd bij me gebleven…',
  'Rooted in yoga': 'Geworteld in yoga',
  'I am also a trained yoga practitioner, and inner well-being is an essential part of my life. Yoga connects me to the universe in a way that I feel one with the existence. I try to bring out the same element of purity and bliss in my products so that they connect the users to the existence around them!':
    'Ik ben ook een opgeleide yogabeoefenaar, en innerlijk welzijn is een essentieel onderdeel van mijn leven. Yoga verbindt me op zo’n manier met het universum dat ik me één voel met het bestaan. Ik probeer datzelfde element van puurheid en gelukzaligheid in mijn producten te leggen, zodat ze de gebruikers verbinden met het bestaan om hen heen!',
  'How was NaturallyU born?': 'Hoe is NaturallyU ontstaan?',
  'In the winter of 2017, a fun soap-making activity with a friend led me to accidentally create a soap that turned out to be way beyond my expectations and was a super hit! Flashbacks and memories from my childhood soon took over and drove me to explore starting a venture to make beautiful soaps and cosmetics products using natural herbs. In 2018, a dear friend and I officially started NaturallyU, turning soap recipes into all-natural, chemical-free, hand-crafted products. She chose her own path eventually and I am now the sole owner and creator at NaturallyU!':
    'In de winter van 2017 leidde een leuke zeepmaakactiviteit met een vriendin ertoe dat ik per ongeluk een zeep maakte die mijn verwachtingen ver overtrof en een enorme hit was! Flashbacks en herinneringen uit mijn jeugd namen al snel de overhand en zetten me ertoe aan om een onderneming te starten om prachtige zeep en cosmetica te maken met natuurlijke kruiden. In 2018 startten een dierbare vriendin en ik officieel NaturallyU en toverden we zeeprecepten om tot puur natuurlijke, chemievrije, handgemaakte producten. Zij koos uiteindelijk haar eigen weg en ik ben nu de enige eigenaar en maker bij NaturallyU!',
  'How do I make my products?': 'Hoe maak ik mijn producten?',
  'I draw my inspiration from my childhood memories, and I make magical concoctions in my own kitchen. Albeit, maintaining all the hygiene standards, using separate containers and jars for this purpose. I work with vegetable oils, clay, herb-infused oils, essential oils, and natural herbs from all over the world to create all my products. You can rest assured that your product has not been sitting in a storage box for months before it reaches you and that it was crafted especially for you. We also accommodate individual preferences of ingredients based on specific skin requirements wherever possible!':
    'Ik haal mijn inspiratie uit mijn jeugdherinneringen en maak magische mengsels in mijn eigen keuken. Weliswaar met inachtneming van alle hygiënenormen en met aparte bakken en potten hiervoor. Ik werk met plantaardige oliën, klei, met kruiden aangelengde oliën, essentiële oliën en natuurlijke kruiden van over de hele wereld om al mijn producten te maken. Je kunt er zeker van zijn dat jouw product niet maandenlang in een opslagdoos heeft gelegen voordat het bij je aankomt, en dat het speciaal voor jou is gemaakt. Waar mogelijk houden we ook rekening met individuele voorkeuren voor ingrediënten op basis van specifieke huidbehoeften!',
  'Our vision': 'Onze visie',
  'NaturallyU’s vision': 'De visie van NaturallyU',
  'Everybody desires healthy and glowing skin and luscious, beautiful hair… no matter where you come from, no matter what your background. At NaturallyU, I graciously receive the blessings of Mother Earth and bring to you ancient Indian remedies in the form of soaps, creams, hair oils and more. And while sharing the Indian tradition I also make use of European traditions and culture in my products. I am a firm believer in the Indian idea of Vasudhaiva kutumbakam (the whole world is our family), therefore Inclusion is of massive value to me, and I would like to reach out to everybody who wants to make use of these ancient and timeless beauty secrets.\n\nMy purpose is to bring the Indian traditional wisdom of Ayurveda to Holland while keeping in mind the sensibilities of the European clientele. The products are freshly made to order so that they maintain their quality, texture, and delicate fragrance. Unlike store bought soaps, these boutique hand crafted soaps are made with ZERO chemicals to ensure that the nature’s goodness reaches our clients in the purest possible form. We walk together towards creating a more sustainable planet and ensure this not just by our eco-friendly products but also with our eco-friendly/recyclable packaging.':
    'Iedereen verlangt naar een gezonde, stralende huid en vol, prachtig haar… ongeacht waar je vandaan komt, ongeacht je achtergrond. Bij NaturallyU ontvang ik dankbaar de zegeningen van Moeder Aarde en breng ik je eeuwenoude Indiase remedies in de vorm van zepen, crèmes, haaroliën en meer. En terwijl ik de Indiase traditie deel, gebruik ik ook Europese tradities en cultuur in mijn producten. Ik geloof sterk in het Indiase idee van Vasudhaiva kutumbakam (de hele wereld is onze familie); daarom is inclusie voor mij van enorme waarde, en wil ik iedereen bereiken die gebruik wil maken van deze eeuwenoude en tijdloze schoonheidsgeheimen.\n\nMijn doel is om de traditionele Indiase wijsheid van Ayurveda naar Nederland te brengen, met oog voor de gevoeligheden van de Europese klant. De producten worden vers op bestelling gemaakt, zodat ze hun kwaliteit, textuur en subtiele geur behouden. In tegenstelling tot winkelzepen worden deze ambachtelijke, handgemaakte zepen gemaakt met ZERO chemicaliën, zodat het goede van de natuur onze klanten in de puurst mogelijke vorm bereikt. Samen zetten we stappen naar een duurzamere planeet en zorgen we daarvoor, niet alleen met onze milieuvriendelijke producten, maar ook met onze milieuvriendelijke/recyclebare verpakking.',
  'What’s Next???': 'Wat is de volgende stap???',
  'Wait no more! Explore our stunning line of products and make them yours today OR gift them to your loved ones and show them how much you care. Happy Holidays!':
    'Wacht niet langer! Ontdek onze prachtige productlijn en maak ze vandaag nog van jou OF geef ze cadeau aan je dierbaren en laat zien hoeveel je om ze geeft. Fijne feestdagen!',
  'Explore the Products': 'Ontdek de producten',
  'Hands-on & guided': 'Praktisch & begeleid',
  'Soap-Making Workshops': 'Zeepmaakworkshops',
  "Looking for a fun way to spend time with your girlfriends? Or searching for fun recreational activities for your children's next birthday party? Try our signature soap-making workshops! Immerse yourself in the fine aroma of essential oils and have to yourselves a few zen hours. As a bonus, you get to create something special. Call Today for bookings!":
    'Op zoek naar een leuke manier om tijd door te brengen met je vriendinnen? Of naar een leuke activiteit voor het volgende verjaardagsfeestje van je kinderen? Probeer onze kenmerkende zeepmaakworkshops! Dompel je onder in de fijne geur van essentiële oliën en gun jezelf een paar zen-uurtjes. Als bonus maak je iets bijzonders. Bel vandaag nog voor een boeking!',
  'See Our Workshops': 'Bekijk onze workshops',
  'Ayurveda-Rooted': 'Geworteld in Ayurveda',
  'Every formula draws on traditional Indian wellness practices.':
    'Elke formule put uit traditionele Indiase wellnessrituelen.',
  'Zero Chemicals': 'Nul chemicaliën',
  'No synthetic fragrance, no artificial additives — ever.':
    'Geen synthetische geuren, geen kunstmatige toevoegingen — nooit.',
  'Made Fresh': 'Vers gemaakt',
  'Small batches, made to order, never left to sit on a shelf.':
    'Kleine batches, op bestelling gemaakt, nooit lang op de plank.',
  'Want to know more? Write to us!': 'Wil je meer weten? Schrijf ons!',
  'NaturallyU, Denhaag, Netherlands': 'NaturallyU, Den Haag, Nederland',
  'Get in Touch': 'Neem contact op',

  // ── Cart page (CMS) ────────────────────────────────────────────────
  'Your Cart': 'Jouw winkelwagen',
  'Your cart is empty': 'Je winkelwagen is leeg',
  "Looks like you haven't added anything yet.": 'Je hebt nog niets toegevoegd.',
  'Shipping calculated at checkout. See [Shipping & Returns](/shipping-returns).':
    'Verzendkosten worden bij het afrekenen berekend. Zie [Verzending & Retouren](/shipping-returns).',

  // ── Checkout page (CMS) ────────────────────────────────────────────
  'Checkout': 'Afrekenen',
  'Shipping calculated after order review.': 'Verzendkosten worden na controle van de bestelling berekend.',
  'Payment is collected securely on the next step.': 'De betaling wordt veilig geïnd in de volgende stap.',

  // ── Contact page (CMS) ─────────────────────────────────────────────
  'Contact Us': 'Neem contact op',
  "Questions about a product, a workshop, or an order? We'd love to hear from you.":
    'Vragen over een product, een workshop of een bestelling? We horen graag van je.',
  'Den Haag, Netherlands': 'Den Haag, Nederland',

  // ── FAQ ────────────────────────────────────────────────────────────
  'Frequently Asked Questions': 'Veelgestelde vragen',
  'What are your products made of?': 'Waar zijn jullie producten van gemaakt?',
  'Every bar is handmade in small batches using natural oils, butters, and botanicals — no synthetic detergents or artificial fillers.':
    'Elke zeep is handgemaakt in kleine batches met natuurlijke oliën, boters en plantenextracten — geen synthetische reinigingsmiddelen of kunstmatige vulstoffen.',
  'How long does shipping take?': 'Hoe lang duurt de verzending?',
  'Orders are handcrafted to order, so please allow a few extra days for production before your package ships.':
    'Bestellingen worden op bestelling met de hand gemaakt, houd dus rekening met een paar extra dagen productietijd voordat je pakket wordt verzonden.',
  'What does shipping cost?': 'Wat kost de verzending?',
  'Shipping ranges from €6.75–€12.95 depending on your region, and orders over €50–€100 (region-dependent) ship free.':
    'De verzendkosten variëren van €6,75–€12,95 afhankelijk van je regio, en bestellingen boven €50–€100 (afhankelijk van de regio) worden gratis verzonden.',
  'Can I return a product?': 'Kan ik een product retourneren?',
  'Yes — returns are accepted within 30 days of delivery. See our Shipping & Returns page for the full policy.':
    'Ja — retouren worden geaccepteerd binnen 30 dagen na levering. Zie onze pagina Verzending & Retouren voor het volledige beleid.',
  'Are your products tested on skin before selling?':
    'Worden jullie producten op de huid getest voordat ze worden verkocht?',
  "We recommend a patch test before first use of any product, since everyone's skin reacts a little differently to natural ingredients.":
    'We raden een huidtest aan vóór het eerste gebruik van elk product, omdat ieders huid net iets anders reageert op natuurlijke ingrediënten.',
  'Do you offer workshops?': 'Bieden jullie workshops aan?',
  'Yes — we run signature soap-making workshops for groups and birthday parties. Visit our Workshops page to get in touch.':
    'Ja — we organiseren onze kenmerkende zeepmaakworkshops voor groepen en verjaardagsfeestjes. Bezoek onze Workshops-pagina om contact op te nemen.',

  // ── Gift sets ──────────────────────────────────────────────────────
  'Curated handmade sets, thoughtfully packaged — perfect for any occasion.':
    'Samengestelde handgemaakte sets, met zorg verpakt — perfect voor elke gelegenheid.',
  'No gift sets are available right now — check back soon, or browse the full shop.':
    'Er zijn op dit moment geen cadeausets beschikbaar — kom binnenkort terug of bekijk de hele winkel.',

  // ── Home meta ──────────────────────────────────────────────────────
  'Home': 'Home',

  // ── Privacy policy ─────────────────────────────────────────────────
  'Last updated: 2026': 'Laatst bijgewerkt: 2026',
  'Information We Collect': 'Informatie die we verzamelen',
  "When you place an order or contact us, we collect the information needed to fulfill it — your name, email, shipping address, and phone number. We don't collect anything beyond what's needed to process your order and get in touch with you.":
    'Wanneer je een bestelling plaatst of contact met ons opneemt, verzamelen we de informatie die nodig is om deze te verwerken — je naam, e-mailadres, verzendadres en telefoonnummer. We verzamelen niets meer dan wat nodig is om je bestelling te verwerken en contact met je op te nemen.',
  'How We Use It': 'Hoe we het gebruiken',
  "Your information is used to process and ship your order, respond to questions, and — if you've opted in — send occasional updates about new products or offers. We never sell your data to third parties.":
    'Je gegevens worden gebruikt om je bestelling te verwerken en te verzenden, om vragen te beantwoorden en — als je je hebt aangemeld — om je af en toe updates te sturen over nieuwe producten of aanbiedingen. We verkopen je gegevens nooit aan derden.',
  'Cookies': 'Cookies',
  "We use minimal cookies/local storage to keep your shopping cart working between visits. We don't use third-party tracking or advertising cookies.":
    'We gebruiken minimale cookies/lokale opslag om je winkelwagen tussen bezoeken te laten werken. We gebruiken geen tracking- of advertentiecookies van derden.',
  'Third-Party Services': 'Diensten van derden',
  'Payments are processed by a secure third-party payment provider — we never see or store your full card details.':
    'Betalingen worden verwerkt door een veilige externe betaaldienst — we zien of bewaren je volledige kaartgegevens nooit.',
  'Your Rights': 'Jouw rechten',
  'You can ask us to access, correct, or delete your personal information at any time — just get in touch.':
    'Je kunt ons op elk moment vragen om je persoonlijke gegevens in te zien, te corrigeren of te verwijderen — neem gewoon contact op.',
  'Questions about this policy? Reach out via our Contact page.':
    'Vragen over dit beleid? Neem contact op via onze Contactpagina.',

  // ── Product page shared template (CMS) ─────────────────────────────
  'Product Page (shared template)': 'Productpagina (gedeeld sjabloon)',
  'Handmade, natural & chemical-free': 'Handgemaakt, natuurlijk & chemievrij',
  'Handcrafted in small batches, to order': 'Handgemaakt in kleine batches, op bestelling',
  'Parabens, SLS, artificial colour and synthetic fragrance':
    'Parabenen, SLS, kunstmatige kleurstoffen en synthetische geuren',
  'We ship worldwide. Orders are handcrafted to order, so please allow a few extra days for production before your package ships. Shipping costs range from €6.75–€12.95 depending on your region, and orders over €50–€100 (region-dependent) ship free.':
    'Wij verzenden wereldwijd. Bestellingen worden op bestelling met de hand gemaakt, houd dus rekening met een paar extra dagen productietijd voordat je pakket wordt verzonden. De verzendkosten variëren van €6,75–€12,95 afhankelijk van je regio, en bestellingen boven €50–€100 (afhankelijk van de regio) worden gratis verzonden.',
  "If something arrives damaged or isn't right, contact us and we'll make it right. Returns are accepted within 30 days of delivery.":
    'Als er iets beschadigd of niet in orde aankomt, neem dan contact met ons op en we lossen het op. Retouren worden geaccepteerd binnen 30 dagen na levering.',
  'Lather with warm water and massage gently onto skin. Rinse thoroughly. Keep the bar in a dry, drained soap dish between uses to help it last longer.':
    'Schuim op met warm water en masseer zachtjes op de huid. Grondig afspoelen. Bewaar de zeep tussen gebruik door in een droge, goed afwaterende zeepbak, zodat hij langer meegaat.',
  'Apply a small amount to clean, dry skin. As with any natural product, we recommend a patch test on a small area before first use.':
    'Breng een kleine hoeveelheid aan op een schone, droge huid. Zoals bij elk natuurlijk product raden we vóór het eerste gebruik een huidtest op een klein stukje aan.',
  'Massage into the scalp and through the lengths of dry or damp hair. Leave in for at least 30 minutes (or overnight) before washing out.':
    'Masseer in de hoofdhuid en door het droge of vochtige haar. Laat minstens 30 minuten (of een nacht) intrekken voordat je het uitwast.',
  'Rinse before first use. Air-dry fully between uses to keep it fresh.':
    'Spoel af vóór het eerste gebruik. Laat tussen gebruik door volledig aan de lucht drogen om het fris te houden.',
  'As with any natural, handmade product, we recommend a patch test on a small area of skin before first use.':
    'Zoals bij elk natuurlijk, handgemaakt product raden we vóór het eerste gebruik een huidtest op een klein stukje huid aan.',

  // ── Search page (CMS) ──────────────────────────────────────────────
  'Search results': 'Zoekresultaten',
  'Type something to search the site.': 'Typ iets om de site te doorzoeken.',
  'Browse all products': 'Bekijk alle producten',

  // ── Shipping & returns (CMS) ───────────────────────────────────────
  'Shipping': 'Verzending',
  'We ship worldwide. Orders are handcrafted to order, so please allow a few extra days for production before your package ships. Shipping costs range from €6.75 to €12.95 depending on your region, and orders over €50–€100 (region-dependent) ship free.':
    'Wij verzenden wereldwijd. Bestellingen worden op bestelling met de hand gemaakt, houd dus rekening met een paar extra dagen productietijd voordat je pakket wordt verzonden. De verzendkosten variëren van €6,75 tot €12,95 afhankelijk van je regio, en bestellingen boven €50–€100 (afhankelijk van de regio) worden gratis verzonden.',
  'Returns': 'Retouren',

  // ── Shop page (CMS) ────────────────────────────────────────────────
  'Sales tax included on all products.': 'Btw inbegrepen bij alle producten.',

  // ── Terms & conditions ─────────────────────────────────────────────
  'Orders & Payment': 'Bestellingen & Betaling',
  'By placing an order with NaturallyU, you agree to pay the listed price plus any applicable shipping. Orders are handcrafted to order and may take a few extra days to prepare before shipping.':
    'Door een bestelling bij NaturallyU te plaatsen, ga je ermee akkoord de vermelde prijs plus eventuele verzendkosten te betalen. Bestellingen worden op bestelling met de hand gemaakt en kunnen een paar extra dagen voorbereidingstijd vergen voordat ze worden verzonden.',
  'See our [Shipping & Returns](/shipping-returns) page for shipping costs, timelines, and our 30-day return policy.':
    'Zie onze pagina [Verzending & Retouren](/shipping-returns) voor verzendkosten, levertijden en ons retourbeleid van 30 dagen.',
  'Product Disclaimer': 'Productdisclaimer',
  'Our products are not prescription products, but rather timeless beauty secrets drawn from nature. A patch test is recommended before first use of any product.':
    'Onze producten zijn geen voorgeschreven producten, maar tijdloze schoonheidsgeheimen uit de natuur. Een huidtest wordt aanbevolen vóór het eerste gebruik van elk product.',
  'Governing Law': 'Toepasselijk recht',
  'These terms are governed by the laws of the jurisdiction in which NaturallyU operates.':
    'Op deze voorwaarden is het recht van toepassing van het rechtsgebied waarin NaturallyU actief is.',
  'Questions about these terms? Reach out via our Contact page.':
    'Vragen over deze voorwaarden? Neem contact op via onze Contactpagina.',

  // ── Track order (CMS) ──────────────────────────────────────────────
  'Track Your Order': 'Volg je bestelling',
  'Enter the order ID from your confirmation email.':
    'Vul het bestelnummer uit je bevestigingsmail in.',

  // ── Workshops (CMS) ────────────────────────────────────────────────
  'Signature soap-making workshops, hosted by NaturallyU — for groups and birthday parties.':
    'Kenmerkende zeepmaakworkshops, verzorgd door NaturallyU — voor groepen en verjaardagsfeestjes.',
  'Hands-On & Guided': 'Praktisch & begeleid',
  'Learn the same natural, chemical-free soap-making process behind every NaturallyU bar, guided start to finish.':
    'Leer hetzelfde natuurlijke, chemievrije zeepmaakproces achter elke NaturallyU-zeep, van begin tot eind begeleid.',
  'Perfect for Groups': 'Perfect voor groepen',
  'A hands-on activity for friends, teams, or anyone curious about handmade skincare.':
    'Een praktische activiteit voor vrienden, teams of iedereen die nieuwsgierig is naar handgemaakte huidverzorging.',
  'Birthday Parties': 'Verjaardagsfeestjes',
  'A memorable, take-home-something-you-made alternative to a typical party activity.':
    'Een gedenkwaardig alternatief voor een standaard feestactiviteit, waarbij je iets zelfgemaakts mee naar huis neemt.',
  'Interested in booking a workshop?': 'Interesse om een workshop te boeken?',
  "Get in touch and we'll help you plan the details — group size, timing, and location.":
    'Neem contact op en we helpen je de details te plannen — groepsgrootte, tijdstip en locatie.',
};

const nl = { ...strings, ...catalog, ...admin };

export default nl;
