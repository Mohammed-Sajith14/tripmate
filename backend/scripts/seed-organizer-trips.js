import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.model.js';
import Trip from '../models/Trip.model.js';

dotenv.config();

const seedData = {
  smileytrips: [
    {
      title: 'Manali Mountain Reset',
      destination: 'Manali',
      country: 'India',
      location: { name: 'Manali, Himachal Pradesh', latitude: 32.2432, longitude: 77.1892 },
      category: 'Hills',
      startDate: '2026-04-10',
      endDate: '2026-04-15',
      bookingDeadline: '2026-04-05',
      priceMin: 420,
      priceMax: 650,
      totalSpots: 20,
      coverImage: 'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=1200',
      description:
        'A relaxed hill getaway covering local cafes, Solang viewpoints, and slow travel experiences in Manali.',
      itinerary: [
        { day: 1, title: 'Arrival & Orientation', description: 'Check-in, local walk, and welcome dinner.' },
        { day: 2, title: 'Solang Valley', description: 'Scenic valley tour and optional activities.' },
        { day: 3, title: 'Old Manali Trails', description: 'Heritage lanes, cafes, and riverside evening.' },
      ],
      inclusions: ['Hotel stay', 'Breakfast', 'Local transport'],
      exclusions: ['Flights', 'Personal shopping'],
      cancellationPolicy: 'Full refund up to 7 days before departure.',
      refundPolicy: 'Refund processed within 5-7 working days.',
      minimumGroupSize: 4,
      requirements: 'Carry valid government ID.',
      importantNotes: 'Weather can drop at night; carry warm layers.',
    },
    {
      title: 'Goa Beach Recharge',
      destination: 'Goa',
      country: 'India',
      location: { name: 'Calangute, Goa', latitude: 15.5449, longitude: 73.7553 },
      category: 'Beach',
      startDate: '2026-05-08',
      endDate: '2026-05-12',
      bookingDeadline: '2026-05-02',
      priceMin: 380,
      priceMax: 580,
      totalSpots: 24,
      coverImage: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1200',
      description:
        'A balanced Goa itinerary with beach time, old churches, and local seafood trails.',
      itinerary: [
        { day: 1, title: 'North Goa Arrival', description: 'Hotel check-in and sunset beach evening.' },
        { day: 2, title: 'Beach Circuit', description: 'Calangute, Baga, and Candolim with free time.' },
        { day: 3, title: 'Old Goa Heritage', description: 'Churches, museums, and riverside dining.' },
      ],
      inclusions: ['Resort stay', 'Breakfast', 'Guided day tour'],
      exclusions: ['Airfare', 'Water sports tickets'],
      cancellationPolicy: '80% refund before 5 days of departure.',
      refundPolicy: 'Refund to original payment method.',
      minimumGroupSize: 4,
      requirements: 'Casual wear and sunscreen recommended.',
      importantNotes: 'Monsoon showers are possible in late evenings.',
    },
    {
      title: 'Munnar Tea Valley Retreat',
      destination: 'Munnar',
      country: 'India',
      location: { name: 'Munnar, Kerala', latitude: 10.0889, longitude: 77.0595 },
      category: 'Nature',
      startDate: '2026-06-14',
      endDate: '2026-06-18',
      bookingDeadline: '2026-06-08',
      priceMin: 400,
      priceMax: 620,
      totalSpots: 18,
      coverImage: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=1200',
      description:
        'Tea gardens, misty viewpoints, and spice trails for a calm and scenic Kerala break.',
      itinerary: [
        { day: 1, title: 'Munnar Check-in', description: 'Welcome and tea estate orientation.' },
        { day: 2, title: 'Eravikulam Visit', description: 'Nature park and panoramic viewpoints.' },
        { day: 3, title: 'Spice Garden Trail', description: 'Guided walk and local market stop.' },
      ],
      inclusions: ['Hotel stay', 'Breakfast', 'Sightseeing transfers'],
      exclusions: ['Flights', 'Entry tickets for optional attractions'],
      cancellationPolicy: '70% refund before 6 days of departure.',
      refundPolicy: 'Refund completed within one week.',
      minimumGroupSize: 4,
      requirements: 'Comfortable walking shoes needed.',
      importantNotes: 'Early mornings can be foggy with light drizzle.',
    },
    {
      title: 'Kutch White Desert Road Trip',
      destination: 'Kutch',
      country: 'India',
      location: { name: 'Dhordo, Gujarat', latitude: 23.8254, longitude: 69.3754 },
      category: 'Road Trip',
      startDate: '2026-11-20',
      endDate: '2026-11-25',
      bookingDeadline: '2026-11-10',
      priceMin: 520,
      priceMax: 780,
      totalSpots: 16,
      coverImage: 'https://images.pexels.com/photos/1001435/pexels-photo-1001435.jpeg?auto=compress&cs=tinysrgb&w=1200',
      description:
        'White Rann sunset views, folk performances, and desert road journeys with curated stops.',
      itinerary: [
        { day: 1, title: 'Bhuj Arrival', description: 'City briefing and local cuisine night.' },
        { day: 2, title: 'Drive to Dhordo', description: 'Desert camp check-in and evening cultural show.' },
        { day: 3, title: 'White Rann Exploration', description: 'Sunrise-sunset experiences and handicraft markets.' },
      ],
      inclusions: ['Camp stay', 'Breakfast & dinner', 'Road transfers'],
      exclusions: ['Flights', 'Personal shopping'],
      cancellationPolicy: '70% refund before 10 days of departure.',
      refundPolicy: 'Processed within 7 working days.',
      minimumGroupSize: 6,
      requirements: 'Carry ID for permit verification.',
      importantNotes: 'Evenings are cold; carry warm clothing.',
    },
    {
      title: 'Andaman Island Escape',
      destination: 'Port Blair',
      country: 'India',
      location: { name: 'Port Blair, Andaman', latitude: 11.6234, longitude: 92.7265 },
      category: 'Beach',
      startDate: '2026-07-05',
      endDate: '2026-07-10',
      bookingDeadline: '2026-06-25',
      priceMin: 720,
      priceMax: 980,
      totalSpots: 14,
      coverImage: 'https://images.pexels.com/photos/457882/pexels-photo-457882.jpeg?auto=compress&cs=tinysrgb&w=1200',
      description:
        'Crystal-clear beaches, ferry rides, and island hopping with balanced leisure and activities.',
      itinerary: [
        { day: 1, title: 'Port Blair Arrival', description: 'Hotel check-in and Cellular Jail visit.' },
        { day: 2, title: 'Havelock Transfer', description: 'Ferry ride and Radhanagar beach sunset.' },
        { day: 3, title: 'Island Leisure', description: 'Optional snorkeling and beach relaxation.' },
      ],
      inclusions: ['Hotel stay', 'Breakfast', 'Inter-island ferry tickets'],
      exclusions: ['Flights', 'Water activity fees'],
      cancellationPolicy: '75% refund before 8 days of departure.',
      refundPolicy: 'Refund to source account within a week.',
      minimumGroupSize: 4,
      requirements: 'Carry government ID and light beachwear.',
      importantNotes: 'Ferry timings can shift due to weather.',
    },
  ],
  tripfactory: [
    {
      title: 'Bali Culture & Coastline',
      destination: 'Bali',
      country: 'Indonesia',
      location: { name: 'Ubud, Bali', latitude: -8.5069, longitude: 115.2625 },
      category: 'Beach',
      startDate: '2026-04-22',
      endDate: '2026-04-28',
      bookingDeadline: '2026-04-12',
      priceMin: 980,
      priceMax: 1350,
      totalSpots: 22,
      coverImage: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200',
      description:
        'A curated Bali route covering Ubud, temple circuits, beach sunsets, and local arts.',
      itinerary: [
        { day: 1, title: 'Denpasar Arrival', description: 'Airport transfer and Ubud check-in.' },
        { day: 2, title: 'Temple Trail', description: 'Tanah Lot and Uluwatu with cultural performance.' },
        { day: 3, title: 'Beach & Market Day', description: 'Seminyak leisure and local shopping.' },
      ],
      inclusions: ['Hotel stay', 'Daily breakfast', 'Airport transfers'],
      exclusions: ['International airfare', 'Personal expenses'],
      cancellationPolicy: '80% refund before 7 days of departure.',
      refundPolicy: 'Refund initiated within 5 working days.',
      minimumGroupSize: 4,
      requirements: 'Passport valid for 6+ months.',
      importantNotes: 'Carry modest attire for temple visits.',
    },
    {
      title: 'Swiss Alps Scenic Journey',
      destination: 'Interlaken',
      country: 'Switzerland',
      location: { name: 'Interlaken, Switzerland', latitude: 46.6863, longitude: 7.8632 },
      category: 'Mountain',
      startDate: '2026-06-02',
      endDate: '2026-06-09',
      bookingDeadline: '2026-05-20',
      priceMin: 2100,
      priceMax: 2800,
      totalSpots: 12,
      coverImage: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1200',
      description:
        'Iconic alpine train routes, mountain villages, and Swiss lake panoramas in one itinerary.',
      itinerary: [
        { day: 1, title: 'Zurich Arrival', description: 'City transfer and onboarding.' },
        { day: 2, title: 'Interlaken Circuit', description: 'Town exploration and lake cruise.' },
        { day: 3, title: 'Alpine Excursion', description: 'High-altitude scenic rail and viewpoints.' },
      ],
      inclusions: ['Hotel stay', 'Breakfast', 'Intercity train pass'],
      exclusions: ['Visa fees', 'Optional adventure activities'],
      cancellationPolicy: '70% refund before 12 days of departure.',
      refundPolicy: 'Refund in 7-10 working days.',
      minimumGroupSize: 4,
      requirements: 'Schengen visa required.',
      importantNotes: 'Layered clothing required for alpine weather.',
    },
    {
      title: 'Istanbul & Cappadocia Highlights',
      destination: 'Istanbul',
      country: 'Turkey',
      location: { name: 'Istanbul, Turkey', latitude: 41.0082, longitude: 28.9784 },
      category: 'Cultural',
      startDate: '2026-05-15',
      endDate: '2026-05-21',
      bookingDeadline: '2026-05-05',
      priceMin: 1280,
      priceMax: 1760,
      totalSpots: 18,
      coverImage: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200',
      description:
        'Mosques, bazaars, Bosphorus views, and a Cappadocia extension for cave landscapes.',
      itinerary: [
        { day: 1, title: 'Istanbul Arrival', description: 'Check-in and old city evening walk.' },
        { day: 2, title: 'Historic Core', description: 'Hagia Sophia, Blue Mosque, and Grand Bazaar.' },
        { day: 3, title: 'Cappadocia Transfer', description: 'Flight and cave valley tour.' },
      ],
      inclusions: ['Hotel stay', 'Breakfast', 'Domestic transfer segment'],
      exclusions: ['International flights', 'Balloon ride charges'],
      cancellationPolicy: '75% refund before 9 days of departure.',
      refundPolicy: 'Bank refund in 5-7 business days.',
      minimumGroupSize: 4,
      requirements: 'Passport + travel insurance.',
      importantNotes: 'Activity schedules depend on weather conditions.',
    },
    {
      title: 'Vietnam Heritage Explorer',
      destination: 'Hanoi',
      country: 'Vietnam',
      location: { name: 'Hanoi, Vietnam', latitude: 21.0278, longitude: 105.8342 },
      category: 'Food & Culture',
      startDate: '2026-07-18',
      endDate: '2026-07-24',
      bookingDeadline: '2026-07-08',
      priceMin: 860,
      priceMax: 1240,
      totalSpots: 20,
      coverImage: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=1200',
      description:
        'Street food curation, old-quarter heritage, and short scenic escapes around Hanoi.',
      itinerary: [
        { day: 1, title: 'Arrival in Hanoi', description: 'Check-in and evening food walk.' },
        { day: 2, title: 'Old Quarter Heritage', description: 'Guided city highlights and cultural sites.' },
        { day: 3, title: 'Day Excursion', description: 'Scenic outskirts and local crafts stop.' },
      ],
      inclusions: ['Hotel stay', 'Breakfast', 'City tour'],
      exclusions: ['International airfare', 'Personal meals outside inclusions'],
      cancellationPolicy: '80% refund before 6 days of departure.',
      refundPolicy: 'Refund in 4-6 business days.',
      minimumGroupSize: 4,
      requirements: 'Passport and visa as applicable.',
      importantNotes: 'Keep local cash for street purchases.',
    },
    {
      title: 'Kenya Wildlife Safari Circuit',
      destination: 'Nairobi',
      country: 'Kenya',
      location: { name: 'Nairobi, Kenya', latitude: -1.2921, longitude: 36.8219 },
      category: 'Wildlife',
      startDate: '2026-08-08',
      endDate: '2026-08-14',
      bookingDeadline: '2026-07-25',
      priceMin: 1950,
      priceMax: 2550,
      totalSpots: 10,
      coverImage: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1200',
      description:
        'Safari-focused journey with curated game drives, nature reserves, and expert-guided sessions.',
      itinerary: [
        { day: 1, title: 'Nairobi Arrival', description: 'Orientation and safari briefing.' },
        { day: 2, title: 'Reserve Game Drive', description: 'Morning and evening wildlife drives.' },
        { day: 3, title: 'Conservation Day', description: 'Guided reserve experience and local insights.' },
      ],
      inclusions: ['Lodge stay', 'Breakfast & dinner', 'Game drive permits'],
      exclusions: ['International flights', 'Optional activities'],
      cancellationPolicy: '70% refund before 14 days of departure.',
      refundPolicy: 'Processed in 7-10 business days.',
      minimumGroupSize: 4,
      requirements: 'Travel insurance mandatory.',
      importantNotes: 'Carry neutral-color clothing and binoculars.',
    },
  ],
};

