import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { properties } from './drizzle/schema.ts';
import 'dotenv/config';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

try {
  const testProperty = {
    title: "Anya Villas – Ultra-Luxury Residential Villas, Tagaytay",
    realPropertyName: "Anya Villas – Ultra-Luxury Residential Villas, Tagaytay",
    slug: "anya-villas-ultra-luxury-tagaytay",
    shortDescription: "Fully developed ultra-luxury residential villa estate in Tagaytay, income generating, offering exclusive end-user living or high-end rental investment potential within a world-class resort environment.",
    longDescription: "Anya Villas is a fully developed, ultra-luxury residential property located in the highly desirable Tagaytay lifestyle corridor. Set within a private, resort-style environment, the estate combines exclusivity, privacy, and five-star amenities, making it suitable both for discerning end-users and investors seeking premium residential rental exposure.\n\nThe villas are suitable for private end-use or as premium rental assets. Owners may generate income through short- or long-term leasing, subject to estate guidelines and management arrangements.\n\nThe villas are designed as expansive private residences with generous lot allocations, high-end finishes, and dedicated leisure spaces. Each villa configuration emphasizes privacy, indoor-outdoor living, and functionality for both personal use and entertaining. Supported by comprehensive resort amenities and professional property management infrastructure, Anya Villas offers a rare opportunity to acquire completed luxury homes in one of the Philippines' most established leisure destinations.",
    region: "SouthEastAsia",
    country: "Philippines",
    city: "Tagaytay City, Cavite CALABARZON (Region IV-A)",
    address: " Buenavista Hills Road, Brgy. Mag-aswang Ilat, Tagaytay City",
    propertyType: "Residential",
    assetClass: "Residential",
    buildingAreaSqm: "500",
    floorAreaSqm: "500",
    units: 72,
    unitsDetails: "Approx. 500 – 600 sqm per villa, Each villa consists of a Master Casita (Master Bedroom suite) and an Entertainment Casita designed for hosting, featuring a social kitchen, private heated swimming pool, and outdoor spaces suitable for private dining and barbecues.",
    askingPriceNet: "50600000",
    incomeGenerating: true,
    incomeDetails: "The villas are suitable for private end-use or as premium rental assets. Owners may generate income through short- or long-term leasing, subject to estate guidelines and management arrangements.",
    currency: "PHP",
    features: ["Spacious master suites, dedicated entertainment casitas, high-end finishes, private heated pools, and thoughtfully designed indoor-outdoor living spaces."],
    amenities: ["World-class gastronomy offerings, Anila Poolside Restaurant, Amra Café, Wellness Pavilion, Elite Club Lounge, Anya Lounge, resort-style heated pool, Tala Garden, library, ballroom for grand events, and boardroom facilities."],
    images: [
      "https://d2xsxph8kpxj0f.cloudfront.net/310419663029887923/DnWsBVTJUtGDXWt9zvifVT/properties/1767507768412-jilecr.jpg",
      "https://d2xsxph8kpxj0f.cloudfront.net/310419663029887923/DnWsBVTJUtGDXWt9zvifVT/properties/1767507775581-wx85g.webp",
      "https://d2xsxph8kpxj0f.cloudfront.net/310419663029887923/DnWsBVTJUtGDXWt9zvifVT/properties/1767507779574-2wjnvo.jpg"
    ],
    imageCaptions: {},
    mainImage: "https://d2xsxph8kpxj0f.cloudfront.net/310419663029887923/DnWsBVTJUtGDXWt9zvifVT/properties/1767507768412-jilecr.jpg",
    status: "available",
    others: "Anya Villas represents a rare opportunity to acquire fully developed luxury villas within a resort-grade environment in Tagaytay. The combination of low-density planning, expansive villa layouts, and comprehensive lifestyle amenities positions the estate at the top end of the residential market. The property appeals equally to owner-occupiers seeking a private leisure retreat and to investors targeting premium rental demand driven by Tagaytay's enduring popularity as a lifestyle and weekend destination. Full documentation, ownership structure, and management details are available upon request."
  };

  console.log('Attempting to insert Anya Villas property...');

  const result = await db.insert(properties).values(testProperty);
  console.log('\n✅ Insert successful!');
  console.log('Insert ID:', result[0].insertId);
} catch (error) {
  console.error('\n❌ Insert failed with error:');
  console.error('Message:', error.message);
  console.error('Code:', error.code);
  console.error('SQL State:', error.sqlState);
  console.error('SQL Message:', error.sqlMessage);
  console.error('\nFull error:', error);
}

await connection.end();
