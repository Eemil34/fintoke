export type ImageCategoryId =
  | 'medical'
  | 'dental'
  | 'wellness'
  | 'fitness'
  | 'restaurant'
  | 'cafe'
  | 'bar'
  | 'hotel'
  | 'real-estate'
  | 'office'
  | 'saas'
  | 'legal'
  | 'finance'
  | 'education'
  | 'retail'
  | 'beauty'
  | 'construction'
  | 'industrial'
  | 'automotive'
  | 'travel'
  | 'farm'
  | 'pets'
  | 'people'
  | 'interior'
  | 'nature';

export type LibraryPhoto = {
  id: string;
  alt: string;
};

export type ImageCategory = {
  id: ImageCategoryId;
  label: string;
  keywords: string[];
  photos: LibraryPhoto[];
};

export const IMAGE_LIBRARY: ImageCategory[] = [
  {
    id: 'medical',
    label: 'Hospital, clinic, and medical',
    keywords: [
      'hospital', 'clinic', 'medical', 'doctor', 'nurse', 'healthcare', 'health care',
      'surgery', 'patient', 'physician', 'emergency', 'ambulance', 'pharmacy',
      'pediatric', 'cardiology', 'oncology', 'laboratory', 'stethoscope',
      'sairaala', 'lääkäri', 'terveys', 'klinikka', 'terveyskeskus', 'lääkäriasema',
      'health center', 'urgent care', 'polyclinic', 'neurology', 'radiology',
      'operating room', 'operating theatre', 'ward', 'icu', 'inpatient',
      'terveydenhuolto', 'hoitaja', 'potilas',
    ],
    photos: [
      { id: 'photo-1519494026892-80bbd2d6fd0d', alt: 'Bright hospital corridor' },
      { id: 'photo-1538108149393-fbbd81895907', alt: 'Hospital hallway with gurney' },
      { id: 'photo-1551076805-e1869033e561', alt: 'Modern hospital exterior' },
      { id: 'photo-1579684453423-f84349ef60b0', alt: 'Clinician preparing for a procedure' },
      { id: 'photo-1576091160399-112ba8d25d1d', alt: 'Doctor reviewing a tablet' },
      { id: 'photo-1576091160550-2173dba999ef', alt: 'Clinician with a patient chart' },
      { id: 'photo-1631217868264-e5b90bb7e133', alt: 'Medical professional in scrubs' },
      { id: 'photo-1559839734-2b71ea197ec2', alt: 'Smiling female doctor' },
      { id: 'photo-1612349317150-e413f6a5b16d', alt: 'Male doctor in a white coat' },
      { id: 'photo-1516549655169-df83a0774514', alt: 'Hospital reception desk' },
      { id: 'photo-1504439904031-93ded9f93e4e', alt: 'Empty hospital ward' },
      { id: 'photo-1576678927484-cc907957088c', alt: 'Nurse station' },
      { id: 'photo-1551601651-2a8555f1a136', alt: 'Healthcare worker with a patient' },
      { id: 'photo-1571772996211-2f02c9727629', alt: 'Medical laboratory work' },
      { id: 'photo-1530497610245-94d3c16cda28', alt: 'MRI / imaging equipment' },
      { id: 'photo-1581056771107-24ca5f033842', alt: 'Stethoscope and medical notes' },
      { id: 'photo-1586773860418-d37222d8fce3', alt: 'Hospital building entrance' },
      { id: 'photo-1666214280557-f1b5022eb634', alt: 'Modern clinical workspace' },
      { id: 'photo-1584515933487-779824d29309', alt: 'Nurse in a hospital corridor' },
      { id: 'photo-1559757148-5c350d0d3c56', alt: 'Anatomical brain model' },
      { id: 'photo-1527613426441-4da17471b66d', alt: 'Clinician reviewing an X-ray' },
      { id: 'photo-1587854692152-cbe660dbde88', alt: 'Prescription capsules and bottle' },
      { id: 'photo-1622253692010-333f2da6031d', alt: 'Clinician in blue scrubs' },
      { id: 'photo-1516841273335-e39b37888115', alt: 'Medical team walking a hospital corridor' },
      { id: 'photo-1559757175-5700dde675bc', alt: 'Brain and neuron teaching models' },
      { id: 'photo-1594824476967-48c8b964273f', alt: 'Doctor in teal scrubs' },
      { id: 'photo-1551190822-a9333d879b1f', alt: 'Surgical team in an operating room' },
      { id: 'photo-1576671081837-49000212a370', alt: 'Medical vials and ampoules' },
      { id: 'photo-1631815588090-d4bfec5b1ccb', alt: 'Clinician taking a patient blood pressure' },
    ],
  },
  {
    id: 'dental',
    label: 'Dental clinic',
    keywords: ['dental', 'dentist', 'teeth', 'orthodont', 'smile clinic', 'hammas'],
    photos: [
      { id: 'photo-1606811971618-4486d14f3f99', alt: 'Dental treatment room' },
      { id: 'photo-1629909613654-28e377c37b09', alt: 'Dental tools on a tray' },
      { id: 'photo-1609840114035-3c981b782dfe', alt: 'Close-up dental care' },
      { id: 'photo-1576091160399-112ba8d25d1d', alt: 'Clinician consulting a patient' },
      { id: 'photo-1527613426441-4da17471b66d', alt: 'Clinician reviewing a dental X-ray' },
    ],
  },
  {
    id: 'wellness',
    label: 'Spa and wellness',
    keywords: ['spa', 'wellness', 'massage', 'sauna', 'yoga studio', 'meditation', 'relax'],
    photos: [
      { id: 'photo-1540555700478-4be289fbecef', alt: 'Spa treatment room' },
      { id: 'photo-1544161515-4ab6ce6db874', alt: 'Hot stone massage' },
      { id: 'photo-1515377905703-c4788e51af15', alt: 'Candles and towels in a spa' },
      { id: 'photo-1507652313519-d4e9174996dd', alt: 'Spa pool' },
      { id: 'photo-1506126613408-eca07ce68773', alt: 'Yoga practice' },
      { id: 'photo-1544367567-0f2fcb009e0b', alt: 'Meditation by water' },
    ],
  },
  {
    id: 'fitness',
    label: 'Gym and fitness',
    keywords: ['gym', 'fitness', 'workout', 'training', 'crossfit', 'yoga', 'personal trainer', 'kuntosali'],
    photos: [
      { id: 'photo-1534438327276-14e5300c3a48', alt: 'Gym interior with equipment' },
      { id: 'photo-1571019614242-c5c5dee9f50b', alt: 'Person lifting weights' },
      { id: 'photo-1517836357463-d25dfeac3438', alt: 'Dumbbell rack' },
      { id: 'photo-1571902943202-507ec2618e8f', alt: 'Row of treadmills' },
      { id: 'photo-1518611012118-696072aa579a', alt: 'Yoga class' },
      { id: 'photo-1599058917212-d750089bc07e', alt: 'Athlete training' },
      { id: 'photo-1517960413843-0aee8e2b3285', alt: 'Kettlebell workout' },
      { id: 'photo-1540497077202-7c8a3999166f', alt: 'Fitness studio' },
    ],
  },
  {
    id: 'restaurant',
    label: 'Restaurant and dining',
    keywords: [
      'restaurant', 'dining', 'bistro', 'brasserie', 'chef', 'menu', 'dinner',
      'sushi', 'ramen', 'japanese cuisine', 'trattoria', 'steakhouse', 'ravintola',
    ],
    photos: [
      { id: 'photo-1414235077428-338989a2e8c0', alt: 'Plated restaurant dish' },
      { id: 'photo-1517248135467-4c7edcad34c4', alt: 'Restaurant dining room' },
      { id: 'photo-1559339352-11d035aa65de', alt: 'Set dining table' },
      { id: 'photo-1552566626-52f8b828add9', alt: 'Restaurant interior' },
      { id: 'photo-1555396273-367ea4eb4db5', alt: 'Open kitchen restaurant' },
      { id: 'photo-1424847651672-bf20a4b0982b', alt: 'Friends dining' },
      { id: 'photo-1466978913421-dad2ebd01d17', alt: 'Pasta dish' },
      { id: 'photo-1600891964092-4316c288032e', alt: 'Steak dinner' },
      { id: 'photo-1544025162-d76694265947', alt: 'Plated entree' },
      { id: 'photo-1553621042-f6e147245754', alt: 'Sushi platter' },
      { id: 'photo-1579871494447-9811cf80d66c', alt: 'Sushi rolls' },
      { id: 'photo-1569718212165-3a8278d5f624', alt: 'Ramen bowl' },
      { id: 'photo-1577219491135-ce391730fb2c', alt: 'Chef in a kitchen' },
      { id: 'photo-1551218808-94e220e084d2', alt: 'Plated appetizer' },
      { id: 'photo-1513475382585-d06e58bcb0e0', alt: 'Dessert on a plate' },
      { id: 'photo-1488477181946-6428a0291777', alt: 'Pastry dessert' },
    ],
  },
  {
    id: 'cafe',
    label: 'Cafe, bakery, and coffee',
    keywords: ['cafe', 'coffee', 'bakery', 'pastry', 'espresso', 'kahvila', 'leipomo', 'mustard', 'senf', 'mill'],
    photos: [
      { id: 'photo-1495474472287-4d71bcdd2085', alt: 'Coffee being poured' },
      { id: 'photo-1501339847302-ac426a4a7cbb', alt: 'Cafe counter' },
      { id: 'photo-1497935586351-b67a49e012bf', alt: 'Espresso cups' },
      { id: 'photo-1509440159596-0249088772ff', alt: 'Fresh bread' },
      { id: 'photo-1555507036-ab1f4038808a', alt: 'Croissants' },
      { id: 'photo-1517433670267-08bbd4be890f', alt: 'Bakery interior' },
      { id: 'photo-1556910103-1c02745aae4d', alt: 'Home kitchen cooking' },
      { id: 'photo-1596040033229-a9821ebd058d', alt: 'Spices and ingredients' },
    ],
  },
  {
    id: 'bar',
    label: 'Bar and cocktails',
    keywords: ['bar', 'cocktail', 'pub', 'nightlife', 'speakeasy', 'whiskey', 'gin', 'kapteeni'],
    photos: [
      { id: 'photo-1514933651103-005eec06c04b', alt: 'Bar interior' },
      { id: 'photo-1470337458703-46ad1756a187', alt: 'Cocktails on a bar' },
      { id: 'photo-1551538827-9c037cb4f32a', alt: 'Cocktail glass' },
      { id: 'photo-1566417713940-fe7c737a9ef2', alt: 'Whiskey pour' },
      { id: 'photo-1544148103-0773bf10d330', alt: 'Bartender at work' },
      { id: 'photo-1575444758702-4a6b9222336e', alt: 'Crowded bar' },
    ],
  },
  {
    id: 'hotel',
    label: 'Hotel and hospitality',
    keywords: ['hotel', 'resort', 'suite', 'lobby', 'hospitality', 'boutique hotel', 'hotelli'],
    photos: [
      { id: 'photo-1566073771259-6a8506099945', alt: 'Hotel pool' },
      { id: 'photo-1551882547-ff40c63fe5fa', alt: 'Hotel lobby' },
      { id: 'photo-1542314831-068cd1dbfeeb', alt: 'Luxury hotel exterior' },
      { id: 'photo-1520250497591-112f2f40a3f4', alt: 'Resort pool' },
      { id: 'photo-1571896349842-33c89424de2d', alt: 'Tropical resort' },
      { id: 'photo-1445019980597-93fa8acb246c', alt: 'Hotel room' },
      { id: 'photo-1611892440504-42a792e24d32', alt: 'Made hotel bed' },
      { id: 'photo-1590490360182-c33d57733427', alt: 'Hotel bathroom' },
      { id: 'photo-1564501049412-61c2a3083791', alt: 'Hotel facade' },
      { id: 'photo-1582719478250-c89cae4dc85b', alt: 'Hotel suite' },
    ],
  },
  {
    id: 'real-estate',
    label: 'Homes and real estate',
    keywords: ['real estate', 'realtor', 'house', 'apartment', 'property', 'listing', 'home', 'asunnot'],
    photos: [
      { id: 'photo-1564013799919-ab600027ffc6', alt: 'Modern house exterior' },
      { id: 'photo-1568605114967-8130f3a36994', alt: 'Suburban home' },
      { id: 'photo-1600596542815-ffad4c1539a9', alt: 'Luxury house at dusk' },
      { id: 'photo-1600585154340-be6161a56a0c', alt: 'Living room interior' },
      { id: 'photo-1600607687939-ce8a6c25118c', alt: 'Kitchen interior' },
      { id: 'photo-1512917774080-9991f1c4c750', alt: 'Apartment living space' },
      { id: 'photo-1600566753190-17f0baa2a6c3', alt: 'House with a pool' },
    ],
  },
  {
    id: 'office',
    label: 'Offices and teams',
    keywords: ['office', 'team', 'coworking', 'agency', 'studio', 'meeting', 'workplace'],
    photos: [
      { id: 'photo-1497366216548-37526070297c', alt: 'Open office' },
      { id: 'photo-1497366811353-6870744d04b2', alt: 'Glass office interior' },
      { id: 'photo-1522071820081-009f0129c71c', alt: 'Team collaborating' },
      { id: 'photo-1600880292203-757bb62b4baf', alt: 'Meeting around a table' },
      { id: 'photo-1551434678-e076c223a692', alt: 'Office conversation' },
      { id: 'photo-1519389950473-47ba0277781c', alt: 'People working on laptops' },
      { id: 'photo-1531482615713-2afd69097998', alt: 'Workshop discussion' },
    ],
  },
  {
    id: 'saas',
    label: 'Software and product',
    keywords: ['saas', 'software', 'app', 'dashboard', 'startup', 'product', 'tech', 'developer'],
    photos: [
      { id: 'photo-1553877522-43269d4ea984', alt: 'Laptop with product UI' },
      { id: 'photo-1460925895917-afdab827c52f', alt: 'Analytics on a screen' },
      { id: 'photo-1498050108023-c5249f4df085', alt: 'Code on a laptop' },
      { id: 'photo-1486312338219-ce68d2c6f44d', alt: 'Person working at a desk' },
      { id: 'photo-1454165804606-c3d57bc86b40', alt: 'Planning documents' },
      { id: 'photo-1519389950473-47ba0277781c', alt: 'Product team at work' },
    ],
  },
  {
    id: 'legal',
    label: 'Law and professional services',
    keywords: ['law', 'legal', 'lawyer', 'attorney', 'firm', 'counsel', 'notary', 'laki', 'asianajaja'],
    photos: [
      { id: 'photo-1589829545856-d10d557cf95f', alt: 'Law books and gavel' },
      { id: 'photo-1521791136064-7986c2920216', alt: 'Handshake in an office' },
      { id: 'photo-1450101499163-c8848c66ca85', alt: 'Signing documents' },
      { id: 'photo-1505664194779-8beaceb93744', alt: 'Law library' },
      { id: 'photo-1436450412740-6b988f486c6b', alt: 'Courthouse columns' },
    ],
  },
  {
    id: 'finance',
    label: 'Finance and banking',
    keywords: ['finance', 'bank', 'invest', 'accounting', 'wealth', 'insurance', 'fintech'],
    photos: [
      { id: 'photo-1579621970563-ebec7560ff3e', alt: 'Savings and coins' },
      { id: 'photo-1554224155-6726b3ff858f', alt: 'Calculator and documents' },
      { id: 'photo-1611974789855-9c2a0a7236a3', alt: 'Stock market chart' },
      { id: 'photo-1554224154-26032ffc0d07', alt: 'Financial documents' },
      { id: 'photo-1553729459-efe14ef6055d', alt: 'Financial planning' },
    ],
  },
  {
    id: 'education',
    label: 'Schools and education',
    keywords: ['school', 'university', 'education', 'course', 'academy', 'student', 'classroom', 'koulu'],
    photos: [
      { id: 'photo-1541339907198-e08756dedf3f', alt: 'University graduation' },
      { id: 'photo-1524995997946-a1c2e315a42f', alt: 'Library study space' },
      { id: 'photo-1503676260728-1c00da094a0b', alt: 'Children in a classroom' },
      { id: 'photo-1524178232363-1fb2b075b655', alt: 'Lecture hall' },
      { id: 'photo-1427504494785-3a9ca7044f45', alt: 'Students studying' },
      { id: 'photo-1509062522246-3755977927d7', alt: 'Teacher at a whiteboard' },
      { id: 'photo-1481627834876-b7833e8f5570', alt: 'Library shelves' },
    ],
  },
  {
    id: 'retail',
    label: 'Shops and retail',
    keywords: ['shop', 'store', 'retail', 'boutique', 'ecommerce', 'fashion', 'kauppa'],
    photos: [
      { id: 'photo-1441986300917-64674bd600d8', alt: 'Clothing store interior' },
      { id: 'photo-1445205170230-053b83016050', alt: 'Fashion retail racks' },
      { id: 'photo-1483985988355-763728e1935b', alt: 'Shopping bags' },
      { id: 'photo-1555529669-e69e7aa0ba9a', alt: 'Checkout counter' },
      { id: 'photo-1556740749-887f6717d7e4', alt: 'Storefront display' },
    ],
  },
  {
    id: 'beauty',
    label: 'Salon and beauty',
    keywords: ['salon', 'beauty', 'hair', 'barber', 'makeup', 'spa salon', 'kampaamo'],
    photos: [
      { id: 'photo-1560066984-138dadb4c035', alt: 'Hair salon interior' },
      { id: 'photo-1522337360788-8b13dee7a37e', alt: 'Makeup brushes' },
      { id: 'photo-1522335789203-aabd1fc54bc9', alt: 'Beauty products' },
      { id: 'photo-1516975080664-ed2fc6a32937', alt: 'Salon styling' },
      { id: 'photo-1595476108010-b4d1f102b1b1', alt: 'Haircut in progress' },
    ],
  },
  {
    id: 'construction',
    label: 'Construction and trades',
    keywords: ['construction', 'builder', 'contractor', 'renovation', 'architect site', 'rakennus'],
    photos: [
      { id: 'photo-1503387762-592deb58ef4e', alt: 'Building under construction' },
      { id: 'photo-1541888946425-d81bb19240f5', alt: 'Construction workers' },
      { id: 'photo-1504307651254-35680f356dfd', alt: 'Crane on a job site' },
      { id: 'photo-1581094794329-c8112a89af12', alt: 'Hard hat and plans' },
      { id: 'photo-1581092918056-0c4c3acd3789', alt: 'Engineer reviewing plans' },
    ],
  },
  {
    id: 'industrial',
    label: 'Factory and industrial',
    keywords: ['factory', 'industrial', 'warehouse', 'manufacturing', 'logistics', 'workshop'],
    photos: [
      { id: 'photo-1565043589221-1a6fd9ae45c7', alt: 'Factory floor' },
      { id: 'photo-1581091226825-a6a2a5aee158', alt: 'Engineer at a computer' },
      { id: 'photo-1504328345606-18bbc8c9d7d1', alt: 'Industrial pipes' },
      { id: 'photo-1586528116311-ad8dd3c8310d', alt: 'Warehouse aisles' },
    ],
  },
  {
    id: 'automotive',
    label: 'Cars and automotive',
    keywords: ['car', 'auto', 'garage', 'dealership', 'mechanic', 'vehicle', 'auto'],
    photos: [
      { id: 'photo-1492144534655-ae79c964c9d7', alt: 'Sports car detail' },
      { id: 'photo-1503376780353-7e6692767b70', alt: 'Car on a wet road' },
      { id: 'photo-1494976388531-d1058494cdd8', alt: 'Classic car' },
      { id: 'photo-1486006920555-c77dcf18193c', alt: 'Mechanic workshop' },
    ],
  },
  {
    id: 'travel',
    label: 'Travel and destinations',
    keywords: ['travel', 'tour', 'vacation', 'destination', 'airline', 'guide'],
    photos: [
      { id: 'photo-1488646953014-85cb44e25828', alt: 'Passport and camera' },
      { id: 'photo-1476514525535-07fb3b4ae5f1', alt: 'Mountain lake travel' },
      { id: 'photo-1507525428034-b723cf961d3e', alt: 'Tropical beach' },
      { id: 'photo-1469854523086-cc02fe5d8800', alt: 'Road trip landscape' },
    ],
  },
  {
    id: 'farm',
    label: 'Farm and artisan food',
    keywords: ['farm', 'organic', 'harvest', 'vineyard', 'winery', 'mustard', 'mill', 'artisan', 'maatila'],
    photos: [
      { id: 'photo-1500382017468-9049fed747ef', alt: 'Rural landscape' },
      { id: 'photo-1464226184884-fa280b87c399', alt: 'Fresh market produce' },
      { id: 'photo-1500595046743-cd271d694d30', alt: 'Farm fields' },
      { id: 'photo-1625246333195-78d9c38ad449', alt: 'Greenhouse rows' },
      { id: 'photo-1466637574441-749b8f19452f', alt: 'Ingredient prep' },
    ],
  },
  {
    id: 'pets',
    label: 'Pets and veterinary',
    keywords: ['vet', 'veterinary', 'pet', 'dog', 'cat', 'animal clinic', 'eläinlääkäri'],
    photos: [
      { id: 'photo-1450778869180-41d0601e046e', alt: 'Dog portrait' },
      { id: 'photo-1548199973-03cce0bbc87b', alt: 'Dogs together' },
      { id: 'photo-1517849845537-4d257902454a', alt: 'Puppy close-up' },
      { id: 'photo-1587300003388-59208cc962cb', alt: 'Golden retriever' },
      { id: 'photo-1576201836106-db1758fd1c97', alt: 'Cat at a clinic' },
    ],
  },
  {
    id: 'people',
    label: 'People and portraits',
    keywords: ['portrait', 'team photo', 'staff', 'founder', 'about us'],
    photos: [
      { id: 'photo-1573496359142-b8d87734a5a2', alt: 'Professional woman' },
      { id: 'photo-1560250097-0b93528c311a', alt: 'Professional man' },
      { id: 'photo-1573497019940-1c28c88b4f3e', alt: 'Woman in an office' },
      { id: 'photo-1580489944761-15a19d654956', alt: 'Portrait of a woman' },
      { id: 'photo-1472099645785-5658abf4ff4e', alt: 'Portrait of a man' },
      { id: 'photo-1507003211169-0a1dd7228f2d', alt: 'Studio portrait' },
      { id: 'photo-1494790108377-be9c29b29330', alt: 'Smiling woman' },
      { id: 'photo-1500648767791-00dcc994a43e', alt: 'Smiling man' },
      { id: 'photo-1537368910025-700350fe46c7', alt: 'Studio portrait of a man' },
    ],
  },
  {
    id: 'interior',
    label: 'Interiors and architecture',
    keywords: ['interior', 'architecture', 'showroom', 'gallery space', 'lobby'],
    photos: [
      { id: 'photo-1618221195710-dd6b41faaea6', alt: 'Designed living interior' },
      { id: 'photo-1586023492125-27b2c045efd7', alt: 'Minimal interior' },
      { id: 'photo-1600210492486-724fe5c67fb0', alt: 'Architect interior' },
      { id: 'photo-1497366754035-f200968a6e72', alt: 'Bright architectural space' },
    ],
  },
  {
    id: 'nature',
    label: 'Nature and landscape',
    keywords: ['nature', 'landscape', 'forest', 'garden', 'outdoor', 'park'],
    photos: [
      { id: 'photo-1441974231531-c6227db76b6e', alt: 'Sunlit forest' },
      { id: 'photo-1472214103451-9374bd1c798e', alt: 'Green valley' },
      { id: 'photo-1469474968028-56623f02e42e', alt: 'Mountain landscape' },
      { id: 'photo-1426604966848-d7adac402bff', alt: 'Lake and mountains' },
      { id: 'photo-1501854140801-50d01698950b', alt: 'Rolling hills' },
    ],
  },
];