const ensureEnvironment = () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is missing. Please configure backend/.env before running this script.');
  }
};

const createTripsForOrganizer = async (organizerUserId, templates) => {
  const organizer = await User.findOne({ userId: organizerUserId.toLowerCase() }).select('_id userId fullName stats');

  if (!organizer) {
    console.log(`⚠️ Organizer not found: ${organizerUserId}`);
    return { created: 0, skipped: templates.length, missing: true };
  }

  let created = 0;
  let skipped = 0;

  for (const template of templates) {
    const existing = await Trip.findOne({ organizer: organizer._id, title: template.title }).select('_id');

    if (existing) {
      skipped += 1;
      continue;
    }

    await Trip.create({
      ...template,
      startDate: new Date(template.startDate),
      endDate: new Date(template.endDate),
      bookingDeadline: template.bookingDeadline ? new Date(template.bookingDeadline) : undefined,
      organizer: organizer._id,
      availableSpots: template.totalSpots,
      galleryImages: [],
      isPublished: true,
      isDraft: false,
    });

    created += 1;
  }

  if (created > 0) {
    await User.findByIdAndUpdate(organizer._id, {
      $inc: { 'stats.tripsCreated': created },
    });
  }

  console.log(`✅ ${organizer.userId}: created ${created}, skipped ${skipped}`);
  return { created, skipped, missing: false };
};

const run = async () => {
  ensureEnvironment();

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Atlas Connected Successfully');
  } catch (error) {
    console.error('❌ MongoDB Atlas Connection Failed:', error);
    throw error;
  }

  try {
    let totalCreated = 0;
    let totalSkipped = 0;

    for (const [organizerUserId, templates] of Object.entries(seedData)) {
      const result = await createTripsForOrganizer(organizerUserId, templates);
      totalCreated += result.created;
      totalSkipped += result.skipped;
    }

    console.log('----------------------------------------');
    console.log(`🎉 Done. Total created: ${totalCreated}, total skipped: ${totalSkipped}`);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

run().catch((error) => {
  console.error('❌ Failed to seed organizer trips:', error.message);
  process.exit(1);
});
