import { getDb } from './db';
import { 
  properties, services, locations, teamMembers, successStories, 
  portfolioStats, siteSettings, marketReports, legalPages 
} from '../drizzle/schema';

export async function seedDatabase() {
  const db = await getDb();
  if (!db) {
    console.log('Database not available for seeding');
    return;
  }

  console.log('Starting database seed...');

  // Seed Locations
  const locationData = [
    { name: 'Manila', country: 'Philippines', region: 'SouthEastAsia', description: 'Premier hospitality and commercial hub in Southeast Asia', projectCount: 60, specialization: 'Luxury Hospitality & Mixed-Use', order: 1, isActive: true },
    { name: 'Maldives', country: 'Maldives', region: 'Maldives', description: 'Exclusive island resort developments', projectCount: 4, specialization: 'Island Resorts', order: 2, isActive: true },
    { name: 'Europe', country: 'Multiple', region: 'Europe', description: 'Premium hospitality across European capitals', projectCount: 50, specialization: 'Boutique Hotels', order: 3, isActive: true },
  ];
  await db.insert(locations).values(locationData).onDuplicateKeyUpdate({ set: { name: locationData[0].name } });

  // Seed Team Members
  const teamData = [
    { name: 'Georg Blascheck', role: 'Managing Director', shortBio: 'Expert in global real estate investments with 20+ years experience', bio: 'Georg brings extensive experience in international real estate transactions, specializing in hospitality and commercial developments across Asia, Europe, and the Americas.', email: 'georg@3bsolution.com', phone: '+49 123 456 789', isExpert: true, order: 1, isActive: true },
    { name: 'Engela Pacayra', role: 'Investment Director', shortBio: 'Specialized in Philippine real estate and investor relations', bio: 'Engela leads our Philippine operations and investor relations, with deep expertise in local market dynamics and regulatory frameworks.', email: 'engela@3bsolution.com', phone: '+63 123 456 789', isExpert: true, order: 2, isActive: true },
    { name: 'Bibian Bock', role: 'Operations Director', shortBio: 'Operations expert with focus on China network development', bio: 'Bibian manages operational excellence and strategic partnerships, with particular focus on expanding our China network and website management.', email: 'bibian@3bsolution.com', phone: '+49 987 654 321', isExpert: true, order: 3, isActive: true },
  ];
  await db.insert(teamMembers).values(teamData).onDuplicateKeyUpdate({ set: { name: teamData[0].name } });

  // Seed Services
  const servicesData = [
    { title: 'Investment Advisory', slug: 'investment-advisory', shortDescription: 'Strategic guidance for high-yield real estate investments', fullDescription: 'Our investment advisory services provide comprehensive analysis and strategic recommendations for investors seeking premium real estate opportunities. We leverage our global network and local expertise to identify, evaluate, and structure investments that align with your financial objectives.', icon: 'TrendingUp', order: 1, isActive: true, features: ['Market Analysis', 'Due Diligence', 'Investment Structuring', 'Risk Assessment'] },
    { title: 'Property Acquisition', slug: 'property-acquisition', shortDescription: 'End-to-end support for acquiring premium properties', fullDescription: 'From initial property identification to final closing, our acquisition team guides you through every step of the purchase process. We handle negotiations, legal coordination, and ensure seamless transactions across multiple jurisdictions.', icon: 'Building', order: 2, isActive: true, features: ['Property Sourcing', 'Negotiation Support', 'Legal Coordination', 'Transaction Management'] },
    { title: 'Asset Management', slug: 'asset-management', shortDescription: 'Professional management to maximize your investment returns', fullDescription: 'Our asset management services ensure your investments perform optimally. We provide ongoing oversight, performance monitoring, and strategic recommendations to enhance value and returns throughout the investment lifecycle.', icon: 'BarChart3', order: 3, isActive: true, features: ['Performance Monitoring', 'Value Enhancement', 'Reporting & Analytics', 'Exit Strategy Planning'] },
    { title: 'Development Consulting', slug: 'development-consulting', shortDescription: 'Expert guidance for hospitality and commercial developments', fullDescription: 'Leverage our deep expertise in hospitality and commercial development. We provide consulting services covering project feasibility, design optimization, operator selection, and construction oversight.', icon: 'Compass', order: 4, isActive: true, features: ['Feasibility Studies', 'Design Optimization', 'Operator Selection', 'Project Oversight'] },
  ];
  await db.insert(services).values(servicesData).onDuplicateKeyUpdate({ set: { title: servicesData[0].title } });

  // Seed Portfolio Stats
  const statsData = [
    { label: 'Total Projects', value: '70', suffix: '+', order: 1, isActive: true },
    { label: 'Assets Under Advisory', value: '2.5', suffix: 'B USD', order: 2, isActive: true },
    { label: 'Average Annual Return', value: '18', suffix: '%', order: 3, isActive: true },
    { label: 'Countries', value: '12', suffix: '+', order: 4, isActive: true },
  ];
  await db.insert(portfolioStats).values(statsData).onDuplicateKeyUpdate({ set: { label: statsData[0].label } });

  // Seed Properties
  const propertiesData = [
    { title: 'Makati Prime Tower', slug: 'makati-prime-tower', shortDescription: 'Premium mixed-use development in Manila CBD', description: 'A landmark 45-story mixed-use tower featuring luxury residences, Grade A office space, and premium retail in the heart of Makati. This development offers unparalleled views of the Manila skyline and direct access to major business districts.', region: 'SouthEastAsia' as const, country: 'Philippines', city: 'Makati', propertyType: 'MixedUse' as const, priceMin: '25000000', priceMax: '35000000', currency: 'USD', expectedReturn: '18.5', investmentTimeline: '5-7 years', status: 'available' as const, featured: true },
    { title: 'Boracay Beach Resort', slug: 'boracay-beach-resort', shortDescription: 'Beachfront luxury resort development', description: 'An exclusive 5-star beachfront resort featuring 120 luxury villas and suites, world-class spa facilities, and multiple dining venues. Located on the pristine shores of Boracay with direct beach access.', region: 'SouthEastAsia' as const, country: 'Philippines', city: 'Boracay', propertyType: 'Resort' as const, priceMin: '45000000', priceMax: '55000000', currency: 'USD', expectedReturn: '22.0', investmentTimeline: '7-10 years', status: 'available' as const, featured: true },
    { title: 'Maldives Private Island', slug: 'maldives-private-island', shortDescription: 'Exclusive private island resort opportunity', description: 'A rare opportunity to develop an exclusive private island resort in the Maldives. The 15-hectare island features pristine beaches, crystal-clear lagoons, and potential for 80 overwater villas.', region: 'Maldives' as const, country: 'Maldives', city: 'North Malé Atoll', propertyType: 'Island' as const, priceMin: '85000000', priceMax: '100000000', currency: 'USD', expectedReturn: '25.0', investmentTimeline: '10-15 years', status: 'available' as const, featured: true },
    { title: 'Barcelona Boutique Hotel', slug: 'barcelona-boutique-hotel', shortDescription: 'Historic building conversion in Gothic Quarter', description: 'A stunning 18th-century palace conversion into a 45-room boutique hotel in Barcelona Gothic Quarter. Features original architectural details, rooftop terrace with city views, and prime tourist location.', region: 'Europe' as const, country: 'Spain', city: 'Barcelona', propertyType: 'CityHotel' as const, priceMin: '18000000', priceMax: '22000000', currency: 'USD', expectedReturn: '15.0', investmentTimeline: '5-7 years', status: 'available' as const, featured: true },
    { title: 'Miami Waterfront Commercial', slug: 'miami-waterfront-commercial', shortDescription: 'Prime waterfront commercial development', description: 'A 25,000 sqm waterfront commercial complex in Miami featuring Class A office space, retail, and marina facilities. Prime location with excellent connectivity and views of Biscayne Bay.', region: 'NorthAmerica' as const, country: 'USA', city: 'Miami', propertyType: 'Commercial' as const, priceMin: '65000000', priceMax: '75000000', currency: 'USD', expectedReturn: '16.5', investmentTimeline: '5-7 years', status: 'available' as const, featured: true },
    { title: 'Cebu IT Park Office Tower', slug: 'cebu-it-park-office', shortDescription: 'Grade A office tower in Cebu IT Park', description: 'A modern 30-story Grade A office tower in the heart of Cebu IT Park, catering to BPO and tech companies. Features state-of-the-art facilities, LEED certification, and excellent tenant mix.', region: 'SouthEastAsia' as const, country: 'Philippines', city: 'Cebu', propertyType: 'Office' as const, priceMin: '35000000', priceMax: '42000000', currency: 'USD', expectedReturn: '14.0', investmentTimeline: '5-7 years', status: 'available' as const, featured: false },
  ];
  await db.insert(properties).values(propertiesData).onDuplicateKeyUpdate({ set: { title: propertiesData[0].title } });

  // Seed Success Stories
  const storiesData = [
    { title: 'Manila Hotel Portfolio Acquisition', slug: 'manila-hotel-portfolio', clientName: 'European Family Office', clientType: 'FamilyOffice' as const, location: 'Manila, Philippines', propertyType: 'Hospitality', investmentAmount: '$45M', returnAchieved: '24% IRR', timeline: '4 years', shortDescription: 'Strategic acquisition of 3 boutique hotels in Manila CBD', fullStory: 'We assisted a European family office in identifying and acquiring a portfolio of three boutique hotels in Manila. Through careful due diligence and strategic negotiations, we secured favorable terms and implemented operational improvements that significantly enhanced returns.', challenge: 'The client sought exposure to the Philippine hospitality market but lacked local expertise and connections.', solution: 'We provided end-to-end support including market analysis, property identification, due diligence, negotiation, and post-acquisition asset management.', results: 'The portfolio achieved a 24% IRR over 4 years, exceeding initial projections by 6 percentage points.', testimonial: '3B Solution\'s local expertise and professional approach made our entry into the Philippine market seamless and highly profitable.', featured: true, featuredMonth: '2024-12', isActive: true },
    { title: 'Maldives Resort Development', slug: 'maldives-resort-development', clientName: 'Asian Investment Group', clientType: 'Institutional' as const, location: 'Maldives', propertyType: 'Resort', investmentAmount: '$120M', returnAchieved: '28% IRR', timeline: '6 years', shortDescription: 'Greenfield 5-star resort development', fullStory: 'We partnered with an Asian investment group to develop a world-class 5-star resort in the Maldives. From site selection to operator negotiation, we managed every aspect of this complex international development.', challenge: 'Developing in the Maldives requires navigating complex regulations, logistics, and environmental considerations.', solution: 'Our team coordinated with local authorities, international operators, and construction partners to deliver a seamless development process.', results: 'The resort opened on schedule and achieved premium positioning, delivering exceptional returns to investors.', featured: false, isActive: true },
  ];
  await db.insert(successStories).values(storiesData).onDuplicateKeyUpdate({ set: { title: storiesData[0].title } });

  // Seed Site Settings
  const settingsData = [
    { key: 'hero_headline', value: 'Premium Real Estate Solutions', type: 'text' as const, category: 'home' },
    { key: 'hero_subheadline', value: 'Exclusive Access to High-Yield Real Estate Investments', type: 'text' as const, category: 'home' },
    { key: 'hero_description', value: 'Anchored in the Philippines, Diversified Globally\n15-30% Annual Returns Backed by Global Expertise', type: 'text' as const, category: 'home' },
    { key: 'about_story', value: 'Founded with a vision to bridge global investors with premium real estate opportunities, 3B Solution has grown into a trusted partner for discerning investors worldwide.', type: 'text' as const, category: 'about' },
    { key: 'mission', value: 'To provide exceptional real estate investment opportunities that deliver superior returns while maintaining the highest standards of integrity and professionalism.', type: 'text' as const, category: 'about' },
    { key: 'vision', value: 'To be the premier global platform connecting sophisticated investors with transformative real estate opportunities.', type: 'text' as const, category: 'about' },
    { key: 'footer_disclaimer', value: '© 2024 3B Solution. All rights reserved. Investment involves risk. Past performance is not indicative of future results.', type: 'text' as const, category: 'footer' },
  ];
  await db.insert(siteSettings).values(settingsData).onDuplicateKeyUpdate({ set: { key: settingsData[0].key } });

  // Seed Market Reports
  const reportsData = [
    { title: 'Philippine Real Estate Market Outlook 2024', slug: 'ph-market-outlook-2024', description: 'Comprehensive analysis of the Philippine real estate market including hospitality, commercial, and residential sectors.', category: 'Market Outlook', region: 'SouthEastAsia', isActive: true, publishedAt: new Date() },
    { title: 'Maldives Tourism & Hospitality Investment Guide', slug: 'maldives-hospitality-guide', description: 'In-depth guide to investing in Maldives hospitality sector, covering regulations, opportunities, and market dynamics.', category: 'Investment Guide', region: 'Maldives', isActive: true, publishedAt: new Date() },
    { title: 'European Boutique Hotel Investment Trends', slug: 'europe-boutique-trends', description: 'Analysis of boutique hotel investment opportunities across major European cities.', category: 'Market Trends', region: 'Europe', isActive: true, publishedAt: new Date() },
  ];
  await db.insert(marketReports).values(reportsData).onDuplicateKeyUpdate({ set: { title: reportsData[0].title } });

  // Seed Legal Pages
  const legalPagesData = [
    { 
      slug: 'terms-of-service', 
      title: 'Terms of Service', 
      content: `<h2>1. Acceptance of Terms</h2>
<p>By accessing and using the 3B Solution website and services, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to abide by these terms, please do not use our services.</p>

<h2>2. Description of Services</h2>
<p>3B Solution provides real estate investment advisory services, property acquisition support, asset management, and development consulting. Our services are intended for sophisticated investors and institutional clients seeking premium real estate investment opportunities.</p>

<h2>3. Investment Risks</h2>
<p>All investments involve risk, including the potential loss of principal. Past performance is not indicative of future results. Real estate investments are subject to various risks including market fluctuations, economic conditions, regulatory changes, and other factors beyond our control.</p>

<h2>4. User Responsibilities</h2>
<p>Users are responsible for:</p>
<ul>
<li>Providing accurate and complete information</li>
<li>Maintaining the confidentiality of account credentials</li>
<li>Conducting their own due diligence before making investment decisions</li>
<li>Complying with all applicable laws and regulations</li>
</ul>

<h2>5. Intellectual Property</h2>
<p>All content on this website, including text, graphics, logos, and images, is the property of 3B Solution and is protected by international copyright laws. Unauthorized use or reproduction is prohibited.</p>

<h2>6. Limitation of Liability</h2>
<p>3B Solution shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use our services, or from any information provided through our platform.</p>

<h2>7. Governing Law</h2>
<p>These terms shall be governed by and construed in accordance with the laws of Germany and the Philippines, as applicable to our respective offices.</p>

<h2>8. Contact Information</h2>
<p>For questions regarding these terms, please contact us at info@3bsolution.de</p>`,
      metaTitle: 'Terms of Service - 3B Solution',
      metaDescription: 'Terms and conditions for using 3B Solution real estate investment services.',
      isActive: true,
      order: 1
    },
    { 
      slug: 'privacy', 
      title: 'Privacy Policy', 
      content: `<h2>1. Information We Collect</h2>
<p>We collect information you provide directly to us, including:</p>
<ul>
<li>Contact information (name, email, phone number)</li>
<li>Professional information (company, title, investment preferences)</li>
<li>Communication records and inquiry details</li>
<li>Information provided during consultations and meetings</li>
</ul>

<h2>2. How We Use Your Information</h2>
<p>We use the information we collect to:</p>
<ul>
<li>Provide and improve our services</li>
<li>Communicate with you about investment opportunities</li>
<li>Send market updates and newsletters (with your consent)</li>
<li>Comply with legal obligations</li>
<li>Protect our rights and prevent fraud</li>
</ul>

<h2>3. Information Sharing</h2>
<p>We do not sell your personal information. We may share information with:</p>
<ul>
<li>Service providers who assist in our operations</li>
<li>Professional advisors (lawyers, accountants)</li>
<li>Regulatory authorities when required by law</li>
<li>Business partners with your explicit consent</li>
</ul>

<h2>4. Data Security</h2>
<p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>

<h2>5. Your Rights</h2>
<p>You have the right to:</p>
<ul>
<li>Access your personal information</li>
<li>Correct inaccurate data</li>
<li>Request deletion of your data</li>
<li>Opt-out of marketing communications</li>
<li>Lodge a complaint with supervisory authorities</li>
</ul>

<h2>6. Cookies</h2>
<p>Our website uses cookies to enhance your browsing experience. You can control cookie settings through your browser preferences.</p>

<h2>7. International Transfers</h2>
<p>Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place for such transfers.</p>

<h2>8. Contact Us</h2>
<p>For privacy-related inquiries, please contact our Data Protection Officer at info@3bsolution.de</p>`,
      metaTitle: 'Privacy Policy - 3B Solution',
      metaDescription: 'How 3B Solution collects, uses, and protects your personal information.',
      isActive: true,
      order: 2
    },
    { 
      slug: 'imprint', 
      title: 'Imprint', 
      content: `<h2>Company Information</h2>
<p><strong>3B SolutionDE</strong><br>
Weidenweg 17<br>
15806 Zossen<br>
Germany</p>

<p><strong>3B SolutionPH Corp.</strong><br>
7th Floor Unit 710<br>
High Street South Corporate Plaza, Tower 2<br>
26th Street Corner 11th Ave.<br>
Bonifacio Global City<br>
1630 Taguig City<br>
Philippines</p>

<h2>Contact</h2>
<p>Email: info@3bsolution.de<br>
Website: www.3bsolution.com</p>

<h2>Management</h2>
<p>Managing Director: Georg Blascheck</p>

<h2>Regulatory Information</h2>
<p>3B Solution operates as a real estate investment advisory firm. Our services are provided in compliance with applicable regulations in Germany and the Philippines.</p>

<h2>Disclaimer</h2>
<p>The information provided on this website is for general informational purposes only. It does not constitute investment advice or an offer to sell or solicitation of an offer to buy any securities or investment products.</p>

<p>All investments involve risk, including the potential loss of principal. Past performance is not indicative of future results. Prospective investors should consult with qualified financial, legal, and tax advisors before making any investment decisions.</p>

<h2>Copyright</h2>
<p>© 2024 3B Solution. All rights reserved.</p>

<p>All content on this website, including text, graphics, logos, images, and software, is the property of 3B Solution and is protected by German and international copyright laws.</p>`,
      metaTitle: 'Imprint - 3B Solution',
      metaDescription: 'Legal information and company details for 3B Solution real estate investment advisory.',
      isActive: true,
      order: 3
    },
  ];
  await db.insert(legalPages).values(legalPagesData).onDuplicateKeyUpdate({ set: { slug: legalPagesData[0].slug } });

  console.log('Database seeding completed!');
}

// Run seed if executed directly
// seedDatabase().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
