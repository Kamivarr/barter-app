/**
 * Idempotentny skrypt seedujący bazę danych Barter.
 *
 * Uruchomienie: npx prisma db seed (lub npm run docker:prisma:seed)
 *
 * Resetuje przedmioty, wypożyczenia i recenzje, zachowując użytkowników i strukturę tabel.
 * Wprowadza 8 kategorii, 4 domyślnych użytkowników testowych, 111 realistycznych przedmiotów
 * z autentycznymi zdjęciami narzędzi oraz przykładowe wypożyczenia i opinie.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_PASSWORD_HASH = '$2b$10$Bc2oEDao77wRV/H9YmFJ4u/OLY8D90pcbQ8P9nL2gQQhr8ay3ED1u';

interface CategorySeed {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

interface UserSeed {
  id: string;
  email: string;
  name: string;
  phone: string;
  city: string;
  neighborhood: string;
  exactAddress: string;
}

interface ItemSeed {
  id: string;
  title: string;
  description: string;
  dailyPrice: number;
  depositAmount: number;
  condition: string;
  rentalRules: string;
  neighborLoc: string;
  imagesJson: string;
  isAvailable: boolean;
  ownerId: string;
  categoryId: string;
}

interface RentalSeed {
  id: string;
  itemId: string;
  renterId: string;
  startDate: string;
  endDate: string;
  days: number;
  ownerAmount: number;
  commissionAmount: number;
  depositAmount: number;
  totalPaid: number;
  status: string;
  pickupPin: string;
}

interface ReviewSeed {
  id: string;
  rentalRequestId: string;
  itemId: string;
  authorId: string;
  targetUserId: string;
  rating: number;
  comment: string;
}

const CATEGORIES: CategorySeed[] = [
  {
    "id": "cat_power_tools",
    "name": "Elektronarzędzia",
    "slug": "elektronarzedzia",
    "icon": "🔧"
  },
  {
    "id": "cat_cleaning",
    "name": "Sprzęt czyszczący",
    "slug": "sprzet-czyszczacy",
    "icon": "🧹"
  },
  {
    "id": "cat_garden",
    "name": "Ogród i Działka",
    "slug": "ogrod-i-dzialka",
    "icon": "🌿"
  },
  {
    "id": "cat_construction",
    "name": "Budowa i Remont",
    "slug": "budowa-i-remont",
    "icon": "🏗️"
  },
  {
    "id": "cat_workshop",
    "name": "Sprzęt warsztatowy",
    "slug": "sprzet-warsztatowy",
    "icon": "⚙️"
  },
  {
    "id": "cat_painting",
    "name": "Malowanie i Wykończenie",
    "slug": "malowanie-i-wykonczenie",
    "icon": "🎨"
  },
  {
    "id": "cat_measuring",
    "name": "Przyrządy pomiarowe",
    "slug": "przyrzady-pomiarowe",
    "icon": "📐"
  },
  {
    "id": "cat_transport",
    "name": "Transport i Magazyn",
    "slug": "transport-i-magazyn",
    "icon": "🛞"
  }
];

const USERS: UserSeed[] = [
  {
    "id": "usr_marek_kowalski",
    "email": "marek.kowalski@barter.local",
    "name": "Marek Kowalski",
    "phone": "500-100-200",
    "city": "Rzeszów",
    "neighborhood": "Osiedle Akademickie",
    "exactAddress": "ul. Akademicka 4/12, kod do domofonu: 412#"
  },
  {
    "id": "usr_anna_nowak",
    "email": "anna.nowak@barter.local",
    "name": "Anna Nowak",
    "phone": "600-300-400",
    "city": "Rzeszów",
    "neighborhood": "Osiedle Słoneczne",
    "exactAddress": "ul. Słoneczna 18, odbiór z garażu"
  },
  {
    "id": "usr_piotr_wisniewski",
    "email": "piotr.wisniewski@barter.local",
    "name": "Piotr Wiśniewski",
    "phone": "700-800-900",
    "city": "Rzeszów",
    "neighborhood": "Osiedle Drabinianka",
    "exactAddress": "ul. Zielona 7, wejście od ogrodu"
  },
  {
    "id": "usr_jan_kowalski",
    "email": "jan.kowalski@example.com",
    "name": "Jan Kowalski",
    "phone": "501-234-567",
    "city": "Rzeszów",
    "neighborhood": "Nowe Miasto",
    "exactAddress": "al. Powstańców Warszawy 12/4"
  }
];

const ITEMS: ItemSeed[] = [
  {
    "id": "item_dewalt_drill",
    "title": "Wiertarko-wkrętarka udarowa DeWalt DCD796P2 18V XR",
    "description": "Profesjonalna bezszczotkowa wiertarko-wkrętarka 18V z udarem mechanicznym. W zestawie 2x akumulator 5.0Ah XR, szybka ładowarka oraz systemowa walizka TSTAK. Moment obrotowy 70Nm.",
    "dailyPrice": 45.0,
    "depositAmount": 100.0,
    "condition": "GOOD",
    "rentalRules": "Zwrot ze skompletowanym zestawem (bity, 2 akumulatory, walizka). Przed zwrotem oczyścić sprzęt z pyłu budowlanego.",
    "neighborLoc": "250m od Ciebie • Osiedle Akademickie, Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80\", \"https://images.unsplash.com/photo-1622044939413-0b829c342434?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_marek_kowalski",
    "categoryId": "cat_power_tools"
  },
  {
    "id": "item_bosch_gsb_drill",
    "title": "Wiertarka udarowa sieciowa Bosch Professional GSB 13 RE 600W",
    "description": "Niezawodna wiertarka udarowa 600W do wiercenia w betonie, cegle, drewnie i metalu. Wyposażona w samozaciskowy uchwyt wiertarski 13mm oraz płynną regulację prędkości obrotowej.",
    "dailyPrice": 30.0,
    "depositAmount": 50.0,
    "condition": "GOOD",
    "rentalRules": "Używać wyłącznie z ostrymi wiertłami o odpowiednim przeznaczeniu. Nie ciągnąć za kabel zasilający.",
    "neighborLoc": "400m od Ciebie • Osiedle Słoneczne, Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_anna_nowak",
    "categoryId": "cat_power_tools"
  },
  {
    "id": "item_makita_df333_drill",
    "title": "Wkrętarka akumulatorowa Makita DF333DWAE 12V Max CXT",
    "description": "Lekka, poręczna wkrętarka 12V idealna do montażu mebli, prac instalacyjnych i skręcania konstrukcji drewnianych. W zestawie 2 akumulatory 2.0Ah oraz walizka z organizerem.",
    "dailyPrice": 25.0,
    "depositAmount": 50.0,
    "condition": "NEW",
    "rentalRules": "Udostępniam z naładowanymi akumulatorami. Proszę o zwrot w oryginalnej walizce.",
    "neighborLoc": "500m od Ciebie • Osiedle Drabinianka, Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1645651964715-d200ce0939cc?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_piotr_wisniewski",
    "categoryId": "cat_power_tools"
  },
  {
    "id": "item_milwaukee_fpd2",
    "title": "Wiertarko-wkrętarka Milwaukee M18 FUEL FPD2 135Nm",
    "description": "Potężna wkrętarka bezszczotkowa generująca aż 135Nm momentu obrotowego. Bez problemu wierci otwornicami w drewnie do 89mm i wiertłami do betonu. W zestawie 2x bateria 5.0Ah M18.",
    "dailyPrice": 55.0,
    "depositAmount": 150.0,
    "condition": "GOOD",
    "rentalRules": "Sprzęt o bardzo dużej sile — zalecam używanie z dołączoną rękojeścią boczną.",
    "neighborLoc": "300m od Ciebie • Nowe Miasto, Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80\", \"https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_jan_kowalski",
    "categoryId": "cat_power_tools"
  },
  {
    "id": "item_bosch_gsr_pocket",
    "title": "Kompaktowa wkrętarka meblowa Bosch GSR 12V-15 z bitami",
    "description": "Niezwykle zwięzła wkrętarka Bosch 12V o długości głowicy zaledwie 169mm. Umożliwia wygodną pracę w ciasnych szafkach i narożnikach. W komplecie zestaw bitów Wiha.",
    "dailyPrice": 25.0,
    "depositAmount": 50.0,
    "condition": "GOOD",
    "rentalRules": "Zwrot kompletnego zestawu bitów. Zapewniam pełne naładowanie akumulatorów.",
    "neighborLoc": "ul. Akademicka 4 • Rejon Politechniki, Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1622044939413-0b829c342434?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_marek_kowalski",
    "categoryId": "cat_power_tools"
  },
  {
    "id": "item_parkside_perf_drill",
    "title": "Wkrętarka udarowa Parkside Performance 20V 60Nm",
    "description": "Mocna wkrętarka z silnikiem bezszczotkowym, metalowym uchwytem Rohm i baterią 20V 4Ah. Bardzo solidny sprzęt do wszelkich prac warsztatowych i domowych.",
    "dailyPrice": 20.0,
    "depositAmount": 50.0,
    "condition": "GOOD",
    "rentalRules": "Zwrot w stanie czystym z ładowarką i akumulatorem.",
    "neighborLoc": "ul. Słoneczna 18 • Rejon Lwowskiej, Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1645651964715-d200ce0939cc?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_anna_nowak",
    "categoryId": "cat_power_tools"
  },
  {
    "id": "item_dewalt_dcf887_impact",
    "title": "Zakrętarka udarowa DeWalt DCF887N 18V XR 205Nm 1/4\"",
    "description": "Specjalistyczna zakrętarka udarowa z 3 biegami pracy do szybkiego wkręcania długich wkrętów ciesielskich i śrub bez obciążania nadgarstka. Bateria 18V 4Ah w zestawie.",
    "dailyPrice": 40.0,
    "depositAmount": 80.0,
    "condition": "GOOD",
    "rentalRules": "Wymaga bitów udarowych typu Impact Torsion. Mogę dołożyć zestaw końcówek Torx.",
    "neighborLoc": "ul. Zielona 7 • Rejon Żwirowni, Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_piotr_wisniewski",
    "categoryId": "cat_power_tools"
  },
  {
    "id": "item_makita_dtd152_impact",
    "title": "Zakrętarka udarowa Makita DTD152Z 18V LXT 165Nm",
    "description": "Sprawdzona zakrętarka akumulatorowa Makita 18V do prac dekarskich i montażowych. Oświetlenie robocze LED, ergonomiczna rękojeść gumowana, bateria 5.0Ah w komplecie.",
    "dailyPrice": 35.0,
    "depositAmount": 80.0,
    "condition": "FAIR",
    "rentalRules": "Sprawna w 100%, nosi normalne ślady użytkowania. Zwrot z ładowarką.",
    "neighborLoc": "al. Powstańców Warszawy 12 • Millenium Hall, Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1622044939413-0b829c342434?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_jan_kowalski",
    "categoryId": "cat_power_tools"
  },
  {
    "id": "item_makita_grinder_125",
    "title": "Szlifierka kątowa Makita GA5030R 125mm 720W",
    "description": "Lekka szlifierka kątowa z wąską obudową silnika o małej średnicy, ułatwiającą pewny chwyt jedną ręką. Funkcja anti-restart zapobiega przypadkowemu włączeniu.",
    "dailyPrice": 25.0,
    "depositAmount": 50.0,
    "condition": "GOOD",
    "rentalRules": "Praca wyłącznie z założoną osłoną tarczy i okularami ochronnymi. W zestawie klucz do tarcz.",
    "neighborLoc": "al. Powstańców Warszawy • Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=800&q=80\", \"https://images.unsplash.com/photo-1598302936625-6075fbd98dd7?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_marek_kowalski",
    "categoryId": "cat_power_tools"
  },
  {
    "id": "item_bosch_gws_grinder",
    "title": "Szlifierka kątowa Bosch Professional GWS 9-125 900W",
    "description": "Mocna kątówka 900W z bezpośrednim chłodzeniem silnika zapewniającym wysoką odporność na przeciążenia. Znakomita do cięcia profili stalowych, zbrojenia i szlifowania spawów.",
    "dailyPrice": 30.0,
    "depositAmount": 50.0,
    "condition": "GOOD",
    "rentalRules": "Zwrot z kluczem i nakrętkami mocującymi. Tarcze tnące we własnym zakresie lub za dopłatą.",
    "neighborLoc": "Osiedle Mieszka I • Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1598302936625-6075fbd98dd7?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_anna_nowak",
    "categoryId": "cat_power_tools"
  },
  {
    "id": "item_dewalt_dwe4206_grinder",
    "title": "Szlifierka kątowa DeWalt DWE4206 125mm 1010W z łagodnym startem",
    "description": "Szlifierka o mocy 1010W z systemem wyrzucania pyłu ze strumienia powietrza chłodzącego. Beznarzędziowo przestawiana osłona i łagodny rozruch bez szarpnięć.",
    "dailyPrice": 30.0,
    "depositAmount": 60.0,
    "condition": "NEW",
    "rentalRules": "Sprzęt praktycznie nowy, po każdym cięciu proszę przedmuchać szczeliny wentylacyjne.",
    "neighborLoc": "ul. Kwiatkowskiego • Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_piotr_wisniewski",
    "categoryId": "cat_power_tools"
  },
  {
    "id": "item_metabo_grinder_230",
    "title": "Duża szlifierka kątowa Metabo WE 2200-230 2300W do bruku",
    "description": "Ciężka, 2300W szlifierka kątowa na tarcze 230mm. Niezbędna do docinania krawężników, kostki brukowej, bloczków betonowych i grubych belek stalowych.",
    "dailyPrice": 45.0,
    "depositAmount": 100.0,
    "condition": "GOOD",
    "rentalRules": "Wymaga tarczy 230mm z otworem 22.23mm. Zalecam podłączenie pod bezpiecznik B16 lub C16.",
    "neighborLoc": "ul. Podwisłocze • Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1522322512347-a0e57fd1744c?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_jan_kowalski",
    "categoryId": "cat_power_tools"
  },
  {
    "id": "item_bosch_gks190_saw",
    "title": "Pilarka tarczowa ręczna Bosch GKS 190 1400W z prowadnicą",
    "description": "Najwyższa w swojej klasie głębokość cięcia (70mm przy 90° i 50mm przy 45°). Turbodmuchawa utrzymuje linię cięcia wolną od wiórów. W komplecie tarcza z węglikami spiekanymi.",
    "dailyPrice": 40.0,
    "depositAmount": 80.0,
    "condition": "GOOD",
    "rentalRules": "Nie ciąć drewna z gwoździami. Zwracać z czystą stopą pilarki.",
    "neighborLoc": "Osiedle Dąbrowskiego • Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1513467655676-561b7d489a88?auto=format&fit=crop&w=800&q=80\", \"https://images.unsplash.com/photo-1642006953663-06f0387f5652?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_marek_kowalski",
    "categoryId": "cat_power_tools"
  },
  {
    "id": "item_makita_hs7601_saw",
    "title": "Pilarka tarczowa Makita HS7601 1200W z tarczą do drewna",
    "description": "Precyzyjna pilarka tarczowa 190mm z aluminiową płytą podstawy i ergonomiczną rękojeścią. Łatwe ustawianie głębokości i kąta cięcia.",
    "dailyPrice": 35.0,
    "depositAmount": 80.0,
    "condition": "GOOD",
    "rentalRules": "Zwrot ze zdemontowanym klinem prowadzącym i kluczem imbusowym w gnieździe.",
    "neighborLoc": "Rejon Szpitala Wojewódzkiego • Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1642006953663-06f0387f5652?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_anna_nowak",
    "categoryId": "cat_power_tools"
  },
  {
    "id": "item_dewalt_dcs570_saw",
    "title": "Akumulatorowa pilarka tarczowa DeWalt DCS570N 18V XR 184mm",
    "description": "Mobilna pilarka bezprzewodowa 18V z silnikiem bezszczotkowym. Osiąga 5500 obr/min, zapewniając cięcie belek i płyt OSB w dowolnym miejscu bez przedłużacza. 2x bateria 5Ah.",
    "dailyPrice": 50.0,
    "depositAmount": 120.0,
    "condition": "NEW",
    "rentalRules": "Dołączam 2 naładowane akumulatory i ładowarkę wielonapięciową.",
    "neighborLoc": "Osiedle Zalesie • Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1513467655676-561b7d489a88?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_piotr_wisniewski",
    "categoryId": "cat_power_tools"
  },
  {
    "id": "item_evolution_saw_multipurpose",
    "title": "Wielozadaniowa pilarka tarczowa Evolution R185CCS (drewno, stal, alu)",
    "description": "Specjalistyczna pilarka z opatentowaną technologią TCT umożliwiającą czyste cięcie stali konstrukcyjnej, aluminium oraz drewna z gwoździami tą samą tarczą bez iskrzenia.",
    "dailyPrice": 45.0,
    "depositAmount": 100.0,
    "condition": "GOOD",
    "rentalRules": "Nie chłodzić tarczy wodą. Ciąć ze stałym, równomiernym posuwem.",
    "neighborLoc": "Osiedle Baranówka • Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_jan_kowalski",
    "categoryId": "cat_power_tools"
  },
  {
    "id": "item_makita_ls1018_miter",
    "title": "Ukośnica przesuwna z laserem Makita LS1018LN 260mm 1430W",
    "description": "Kapówka warsztatowa z podwójnym mechanizmem posuwu i znacznikiem laserowym. Umożliwia cięcie desek tarasowych o szerokości do 310mm pod kątem 90°.",
    "dailyPrice": 65.0,
    "depositAmount": 150.0,
    "condition": "GOOD",
    "rentalRules": "Transport wyłącznie w pozycji zablokowanej głowicy. Dołączam boczne podpórki materiału.",
    "neighborLoc": "250m od Ciebie • Osiedle Akademickie, Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1581147036324-c17ac41dfa6c?auto=format&fit=crop&w=800&q=80\", \"https://images.unsplash.com/photo-1747407823729-466c37e18bec?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_marek_kowalski",
    "categoryId": "cat_power_tools"
  },
  {
    "id": "item_bosch_gcm8_miter",
    "title": "Ukośnica Bosch GCM 8 SJL 1600W z posuwem do paneli",
    "description": "Znakomita ukośnica z 2-punktowym systemem odsysania pyłu i wydajnym silnikiem 1600W. Zdolność cięcia w poziomie do 312mm, idealna do desek podłogowych i listew.",
    "dailyPrice": 60.0,
    "depositAmount": 150.0,
    "condition": "GOOD",
    "rentalRules": "Worek na pył lub adapter do odkurzacza w komplecie. Zwrot w stanie oczyszczonym.",
    "neighborLoc": "400m od Ciebie • Osiedle Słoneczne, Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1747407823729-466c37e18bec?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_anna_nowak",
    "categoryId": "cat_power_tools"
  },
  {
    "id": "item_metabo_kgs216_miter",
    "title": "Ukośnica z posuwem Metabo KGS 216 M z oświetleniem LED",
    "description": "Kompaktowa i lekka ukośnica z funkcją posuwu do szerokich elementów. Precyzyjny wskaźnik laserowy linii cięcia oraz jasne podświetlenie LED stołu roboczego.",
    "dailyPrice": 50.0,
    "depositAmount": 100.0,
    "condition": "GOOD",
    "rentalRules": "Przed zwrotem opróżnić z trocin i zabezpieczyć pokrętła kątowe.",
    "neighborLoc": "500m od Ciebie • Osiedle Drabinianka, Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1581147036324-c17ac41dfa6c?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_piotr_wisniewski",
    "categoryId": "cat_power_tools"
  },
  {
    "id": "item_bosch_gst90_jigsaw",
    "title": "Wyrzynarka grzybkowa Bosch Professional GST 90 E 650W",
    "description": "Niezawodna wyrzynarka z beznarzędziowym systemem wymiany brzeszczotów SDS. 4-stopniowa oscylacja brzeszczotu umożliwia szybkie lub czyste cięcie w drewnie do 90mm.",
    "dailyPrice": 30.0,
    "depositAmount": 60.0,
    "condition": "GOOD",
    "rentalRules": "W zestawie komplet 5 brzeszczotów do drewna i metalu. Zwracać w walizce.",
    "neighborLoc": "300m od Ciebie • Nowe Miasto, Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1608613304810-2d4dd52511a2?auto=format&fit=crop&w=800&q=80\", \"https://images.unsplash.com/photo-1610890753500-96a56a672120?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_jan_kowalski",
    "categoryId": "cat_power_tools"
  },
  {
    "id": "item_makita_jv0600_jigsaw",
    "title": "Wyrzynarka Makita JV0600K 650W z regulacją podcinania",
    "description": "Wyważona wyrzynarka z rękojeścią żelazkową i aluminiową podstawą odchylaną w obie strony do 45°. Płynna regulacja obrotów pokrętłem.",
    "dailyPrice": 25.0,
    "depositAmount": 50.0,
    "condition": "GOOD",
    "rentalRules": "Zwrot z plastikową stopką antyrysową do paneli i blach.",
    "neighborLoc": "ul. Akademicka 4 • Rejon Politechniki, Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1610890753500-96a56a672120?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_marek_kowalski",
    "categoryId": "cat_power_tools"
  },
  {
    "id": "item_dewalt_dcs331_jigsaw",
    "title": "Akumulatorowa wyrzynarka DeWalt DCS331N 18V XR",
    "description": "Bezprzewodowa wyrzynarka z dmuchawą wiórów i szybkim mocowaniem brzeszczotów z chwytem T. Bateria 18V 4.0Ah i ładowarka w zestawie.",
    "dailyPrice": 35.0,
    "depositAmount": 80.0,
    "condition": "GOOD",
    "rentalRules": "Nie dociskać na siłę w łukach, aby nie wyginać brzeszczotu.",
    "neighborLoc": "ul. Słoneczna 18 • Rejon Lwowskiej, Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1608613304810-2d4dd52511a2?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_anna_nowak",
    "categoryId": "cat_power_tools"
  },
  {
    "id": "item_bosch_gbh226_hammer",
    "title": "Młotowiertarka SDS-Plus Bosch GBH 2-26 DFR 800W z wymienną główką",
    "description": "Klasyk na budowie. Energia udaru 2.7J, szybkowymienny uchwyt SDS+ na zwykły uchwyt wiertarski 13mm do wierteł cylindrycznych. W zestawie dłuto, szpicak i wiertła 6,8,10,12.",
    "dailyPrice": 40.0,
    "depositAmount": 100.0,
    "condition": "GOOD",
    "rentalRules": "Smarować końcówki wierteł przed włożeniem do uchwytu (smar w walizce).",
    "neighborLoc": "ul. Zielona 7 • Rejon Żwirowni, Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_piotr_wisniewski",
    "categoryId": "cat_power_tools"
  },
  {
    "id": "item_makita_hr2470_hammer",
    "title": "Młotowiertarka udarowa SDS-Plus Makita HR2470 780W",
    "description": "Wszechstronna młotowiertarka 3-funkcyjna: wiercenie bez udaru, wiercenie z udarem oraz podkuwanie. Blokada obrotów przy kucie tynku i bruzd.",
    "dailyPrice": 35.0,
    "depositAmount": 80.0,
    "condition": "GOOD",
    "rentalRules": "Dołączam ogranicznik głębokości i rękojeść boczną. Sprzęt czysty, gotowy do pracy.",
    "neighborLoc": "al. Powstańców Warszawy 12 • Millenium Hall, Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_jan_kowalski",
    "categoryId": "cat_power_tools"
  },
  {
    "id": "item_karcher_k5",
    "title": "Myjka ciśnieniowa Kärcher K5 Power Control 145 bar z lancami",
    "description": "Wydajna myjka wysokociśnieniowa z silnikiem chłodzonym wodą. W komplecie lanca Vario Power z regulacją ciśnienia, dysza rotacyjna do mchu na kostce oraz wąż 10m na bębnie.",
    "dailyPrice": 60.0,
    "depositAmount": 150.0,
    "condition": "GOOD",
    "rentalRules": "Zwrot z wymytym wężem i spuszczonym ciśnieniem z pistoletu. Zabezpieczyć przed mrozem.",
    "neighborLoc": "Osiedle Mieszka I • Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80\", \"https://images.unsplash.com/photo-1718152521364-b9655b8a7926?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_anna_nowak",
    "categoryId": "cat_cleaning"
  },
  {
    "id": "item_karcher_k7_smart",
    "title": "Myjka wysokociśnieniowa Kärcher K7 Premium Smart Control 180 bar",
    "description": "Topowy model myjki Kärcher z ciśnieniem roboczym do 180 bar i przepływem wody 600 l/h. Funkcja Boost z dodatkową mocą do najcięższych zabrudzeń elewacji i maszyn.",
    "dailyPrice": 85.0,
    "depositAmount": 200.0,
    "condition": "NEW",
    "rentalRules": "Wymaga zasilania z bezpiecznikiem 16A oraz stabilnego źródła wody (min. 12 l/min).",
    "neighborLoc": "al. Powstańców Warszawy • Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_marek_kowalski",
    "categoryId": "cat_cleaning"
  },
  {
    "id": "item_nilfisk_core_140",
    "title": "Myjka ciśnieniowa Nilfisk Core 140-6 PowerControl z wężem 8m",
    "description": "Duńska myjka z metalową pompą aluminiową o wysokiej trwałości. Posiada wewnętrzny bęben na elastyczny wąż Ultraflex oraz dyszę Gentle i Rough.",
    "dailyPrice": 50.0,
    "depositAmount": 100.0,
    "condition": "GOOD",
    "rentalRules": "Wypłukać filtr wody po zakończeniu prac. Dołączam pianownicę do chemii.",
    "neighborLoc": "ul. Kwiatkowskiego • Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1718152521364-b9655b8a7926?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_piotr_wisniewski",
    "categoryId": "cat_cleaning"
  },
  {
    "id": "item_bosch_aquatak_120",
    "title": "Kompaktowa myjka ciśnieniowa Bosch EasyAquatak 120",
    "description": "Lekka, przenośna myjka 120 bar idealna do mycia rowerów, mebli ogrodowych, tarasów i motocykli. Łatwa w transporcie w bagażniku każdego auta.",
    "dailyPrice": 35.0,
    "depositAmount": 60.0,
    "condition": "GOOD",
    "rentalRules": "Zapewniam komplet szybkozłączek do podłączenia pod wąż ogrodowy 1/2\".",
    "neighborLoc": "ul. Podwisłocze • Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1782235869457-069673be2dc3?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_jan_kowalski",
    "categoryId": "cat_cleaning"
  },
  {
    "id": "item_stihl_re130_washer",
    "title": "Myjka wysokociśnieniowa Stihl RE 130 Plus 170 bar ze zbrojonym wężem",
    "description": "Profesjonalna myjka z mosiężną głowicą pompy i tłokami pokrytymi ceramiką. Stalowo zbrojony wąż 9m odporny na załamania i przecieranie na asfalcie.",
    "dailyPrice": 70.0,
    "depositAmount": 150.0,
    "condition": "GOOD",
    "rentalRules": "Zwrot w stanie czystym. Nie dopuszczać do pracy na sucho bez dopływu wody.",
    "neighborLoc": "Osiedle Dąbrowskiego • Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1718152521364-b9655b8a7926?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_marek_kowalski",
    "categoryId": "cat_cleaning"
  },
  {
    "id": "item_karcher_puzzi_10_1",
    "title": "Odkurzacz piorący do tapicerki Kärcher Puzzi 10/1 z chemią RM 760",
    "description": "Profesjonalne urządzenie spryskująco-odsysające do czyszczenia wykładzin, dywanów oraz tapicerki samochodowej i meblowej. W komplecie ssawka szczelinowa i szeroka podłogowa.",
    "dailyPrice": 70.0,
    "depositAmount": 150.0,
    "condition": "GOOD",
    "rentalRules": "W cenie dodaję 2 porcje proszku Kärcher RM 760. Zwrot z wymytym zbiornikiem na brudną wodę.",
    "neighborLoc": "Rejon Szpitala Wojewódzkiego • Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=800&q=80\", \"https://images.unsplash.com/photo-1655874837055-7adc909ae602?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_anna_nowak",
    "categoryId": "cat_cleaning"
  },
  {
    "id": "item_numatic_george",
    "title": "Ekstrakcyjny odkurzacz piorący Numatic George GVE370 4w1",
    "description": "Niezawodny brytyjski odkurzacz piorący do dywanów i tapicerek z silnikiem TwinFlo 1060W. Może pracować zarówno jako odkurzacz piorący, jak i zwykły suchy z workiem HepaFlo.",
    "dailyPrice": 60.0,
    "depositAmount": 120.0,
    "condition": "GOOD",
    "rentalRules": "Używać wyłącznie z niskopieniącymi środkami do prania ekstrakcyjnego.",
    "neighborLoc": "Osiedle Zalesie • Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1655874837055-7adc909ae602?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_piotr_wisniewski",
    "categoryId": "cat_cleaning"
  },
  {
    "id": "item_karcher_wd3_vacuum",
    "title": "Odkurzacz uniwersalny warsztatowy Kärcher WD 3 V-17/4/20",
    "description": "Wytrzymały odkurzacz do zbierania suchego brudu, gruzu, trocin oraz rozlanych płynów. Zbiornik z tworzywa 17L, funkcja dmuchawy, wąż ssący 2m.",
    "dailyPrice": 30.0,
    "depositAmount": 50.0,
    "condition": "GOOD",
    "rentalRules": "Przy odkurzaniu gruzu gipsowego wymagany worek flizelinowy (dołączam 1 szt w cenie).",
    "neighborLoc": "Osiedle Baranówka • Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1674471361339-f720c171ec77?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_jan_kowalski",
    "categoryId": "cat_cleaning"
  },
  {
    "id": "item_bosch_gas35_vacuum",
    "title": "Odkurzacz budowlany z otrząsaczem Bosch GAS 35 M AFC 1200W",
    "description": "Certyfikowany odkurzacz do pyłu klasy M (gips, beton, zaprawa). Automatyczny system oczyszczania filtra (AFC) co 15 sekund gwarantuje stałą siłę ssania przy szlifierkach 'żyrafa'.",
    "dailyPrice": 75.0,
    "depositAmount": 200.0,
    "condition": "GOOD",
    "rentalRules": "Zwrot z opróżnionym workiem lub bez pyłu w zbiorniku. Filtr oczyszczony.",
    "neighborLoc": "250m od Ciebie • Osiedle Akademickie, Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_marek_kowalski",
    "categoryId": "cat_cleaning"
  },
  {
    "id": "item_makita_vc2512_vacuum",
    "title": "Odkurzacz przemysłowy Makita VC2512L 1000W z gniazdem automatycznym",
    "description": "Odkurzacz warsztatowy z gniazdem zasilającym o mocy do 2600W z automatycznym startem po włączeniu podłączonej wiertarki, piły lub szlifierki.",
    "dailyPrice": 40.0,
    "depositAmount": 80.0,
    "condition": "GOOD",
    "rentalRules": "W zestawie adaptery do podłączenia elektronarzędzi oraz rury metalowe.",
    "neighborLoc": "400m od Ciebie • Osiedle Słoneczne, Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1655874837055-7adc909ae602?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_anna_nowak",
    "categoryId": "cat_cleaning"
  },
  {
    "id": "item_karcher_sc3_steamer",
    "title": "Parownica ciśnieniowa Kärcher SC 3 EasyFix z dyszą do fug",
    "description": "Urządzenie parowe gotowe do pracy w zaledwie 30 sekund. Czyści płytki, fugi, kabiny prysznicowe, płyty indukcyjne i baterie łazienkowe bez kropli chemii.",
    "dailyPrice": 35.0,
    "depositAmount": 70.0,
    "condition": "GOOD",
    "rentalRules": "Nalewać wyłącznie wodę z kranu lub destylowaną. Filtr odkamieniający wbudowany.",
    "neighborLoc": "500m od Ciebie • Osiedle Drabinianka, Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1782235869457-069673be2dc3?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_piotr_wisniewski",
    "categoryId": "cat_cleaning"
  },
  {
    "id": "item_karcher_sc5_steamer",
    "title": "Parownica wielofunkcyjna Kärcher SC 5 Deluxe 4.2 bar VapoHydro",
    "description": "Najmocniejsza parownica domowo-warsztatowa generująca parę o ciśnieniu 4.2 bara. Funkcja VapoHydro dodaje strumień gorącej wody do spłukiwania rozpuszczonego brudu.",
    "dailyPrice": 50.0,
    "depositAmount": 100.0,
    "condition": "GOOD",
    "rentalRules": "Świetna do dezynfekcji i doczyszczania silników, kafelków i piekarników.",
    "neighborLoc": "300m od Ciebie • Nowe Miasto, Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_jan_kowalski",
    "categoryId": "cat_cleaning"
  },
  {
    "id": "item_karcher_wv6_window",
    "title": "Myjka do okien akumulatorowa Kärcher WV 6 Plus z ssawką 280mm",
    "description": "Najwyższy model ściągaczki Kärcher z wyświetlaczem czasu pracy w minutach (do 100 min na jednym ładowaniu) i płynną silikonową listwą zbierającą wodę bez smug.",
    "dailyPrice": 20.0,
    "depositAmount": 50.0,
    "condition": "GOOD",
    "rentalRules": "W zestawie spryskiwacz z padem z mikrofibry i ładowarka sieciowa.",
    "neighborLoc": "ul. Akademicka 4 • Rejon Politechniki, Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1674471361339-f720c171ec77?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_marek_kowalski",
    "categoryId": "cat_cleaning"
  },
  {
    "id": "item_bosch_glassvac",
    "title": "Akumulatorowa myjka do okien i luster Bosch GlassVAC Solo Plus",
    "description": "Kompaktowa ściągaczka do szyb samochodowych, okien dachowych i kabin prysznicowych z piórami wycieraczek z gumy Bosch Automotive.",
    "dailyPrice": 20.0,
    "depositAmount": 50.0,
    "condition": "NEW",
    "rentalRules": "Zwrot z wymytym zbiorniczkiem na brudną wodę i naładowaną baterią.",
    "neighborLoc": "ul. Słoneczna 18 • Rejon Lwowskiej, Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1655874837055-7adc909ae602?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_anna_nowak",
    "categoryId": "cat_cleaning"
  },
  {
    "id": "item_karcher_s4_sweeper",
    "title": "Zamiatarka ręczna do kostki i chodnika Kärcher S 4 Twin 20L",
    "description": "Zamiatarka z podwójnymi szczotkami bocznymi o szerokości roboczej 680mm. Pozwala w 15 minut zamieść 500m² podjazdu z liści, piasku i pyłu 5x szybciej niż miotłą.",
    "dailyPrice": 35.0,
    "depositAmount": 70.0,
    "condition": "GOOD",
    "rentalRules": "Opróżnić kosz na śmieci przed zwrotem. Składany pałąk ułatwia transport w aucie.",
    "neighborLoc": "ul. Zielona 7 • Rejon Żwirowni, Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1718152521364-b9655b8a7926?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_piotr_wisniewski",
    "categoryId": "cat_cleaning"
  },
  {
    "id": "item_numatic_polisher_floor",
    "title": "Szorowarka jednotarczowa Numatic HFM 1515 do posadzek garażowych",
    "description": "Profesjonalna maszyna jednotarczowa 1500W do doczyszczania betonu, polimeryzacji posadzek żywicznych i gruntownego prania wykładzin. W zestawie trzymak padów i szczotka.",
    "dailyPrice": 90.0,
    "depositAmount": 250.0,
    "condition": "GOOD",
    "rentalRules": "Wymaga transportu pionowego lub z zabezpieczonym silnikiem. Waga ok. 35kg.",
    "neighborLoc": "al. Powstańców Warszawy 12 • Millenium Hall, Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_jan_kowalski",
    "categoryId": "cat_cleaning"
  },
  {
    "id": "item_stihl_rm248_mower",
    "title": "Kosiarka spalinowa z napędem Stihl RM 248 T 46cm kosz 55L",
    "description": "Zwrotna kosiarka spalinowa z 1-biegowym napędem kół. Silnik Stihl EVC 200 o łatwym rozruchu, 7-stopniowa centralna regulacja wysokości koszenia od 25 do 75mm.",
    "dailyPrice": 55.0,
    "depositAmount": 120.0,
    "condition": "GOOD",
    "rentalRules": "Zatankowana benzyną PB95 (oddać z pełnym bakiem lub rozliczyć paliwo). Wymyć spód kosiska.",
    "neighborLoc": "al. Powstańców Warszawy • Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1458245201577-fc8a130b8829?auto=format&fit=crop&w=800&q=80\", \"https://images.unsplash.com/photo-1780419748459-075ce111534a?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_marek_kowalski",
    "categoryId": "cat_garden"
  },
  {
    "id": "item_husqvarna_lc140_mower",
    "title": "Kosiarka spalinowa Husqvarna LC 140P z silnikiem 123cc",
    "description": "Kompaktowa kosiarka spalinowa na stalowej obudowie tnącej. Składany uchwyt z miękkim wyściełaniem, łożyskowane koła i kosz ze wskaźnikiem napełnienia 50L.",
    "dailyPrice": 50.0,
    "depositAmount": 100.0,
    "condition": "GOOD",
    "rentalRules": "Sprawdzić stan oleju przed uruchomieniem. Nie kosić mokrej trawy z kamieniami.",
    "neighborLoc": "Osiedle Mieszka I • Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1780419748459-075ce111534a?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_anna_nowak",
    "categoryId": "cat_garden"
  },
  {
    "id": "item_makita_dlm432_mower",
    "title": "Kosiarka akumulatorowa Makita DLM432Z 36V (2x18V) 43cm",
    "description": "Cicha i ekologiczna kosiarka bez spalin i kabla. Zasilana dwoma akumulatorami 18V LXT. 13-stopniowa regulacja wysokości, kosz 50L z tkaniny. W zestawie 4 akumulatory 5Ah.",
    "dailyPrice": 65.0,
    "depositAmount": 150.0,
    "condition": "NEW",
    "rentalRules": "W zestawie szybka podwójna ładowarka DC18RD. Zwracać ze skoszonym koszem.",
    "neighborLoc": "ul. Kwiatkowskiego • Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1458245201577-fc8a130b8829?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_piotr_wisniewski",
    "categoryId": "cat_garden"
  },
  {
    "id": "item_bosch_rotak370_mower",
    "title": "Kosiarka elektryczna Bosch Rotak 370 ER 1400W do trawnika",
    "description": "Lekka kosiarka elektryczna z innowacyjnymi grzebieniami do trawy, które umożliwiają dokładne koszenie tuż przy murkach, krawężnikach i płotach. W komplecie przedłużacz 25m.",
    "dailyPrice": 30.0,
    "depositAmount": 60.0,
    "condition": "GOOD",
    "rentalRules": "Uważać na kabel podczas pracy. Opróżnić i opłukać kosz przed zwrotem.",
    "neighborLoc": "ul. Podwisłocze • Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1780419748459-075ce111534a?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_jan_kowalski",
    "categoryId": "cat_garden"
  },
  {
    "id": "item_alko_easy_mower",
    "title": "Kosiarka spalinowa AL-KO Easy 4.20 P-S z funkcją mulczowania",
    "description": "Zwrotna kosiarka spalinowa z aerodynamiczną obudową z blachy stalowej gwarantującą optymalne napełnianie kosza. Silnik AL-KO Tech 140 OHV z primerem rozruchowym.",
    "dailyPrice": 45.0,
    "depositAmount": 100.0,
    "condition": "GOOD",
    "rentalRules": "Zwrot z oczyszczonym nożem i obudową od spodu.",
    "neighborLoc": "Osiedle Dąbrowskiego • Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1458245201577-fc8a130b8829?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_marek_kowalski",
    "categoryId": "cat_garden"
  },
  {
    "id": "item_stihl_ms180_saw",
    "title": "Pilarka łańcuchowa spalinowa Stihl MS 180 1.9 KM z prowadnicą 35cm",
    "description": "Lekka pilarka spalinowa do przygotowania drewna opałowego, ścinki mniejszych drzew oraz prac ciesielskich. Wyposażona w boczny napinacz piły łańcuchowej i kompensator.",
    "dailyPrice": 50.0,
    "depositAmount": 100.0,
    "condition": "GOOD",
    "rentalRules": "Wydaję z naostrzonym łańcuchem Stihl Picco Micro. Wymaga mieszanki paliwowej 1:50 z olejem Stihl.",
    "neighborLoc": "Rejon Szpitala Wojewódzkiego • Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80\", \"https://images.unsplash.com/photo-1474742509976-ddec6b387356?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_anna_nowak",
    "categoryId": "cat_garden"
  },
  {
    "id": "item_husqvarna_135_saw",
    "title": "Pilarka spalinowa Husqvarna 135 Mark II 2.1 KM z technologią X-Torq",
    "description": "Łatwa w uruchamianiu pilarka uniwersalna o niskim zużyciu paliwa. Pompka paliwowa, zespolona dźwignia ssania i wyłącznika zapłonu oraz system Air Injection.",
    "dailyPrice": 50.0,
    "depositAmount": 100.0,
    "condition": "GOOD",
    "rentalRules": "Paliwo i olej do smarowania prowadnicy dolewam na start. Zwracać z naciągniętym łańcuchem.",
    "neighborLoc": "Osiedle Zalesie • Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1474742509976-ddec6b387356?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_piotr_wisniewski",
    "categoryId": "cat_garden"
  },
  {
    "id": "item_makita_duc353_saw",
    "title": "Pilarka łańcuchowa akumulatorowa Makita DUC353Z 36V 35cm",
    "description": "Cicha pilarka bezszczotkowa o prędkości łańcucha 20 m/s równej piłom spalinowym. Beznarzędziowy naciąg łańcucha, automatyczne smarowanie. W zestawie 2 akumulatory 5.0Ah.",
    "dailyPrice": 60.0,
    "depositAmount": 150.0,
    "condition": "NEW",
    "rentalRules": "Idealna do prac na osiedlach i w ogródkach działkowych gdzie hałas przeszkadza sąsiadom.",
    "neighborLoc": "Osiedle Baranówka • Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1786570039258-5e8e22d5d6d0?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_jan_kowalski",
    "categoryId": "cat_garden"
  },
  {
    "id": "item_stihl_ms251_saw",
    "title": "Mocna pilarka spalinowa Stihl MS 251 3.0 KM z prowadnicą 40cm",
    "description": "Profesjonalna pilarka rolniczo-leśna o dużej mocy 3.0 KM. Bez problemu przecina pnie dębowe i bukowe o średnicy 40-50cm. Stały naciąg, zawór dekompresyjny.",
    "dailyPrice": 75.0,
    "depositAmount": 200.0,
    "condition": "GOOD",
    "rentalRules": "Wymaga doświadczenia w obsłudze pilarek o dużej mocy. Dołączam kask z ochroną słuchu i siatką.",
    "neighborLoc": "250m od Ciebie • Osiedle Akademickie, Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_marek_kowalski",
    "categoryId": "cat_garden"
  },
  {
    "id": "item_stihl_fs55_trimmer",
    "title": "Kosa spalinowa Stihl FS 55 z głowicą żyłkową i trójzębem",
    "description": "Wielofunkcyjna kosa z uchwytem oburęcznym (kierownica). W zestawie głowica żyłkowa AutoCut do trawy przy płotach oraz metalowy trójząb do zarośli, chwastów i jeżyn.",
    "dailyPrice": 45.0,
    "depositAmount": 80.0,
    "condition": "GOOD",
    "rentalRules": "W zestawie profesjonalne szelki nośne i okulary ochronne. Używać wyłącznie mieszanki 1:50.",
    "neighborLoc": "400m od Ciebie • Osiedle Słoneczne, Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1734079692079-172d8243ebd3?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_anna_nowak",
    "categoryId": "cat_garden"
  },
  {
    "id": "item_husqvarna_128r_trimmer",
    "title": "Wykaszarka spalinowa Husqvarna 128R 1.1 KM z pasami nośnymi",
    "description": "Lekka, zwinna podkaszarka spalinowa z systemem łatwego rozruchu Smart Start. Silnik E-TECH o obniżonej emisji spalin. W komplecie zapas żyłki tnącej 2.4mm.",
    "dailyPrice": 40.0,
    "depositAmount": 80.0,
    "condition": "GOOD",
    "rentalRules": "Praca w osłonie głowicy. Po zakończeniu pracy opłukać osłonę z resztek trawy.",
    "neighborLoc": "500m od Ciebie • Osiedle Drabinianka, Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1543309959-4d45288d1629?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_piotr_wisniewski",
    "categoryId": "cat_garden"
  },
  {
    "id": "item_makita_dur368_trimmer",
    "title": "Kosa akumulatorowa Makita DUR368AZ 36V z technologią ADT",
    "description": "Cicha kosa z automatyczną regulacją prędkości w zależności od gęstości chwastów. 3 biegi, bieg wsteczny do samoczynnego oczyszczania głowicy z zaplątanej trawy. Baterie w cenie.",
    "dailyPrice": 50.0,
    "depositAmount": 120.0,
    "condition": "NEW",
    "rentalRules": "Dołączam 2 naładowane akumulatory 18V 5Ah i podwójną ładowarkę.",
    "neighborLoc": "300m od Ciebie • Nowe Miasto, Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1734079692079-172d8243ebd3?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_jan_kowalski",
    "categoryId": "cat_garden"
  },
  {
    "id": "item_makita_duh523_hedge",
    "title": "Akumulatorowe nożyce do żywopłotu Makita DUH523Z 18V 52cm",
    "description": "Lekkie nożyce akumulatorowe z ostrzami szlifowanymi diamentowo. Antywibracyjna konstrukcja silnika i gumowany uchwyt chronią dłonie przed zmęczeniem. Waga tylko 3.3kg.",
    "dailyPrice": 35.0,
    "depositAmount": 70.0,
    "condition": "GOOD",
    "rentalRules": "Ostrza zakonserwowane olejem teflonowym. Zwracać z osłoną ostrza.",
    "neighborLoc": "ul. Akademicka 4 • Rejon Politechniki, Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1543309959-4d45288d1629?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_marek_kowalski",
    "categoryId": "cat_garden"
  },
  {
    "id": "item_bosch_hedge_electric",
    "title": "Nożyce elektryczne do żywopłotu Bosch UniversalHedgeCut 50",
    "description": "Wygodne nożyce elektryczne o mocy 480W z listwą tnącą 50cm i odstępem między zębami 26mm. Funkcja piłowania grubszych gałęzi na końcu ostrza.",
    "dailyPrice": 25.0,
    "depositAmount": 50.0,
    "condition": "GOOD",
    "rentalRules": "W komplecie 20-metrowy przedłużacz ogrodowy w widocznym pomarańczowym kolorze.",
    "neighborLoc": "ul. Słoneczna 18 • Rejon Lwowskiej, Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1734079692079-172d8243ebd3?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_anna_nowak",
    "categoryId": "cat_garden"
  },
  {
    "id": "item_stihl_hs45_hedge",
    "title": "Spalinowe nożyce do żywopłotu Stihl HS 45 z dwustronnym ostrzem 60cm",
    "description": "Mocne nożyce spalinowe z silnikiem 2-MIX do przycinania zdrewniałych żywopłotów grabowych, tui i ligustru. Długość cięcia 60cm zintegrowana z osłoną dłoni.",
    "dailyPrice": 50.0,
    "depositAmount": 100.0,
    "condition": "GOOD",
    "rentalRules": "Używać wyłącznie z zalaną mieszanką do silników 2-suwowych Stihl.",
    "neighborLoc": "ul. Zielona 7 • Rejon Żwirowni, Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1543309959-4d45288d1629?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_piotr_wisniewski",
    "categoryId": "cat_garden"
  },
  {
    "id": "item_stihl_bg86_blower",
    "title": "Spalinowa dmuchawa do liści Stihl BG 86 z rurą płaską i okrągłą",
    "description": "Bardzo mocna ręczna dmuchawa spalinowa generująca strumień powietrza o prędkości 85 m/s. Błyskawicznie zdmuchuje mokre liście, żołędzie, ściętą trawę i świeży śnieg.",
    "dailyPrice": 45.0,
    "depositAmount": 90.0,
    "condition": "GOOD",
    "rentalRules": "Wydaję z pełnym zbiornikiem paliwa. Dołączam nauszniki ochronne.",
    "neighborLoc": "al. Powstańców Warszawy 12 • Millenium Hall, Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1733286125300-b4c5563295ad?auto=format&fit=crop&w=800&q=80\", \"https://images.unsplash.com/photo-1779636489748-c66b48a94c39?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_jan_kowalski",
    "categoryId": "cat_garden"
  },
  {
    "id": "item_makita_dub362_blower",
    "title": "Akumulatorowa dmuchawa osiowa Makita DUB362Z 36V z 6 biegami",
    "description": "Bezemisyjna dmuchawa ogrodowa o potężnym przepływie 13.4 m³/min. 6-stopniowa regulacja siły wydmuchu pokrętłem i blokada włącznika do pracy ciągłej. 2x bateria 5Ah.",
    "dailyPrice": 45.0,
    "depositAmount": 100.0,
    "condition": "NEW",
    "rentalRules": "Idealna do sprzątania kostki brukowej, tarasów i garaży.",
    "neighborLoc": "al. Powstańców Warszawy • Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1779636489748-c66b48a94c39?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_marek_kowalski",
    "categoryId": "cat_garden"
  },
  {
    "id": "item_bosch_als25_vacuum",
    "title": "Odkurzacz i dmuchawa do liści z rozdrabniaczem Bosch ALS 25 2500W",
    "description": "Elektryczny odkurzacz ogrodowy, który zasysa liście, rozdrabnia je w stosunku 10:1 metalowym wirnikiem i zbiera do worka 45L z nieprzemakalnego materiału.",
    "dailyPrice": 30.0,
    "depositAmount": 60.0,
    "condition": "GOOD",
    "rentalRules": "Opróżnić i wysuszyć worek po zakończeniu prac. Nie zasysać kamieni ani gałęzi powyżej 1cm.",
    "neighborLoc": "Osiedle Mieszka I • Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1733286125300-b4c5563295ad?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_anna_nowak",
    "categoryId": "cat_garden"
  },
  {
    "id": "item_garden_tiller",
    "title": "Glebogryzarka spalinowa Stiga SRC 36 V 123cc 36cm",
    "description": "Zwrotna glebogryzarka spalinowa z 4 zespołami noży rotacyjnych o głębokości roboczej do 20cm. Koło transportowe ułatwia przejazd przez trawnik i chodnik.",
    "dailyPrice": 65.0,
    "depositAmount": 150.0,
    "condition": "GOOD",
    "rentalRules": "Przed pracą usunąć z gleby grube kamienie i druty. Zwracać z oczyszczonymi nożami.",
    "neighborLoc": "ul. Kwiatkowskiego • Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80\", \"https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_piotr_wisniewski",
    "categoryId": "cat_garden"
  },
  {
    "id": "item_bosch_axt25_chipper",
    "title": "Cichy frezowy rozdrabniacz do gałęzi Bosch AXT 25 TC 2500W",
    "description": "Innowacyjny rozdrabniacz z systemem Turbine-Cut, który bez problemu wciąga i kruszy gałęzie o grubości do 45mm. Zintegrowany kosz o pojemności 53L.",
    "dailyPrice": 60.0,
    "depositAmount": 150.0,
    "condition": "GOOD",
    "rentalRules": "Nie wrzucać korzeni oblepionych ziemią i kamieniami. Zwracać z pustym koszem.",
    "neighborLoc": "ul. Podwisłocze • Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_jan_kowalski",
    "categoryId": "cat_garden"
  },
  {
    "id": "item_altrad_mixer_130",
    "title": "Betoniarka wolnospadowa Altrad Spomasz MK-130 130L 230V",
    "description": "Profesjonalna polska betoniarka z wieńcem żeliwnym. Pojemność zasypowa 100L, całkowita 130L. Silnik 230V 700W z zabezpieczeniem termicznym. Duże koła ułatwiają przetaczanie.",
    "dailyPrice": 50.0,
    "depositAmount": 150.0,
    "condition": "GOOD",
    "rentalRules": "Po zakończeniu betonowania natychmiast wymyć bęben wodą z łopatą żwiru. Brak zastygniętego betonu!",
    "neighborLoc": "Osiedle Dąbrowskiego • Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1669170930713-f7c778496177?auto=format&fit=crop&w=800&q=80\", \"https://images.unsplash.com/photo-1773432114391-f85c1674b233?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_marek_kowalski",
    "categoryId": "cat_construction"
  },
  {
    "id": "item_bwe150_mixer",
    "title": "Betoniarka budowlana BWE-150 150L z wieńcem żeliwnym",
    "description": "Mocna betoniarka 1000W do intensywnych prac murarskich i posadzkarskich. Przechył bębna za pomocą koła z nożną blokadą kąta.",
    "dailyPrice": 55.0,
    "depositAmount": 150.0,
    "condition": "FAIR",
    "rentalRules": "Bęben musi być czysty przed zwrotem. Wymaga przyczepki lub busa do transportu.",
    "neighborLoc": "Rejon Szpitala Wojewódzkiego • Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1773432114391-f85c1674b233?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_anna_nowak",
    "categoryId": "cat_construction"
  },
  {
    "id": "item_collomix_xo4_mixer",
    "title": "Mieszadło elektryczne dwubiegowe Collomix Xo 4 R 1500W z mieszadłem WK",
    "description": "Niemieckie profesjonalne mieszadło do zapraw murarskich, tynków, jastrychów i klejów do płytek do 60 litrów jednorazowo. Ergonomiczne rękojeści z odbojnikami gumowymi.",
    "dailyPrice": 35.0,
    "depositAmount": 80.0,
    "condition": "GOOD",
    "rentalRules": "Wymyć mieszadło w wiadrze z wodą zaraz po zakończeniu mieszania zaprawy.",
    "neighborLoc": "Osiedle Zalesie • Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_piotr_wisniewski",
    "categoryId": "cat_construction"
  },
  {
    "id": "item_rubi_rubimix_mixer",
    "title": "Mieszarka do klejów i zapraw Rubi Rubimix-9 N 1200W",
    "description": "Wygodna mieszarka z regulacją obrotów na spuście i gwintem M14. W komplecie uniwersalne mieszadło spiralne do kleju do gresu i gładzi gipsowych.",
    "dailyPrice": 30.0,
    "depositAmount": 60.0,
    "condition": "GOOD",
    "rentalRules": "Zwrot ze zdemontowanym i wymytym mieszadłem stalowym.",
    "neighborLoc": "Osiedle Baranówka • Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1773432114391-f85c1674b233?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_jan_kowalski",
    "categoryId": "cat_construction"
  },
  {
    "id": "item_ladder_8m",
    "title": "Drabina aluminiowa 3-elementowa Krause Corda 3x9 ze stopą na schody",
    "description": "Uniwersalna drabina wielofunkcyjna Krause: przystawna, rozstawna oraz z wysuwanym trzecim elementem. Zasięg roboczy do 6.20m. Szeroki stabilizator podstawy.",
    "dailyPrice": 25.0,
    "depositAmount": 50.0,
    "condition": "GOOD",
    "rentalRules": "Transport na dachu auta z odpowiednimi pasami mocującymi. Maksymalne obciążenie 150kg.",
    "neighborLoc": "250m od Ciebie • Osiedle Akademickie, Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80\", \"https://images.unsplash.com/photo-1570050785780-3c79854c7813?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_marek_kowalski",
    "categoryId": "cat_construction"
  },
  {
    "id": "item_faraone_telescopic_ladder",
    "title": "Drabina teleskopowa Faraone Teles 4+4 szczeble z atestem EN131",
    "description": "Profesjonalna kompaktowa drabina teleskopowa składana do zaledwie 120cm. Mieści się w bagażniku samochodu osobowego. Rozkłada się do 4.10m wysokości roboczej.",
    "dailyPrice": 30.0,
    "depositAmount": 80.0,
    "condition": "NEW",
    "rentalRules": "Przed wejściem upewnić się, że wszystkie blokady szczebli zatrzasnęły się z kliknięciem.",
    "neighborLoc": "400m od Ciebie • Osiedle Słoneczne, Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1570050785780-3c79854c7813?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_anna_nowak",
    "categoryId": "cat_construction"
  },
  {
    "id": "item_krause_stabilo_joint_ladder",
    "title": "Drabina przegubowa 4x3 Krause Stabilo z podestem roboczym",
    "description": "Drabina aluminiowa łamana w 4 miejscach. Może służyć jako stabilny podest roboczy o wysokości 1m do malowania sufitów lub jako drabina przystawna o długości 3.5m.",
    "dailyPrice": 30.0,
    "depositAmount": 60.0,
    "condition": "GOOD",
    "rentalRules": "W komplecie 2 stalowe blachy pomostowe z antypoślizgową perforacją.",
    "neighborLoc": "500m od Ciebie • Osiedle Drabinianka, Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1779626963938-9d43dfcdb95c?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_piotr_wisniewski",
    "categoryId": "cat_construction"
  },
  {
    "id": "item_krause_climtec_scaffold",
    "title": "Rusztowanie jezdne aluminiowe Krause ClimTec wysokość robocza 3.0m",
    "description": "Bezpieczne rusztowanie aluminiowe z kółkami wyposażonymi w hamulce. Pomost z klapą przejściową wykonany z wodoodpornej sklejki antypoślizgowej. Montaż bez użycia narzędzi.",
    "dailyPrice": 60.0,
    "depositAmount": 200.0,
    "condition": "GOOD",
    "rentalRules": "Montaż wyłącznie zgodnie z instrukcją. Zapewniam komplet burt przypodłogowych i stężeń.",
    "neighborLoc": "300m od Ciebie • Nowe Miasto, Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_jan_kowalski",
    "categoryId": "cat_construction"
  },
  {
    "id": "item_wacker_compactor_90",
    "title": "Zagęszczarka jednokierunkowa Wacker Neuson MP15 90kg z matą do kostki",
    "description": "Niezawodna płyta wibracyjna z silnikiem benzynowym Wacker Neuson 5.5 KM. Siła odśrodkowa 15 kN. W zestawie gruba mata elastomerowa do ubijania kostki bez pęknięć.",
    "dailyPrice": 80.0,
    "depositAmount": 250.0,
    "condition": "GOOD",
    "rentalRules": "Zapewniam kółka transportowe. Transport w pozycji pionowej z zamkniętym zaworem paliwa.",
    "neighborLoc": "ul. Akademicka 4 • Rejon Politechniki, Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_marek_kowalski",
    "categoryId": "cat_construction"
  },
  {
    "id": "item_scheppach_hp1800_compactor",
    "title": "Zagęszczarka płytowa Scheppach HP1800S 102kg 23kN z podwoziem",
    "description": "Mocna zagęszczarka spalinowa do ubijania piasku, podsypki i tłucznia pod podjazdy i fundamenty. Płyta ze stali tłoczonej o wymiarach 550x440mm.",
    "dailyPrice": 75.0,
    "depositAmount": 200.0,
    "condition": "GOOD",
    "rentalRules": "Dołączam składane koła transportowe i matę poliuretanową.",
    "neighborLoc": "ul. Słoneczna 18 • Rejon Lwowskiej, Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1669170930713-f7c778496177?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_anna_nowak",
    "categoryId": "cat_construction"
  },
  {
    "id": "item_bosch_gsh11e_breaker",
    "title": "Ciężki młot wyburzeniowy Bosch GSH 11 E 1500W 16.8J SDS-Max",
    "description": "Wzorzec w klasie ciężkich młotów kujących. Energia pojedynczego udaru 16.8J pozwala na szybkie skuwanie grubych posadzek betonowych, ław i stropów. W zestawie 2 dłuta i szpicak.",
    "dailyPrice": 70.0,
    "depositAmount": 200.0,
    "condition": "GOOD",
    "rentalRules": "Smarować uchwyt SDS-Max przed każdym wpięciem osprzętu. Dłuta regularnie chłodzić.",
    "neighborLoc": "ul. Zielona 7 • Rejon Żwirowni, Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_piotr_wisniewski",
    "categoryId": "cat_construction"
  },
  {
    "id": "item_makita_hm1203_breaker",
    "title": "Młot wyburzeniowy Makita HM1203C 1510W SDS-Max 19.1J",
    "description": "Młot udarowy z układem łagodnego rozruchu i stabilizacją obrotów pod obciążeniem. 12 pozycji ustawienia dłuta, kontrolka serwisowa szczotek węglowych.",
    "dailyPrice": 70.0,
    "depositAmount": 200.0,
    "condition": "GOOD",
    "rentalRules": "W komplecie walizka z kółkami, dłuto płaskie szerokie i szpicak samoostrzący.",
    "neighborLoc": "al. Powstańców Warszawy 12 • Millenium Hall, Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_jan_kowalski",
    "categoryId": "cat_construction"
  },
  {
    "id": "item_scheppach_ab1600_breaker",
    "title": "Młot udarowy wyburzeniowy Scheppach AB1600 50J z walizką metalową",
    "description": "Ekstremalna energia uderzenia 50 dżuli na uchwyt sześciokątny HEX 30mm. Stworzony do najcięższych rozbiórek fundamentów, skarp i betonu zbrojonego.",
    "dailyPrice": 65.0,
    "depositAmount": 150.0,
    "condition": "FAIR",
    "rentalRules": "Waga sprzętu to 17kg. W zestawie dłuto płaskie i szpic HEX 30mm.",
    "neighborLoc": "al. Powstańców Warszawy • Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_marek_kowalski",
    "categoryId": "cat_construction"
  },
  {
    "id": "item_rubi_du200_tile_cutter",
    "title": "Elektryczna przecinarka stolikowa do glazury Rubi DU-200 EVO z wodą",
    "description": "Przecinarka z przesuwną głowicą silnika do płytek ściennych, podłogowych i gresu o długości do 65cm. Zintegrowana pompka wody z filtrem zapewnia cięcie bezpyłowe.",
    "dailyPrice": 50.0,
    "depositAmount": 120.0,
    "condition": "GOOD",
    "rentalRules": "Po zakończeniu pracy wylać wodę z koryta i przepłukać pompkę czystą wodą.",
    "neighborLoc": "Osiedle Mieszka I • Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1642006953663-06f0387f5652?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_anna_nowak",
    "categoryId": "cat_construction"
  },
  {
    "id": "item_norton_clipper_tile",
    "title": "Przecinarka do płytek Norton Clipper TT200 EM z tarczą diamentową",
    "description": "Zwarta przecinarka stołowa z uchylnym stołem do fazowania krawędzi pod kątem 45° (jolly). Doskonała do precyzyjnego docinania płytek w łazience.",
    "dailyPrice": 40.0,
    "depositAmount": 80.0,
    "condition": "GOOD",
    "rentalRules": "Zapewniam wysokiej klasy tarczę diamentową z ciągłym wieńcem do czystego cięcia gresu.",
    "neighborLoc": "ul. Kwiatkowskiego • Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_piotr_wisniewski",
    "categoryId": "cat_construction"
  },
  {
    "id": "item_bosch_gnf35_wall_chaser",
    "title": "Bruzdownica do ścian z odsysaniem pyłu Bosch GNF 35 CA 1400W",
    "description": "Specjalistyczne elektronarzędzie do wycinania rowków pod kable elektryczne i rurki instalacyjne w betonie i cegle. Szerokość bruzdy do 39mm, głębokość do 35mm.",
    "dailyPrice": 55.0,
    "depositAmount": 120.0,
    "condition": "GOOD",
    "rentalRules": "Wymaga podłączenia odkurzacza przemysłowego z filtrem klasy M. W zestawie 2 tarcze diamentowe.",
    "neighborLoc": "ul. Podwisłocze • Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1598302936625-6075fbd98dd7?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_jan_kowalski",
    "categoryId": "cat_construction"
  },
  {
    "id": "item_magnum_mig208_welder",
    "title": "Spawarka inwertorowa MIG/MAG/MMA Magnum MIG 208 Alu Synergia 200A",
    "description": "Zaawansowany półautomat spawalniczy z programami synergicznymi do spawania stali czarnej, nierdzewnej oraz aluminium. Zasilanie 230V, wyświetlacz LCD, prąd 200A w cyklu 60%.",
    "dailyPrice": 65.0,
    "depositAmount": 150.0,
    "condition": "GOOD",
    "rentalRules": "W zestawie uchwyt spawalniczy MB15 3m, przewód masowy i reduktor gazu. Drut we własnym zakresie.",
    "neighborLoc": "Osiedle Dąbrowskiego • Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=800&q=80\", \"https://images.unsplash.com/photo-1683470156390-703e9313dab6?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_marek_kowalski",
    "categoryId": "cat_workshop"
  },
  {
    "id": "item_spartus_easymig_210",
    "title": "Półautomat spawalniczy Spartus EasyMIG 210 z butlą Mix Ar/CO2",
    "description": "Kompaktowy migomat inwertorowy z płynną regulacją indukcyjności (lutospawanie ocynku). Dołączam pełną butlę gazu osłonowego 8L Ar/CO2.",
    "dailyPrice": 75.0,
    "depositAmount": 200.0,
    "condition": "NEW",
    "rentalRules": "Butla zalegalizowana z kołpakiem ochronnym na czas transportu. Zwrot z kompletnym osprzętem.",
    "neighborLoc": "Rejon Szpitala Wojewódzkiego • Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1683470156390-703e9313dab6?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_anna_nowak",
    "categoryId": "cat_workshop"
  },
  {
    "id": "item_bester_mma_welder",
    "title": "Spawarka inwertorowa elektrodowa Bester MMA 160A w walizce",
    "description": "Lekka (tylko 4.5kg) spawarka elektrodowa z funkcjami Hot Start, Arc Force oraz Anti Stick. Doskonała do naprawy furtek, przęseł ogrodzeniowych i profili w terenie.",
    "dailyPrice": 35.0,
    "depositAmount": 70.0,
    "condition": "GOOD",
    "rentalRules": "Działa z elektrodami rutylowymi i zasadowymi 1.6-4.0mm. Kable miedziane 3m w zestawie.",
    "neighborLoc": "Osiedle Zalesie • Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1648815546030-6a5792d4fa38?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_piotr_wisniewski",
    "categoryId": "cat_workshop"
  },
  {
    "id": "item_speedglas_helmet",
    "title": "Przyłbica spawalnicza automatyczna 3M Speedglas 9100X True-View",
    "description": "Najwyższej klasy maska samościemniająca z polem widzenia 54x107mm i naturalnym odwzorowaniem kolorów. Płynna regulacja stopnia zaciemnienia DIN 5, 8, 9-13.",
    "dailyPrice": 30.0,
    "depositAmount": 80.0,
    "condition": "GOOD",
    "rentalRules": "Nie czyścić szybki rozpuszczalnikami. W komplecie zapasowa szybka ochronna poliwęglanowa.",
    "neighborLoc": "Osiedle Baranówka • Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_jan_kowalski",
    "categoryId": "cat_workshop"
  },
  {
    "id": "item_scheppach_hc53dc_compressor",
    "title": "Kompresor olejowy dwutłokowy Scheppach HC53DC 50L 10 bar 412 l/min",
    "description": "Bardzo wydajna sprężarka z układem cylindrów V. Zbiornik 50 litrów, ciśnienie 10 bar, wysoka wydajność efektywna na wyjściu. Obsłuży klucze udarowe, pistolety i ropowownice.",
    "dailyPrice": 45.0,
    "depositAmount": 100.0,
    "condition": "GOOD",
    "rentalRules": "Transport wyłącznie w pozycji stojącej, aby zapobiec wyciekowi oleju ze sprężarki.",
    "neighborLoc": "250m od Ciebie • Osiedle Akademickie, Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80\", \"https://images.unsplash.com/photo-1655165312002-9d781ad4046e?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_marek_kowalski",
    "categoryId": "cat_workshop"
  },
  {
    "id": "item_stanley_silent_compressor",
    "title": "Wyciszony kompresor bezolejowy Stanley Fatmax 24L 8 bar (59 dB)",
    "description": "Cichobieżna sprężarka o poziomie głośności zaledwie 59 dB (cichsza niż normalna rozmowa!). Idealna do przedmuchiwania, pompowania kół i zasilania zszywaczy w mieszkaniu.",
    "dailyPrice": 35.0,
    "depositAmount": 80.0,
    "condition": "NEW",
    "rentalRules": "Kompresor bezolejowy — nie wymaga wymiany oleju. W zestawie wąż spiralny 10m i pistolet z manometrem.",
    "neighborLoc": "400m od Ciebie • Osiedle Słoneczne, Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1655165312002-9d781ad4046e?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_anna_nowak",
    "categoryId": "cat_workshop"
  },
  {
    "id": "item_yato_toolkit_216",
    "title": "Zestaw kluczy nasadowych Yato YT-38841 216 elementów CrV 1/2, 3/8, 1/4",
    "description": "Kompletny profesjonalny zestaw narzędziowy z 3 grzechotkami o 72 zębach, nasadkami krótkimi, długimi, Torx, E-Torx, bitami oraz kluczami płasko-oczkowymi w solidnej walizce.",
    "dailyPrice": 30.0,
    "depositAmount": 60.0,
    "condition": "GOOD",
    "rentalRules": "Zwrot kompletnego zestawu — weryfikacja wszystkich elementów przy odbiorze i zwrocie.",
    "neighborLoc": "500m od Ciebie • Osiedle Drabinianka, Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=800&q=80\", \"https://images.unsplash.com/photo-1581783898377-1c85bf937427?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_piotr_wisniewski",
    "categoryId": "cat_workshop"
  },
  {
    "id": "item_proxxon_torque_wrench",
    "title": "Zestaw kluczy dynamometrycznych Proxxon MicroClick 40-200Nm i 6-30Nm",
    "description": "Precyzyjne klucze dynamometryczne z certyfikatem kalibracji zgodnym z normą ISO 6789. Niezbędne przy dokręcaniu kół samochodowych, głowic silników oraz rowerów carbonowych.",
    "dailyPrice": 35.0,
    "depositAmount": 80.0,
    "condition": "NEW",
    "rentalRules": "Po zakończeniu pracy ZAWSZE zresetować nastawę sprężyny na wartość minimalną.",
    "neighborLoc": "300m od Ciebie • Nowe Miasto, Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1581783898377-1c85bf937427?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_jan_kowalski",
    "categoryId": "cat_workshop"
  },
  {
    "id": "item_bosch_bench_grinder",
    "title": "Szlifierka stołowa dwutarczowa Bosch Professional GBG 35-15 350W",
    "description": "Solidna szlifierka warsztatowa z odlewaną obudową i bezszczotkowym silnikiem indukcyjnym. W komplecie tarcza gruboziarnista do ostrzenia siekier i drobnoziarnista do wierteł.",
    "dailyPrice": 25.0,
    "depositAmount": 50.0,
    "condition": "GOOD",
    "rentalRules": "Używać z przezroczystymi szybkami ochronnymi. Nie szlifować aluminium na sucho.",
    "neighborLoc": "ul. Akademicka 4 • Rejon Politechniki, Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1598302936625-6075fbd98dd7?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_marek_kowalski",
    "categoryId": "cat_workshop"
  },
  {
    "id": "item_bison_vise_150",
    "title": "Imadło ślusarskie obrotowe Bison-Bial 150mm hartowane ze staliwa",
    "description": "Ciężkie (25kg) imadło polskiej produkcji z podstawą obrotową 360° i hartowanymi wymiennymi wkładkami szczękowymi. Potężna siła ścisku bez ryzyka pęknięcia korpusu.",
    "dailyPrice": 30.0,
    "depositAmount": 100.0,
    "condition": "GOOD",
    "rentalRules": "Mocowane na 4 śruby M12 do blatu stołu warsztatowego. Nie bić młotkiem po śrubie pociągowej.",
    "neighborLoc": "ul. Słoneczna 18 • Rejon Lwowskiej, Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1783309239756-168e747dde35?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_anna_nowak",
    "categoryId": "cat_workshop"
  },
  {
    "id": "item_yato_jack_3t",
    "title": "Podnośnik hydrauliczny niskoprofilowy 'żaba' Yato 3T z 2 kobyłkami",
    "description": "Podnośnik warsztatowy z profilem wejścia od zaledwie 75mm (obsłuży obniżone zawieszenia) z podwójną pompą Quick Lift. W komplecie 2 kobyłki warsztatowe z zapadkami 3T.",
    "dailyPrice": 35.0,
    "depositAmount": 80.0,
    "condition": "GOOD",
    "rentalRules": "Podnosić wyłącznie w wyznaczonych punktach podwozia. Po podniesieniu zawsze zabezpieczyć kobyłkami!",
    "neighborLoc": "ul. Zielona 7 • Rejon Żwirowni, Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1787509113202-e44284ee6577?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_piotr_wisniewski",
    "categoryId": "cat_workshop"
  },
  {
    "id": "item_jonnesway_spring_compressor",
    "title": "Zestaw ściągaczy do sprężyn zawieszenia i łożysk Jonnesway",
    "description": "Kute ściągacze do sprężyn kolumn MacPhersona z blokadami zabezpieczającymi przed zsunięciem. W walizce również uniwersalny zestaw ściągaczy 2 i 3-ramiennych do łożysk.",
    "dailyPrice": 30.0,
    "depositAmount": 70.0,
    "condition": "GOOD",
    "rentalRules": "Gwinty ściągaczy regularnie smarować smarem stałym. Nie używać z kluczami udarowymi pneumatycznymi.",
    "neighborLoc": "al. Powstańców Warszawy 12 • Millenium Hall, Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_jan_kowalski",
    "categoryId": "cat_workshop"
  },
  {
    "id": "item_wagner_control_250",
    "title": "Agregat malarski hydrodynamiczny bezpowietrzny Wagner Control Pro 250 M",
    "description": "Nowoczesny agregat bezpowietrzny z technologią High Efficiency Airless (HEA), która zmniejsza pylenie farby aż o 55%. Maluje ściany wewnętrzne, elewacje i ogrodzenia z prędkością 15 m²/min.",
    "dailyPrice": 90.0,
    "depositAmount": 250.0,
    "condition": "GOOD",
    "rentalRules": "Zwrot idealnie wymytego agregatu, pistoletu i dyszy. Zapewniam płyn konserwujący EasyClean.",
    "neighborLoc": "al. Powstańców Warszawy • Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=800&q=80\", \"https://images.unsplash.com/photo-1666009387246-65e8ad8e7103?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_marek_kowalski",
    "categoryId": "cat_painting"
  },
  {
    "id": "item_graco_gx21_sprayer",
    "title": "Profesjonalny agregat malarski Graco GX 21 z wężem BlueMax 15m",
    "description": "Agregat z pompą tłokową ProXChange do farb lateksowych, akrylowych i emulsji. Ciśnienie robocze do 207 bar umożliwia natrysk gęstych farb bez rozcieńczania.",
    "dailyPrice": 120.0,
    "depositAmount": 300.0,
    "condition": "GOOD",
    "rentalRules": "Wymaga starannego płukania po zakończeniu malowania. Dołączam pistolet SG3 i dyszę RAC X.",
    "neighborLoc": "Osiedle Mieszka I • Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1666009387246-65e8ad8e7103?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_anna_nowak",
    "categoryId": "cat_painting"
  },
  {
    "id": "item_flex_ge5_giraffe",
    "title": "Szlifierka do gipsu 'żyrafa' Flex GE 5 z głowicą okrągłą i torbą",
    "description": "Oryginalna niemiecka żyrafa Flex o wadze tylko 3.9kg z optymalnym wyważeniem. Elastyczny wał napędowy i obrotowa głowica szlifująca idealnie przylega do ścian i sufitów.",
    "dailyPrice": 55.0,
    "depositAmount": 120.0,
    "condition": "GOOD",
    "rentalRules": "Wypożyczana z wężem antystatycznym do odkurzacza. Papiery ścierne na rzep 225mm w różnych gradacjach.",
    "neighborLoc": "ul. Kwiatkowskiego • Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1559295758-d77a698a2dff?auto=format&fit=crop&w=800&q=80\", \"https://images.unsplash.com/photo-1642006953665-4046190641ee?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_piotr_wisniewski",
    "categoryId": "cat_painting"
  },
  {
    "id": "item_mirka_leros_sander",
    "title": "Szlifierka bezszczotkowa do ścian i sufitów Mirka LEROS 225mm z odkurzaczem",
    "description": "Najlżejsza na rynku szlifierka ścienna (3.5kg) z silnikiem bezszczotkowym i oscylacją 5mm. Głowica ruchoma w zakresie 180° pozwala na gładkie przejścia bez rys na gładzi.",
    "dailyPrice": 90.0,
    "depositAmount": 250.0,
    "condition": "NEW",
    "rentalRules": "Działa z siatkami ściernymi Abranet. W komplecie dedykowany wąż z kablem zintegrowanym.",
    "neighborLoc": "ul. Podwisłocze • Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1642006953665-4046190641ee?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_jan_kowalski",
    "categoryId": "cat_painting"
  },
  {
    "id": "item_steinel_hl1920_heatgun",
    "title": "Opalarka elektryczna z regulacją cyfrową Steinel HL 1920 E 2000W",
    "description": "Elektronicznie sterowana opalarka z 9-stopniową regulacją temperatury od 80 do 600°C na pokrętle. Niezastąpiona przy usuwaniu farb, zgrzewaniu folii, zginaniu rur PVC i oklejaniu aut.",
    "dailyPrice": 25.0,
    "depositAmount": 50.0,
    "condition": "GOOD",
    "rentalRules": "Przed wyłączeniem schłodzić urządzenie na biegu zimnego powietrza. W zestawie dysza redukcyjna i płaska.",
    "neighborLoc": "Osiedle Dąbrowskiego • Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1674485190969-4347f72aad0e?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_marek_kowalski",
    "categoryId": "cat_painting"
  },
  {
    "id": "item_bosch_ghg2366_heatgun",
    "title": "Opalarka profesjonalna Bosch GHG 23-66 2300W z wyświetlaczem LCD",
    "description": "Precyzyjna opalarka z cyfrową regulacją temperatury co 10°C na wyświetlaczu LCD. 10 biegów nadmuchu, pamięć programów roboczych i automatyczne wyłączanie przy przegrzaniu.",
    "dailyPrice": 30.0,
    "depositAmount": 60.0,
    "condition": "GOOD",
    "rentalRules": "Zapewniam 4 dysze specjalistyczne (reflektorowa, powierzchniowa, redukcyjna, szczelinowa).",
    "neighborLoc": "Rejon Szpitala Wojewódzkiego • Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1674485190969-4347f72aad0e?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_anna_nowak",
    "categoryId": "cat_painting"
  },
  {
    "id": "item_bosch_pfs5000_sprayer",
    "title": "Uniwersalny system natryskowy HVLP Bosch PFS 5000 E 1200W",
    "description": "Pistolet natryskowy z technologią ALLPaint do lakierowania drewna, bejcowania, lakierobejc oraz natrysku farb ściennych. Dwa zbiorniki 1000ml z systemem ConstantFeed.",
    "dailyPrice": 40.0,
    "depositAmount": 80.0,
    "condition": "GOOD",
    "rentalRules": "Po użyciu pistolet i dyszę należy natychmiast dokładnie umyć rozcieńczalnikiem lub wodą.",
    "neighborLoc": "Osiedle Zalesie • Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_piotr_wisniewski",
    "categoryId": "cat_painting"
  },
  {
    "id": "item_makita_dbn500_nailer",
    "title": "Akumulatorowa gwoździarka wykończeniowa Makita DBN500Z 18V",
    "description": "Sztyfciarka na sztyfty 1.2mm (18Ga) o długości od 15 do 50mm. Beznarzędziowe ustawianie głębokości wbijania, tryb pojedynczy i sekwencyjny. Bateria 18V 3Ah i ładowarka.",
    "dailyPrice": 45.0,
    "depositAmount": 100.0,
    "condition": "GOOD",
    "rentalRules": "Idealna do montażu listew przypodłogowych, boazerii i ościeżnic bez widocznych śladów po gwoździach.",
    "neighborLoc": "Osiedle Baranówka • Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1622044939413-0b829c342434?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_jan_kowalski",
    "categoryId": "cat_painting"
  },
  {
    "id": "item_bostitch_stapler_air",
    "title": "Zszywacz tapicerski pneumatyczny Bostitch 21684B do mebli i tkanin",
    "description": "Lekki profesjonalny zszywacz pneumatyczny na zszywki tapicerskie typ 80 (szerokość 12.8mm, długość 4-16mm). Tłumik hałasu w tylnej części korpusu.",
    "dailyPrice": 25.0,
    "depositAmount": 50.0,
    "condition": "GOOD",
    "rentalRules": "Wymaga zasilania ze sprężarki (ciśnienie 4-7 bar). Wpuszczać kroplę oleju pneumatycznego przed pracą.",
    "neighborLoc": "250m od Ciebie • Osiedle Akademickie, Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1783309239756-168e747dde35?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_marek_kowalski",
    "categoryId": "cat_painting"
  },
  {
    "id": "item_bosch_gll380_laser",
    "title": "Laser krzyżowy 3x360° Bosch GLL 3-80 C z tyczką BT 350 i Bluetooth",
    "description": "Jednoczesne wyznaczanie 1 linii poziomej i 2 pionowych w promieniu 360°. Sterowanie ze smartfona przez aplikację Bosch Levelling Remote. W komplecie tyczka rozporowa do 3.5m.",
    "dailyPrice": 50.0,
    "depositAmount": 120.0,
    "condition": "NEW",
    "rentalRules": "Sprzęt precyzyjny — transportować wyłącznie z zablokowanym wahadłem kompensatora.",
    "neighborLoc": "400m od Ciebie • Osiedle Słoneczne, Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80\", \"https://images.unsplash.com/photo-1670511146782-8f52c5a7bd08?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_anna_nowak",
    "categoryId": "cat_measuring"
  },
  {
    "id": "item_dewalt_green_laser",
    "title": "Zielony laser wieloliniowy DeWalt DCE089D1G 3x360° 10.8V z odbiornikiem",
    "description": "Laser z wiązką zieloną 4x lepiej widoczną dla ludzkiego oka niż wiązka czerwona. Zasięg do 30m bez detektora i do 60m z odbiornikiem dołączonym w zestawie.",
    "dailyPrice": 60.0,
    "depositAmount": 150.0,
    "condition": "GOOD",
    "rentalRules": "W komplecie bateria 10.8V 2Ah, ładowarka, uchwyt z magnesami neodymowymi i walizka TSTAK.",
    "neighborLoc": "500m od Ciebie • Osiedle Drabinianka, Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1670511146782-8f52c5a7bd08?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_piotr_wisniewski",
    "categoryId": "cat_measuring"
  },
  {
    "id": "item_bosch_glm50_disto",
    "title": "Dalmierz laserowy Bosch GLM 50-27 C z Bluetooth i celownikiem cyfrowym",
    "description": "Odporny na upadki z 1.5m dalmierz laserowy z certyfikatem IP65. Pomiar odległości, powierzchni, kubatury, kątów nachylenia oraz funkcja wytyczania odcinków.",
    "dailyPrice": 25.0,
    "depositAmount": 50.0,
    "condition": "GOOD",
    "rentalRules": "Zapewniam komplet baterii AAA. Zwracać w oryginalnym pokrowcu na pasek.",
    "neighborLoc": "300m od Ciebie • Nowe Miasto, Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1754941622138-b3c3671f2fa8?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_jan_kowalski",
    "categoryId": "cat_measuring"
  },
  {
    "id": "item_leica_disto_d2",
    "title": "Precyzyjny dalmierz laserowy Leica DISTO D2 z Bluetooth Smart do 100m",
    "description": "Szwajcarski dalmierz o dokładności ±1.5mm. Automatyczna stopka do pomiarów z narożników i krawędzi, podświetlany 3-liniowy wyświetlacz i funkcja Pitagorasa.",
    "dailyPrice": 30.0,
    "depositAmount": 70.0,
    "condition": "NEW",
    "rentalRules": "Aplikacja Leica DISTO Plan umożliwia automatyczne tworzenie planów pomieszczeń na tablecie.",
    "neighborLoc": "ul. Akademicka 4 • Rejon Politechniki, Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_marek_kowalski",
    "categoryId": "cat_measuring"
  },
  {
    "id": "item_bosch_gic120_endoscope",
    "title": "Kamera inspekcyjna z ekranem kolorowym Bosch GIC 120 C endoskop 8.5mm",
    "description": "Wodoodporna kamera (IP67) na elastycznym kablu 120cm z oświetleniem LED i funkcją Compass View (orientacja góra/dół). Zapis zdjęć i filmów na karcie MicroSD.",
    "dailyPrice": 45.0,
    "depositAmount": 100.0,
    "condition": "GOOD",
    "rentalRules": "Niezastąpiona przy inspekcji rur odpływowych, profili pod gips-kartonem i silników aut.",
    "neighborLoc": "ul. Słoneczna 18 • Rejon Lwowskiej, Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1754941622138-b3c3671f2fa8?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_anna_nowak",
    "categoryId": "cat_measuring"
  },
  {
    "id": "item_bosch_gms120_detector",
    "title": "Cyfrowy detektor kabli, rur i profili Bosch Professional GMS 120",
    "description": "Najpopularniejszy detektor uniwersalny na rynku z automatyczną kalibracją. Wykrywa metale żelazne do 120mm, metale kolorowe do 80mm oraz przewody pod napięciem do 50mm.",
    "dailyPrice": 25.0,
    "depositAmount": 50.0,
    "condition": "GOOD",
    "rentalRules": "Dioda LED sygnalizuje zielonym, żółtym lub czerwonym światłem miejsce bezpieczne do wiercenia.",
    "neighborLoc": "ul. Zielona 7 • Rejon Żwirowni, Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1670511146782-8f52c5a7bd08?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_piotr_wisniewski",
    "categoryId": "cat_measuring"
  },
  {
    "id": "item_walabot_diy2_scanner",
    "title": "Skaner ścienny z radarem 3D Walabot DIY 2 do rur i drewna",
    "description": "Innowacyjny radar ścienny łączący się bezprzewodowo ze smartfonem iOS/Android. Wyświetla dokładny obraz 3D tego co kryje się w ścianie: kable, rury PVC, profile i gryzonie.",
    "dailyPrice": 35.0,
    "depositAmount": 80.0,
    "condition": "NEW",
    "rentalRules": "Wymaga pobrania darmowej aplikacji Walabot na swój telefon. W zestawie kabel ładujący.",
    "neighborLoc": "al. Powstańców Warszawy 12 • Millenium Hall, Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1754941622138-b3c3671f2fa8?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_jan_kowalski",
    "categoryId": "cat_measuring"
  },
  {
    "id": "item_bosch_gtc400_thermal",
    "title": "Kamera termowizyjna Bosch GTC 400 C z transmisją obrazu Wi-Fi",
    "description": "Profesjonalna kamera termowizyjna z matrycą 160x120px mierząca temperatury od -10°C do +400°C. Nakłada obraz termiczny na zdjęcie rzeczywiste, lokalizując mostki cieplne i wycieki z podłogówki.",
    "dailyPrice": 95.0,
    "depositAmount": 300.0,
    "condition": "GOOD",
    "rentalRules": "Sprzęt o wysokiej wartości — wydawany z dedykowanym twardym etui transportowym i akumulatorem 12V.",
    "neighborLoc": "al. Powstańców Warszawy • Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_marek_kowalski",
    "categoryId": "cat_measuring"
  },
  {
    "id": "item_stanley_stair_truck",
    "title": "Wózek schodowy 6-kołowy Stanley SXWTD-FT521 120kg składany",
    "description": "Wózek transportowy z 3-kołowym systemem gwiazdowym ułatwiającym wnoszenie pralek, lodówek i paczek po schodach. Aluminiowa rama składana na płasko do transportu w bagażniku.",
    "dailyPrice": 25.0,
    "depositAmount": 50.0,
    "condition": "GOOD",
    "rentalRules": "Maksymalny udźwig na schodach 120kg. W zestawie elastyczny pas mocujący ładunek.",
    "neighborLoc": "Osiedle Mieszka I • Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1787509113202-e44284ee6577?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_anna_nowak",
    "categoryId": "cat_transport"
  },
  {
    "id": "item_meister_platform_cart",
    "title": "Wózek platformowy magazynowy Meister 300kg z gumowaną płytą",
    "description": "Solidny wózek platformowy 90x60cm ze składaną rączką i 2 skrętnymi kołami z hamulcem. Powierzchnia antypoślizgowa zapobiega przesuwaniu się kartonów i worków z cementem.",
    "dailyPrice": 20.0,
    "depositAmount": 50.0,
    "condition": "GOOD",
    "rentalRules": "Koła niebrudzące posadzki. Zwracać z oczyszczoną platformą transportową.",
    "neighborLoc": "ul. Kwiatkowskiego • Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1715274036728-4385d95a5e9f?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_piotr_wisniewski",
    "categoryId": "cat_transport"
  },
  {
    "id": "item_pallet_jack_zakrem",
    "title": "Ręczny wózek paletowy 'paleciak' Zakrem WRU4-2200 2.2T widły 1150mm",
    "description": "Niezawodny polski paleciak o udźwigu 2200kg na standardowe europalety 120x80cm. Podwójne rolki poliuretanowe przy widłach zapewniają cichy bieg i łatwy wjazd pod paletę.",
    "dailyPrice": 40.0,
    "depositAmount": 100.0,
    "condition": "GOOD",
    "rentalRules": "Nie przekraczać dopuszczalnego udźwigu 2.2T. Nie przewozić ludzi.",
    "neighborLoc": "ul. Podwisłocze • Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1787509113202-e44284ee6577?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_jan_kowalski",
    "categoryId": "cat_transport"
  },
  {
    "id": "item_drywall_lifter_gk",
    "title": "Podnośnik płyt gipsowo-kartonowych GK do 3.5m z kółkami",
    "description": "Stojak z wciągarką linową umożliwiający samodzielny montaż płyt gipsowych na sufitach i skosach poddasza przez jedną osobę. Rozkłada się na 3 części do przewiezienia.",
    "dailyPrice": 30.0,
    "depositAmount": 70.0,
    "condition": "GOOD",
    "rentalRules": "Wszystkie koła posiadają blokady postojowe. Nie zrzucać płyt na siłę.",
    "neighborLoc": "Osiedle Dąbrowskiego • Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_marek_kowalski",
    "categoryId": "cat_transport"
  },
  {
    "id": "item_straps_set_5t",
    "title": "Zestaw 4 pasów transportowych z napinaczem 5T 8m z atestem GS/TUV",
    "description": "Komplet 4 profesjonalnych 2-częściowych pasów ściągających o szerokości 50mm i sile mocowania 5000 daN. Atestowana etykieta zgodna z normą EN 12195-2.",
    "dailyPrice": 20.0,
    "depositAmount": 50.0,
    "condition": "NEW",
    "rentalRules": "Pasy nieposzarpane, w stanie idealnym. Nie przeciągać po ostrych krawędziach bez ochraniaczy.",
    "neighborLoc": "Rejon Szpitala Wojewódzkiego • Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1426927308491-6380b6a9936f?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_anna_nowak",
    "categoryId": "cat_transport"
  },
  {
    "id": "item_aluminum_ramps_pair",
    "title": "Rampy najazdowe aluminiowe składane 400kg 200cm (komplet 2 sztuki)",
    "description": "Lekkie profile aluminiowe z ząbkowaną powierzchnią antypoślizgową do wprowadzania kosiarek traktorków, quadów, glebogryzarek i motocykli na przyczepkę lub do vana.",
    "dailyPrice": 35.0,
    "depositAmount": 80.0,
    "condition": "GOOD",
    "rentalRules": "Maksymalny nacisk na oś 400kg. Dołączam pasy zabezpieczające rampy przed zsunięciem z burty.",
    "neighborLoc": "Osiedle Zalesie • Rzeszów",
    "imagesJson": "[\"https://images.unsplash.com/photo-1715274036728-4385d95a5e9f?auto=format&fit=crop&w=800&q=80\"]",
    "isAvailable": true,
    "ownerId": "usr_piotr_wisniewski",
    "categoryId": "cat_transport"
  }
];

const RENTALS: RentalSeed[] = [
  {
    "id": "rental_dewalt_001",
    "itemId": "item_dewalt_drill",
    "renterId": "usr_anna_nowak",
    "startDate": "2026-10-15T10:00:00.000Z",
    "endDate": "2026-10-18T10:00:00.000Z",
    "days": 3,
    "ownerAmount": 114.75,
    "commissionAmount": 20.25,
    "depositAmount": 100.0,
    "totalPaid": 135.0,
    "status": "RETURNED",
    "pickupPin": "7342"
  },
  {
    "id": "rental_karcher_001",
    "itemId": "item_karcher_k5",
    "renterId": "usr_piotr_wisniewski",
    "startDate": "2026-10-20T10:00:00.000Z",
    "endDate": "2026-10-23T10:00:00.000Z",
    "days": 3,
    "ownerAmount": 153.0,
    "commissionAmount": 27.0,
    "depositAmount": 150.0,
    "totalPaid": 180.0,
    "status": "RETURNED",
    "pickupPin": "4819"
  },
  {
    "id": "rental_saw_001",
    "itemId": "item_stihl_ms251_saw",
    "renterId": "usr_piotr_wisniewski",
    "startDate": "2026-10-24T09:00:00.000Z",
    "endDate": "2026-10-26T09:00:00.000Z",
    "days": 2,
    "ownerAmount": 110.5,
    "commissionAmount": 19.5,
    "depositAmount": 150.0,
    "totalPaid": 130.0,
    "status": "RETURNED",
    "pickupPin": "9021"
  },
  {
    "id": "rental_giraffe_001",
    "itemId": "item_flex_ge5_giraffe",
    "renterId": "usr_jan_kowalski",
    "startDate": "2026-10-27T08:00:00.000Z",
    "endDate": "2026-10-29T08:00:00.000Z",
    "days": 2,
    "ownerAmount": 119.0,
    "commissionAmount": 21.0,
    "depositAmount": 200.0,
    "totalPaid": 140.0,
    "status": "RETURNED",
    "pickupPin": "3154"
  },
  {
    "id": "rental_laser_001",
    "itemId": "item_bosch_gll380_laser",
    "renterId": "usr_marek_kowalski",
    "startDate": "2026-11-01T10:00:00.000Z",
    "endDate": "2026-11-03T10:00:00.000Z",
    "days": 2,
    "ownerAmount": 93.5,
    "commissionAmount": 16.5,
    "depositAmount": 150.0,
    "totalPaid": 110.0,
    "status": "RETURNED",
    "pickupPin": "6628"
  },
  {
    "id": "rental_active_001",
    "itemId": "item_makita_dlm432_mower",
    "renterId": "usr_anna_nowak",
    "startDate": "2026-11-08T09:00:00.000Z",
    "endDate": "2026-11-11T09:00:00.000Z",
    "days": 3,
    "ownerAmount": 127.5,
    "commissionAmount": 22.5,
    "depositAmount": 150.0,
    "totalPaid": 150.0,
    "status": "ACTIVE",
    "pickupPin": "1945"
  },
  {
    "id": "rental_approved_001",
    "itemId": "item_bester_mma_welder",
    "renterId": "usr_jan_kowalski",
    "startDate": "2026-11-14T09:00:00.000Z",
    "endDate": "2026-11-16T09:00:00.000Z",
    "days": 2,
    "ownerAmount": 76.5,
    "commissionAmount": 13.5,
    "depositAmount": 100.0,
    "totalPaid": 90.0,
    "status": "APPROVED",
    "pickupPin": "8321"
  }
];

const REVIEWS: ReviewSeed[] = [
  {
    "id": "review_dewalt_001",
    "rentalRequestId": "rental_dewalt_001",
    "itemId": "item_dewalt_drill",
    "authorId": "usr_anna_nowak",
    "targetUserId": "usr_marek_kowalski",
    "rating": 5,
    "comment": "Wiertarko-wkrętarka w stanie idealnym! Kompletne bity i zapasowe baterie pozwoliły skończyć montaż mebli w jeden dzień. Marek to wzorowy sąsiad, super kontakt."
  },
  {
    "id": "review_karcher_001",
    "rentalRequestId": "rental_karcher_001",
    "itemId": "item_karcher_k5",
    "authorId": "usr_piotr_wisniewski",
    "targetUserId": "usr_anna_nowak",
    "rating": 5,
    "comment": "Myjka K5 poradziła sobie z kostką brukową rewelacyjnie. Bardzo czysty i zadbany sprzęt, szybki odbiór na Osiedlu Słonecznym. Zdecydowanie polecam wypożyczenie od Anny!"
  },
  {
    "id": "review_saw_001",
    "rentalRequestId": "rental_saw_001",
    "itemId": "item_stihl_ms251_saw",
    "authorId": "usr_piotr_wisniewski",
    "targetUserId": "usr_marek_kowalski",
    "rating": 5,
    "comment": "Piła spalinowa Stihl ma olbrzymią moc, łańcuch był idealnie naostrzony do przygotowania drewna kominkowego. Instruktaż przy odbiorze na najwyższym poziomie."
  },
  {
    "id": "review_giraffe_001",
    "rentalRequestId": "rental_giraffe_001",
    "itemId": "item_flex_ge5_giraffe",
    "authorId": "usr_jan_kowalski",
    "targetUserId": "usr_piotr_wisniewski",
    "rating": 4,
    "comment": "Szlifierka 'żyrafa' znacząco przyspieszyła szlifowanie gładzi w remontowanym mieszkaniu. Trochę waży przy sufitach, ale praca z odkurzaczem była niemalże bezpyłowa."
  },
  {
    "id": "review_laser_001",
    "rentalRequestId": "rental_laser_001",
    "itemId": "item_bosch_gll380_laser",
    "authorId": "usr_marek_kowalski",
    "targetUserId": "usr_anna_nowak",
    "rating": 5,
    "comment": "Laser 360 stopni to czysta poezja przy poziomowaniu stelaży sufitowych i płytek. Zielona wiązka jest rewelacyjnie widoczna nawet przy dziennym słońcu."
  }
];

async function main(): Promise<void> {
  console.log('🌱 Uruchamianie seedera bazy danych Barter...');

  // 1. Czyszczenie starych wypożyczeń, recenzji i przedmiotów
  console.log('  → Czyszczenie starych wypożyczeń, recenzji i przedmiotów...');
  await prisma.review.deleteMany();
  await prisma.rentalRequest.deleteMany();
  await prisma.item.deleteMany();

  // 2. Kategorie
  console.log(`  → Zapewnianie ${CATEGORIES.length} kategorii...`);
  for (const cat of CATEGORIES) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: { name: cat.name, slug: cat.slug, icon: cat.icon },
      create: cat,
    });
  }

  // 3. Domyślni użytkownicy
  console.log(`  → Zapewnianie ${USERS.length} domyślnych użytkowników...`);
  for (const u of USERS) {
    await prisma.user.upsert({
      where: { id: u.id },
      update: {
        email: u.email,
        name: u.name,
        passwordHash: DEFAULT_PASSWORD_HASH,
        phone: u.phone,
        city: u.city,
        neighborhood: u.neighborhood,
        exactAddress: u.exactAddress,
      },
      create: {
        ...u,
        passwordHash: DEFAULT_PASSWORD_HASH,
      },
    });
  }

  // 4. Narzędzia i sprzęt (111 pozycji)
  console.log(`  → Zapisywanie ${ITEMS.length} przedmiotów w bazie danych...`);
  await prisma.item.createMany({
    data: ITEMS,
  });

  // 5. Wypożyczenia
  console.log(`  → Tworzenie ${RENTALS.length} przykładowych wypożyczeń...`);
  for (const r of RENTALS) {
    await prisma.rentalRequest.create({
      data: {
        id: r.id,
        itemId: r.itemId,
        renterId: r.renterId,
        startDate: new Date(r.startDate),
        endDate: new Date(r.endDate),
        days: r.days,
        ownerAmount: r.ownerAmount,
        commissionAmount: r.commissionAmount,
        depositAmount: r.depositAmount,
        totalPaid: r.totalPaid,
        status: r.status,
        pickupPin: r.pickupPin,
      },
    });
  }

  // 6. Recenzje
  console.log(`  → Tworzenie ${REVIEWS.length} przykładowych recenzji...`);
  for (const rev of REVIEWS) {
    await prisma.review.create({
      data: rev,
    });
  }

  console.log('✅ Seeder zakończony pomyślnie!');
  console.log(`   Kategorie: ${CATEGORIES.length} | Użytkownicy: ${USERS.length} | Przedmioty: ${ITEMS.length} | Wypożyczenia: ${RENTALS.length} | Recenzje: ${REVIEWS.length}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error('❌ Błąd seedera:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
