# Regional Location Mapping Knowledge Base

This document defines the comprehensive mapping of countries to their respective regions for the 3B Solution real estate platform.

## Southeast Asia (SEA)

- **BN** - Brunei
- **KH** - Cambodia
- **ID** - Indonesia
- **LA** - Laos
- **MY** - Malaysia
- **MM** - Myanmar
- **PH** - Philippines
- **SG** - Singapore
- **TH** - Thailand
- **TL** - Timor-Leste
- **VN** - Vietnam

## South Asia

- **AF** - Afghanistan
- **BD** - Bangladesh
- **BT** - Bhutan
- **IN** - India
- **MV** - Maldives
- **NP** - Nepal
- **PK** - Pakistan
- **LK** - Sri Lanka

## East Asia

- **CN** - China
- **JP** - Japan
- **KR** - South Korea
- **KP** - North Korea
- **MN** - Mongolia
- **TW** - Taiwan
- **HK** - Hong Kong
- **MO** - Macau

## Central Asia

- **KZ** - Kazakhstan
- **KG** - Kyrgyzstan
- **TJ** - Tajikistan
- **TM** - Turkmenistan
- **UZ** - Uzbekistan

## Middle East / Western Asia

- **AE** - United Arab Emirates
- **SA** - Saudi Arabia
- **QA** - Qatar
- **KW** - Kuwait
- **BH** - Bahrain
- **OM** - Oman
- **YE** - Yemen
- **IR** - Iran
- **IQ** - Iraq
- **IL** - Israel
- **JO** - Jordan
- **LB** - Lebanon
- **SY** - Syria
- **TR** - Turkey

## Western Europe

- **DE** - Germany
- **FR** - France
- **NL** - Netherlands
- **BE** - Belgium
- **LU** - Luxembourg
- **AT** - Austria
- **CH** - Switzerland

## Northern Europe

- **DK** - Denmark
- **SE** - Sweden
- **NO** - Norway
- **FI** - Finland
- **IS** - Iceland
- **IE** - Ireland
- **GB** - United Kingdom

## Southern Europe

- **IT** - Italy
- **ES** - Spain
- **PT** - Portugal
- **GR** - Greece
- **HR** - Croatia
- **SI** - Slovenia
- **MT** - Malta

## Eastern Europe

- **PL** - Poland
- **CZ** - Czech Republic
- **SK** - Slovakia
- **HU** - Hungary
- **RO** - Romania
- **BG** - Bulgaria
- **UA** - Ukraine

## North America

- **US** - United States
- **CA** - Canada
- **MX** - Mexico

## Central America

- **GT** - Guatemala
- **CR** - Costa Rica
- **PA** - Panama

## Caribbean

- **JM** - Jamaica
- **DO** - Dominican Republic
- **BS** - Bahamas

## South America

- **BR** - Brazil
- **AR** - Argentina
- **CL** - Chile
- **CO** - Colombia
- **PE** - Peru

## North Africa

- **EG** - Egypt
- **MA** - Morocco
- **TN** - Tunisia
- **DZ** - Algeria

## Sub-Saharan Africa

- **NG** - Nigeria
- **KE** - Kenya
- **ZA** - South Africa
- **GH** - Ghana
- **ET** - Ethiopia

## Oceania

- **AU** - Australia
- **NZ** - New Zealand
- **FJ** - Fiji
- **PG** - Papua New Guinea

---

## Usage Notes

1. **Database Region Field**: The `region` field in the properties table should use the standardized region names from this mapping (e.g., "Southeast Asia", "Caribbean", "North America").

2. **Landing Pages**: Regional landing pages should be organized according to these mappings:
   - `/investments/southeast-asia` - covers all Southeast Asia countries
   - `/investments/philippines` - specific country page within Southeast Asia
   - `/investments/maldives` - specific country page within South Asia
   - `/investments/caribbean` - covers Jamaica, Dominican Republic, Bahamas
   - `/investments/europe` - can aggregate Western, Northern, Southern, Eastern Europe
   - `/investments/usa` - specific country page within North America

3. **Property Filtering**: When filtering properties by region, ensure the filter matches the exact region name as stored in the database.

4. **Dynamic Counts**: Use tRPC queries to fetch property counts dynamically based on region:
   ```typescript
   const { data: properties } = trpc.properties.list.useQuery({
     region: "Southeast Asia",
     limit: 1,
   });
   // properties.total will give the count
   ```

5. **Regional Hierarchy**:
   - **Continent Level**: Asia, Europe, Americas, Africa, Oceania
   - **Sub-Region Level**: Southeast Asia, South Asia, Western Europe, etc.
   - **Country Level**: Philippines, Maldives, USA, etc.

This knowledge base should be referenced when:
- Adding new properties to the database
- Creating or updating regional landing pages
- Implementing property filters and search functionality
- Generating regional statistics and reports
- Designing navigation and categorization systems
