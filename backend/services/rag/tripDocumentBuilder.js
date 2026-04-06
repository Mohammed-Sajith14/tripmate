const getDurationDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null;
  }

  return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
};

const formatList = (items = []) =>
  items
    .filter((value) => typeof value === 'string' && value.trim() !== '')
    .map((value) => value.trim())
    .join(', ');

const formatItinerary = (itinerary = []) => {
  if (!Array.isArray(itinerary) || itinerary.length === 0) {
    return 'Not provided';
  }

  return itinerary
    .slice(0, 7)
    .map((entry) => {
      const dayLabel = entry?.day ? `Day ${entry.day}` : 'Day Plan';
      const title = entry?.title || 'Activity';
      const description = entry?.description || '';
      return `${dayLabel}: ${title}${description ? ` - ${description}` : ''}`;
    })
    .join(' | ');
};

const buildTripContent = (trip) => {
  const durationDays = getDurationDays(trip.startDate, trip.endDate);
  const organizerName =
    trip?.organizer?.fullName ||
    trip?.organizer?.organizationName ||
    trip?.organizer?.userId ||
    'Organizer';

  const contentSections = [
    `Trip title: ${trip.title}`,
    `Destination: ${trip.destination}, ${trip.country}`,
    `Location label: ${trip?.location?.name || trip.destination}`,
    `Category: ${trip.category}`,
    `Duration: ${durationDays ? `${durationDays} days` : 'Unknown duration'}`,
    `Price range: INR ${trip.priceMin} to INR ${trip.priceMax}`,
    `Available spots: ${trip.availableSpots}/${trip.totalSpots}`,
    `Organizer: ${organizerName}`,
    `Description: ${trip.description || 'No description'}`,
    `Itinerary: ${formatItinerary(trip.itinerary)}`,
    `Inclusions: ${formatList(trip.inclusions) || 'Not provided'}`,
    `Exclusions: ${formatList(trip.exclusions) || 'Not provided'}`,
    `Important notes: ${trip.importantNotes || 'Not provided'}`,
  ];

  return contentSections.join('\n');
};

export const buildTripDocuments = (trips = []) =>
  trips.map((trip) => {
    const organizerName =
      trip?.organizer?.fullName ||
      trip?.organizer?.organizationName ||
      trip?.organizer?.userId ||
      'Organizer';

    const organizerUserId = trip?.organizer?.userId || '';

    return {
      id: String(trip._id),
      title: trip.title,
      destination: trip.destination,
      country: trip.country,
      locationName: trip?.location?.name || trip.destination,
      category: trip.category,
      durationDays: getDurationDays(trip.startDate, trip.endDate),
      priceMin: trip.priceMin,
      priceMax: trip.priceMax,
      availableSpots: trip.availableSpots,
      totalSpots: trip.totalSpots,
      startDate: trip.startDate,
      endDate: trip.endDate,
      organizerName,
      organizerUserId,
      organizerId: trip?.organizer?._id ? String(trip.organizer._id) : '',
      description: trip.description || '',
      itinerary: Array.isArray(trip.itinerary) ? trip.itinerary : [],
      content: buildTripContent(trip),
    };
  });
