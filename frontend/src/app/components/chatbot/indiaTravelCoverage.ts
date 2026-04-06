export type PlaceCategory =
  | "hill-station"
  | "heritage"
  | "spiritual"
  | "beach"
  | "wildlife"
  | "nature"
  | "desert"
  | "island"
  | "city-break"
  | "adventure"
  | "backwaters";

export interface TouristPlaceSeed {
  name: string;
  category: PlaceCategory;
  nearestGateway: string;
  highlights: string[];
  bestSeason?: string;
  idealDuration?: string;
}

export interface StateTravelBlock {
  stateOrUT: string;
  majorCities: string[];
  touristPlaces: TouristPlaceSeed[];
}

export const INDIA_STATE_TRAVEL_BLOCKS: StateTravelBlock[] = [
  {
    stateOrUT: "Andhra Pradesh",
    majorCities: ["Visakhapatnam", "Vijayawada", "Tirupati", "Kurnool"],
    touristPlaces: [
      {
        name: "Tirupati",
        category: "spiritual",
        nearestGateway: "Tirupati",
        highlights: ["Sri Venkateswara Temple", "Sri Padmavathi Temple", "Temple town circuits"],
      },
      {
        name: "Araku Valley",
        category: "hill-station",
        nearestGateway: "Visakhapatnam",
        highlights: ["Tribal museum", "Coffee plantations", "Valley viewpoints"],
      },
      {
        name: "Borra Caves",
        category: "nature",
        nearestGateway: "Visakhapatnam",
        highlights: ["Limestone caves", "Rock formations", "Ananthagiri surroundings"],
      },
      {
        name: "Srisailam",
        category: "spiritual",
        nearestGateway: "Kurnool",
        highlights: ["Mallikarjuna Jyotirlinga", "Nallamala forest roads", "Srisailam dam"],
      },
      {
        name: "Gandikota",
        category: "adventure",
        nearestGateway: "Kadapa",
        highlights: ["Grand canyon of India", "Fort ruins", "Sunset viewpoints"],
      },
    ],
  },
  {
    stateOrUT: "Arunachal Pradesh",
    majorCities: ["Itanagar", "Tawang", "Ziro", "Bomdila"],
    touristPlaces: [
      {
        name: "Tawang",
        category: "hill-station",
        nearestGateway: "Tezpur",
        highlights: ["Tawang Monastery", "War memorial", "High altitude lakes"],
      },
      {
        name: "Ziro Valley",
        category: "nature",
        nearestGateway: "Itanagar",
        highlights: ["Paddy landscapes", "Apatani culture", "Valley walks"],
      },
      {
        name: "Sela Pass",
        category: "adventure",
        nearestGateway: "Tawang",
        highlights: ["Mountain pass", "Snow views", "Sela lake"],
      },
      {
        name: "Namdapha National Park",
        category: "wildlife",
        nearestGateway: "Miao",
        highlights: ["Biodiversity hotspot", "Rainforest trails", "Birdwatching"],
      },
    ],
  },
  {
    stateOrUT: "Assam",
    majorCities: ["Guwahati", "Dibrugarh", "Jorhat", "Silchar"],
    touristPlaces: [
      {
        name: "Kaziranga National Park",
        category: "wildlife",
        nearestGateway: "Guwahati",
        highlights: ["One-horned rhino safari", "Elephant grasslands", "Jeep safaris"],
      },
      {
        name: "Majuli",
        category: "nature",
        nearestGateway: "Jorhat",
        highlights: ["River island culture", "Satras", "Brahmaputra ferries"],
      },
      {
        name: "Manas National Park",
        category: "wildlife",
        nearestGateway: "Guwahati",
        highlights: ["UNESCO site", "Riverine forests", "Wildlife drives"],
      },
      {
        name: "Kamakhya Temple",
        category: "spiritual",
        nearestGateway: "Guwahati",
        highlights: ["Nilachal hill temple", "Pilgrim circuits", "City viewpoints"],
      },
    ],
  },
  {
    stateOrUT: "Bihar",
    majorCities: ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur"],
    touristPlaces: [
      {
        name: "Bodh Gaya",
        category: "spiritual",
        nearestGateway: "Gaya",
        highlights: ["Mahabodhi Temple", "Bodhi tree", "International monasteries"],
      },
      {
        name: "Nalanda",
        category: "heritage",
        nearestGateway: "Patna",
        highlights: ["Ancient university ruins", "Archaeological museum", "Historic walks"],
      },
      {
        name: "Rajgir",
        category: "heritage",
        nearestGateway: "Patna",
        highlights: ["Vishwa Shanti Stupa", "Hot springs", "Ropeway"],
      },
      {
        name: "Vaishali",
        category: "heritage",
        nearestGateway: "Patna",
        highlights: ["Ashokan pillar", "Buddhist heritage", "Ancient republic site"],
      },
    ],
  },
  {
    stateOrUT: "Chhattisgarh",
    majorCities: ["Raipur", "Bilaspur", "Jagdalpur", "Durg"],
    touristPlaces: [
      {
        name: "Chitrakote Falls",
        category: "nature",
        nearestGateway: "Jagdalpur",
        highlights: ["Waterfall viewpoint", "Boating zones", "Monsoon landscapes"],
      },
      {
        name: "Kanger Valley National Park",
        category: "wildlife",
        nearestGateway: "Jagdalpur",
        highlights: ["Forest trails", "Cave systems", "Biodiversity"],
      },
      {
        name: "Sirpur",
        category: "heritage",
        nearestGateway: "Raipur",
        highlights: ["Ancient temple ruins", "Archaeological remains", "Buddhist sites"],
      },
    ],
  },
  {
    stateOrUT: "Goa",
    majorCities: ["Panaji", "Margao", "Vasco da Gama", "Mapusa"],
    touristPlaces: [
      {
        name: "North Goa Beaches",
        category: "beach",
        nearestGateway: "Panaji",
        highlights: ["Baga and Calangute", "Nightlife hubs", "Beach shacks"],
      },
      {
        name: "South Goa Beaches",
        category: "beach",
        nearestGateway: "Margao",
        highlights: ["Palolem and Colva", "Quiet coastlines", "Water activities"],
      },
      {
        name: "Dudhsagar Falls",
        category: "nature",
        nearestGateway: "Vasco da Gama",
        highlights: ["Waterfall trek", "Scenic rail bridge", "Forest roads"],
      },
      {
        name: "Old Goa Churches",
        category: "heritage",
        nearestGateway: "Panaji",
        highlights: ["Basilica of Bom Jesus", "Se Cathedral", "Colonial architecture"],
      },
    ],
  },
  {
    stateOrUT: "Gujarat",
    majorCities: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar"],
    touristPlaces: [
      {
        name: "Gir National Park",
        category: "wildlife",
        nearestGateway: "Rajkot",
        highlights: ["Asiatic lion safari", "Dry deciduous forests", "Guided jeep drives"],
      },
      {
        name: "Rann of Kutch",
        category: "desert",
        nearestGateway: "Bhuj",
        highlights: ["White salt desert", "Rann Utsav", "Sunset horizons"],
      },
      {
        name: "Somnath",
        category: "spiritual",
        nearestGateway: "Diu",
        highlights: ["Jyotirlinga temple", "Arabian Sea promenade", "Aarti experience"],
      },
      {
        name: "Dwarka",
        category: "spiritual",
        nearestGateway: "Jamnagar",
        highlights: ["Dwarkadhish Temple", "Bet Dwarka", "Gomti ghat"],
      },
      {
        name: "Statue of Unity",
        category: "city-break",
        nearestGateway: "Vadodara",
        highlights: ["Viewing gallery", "Valley of flowers", "Riverfront"],
      },
    ],
  },
  {
    stateOrUT: "Haryana",
    majorCities: ["Gurugram", "Faridabad", "Panipat", "Hisar", "Panchkula"],
    touristPlaces: [
      {
        name: "Kurukshetra",
        category: "spiritual",
        nearestGateway: "Karnal",
        highlights: ["Brahma Sarovar", "Historic battle sites", "Pilgrim circuits"],
      },
      {
        name: "Morni Hills",
        category: "hill-station",
        nearestGateway: "Panchkula",
        highlights: ["Forest drives", "Lake viewpoint", "Short treks"],
      },
      {
        name: "Sultanpur National Park",
        category: "wildlife",
        nearestGateway: "Gurugram",
        highlights: ["Birdwatching", "Wetland ecology", "Nature trails"],
      },
    ],
  },
  {
    stateOrUT: "Himachal Pradesh",
    majorCities: ["Shimla", "Manali", "Dharamshala", "Kullu", "Dalhousie"],
    touristPlaces: [
      {
        name: "Shimla",
        category: "hill-station",
        nearestGateway: "Shimla",
        highlights: ["Mall Road", "Jakhoo Temple", "Colonial architecture"],
      },
      {
        name: "Manali",
        category: "hill-station",
        nearestGateway: "Kullu",
        highlights: ["Solang Valley", "Old Manali", "Adventure sports"],
      },
      {
        name: "Spiti Valley",
        category: "adventure",
        nearestGateway: "Manali",
        highlights: ["High altitude villages", "Monasteries", "Road trip circuits"],
      },
      {
        name: "Kasol",
        category: "adventure",
        nearestGateway: "Kullu",
        highlights: ["Parvati Valley", "River cafes", "Kheerganga trek access"],
      },
      {
        name: "Bir Billing",
        category: "adventure",
        nearestGateway: "Dharamshala",
        highlights: ["Paragliding site", "Mountain views", "Monastery trails"],
      },
    ],
  },
  {
    stateOrUT: "Jharkhand",
    majorCities: ["Ranchi", "Jamshedpur", "Dhanbad", "Deoghar"],
    touristPlaces: [
      {
        name: "Deoghar",
        category: "spiritual",
        nearestGateway: "Deoghar",
        highlights: ["Baidyanath Dham", "Pilgrim circuits", "Temple architecture"],
      },
      {
        name: "Betla National Park",
        category: "wildlife",
        nearestGateway: "Ranchi",
        highlights: ["Forest safaris", "Palamu fort ruins", "Nature drives"],
      },
      {
        name: "Netarhat",
        category: "hill-station",
        nearestGateway: "Ranchi",
        highlights: ["Sunrise and sunset points", "Plateau views", "Pine landscapes"],
      },
      {
        name: "Hundru Falls",
        category: "nature",
        nearestGateway: "Ranchi",
        highlights: ["Waterfall viewpoint", "Monsoon scenery", "Photography spots"],
      },
    ],
  },
  {
    stateOrUT: "Karnataka",
    majorCities: ["Bengaluru", "Mysuru", "Mangaluru", "Hubballi", "Belagavi"],
    touristPlaces: [
      {
        name: "Coorg",
        category: "hill-station",
        nearestGateway: "Mysuru",
        highlights: ["Coffee estates", "Abbey Falls", "Madikeri viewpoints"],
      },
      {
        name: "Hampi",
        category: "heritage",
        nearestGateway: "Hubballi",
        highlights: ["Vijayanagara ruins", "Temple complexes", "Coracle rides"],
      },
      {
        name: "Chikmagalur",
        category: "hill-station",
        nearestGateway: "Mangaluru",
        highlights: ["Mullayanagiri hills", "Coffee trails", "Scenic drives"],
      },
      {
        name: "Gokarna",
        category: "beach",
        nearestGateway: "Hubballi",
        highlights: ["Om beach", "Temple town", "Coastal treks"],
      },
      {
        name: "Badami Pattadakal Aihole",
        category: "heritage",
        nearestGateway: "Hubballi",
        highlights: ["Rock-cut caves", "Chalukyan architecture", "UNESCO monuments"],
      },
    ],
  },
  {
    stateOrUT: "Kerala",
    majorCities: ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kannur"],
    touristPlaces: [
      {
        name: "Munnar",
        category: "hill-station",
        nearestGateway: "Kochi",
        highlights: ["Tea estates", "Eravikulam park", "Viewpoints"],
      },
      {
        name: "Alappuzha",
        category: "backwaters",
        nearestGateway: "Kochi",
        highlights: ["Houseboat cruises", "Canal villages", "Backwater sunsets"],
      },
      {
        name: "Wayanad",
        category: "nature",
        nearestGateway: "Kozhikode",
        highlights: ["Edakkal caves", "Waterfalls", "Forest trails"],
      },
      {
        name: "Thekkady",
        category: "wildlife",
        nearestGateway: "Kochi",
        highlights: ["Periyar lake", "Spice plantations", "Safari experiences"],
      },
      {
        name: "Varkala",
        category: "beach",
        nearestGateway: "Thiruvananthapuram",
        highlights: ["Cliff beach", "Cafes", "Sunset promenade"],
      },
      {
        name: "Kovalam",
        category: "beach",
        nearestGateway: "Thiruvananthapuram",
        highlights: ["Lighthouse beach", "Water sports", "Coastal stays"],
      },
    ],
  },
  {
    stateOrUT: "Madhya Pradesh",
    majorCities: ["Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain"],
    touristPlaces: [
      {
        name: "Khajuraho",
        category: "heritage",
        nearestGateway: "Khajuraho",
        highlights: ["Temple complexes", "UNESCO heritage", "Sculptural art"],
      },
      {
        name: "Ujjain",
        category: "spiritual",
        nearestGateway: "Indore",
        highlights: ["Mahakaleshwar temple", "Ghats", "Pilgrim routes"],
      },
      {
        name: "Pachmarhi",
        category: "hill-station",
        nearestGateway: "Bhopal",
        highlights: ["Satpura hills", "Caves and waterfalls", "Nature trails"],
      },
      {
        name: "Kanha National Park",
        category: "wildlife",
        nearestGateway: "Jabalpur",
        highlights: ["Tiger reserve safari", "Sal forests", "Core zone drives"],
      },
      {
        name: "Bhimbetka",
        category: "heritage",
        nearestGateway: "Bhopal",
        highlights: ["Rock shelters", "Prehistoric art", "Archaeological trails"],
      },
    ],
  },
  {
    stateOrUT: "Maharashtra",
    majorCities: ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Kolhapur"],
    touristPlaces: [
      {
        name: "Lonavala",
        category: "hill-station",
        nearestGateway: "Pune",
        highlights: ["Monsoon viewpoints", "Tiger point", "Short treks"],
      },
      {
        name: "Mahabaleshwar",
        category: "hill-station",
        nearestGateway: "Pune",
        highlights: ["Strawberry farms", "Valley points", "Boating"],
      },
      {
        name: "Ajanta Ellora Caves",
        category: "heritage",
        nearestGateway: "Aurangabad",
        highlights: ["Rock-cut caves", "UNESCO world heritage", "Historic sculptures"],
      },
      {
        name: "Shirdi",
        category: "spiritual",
        nearestGateway: "Nashik",
        highlights: ["Sai Baba temple", "Pilgrim circuits", "Temple town"],
      },
      {
        name: "Tadoba National Park",
        category: "wildlife",
        nearestGateway: "Nagpur",
        highlights: ["Tiger safaris", "Lake zones", "Forest drives"],
      },
      {
        name: "Alibaug",
        category: "beach",
        nearestGateway: "Mumbai",
        highlights: ["Coastal forts", "Beach stays", "Ferry routes"],
      },
    ],
  },
  {
    stateOrUT: "Manipur",
    majorCities: ["Imphal", "Thoubal"],
    touristPlaces: [
      {
        name: "Loktak Lake",
        category: "nature",
        nearestGateway: "Imphal",
        highlights: ["Floating phumdis", "Lake boating", "Sunset views"],
      },
      {
        name: "Keibul Lamjao National Park",
        category: "wildlife",
        nearestGateway: "Imphal",
        highlights: ["Floating national park", "Sangai habitat", "Wetland ecology"],
      },
      {
        name: "Kangla Fort",
        category: "heritage",
        nearestGateway: "Imphal",
        highlights: ["Historic fort", "Cultural exhibits", "Local history"],
      },
    ],
  },
  {
    stateOrUT: "Meghalaya",
    majorCities: ["Shillong", "Tura"],
    touristPlaces: [
      {
        name: "Cherrapunji",
        category: "nature",
        nearestGateway: "Shillong",
        highlights: ["Waterfalls", "Cave routes", "Monsoon landscapes"],
      },
      {
        name: "Dawki",
        category: "nature",
        nearestGateway: "Shillong",
        highlights: ["Umngot river boating", "Clear waters", "Border viewpoints"],
      },
      {
        name: "Mawlynnong",
        category: "nature",
        nearestGateway: "Shillong",
        highlights: ["Clean village trails", "Living root bridge access", "Skywalk"],
      },
      {
        name: "Laitlum Canyons",
        category: "adventure",
        nearestGateway: "Shillong",
        highlights: ["Cliff viewpoints", "Hiking trails", "Cloud valley views"],
      },
    ],
  },
  {
    stateOrUT: "Mizoram",
    majorCities: ["Aizawl", "Lunglei"],
    touristPlaces: [
      {
        name: "Reiek",
        category: "hill-station",
        nearestGateway: "Aizawl",
        highlights: ["Mountain viewpoints", "Village culture", "Short hikes"],
      },
      {
        name: "Vantawng Falls",
        category: "nature",
        nearestGateway: "Aizawl",
        highlights: ["Tall waterfall", "Scenic drives", "Forest surroundings"],
      },
      {
        name: "Hmuifang",
        category: "nature",
        nearestGateway: "Aizawl",
        highlights: ["Hill meadows", "Forest trails", "Village experience"],
      },
    ],
  },
  {
    stateOrUT: "Nagaland",
    majorCities: ["Kohima", "Dimapur", "Mokokchung"],
    touristPlaces: [
      {
        name: "Dzukou Valley",
        category: "adventure",
        nearestGateway: "Kohima",
        highlights: ["Trekking valley", "Seasonal blooms", "Mountain camping"],
      },
      {
        name: "Kisama Heritage Village",
        category: "heritage",
        nearestGateway: "Kohima",
        highlights: ["Hornbill festival venue", "Tribal architecture", "Cultural performances"],
      },
      {
        name: "Japfu Peak",
        category: "adventure",
        nearestGateway: "Kohima",
        highlights: ["Peak trek", "Rhododendron belt", "Panoramic views"],
      },
    ],
  },
  {
    stateOrUT: "Odisha",
    majorCities: ["Bhubaneswar", "Cuttack", "Rourkela", "Sambalpur"],
    touristPlaces: [
      {
        name: "Puri",
        category: "spiritual",
        nearestGateway: "Bhubaneswar",
        highlights: ["Jagannath temple", "Sea beach", "Pilgrim circuits"],
      },
      {
        name: "Konark",
        category: "heritage",
        nearestGateway: "Bhubaneswar",
        highlights: ["Sun temple", "Sculptural architecture", "Cultural festivals"],
      },
      {
        name: "Chilika Lake",
        category: "nature",
        nearestGateway: "Bhubaneswar",
        highlights: ["Lagoon boating", "Birdwatching", "Dolphin sightings"],
      },
      {
        name: "Bhitarkanika",
        category: "wildlife",
        nearestGateway: "Cuttack",
        highlights: ["Mangrove ecosystem", "Crocodile habitat", "Boat safaris"],
      },
    ],
  },
  {
    stateOrUT: "Punjab",
    majorCities: ["Amritsar", "Ludhiana", "Jalandhar", "Patiala", "Bathinda"],
    touristPlaces: [
      {
        name: "Golden Temple",
        category: "spiritual",
        nearestGateway: "Amritsar",
        highlights: ["Harmandir Sahib", "Langar experience", "Night illumination"],
      },
      {
        name: "Wagah Border",
        category: "city-break",
        nearestGateway: "Amritsar",
        highlights: ["Retreat ceremony", "Border parade", "Patriotic event"],
      },
      {
        name: "Anandpur Sahib",
        category: "spiritual",
        nearestGateway: "Chandigarh",
        highlights: ["Takht Sri Keshgarh Sahib", "Sikh heritage", "Pilgrim route"],
      },
    ],
  },
  {
    stateOrUT: "Rajasthan",
    majorCities: ["Jaipur", "Udaipur", "Jodhpur", "Jaisalmer", "Ajmer", "Kota"],
    touristPlaces: [
      {
        name: "Jaipur",
        category: "heritage",
        nearestGateway: "Jaipur",
        highlights: ["Amber Fort", "City Palace", "Hawa Mahal"],
      },
      {
        name: "Udaipur",
        category: "heritage",
        nearestGateway: "Udaipur",
        highlights: ["Lake Pichola", "City palace", "Sunset boat rides"],
      },
      {
        name: "Jaisalmer",
        category: "desert",
        nearestGateway: "Jaisalmer",
        highlights: ["Golden fort", "Sam sand dunes", "Desert camps"],
      },
      {
        name: "Pushkar",
        category: "spiritual",
        nearestGateway: "Ajmer",
        highlights: ["Brahma temple", "Pushkar lake", "Bazaar walks"],
      },
      {
        name: "Ranthambore",
        category: "wildlife",
        nearestGateway: "Jaipur",
        highlights: ["Tiger reserve safari", "Fort inside park", "Jeep drives"],
      },
      {
        name: "Mount Abu",
        category: "hill-station",
        nearestGateway: "Udaipur",
        highlights: ["Nakki lake", "Dilwara temples", "Sunset points"],
      },
    ],
  },
  {
    stateOrUT: "Sikkim",
    majorCities: ["Gangtok", "Namchi", "Gyalshing"],
    touristPlaces: [
      {
        name: "Gangtok",
        category: "hill-station",
        nearestGateway: "Bagdogra",
        highlights: ["MG Marg", "Monastery circuits", "Cable car"],
      },
      {
        name: "Tsomgo Lake",
        category: "nature",
        nearestGateway: "Gangtok",
        highlights: ["High altitude lake", "Snow landscapes", "Yak rides"],
      },
      {
        name: "Pelling",
        category: "hill-station",
        nearestGateway: "Gangtok",
        highlights: ["Kanchenjunga views", "Monasteries", "Skywalk"],
      },
      {
        name: "Lachung",
        category: "adventure",
        nearestGateway: "Gangtok",
        highlights: ["Mountain village", "Scenic routes", "North Sikkim circuit"],
      },
      {
        name: "Yumthang Valley",
        category: "nature",
        nearestGateway: "Lachung",
        highlights: ["Valley flowers", "River views", "High-altitude meadows"],
      },
    ],
  },
  {
    stateOrUT: "Tamil Nadu",
    majorCities: ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli"],
    touristPlaces: [
      {
        name: "Ooty",
        category: "hill-station",
        nearestGateway: "Coimbatore",
        highlights: ["Botanical gardens", "Ooty lake", "Doddabetta"],
      },
      {
        name: "Kodaikanal",
        category: "hill-station",
        nearestGateway: "Madurai",
        highlights: ["Kodaikanal lake", "Coaker’s walk", "Pillar rocks"],
      },
      {
        name: "Rameswaram",
        category: "spiritual",
        nearestGateway: "Madurai",
        highlights: ["Ramanathaswamy temple", "Pamban bridge", "Dhanushkodi"],
      },
      {
        name: "Mahabalipuram",
        category: "heritage",
        nearestGateway: "Chennai",
        highlights: ["Shore temple", "Stone carvings", "Beachfront monuments"],
      },
      {
        name: "Kanyakumari",
        category: "beach",
        nearestGateway: "Tirunelveli",
        highlights: ["Sunrise and sunset points", "Vivekananda Rock", "Coastal views"],
      },
      {
        name: "Thanjavur",
        category: "heritage",
        nearestGateway: "Tiruchirappalli",
        highlights: ["Brihadeeswara temple", "Art heritage", "Palace complex"],
      },
    ],
  },
  {
    stateOrUT: "Telangana",
    majorCities: ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar"],
    touristPlaces: [
      {
        name: "Hyderabad",
        category: "city-break",
        nearestGateway: "Hyderabad",
        highlights: ["Charminar", "Golconda fort", "Food trails"],
      },
      {
        name: "Ramappa Temple",
        category: "heritage",
        nearestGateway: "Warangal",
        highlights: ["Kakatiya architecture", "UNESCO heritage", "Temple complex"],
      },
      {
        name: "Nagarjuna Sagar",
        category: "nature",
        nearestGateway: "Hyderabad",
        highlights: ["Dam views", "Boating", "Island museum"],
      },
      {
        name: "Bhongir Fort",
        category: "adventure",
        nearestGateway: "Hyderabad",
        highlights: ["Hill fort climb", "Panoramic views", "Historic trail"],
      },
    ],
  },
  {
    stateOrUT: "Tripura",
    majorCities: ["Agartala", "Udaipur Tripura"],
    touristPlaces: [
      {
        name: "Ujjayanta Palace",
        category: "heritage",
        nearestGateway: "Agartala",
        highlights: ["Royal palace museum", "Architecture", "City heritage"],
      },
      {
        name: "Neermahal",
        category: "heritage",
        nearestGateway: "Agartala",
        highlights: ["Lake palace", "Boat access", "Historic structure"],
      },
      {
        name: "Unakoti",
        category: "heritage",
        nearestGateway: "Agartala",
        highlights: ["Rock carvings", "Forest setting", "Archaeological interest"],
      },
    ],
  },
  {
    stateOrUT: "Uttar Pradesh",
    majorCities: ["Lucknow", "Varanasi", "Agra", "Prayagraj", "Kanpur", "Noida"],
    touristPlaces: [
      {
        name: "Agra",
        category: "heritage",
        nearestGateway: "Agra",
        highlights: ["Taj Mahal", "Agra Fort", "Mehtab Bagh"],
      },
      {
        name: "Varanasi",
        category: "spiritual",
        nearestGateway: "Varanasi",
        highlights: ["Ganga ghats", "Evening aarti", "Old city lanes"],
      },
      {
        name: "Ayodhya",
        category: "spiritual",
        nearestGateway: "Lucknow",
        highlights: ["Ram temple circuits", "Ghats", "Pilgrim routes"],
      },
      {
        name: "Mathura Vrindavan",
        category: "spiritual",
        nearestGateway: "Agra",
        highlights: ["Krishna temples", "Yamuna ghats", "Festive circuits"],
      },
      {
        name: "Sarnath",
        category: "heritage",
        nearestGateway: "Varanasi",
        highlights: ["Buddhist sites", "Dhamek stupa", "Museum"],
      },
      {
        name: "Dudhwa National Park",
        category: "wildlife",
        nearestGateway: "Lucknow",
        highlights: ["Tiger reserve", "Grassland ecosystem", "Jeep safaris"],
      },
    ],
  },
  {
    stateOrUT: "Uttarakhand",
    majorCities: ["Dehradun", "Haridwar", "Nainital", "Haldwani", "Rudrapur"],
    touristPlaces: [
      {
        name: "Rishikesh",
        category: "adventure",
        nearestGateway: "Dehradun",
        highlights: ["River rafting", "Ghats", "Yoga retreats"],
      },
      {
        name: "Mussoorie",
        category: "hill-station",
        nearestGateway: "Dehradun",
        highlights: ["Mall road", "Kempty falls", "Mountain views"],
      },
      {
        name: "Nainital",
        category: "hill-station",
        nearestGateway: "Haldwani",
        highlights: ["Naini lake", "Snow view point", "Lake district"],
      },
      {
        name: "Auli",
        category: "adventure",
        nearestGateway: "Dehradun",
        highlights: ["Ski slopes", "Cable car", "Himalayan panoramas"],
      },
      {
        name: "Kedarnath",
        category: "spiritual",
        nearestGateway: "Dehradun",
        highlights: ["Char Dham route", "High altitude shrine", "Trek circuit"],
      },
      {
        name: "Badrinath",
        category: "spiritual",
        nearestGateway: "Dehradun",
        highlights: ["Temple town", "Alaknanda valley", "Pilgrim route"],
      },
      {
        name: "Jim Corbett National Park",
        category: "wildlife",
        nearestGateway: "Ramnagar",
        highlights: ["Safari zones", "River ecosystem", "Forest lodges"],
      },
    ],
  },
  {
    stateOrUT: "West Bengal",
    majorCities: ["Kolkata", "Siliguri", "Durgapur", "Asansol"],
    touristPlaces: [
      {
        name: "Darjeeling",
        category: "hill-station",
        nearestGateway: "Siliguri",
        highlights: ["Tea gardens", "Toy train", "Tiger hill sunrise"],
      },
      {
        name: "Kalimpong",
        category: "hill-station",
        nearestGateway: "Siliguri",
        highlights: ["Monasteries", "Viewpoints", "Flower nurseries"],
      },
      {
        name: "Sundarbans",
        category: "wildlife",
        nearestGateway: "Kolkata",
        highlights: ["Mangrove delta", "Boat safaris", "Biodiversity"],
      },
      {
        name: "Digha",
        category: "beach",
        nearestGateway: "Kolkata",
        highlights: ["Sea beach", "Coastal stays", "Weekend trips"],
      },
      {
        name: "Shantiniketan",
        category: "heritage",
        nearestGateway: "Kolkata",
        highlights: ["Tagore heritage", "Art and culture", "Campus walks"],
      },
    ],
  },
  {
    stateOrUT: "Andaman and Nicobar Islands",
    majorCities: ["Port Blair"],
    touristPlaces: [
      {
        name: "Havelock Island",
        category: "island",
        nearestGateway: "Port Blair",
        highlights: ["Radhanagar beach", "Scuba and snorkeling", "Island stays"],
      },
      {
        name: "Neil Island",
        category: "island",
        nearestGateway: "Port Blair",
        highlights: ["Calm beaches", "Natural bridge", "Cycling routes"],
      },
      {
        name: "Cellular Jail",
        category: "heritage",
        nearestGateway: "Port Blair",
        highlights: ["Freedom history", "Light and sound show", "Museum"],
      },
    ],
  },
  {
    stateOrUT: "Chandigarh",
    majorCities: ["Chandigarh"],
    touristPlaces: [
      {
        name: "Sukhna Lake",
        category: "city-break",
        nearestGateway: "Chandigarh",
        highlights: ["Lake promenade", "Boating", "Sunset views"],
      },
      {
        name: "Rock Garden",
        category: "heritage",
        nearestGateway: "Chandigarh",
        highlights: ["Art installations", "Sculpture trails", "Urban landmark"],
      },
      {
        name: "Rose Garden Chandigarh",
        category: "city-break",
        nearestGateway: "Chandigarh",
        highlights: ["Botanical trails", "Seasonal blooms", "Family outing"],
      },
    ],
  },
  {
    stateOrUT: "Dadra and Nagar Haveli and Daman and Diu",
    majorCities: ["Silvassa", "Daman", "Diu"],
    touristPlaces: [
      {
        name: "Diu Fort",
        category: "heritage",
        nearestGateway: "Diu",
        highlights: ["Sea fort", "Historic walls", "Coastal views"],
      },
      {
        name: "Nagoa Beach",
        category: "beach",
        nearestGateway: "Diu",
        highlights: ["Beach relaxation", "Water activities", "Family stays"],
      },
      {
        name: "Silvassa Lion Safari",
        category: "wildlife",
        nearestGateway: "Silvassa",
        highlights: ["Wildlife enclosure", "Nature park", "Weekend family spot"],
      },
    ],
  },
  {
    stateOrUT: "Delhi",
    majorCities: ["New Delhi", "Delhi"],
    touristPlaces: [
      {
        name: "Red Fort",
        category: "heritage",
        nearestGateway: "New Delhi",
        highlights: ["Mughal architecture", "Historic exhibits", "Old Delhi circuit"],
      },
      {
        name: "Qutub Minar",
        category: "heritage",
        nearestGateway: "New Delhi",
        highlights: ["UNESCO site", "Monument complex", "Architectural history"],
      },
      {
        name: "India Gate",
        category: "city-break",
        nearestGateway: "New Delhi",
        highlights: ["War memorial", "Evening promenade", "City center"],
      },
      {
        name: "Akshardham Delhi",
        category: "spiritual",
        nearestGateway: "New Delhi",
        highlights: ["Temple complex", "Cultural exhibits", "Evening show"],
      },
    ],
  },
  {
    stateOrUT: "Jammu and Kashmir",
    majorCities: ["Srinagar", "Jammu", "Anantnag", "Baramulla"],
    touristPlaces: [
      {
        name: "Srinagar",
        category: "hill-station",
        nearestGateway: "Srinagar",
        highlights: ["Dal lake shikara", "Mughal gardens", "Old city"],
      },
      {
        name: "Gulmarg",
        category: "adventure",
        nearestGateway: "Srinagar",
        highlights: ["Gondola rides", "Snow sports", "Alpine meadows"],
      },
      {
        name: "Pahalgam",
        category: "nature",
        nearestGateway: "Srinagar",
        highlights: ["Lidder valley", "River walks", "Scenic meadows"],
      },
      {
        name: "Sonamarg",
        category: "nature",
        nearestGateway: "Srinagar",
        highlights: ["Glacier viewpoints", "Mountain drives", "Adventure base"],
      },
      {
        name: "Vaishno Devi",
        category: "spiritual",
        nearestGateway: "Jammu",
        highlights: ["Pilgrim trek", "Katra base", "Temple shrine"],
      },
    ],
  },
  {
    stateOrUT: "Ladakh",
    majorCities: ["Leh", "Kargil"],
    touristPlaces: [
      {
        name: "Leh",
        category: "adventure",
        nearestGateway: "Leh",
        highlights: ["Monasteries", "Local markets", "Acclimatization base"],
      },
      {
        name: "Pangong Lake",
        category: "nature",
        nearestGateway: "Leh",
        highlights: ["High altitude lake", "Changing blue shades", "Road trip route"],
      },
      {
        name: "Nubra Valley",
        category: "adventure",
        nearestGateway: "Leh",
        highlights: ["Sand dunes", "Camel rides", "Monastery villages"],
      },
      {
        name: "Khardung La",
        category: "adventure",
        nearestGateway: "Leh",
        highlights: ["High motorable pass", "Mountain views", "Biker route"],
      },
      {
        name: "Tso Moriri",
        category: "nature",
        nearestGateway: "Leh",
        highlights: ["Lake landscapes", "Remote circuits", "Photography"],
      },
    ],
  },
  {
    stateOrUT: "Lakshadweep",
    majorCities: ["Kavaratti", "Agatti"],
    touristPlaces: [
      {
        name: "Kavaratti",
        category: "island",
        nearestGateway: "Agatti",
        highlights: ["Lagoon waters", "Island life", "Water sports"],
      },
      {
        name: "Agatti Island",
        category: "island",
        nearestGateway: "Agatti",
        highlights: ["Coral reefs", "Beach stays", "Snorkeling"],
      },
      {
        name: "Bangaram Island",
        category: "island",
        nearestGateway: "Agatti",
        highlights: ["Blue lagoons", "Diving zones", "Resort island"],
      },
      {
        name: "Minicoy",
        category: "island",
        nearestGateway: "Agatti",
        highlights: ["Lighthouse", "Lagoon activities", "Island culture"],
      },
    ],
  },
  {
    stateOrUT: "Puducherry",
    majorCities: ["Puducherry", "Karaikal"],
    touristPlaces: [
      {
        name: "White Town Puducherry",
        category: "city-break",
        nearestGateway: "Puducherry",
        highlights: ["French quarter streets", "Cafe culture", "Promenade walks"],
      },
      {
        name: "Auroville",
        category: "city-break",
        nearestGateway: "Puducherry",
        highlights: ["Matrimandir", "Community spaces", "Craft centers"],
      },
      {
        name: "Paradise Beach Puducherry",
        category: "beach",
        nearestGateway: "Puducherry",
        highlights: ["Boat access", "Calm coastline", "Leisure stop"],
      },
    ],
  },
];

export const INDIA_STATES_AND_UTS = INDIA_STATE_TRAVEL_BLOCKS.map((block) => block.stateOrUT);

export const INDIA_MAJOR_CITIES = Array.from(
  new Set(INDIA_STATE_TRAVEL_BLOCKS.flatMap((block) => block.majorCities))
).sort((left, right) => left.localeCompare(right));

export const INDIA_TOURIST_PLACES = INDIA_STATE_TRAVEL_BLOCKS.flatMap((block) =>
  block.touristPlaces.map((place) => ({
    ...place,
    stateOrUT: block.stateOrUT,
  }))
);