export const IMAGE_CATEGORY_IDS = IMAGE_LIBRARY.map((category) => category.id);

const CATEGORY_BY_ID = new Map(IMAGE_LIBRARY.map((category) => [category.id, category]));

export function getImageCategory(id: ImageCategoryId): ImageCategory {
  const found = CATEGORY_BY_ID.get(id);
  if (!found) throw new Error(`Unknown image category: ${id}`);
  return found;
}

export function allLibraryPhotoIds(): string[] {
  return IMAGE_LIBRARY.flatMap((category) => category.photos.map((photo) => photo.id));
}

const WORD_RE = /[\p{L}\p{N}]+/gu;
const FOOD_LIKE = new Set<ImageCategoryId>(['restaurant', 'cafe', 'bar', 'farm']);
const CLINICAL = new Set<ImageCategoryId>(['medical', 'dental']);
const SUPPORTING = new Set<ImageCategoryId>(['people', 'nature', 'interior']);

export function scoreImageCategory(text: string): { category: ImageCategory; score: number } {
  const haystack = text.toLowerCase();
  const tokens = new Set<string>();
  for (const match of haystack.matchAll(WORD_RE)) {
    tokens.add(match[0]);
  }

  let best: { category: ImageCategory; score: number } = {
    category: getImageCategory('office'),
    score: 0,
  };

  for (const category of IMAGE_LIBRARY) {
    let score = 0;
    for (const keyword of category.keywords) {
      const kw = keyword.toLowerCase().trim();
      if (!kw) continue;
      const hit = kw.includes(' ') ? haystack.includes(kw) : tokens.has(kw);
      if (!hit) continue;
      score += kw.includes(' ') ? 8 : kw.length >= 10 ? 8 : kw.length >= 6 ? 5 : 3;
    }
    if (category.id === 'medical' && /layout:\s*['"]medical['"]/.test(haystack)) {
      score += 16;
    }
    if (score > best.score) best = { category, score };
  }

  return best;
}

export function matchImageCategory(text: string): ImageCategory {
  return scoreImageCategory(text).category;
}

const PHOTO_CATEGORY = new Map<string, ImageCategoryId>();
for (const category of IMAGE_LIBRARY) {
  for (const photo of category.photos) {
    if (!PHOTO_CATEGORY.has(photo.id)) PHOTO_CATEGORY.set(photo.id, category.id);
  }
}

export function photoLibraryCategory(id: string): ImageCategoryId | undefined {
  return PHOTO_CATEGORY.get(id);
}

export function isIncompatibleImageCategory(
  siteId: ImageCategoryId,
  photoId: ImageCategoryId,
): boolean {
  if (siteId === photoId) return false;
  if (SUPPORTING.has(photoId)) return false;
  if (siteId === 'hotel' && FOOD_LIKE.has(photoId)) return false;
  if (FOOD_LIKE.has(siteId) && FOOD_LIKE.has(photoId)) return false;
  if (CLINICAL.has(siteId) && (FOOD_LIKE.has(photoId) || photoId === 'hotel')) return true;
  if (FOOD_LIKE.has(siteId) && CLINICAL.has(photoId)) return true;
  if (!FOOD_LIKE.has(siteId) && siteId !== 'hotel' && FOOD_LIKE.has(photoId)) return true;
  return false;
}

export function pickLibraryPhoto(category: ImageCategory, salt: string): LibraryPhoto {
  const photos = category.photos;
  let hash = 0;
  for (let i = 0; i < salt.length; i += 1) {
    hash = (hash * 31 + salt.charCodeAt(i)) >>> 0;
  }
  return photos[hash % photos.length];
}

export function unsplashUrl(id: string, width = 1400): string {
  return `https://images.unsplash.com/${id}?w=${width}&q=80&auto=format&fit=crop`;
}

export function formatImageLibraryModule(): string {
  const payload = IMAGE_LIBRARY.map((category) => ({
    id: category.id,
    label: category.label,
    keywords: category.keywords,
    photos: category.photos,
  }));

  return `// Verified Unsplash photos for this builder. Pick ONE category that matches the site.
// Hospital / clinic => medical. Restaurant => restaurant. Never mix those.

export type ImageCategoryId = ${IMAGE_CATEGORY_IDS.map((id) => `'${id}'`).join(' | ')};

export const IMAGE_LIBRARY = ${JSON.stringify(payload, null, 2)} as const;

export function unsplash(id: string, width = 1400) {
  return \`https://images.unsplash.com/\${id}?w=\${width}&q=80&auto=format&fit=crop\`;
}

export function photosIn(id: ImageCategoryId) {
  const category = IMAGE_LIBRARY.find((item) => item.id === id);
  return category?.photos ?? [];
}
`;
}

export const SITE_IMAGE_AGENT_RULES = `Photos must match the site topic. If the user uploaded files under public/uploads, use those exact /uploads/... paths first. Otherwise read lib/imageLibrary.ts — it is a large categorized Unsplash catalog. Use unsplash() IDs from the matching category only. A hospital or clinic uses medical photos only — never restaurant, food, bar, sushi, or cocktail photos. A hotel uses hotel photos. Never invent Unsplash IDs (they 404 and leave empty frames). Use components/SiteImage.tsx for every photo. Keep instrumentation-client.ts and ImageGuard.`;

export function buildSiteImageAgentRules(userPrompt: string): string {
  const category = matchImageCategory(userPrompt || '');
  const lines = category.photos
    .slice(0, 12)
    .map((photo) => `- ${photo.id} — ${photo.alt}`)
    .join('\n');
  return `${SITE_IMAGE_AGENT_RULES}

For this request, start with the "${category.id}" library (${category.label}):
${lines}
Copy IDs exactly. If you need more, open lib/imageLibrary.ts and stay inside that category (people/nature are OK as supporting shots).`;
}
