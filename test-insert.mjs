import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { properties } from './drizzle/schema.js';
import 'dotenv/config';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

try {
  const testProperty = {
    title: "Test Property",
    realPropertyName: "Test Property Real Name",
    slug: `test-property-${Date.now()}`,
    shortDescription: "Test description",
    longDescription: "Test long description",
    region: "SouthEastAsia",
    country: "Philippines",
    city: "Test City",
    propertyType: "Residential",
    assetClass: "Residential",
    buildingAreaSqm: "500",
    floorAreaSqm: "500",
    floors: 1,
    units: 17,
    unitsDetails: "Test units",
    askingPriceNet: "50600000",
    incomeGenerating: true,
    incomeDetails: "Test income",
    currency: "PHP",
    images: ["https://example.com/test.jpg"],
    imageCaptions: {},
    mainImage: "https://example.com/test.jpg",
    status: "available"
  };

  console.log('Attempting to insert property with data:');
  console.log(JSON.stringify(testProperty, null, 2));

  const result = await db.insert(properties).values(testProperty);
  console.log('\nInsert successful!');
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error('\nInsert failed with error:');
  console.error(error.message);
  console.error('\nFull error:');
  console.error(error);
}

await connection.end();
