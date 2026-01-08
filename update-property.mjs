import { drizzle } from 'drizzle-orm/mysql2';
import { eq } from 'drizzle-orm';
import { properties } from './drizzle/schema.ts';

const db = drizzle(process.env.DATABASE_URL);

async function updateProperty() {
  console.log('Updating Boracay Beach Resort with comprehensive data...');
  
  const result = await db.update(properties)
    .set({
      assetClass: 'Hospitality',
      address: 'Station 1, White Beach, Boracay Island, Malay, Aklan',
      landSizeSqm: '12500.00',
      landSizeHa: '1.25',
      buildingAreaSqm: '8900.00',
      floorAreaSqm: '8200.00',
      floors: 5,
      units: 120,
      unitsDetails: '60 Deluxe Ocean View Rooms, 40 Premium Beachfront Suites, 15 Presidential Villas, 5 Penthouse Suites',
      floorAreaRatio: '2.85',
      askingPriceNet: '42000000.00',
      askingPriceGross: '47500000.00',
      currency: 'USD',
      incomeGenerating: true,
      incomeDetails: 'Current annual revenue: $6.8M with 85% occupancy rate. Peak season occupancy reaches 98%. Detailed financial statements and projections available after NDA.',
      others: 'Beachfront property with 150m private beach access, infinity pool overlooking the ocean, spa and wellness center, 3 restaurants including rooftop dining, water sports equipment included, helipad access.'
    })
    .where(eq(properties.id, 1));
  
  console.log('Update result:', result);
  
  // Verify the update
  const updated = await db.select().from(properties).where(eq(properties.id, 1));
  console.log('Updated property data:', {
    id: updated[0].id,
    title: updated[0].title,
    landSizeSqm: updated[0].landSizeSqm,
    buildingAreaSqm: updated[0].buildingAreaSqm,
    floors: updated[0].floors,
    units: updated[0].units,
    assetClass: updated[0].assetClass,
    askingPriceNet: updated[0].askingPriceNet
  });
  
  process.exit(0);
}

updateProperty().catch(console.error);
