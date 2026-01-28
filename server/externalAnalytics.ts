/**
 * External Analytics Service
 * Integrates Google Analytics Data API and Cloudflare GraphQL Analytics API
 */
console.log('[ExternalAnalytics] Module loading...');

import { BetaAnalyticsDataClient } from '@google-analytics/data';

// Environment variables for credentials
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const CLOUDFLARE_ZONE_ID = process.env.CLOUDFLARE_ZONE_ID;
const GA_PROPERTY_ID = process.env.GA_PROPERTY_ID;

// Google Analytics client - will be initialized with service account credentials
let analyticsDataClient: BetaAnalyticsDataClient | null = null;

// Initialize Google Analytics client
function getGAClient(): BetaAnalyticsDataClient {
  if (!analyticsDataClient) {
    // Check if we have credentials in environment
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
      const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
      analyticsDataClient = new BetaAnalyticsDataClient({
        credentials: {
          client_email: credentials.client_email,
          private_key: credentials.private_key,
        },
        projectId: credentials.project_id,
      });
    } else {
      // Fall back to default credentials (GOOGLE_APPLICATION_CREDENTIALS env var)
      analyticsDataClient = new BetaAnalyticsDataClient();
    }
  }
  return analyticsDataClient;
}

// ============================================
// GOOGLE ANALYTICS DATA API
// ============================================

export interface GAMetrics {
  totalUsers: number;
  newUsers: number;
  sessions: number;
  pageViews: number;
  avgSessionDuration: number;
  bounceRate: number;
}

export interface GATrafficSource {
  source: string;
  medium: string;
  users: number;
  sessions: number;
}

export interface GAPageData {
  pagePath: string;
  pageTitle: string;
  views: number;
  avgTimeOnPage: number;
}

export interface GACountryData {
  country: string;
  users: number;
  sessions: number;
}

export interface GADeviceData {
  deviceCategory: string;
  users: number;
  sessions: number;
}

export interface GATimeSeriesData {
  date: string;
  users: number;
  sessions: number;
  pageViews: number;
}

/**
 * Get basic metrics from Google Analytics
 */
export async function getGAMetrics(startDate: string, endDate: string): Promise<GAMetrics> {
  if (!GA_PROPERTY_ID) {
    console.warn('GA_PROPERTY_ID not configured');
    return {
      totalUsers: 0,
      newUsers: 0,
      sessions: 0,
      pageViews: 0,
      avgSessionDuration: 0,
      bounceRate: 0,
    };
  }

  try {
    const client = getGAClient();
    const [response] = await client.runReport({
      property: `properties/${GA_PROPERTY_ID}`,
      dateRanges: [{ startDate, endDate }],
      metrics: [
        { name: 'totalUsers' },
        { name: 'newUsers' },
        { name: 'sessions' },
        { name: 'screenPageViews' },
        { name: 'averageSessionDuration' },
        { name: 'bounceRate' },
      ],
    });

    const row = response.rows?.[0];
    if (!row?.metricValues) {
      return {
        totalUsers: 0,
        newUsers: 0,
        sessions: 0,
        pageViews: 0,
        avgSessionDuration: 0,
        bounceRate: 0,
      };
    }

    return {
      totalUsers: parseInt(row.metricValues[0]?.value || '0'),
      newUsers: parseInt(row.metricValues[1]?.value || '0'),
      sessions: parseInt(row.metricValues[2]?.value || '0'),
      pageViews: parseInt(row.metricValues[3]?.value || '0'),
      avgSessionDuration: parseFloat(row.metricValues[4]?.value || '0'),
      bounceRate: parseFloat(row.metricValues[5]?.value || '0'),
    };
  } catch (error) {
    console.error('Error fetching GA metrics:', error);
    return {
      totalUsers: 0,
      newUsers: 0,
      sessions: 0,
      pageViews: 0,
      avgSessionDuration: 0,
      bounceRate: 0,
    };
  }
}

/**
 * Get traffic sources from Google Analytics
 */
export async function getGATrafficSources(startDate: string, endDate: string): Promise<GATrafficSource[]> {
  if (!GA_PROPERTY_ID) {
    return [];
  }

  try {
    const client = getGAClient();
    const [response] = await client.runReport({
      property: `properties/${GA_PROPERTY_ID}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [
        { name: 'sessionSource' },
        { name: 'sessionMedium' },
      ],
      metrics: [
        { name: 'totalUsers' },
        { name: 'sessions' },
      ],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 10,
    });

    return (response.rows || []).map(row => ({
      source: row.dimensionValues?.[0]?.value || 'unknown',
      medium: row.dimensionValues?.[1]?.value || 'unknown',
      users: parseInt(row.metricValues?.[0]?.value || '0'),
      sessions: parseInt(row.metricValues?.[1]?.value || '0'),
    }));
  } catch (error) {
    console.error('Error fetching GA traffic sources:', error);
    return [];
  }
}

/**
 * Get top pages from Google Analytics
 */
export async function getGATopPages(startDate: string, endDate: string): Promise<GAPageData[]> {
  if (!GA_PROPERTY_ID) {
    return [];
  }

  try {
    const client = getGAClient();
    const [response] = await client.runReport({
      property: `properties/${GA_PROPERTY_ID}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [
        { name: 'pagePath' },
        { name: 'pageTitle' },
      ],
      metrics: [
        { name: 'screenPageViews' },
        { name: 'averageSessionDuration' },
      ],
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: 10,
    });

    return (response.rows || []).map(row => ({
      pagePath: row.dimensionValues?.[0]?.value || '/',
      pageTitle: row.dimensionValues?.[1]?.value || 'Unknown',
      views: parseInt(row.metricValues?.[0]?.value || '0'),
      avgTimeOnPage: parseFloat(row.metricValues?.[1]?.value || '0'),
    }));
  } catch (error) {
    console.error('Error fetching GA top pages:', error);
    return [];
  }
}

/**
 * Get users by country from Google Analytics
 */
export async function getGACountryData(startDate: string, endDate: string): Promise<GACountryData[]> {
  if (!GA_PROPERTY_ID) {
    return [];
  }

  try {
    const client = getGAClient();
    const [response] = await client.runReport({
      property: `properties/${GA_PROPERTY_ID}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'country' }],
      metrics: [
        { name: 'totalUsers' },
        { name: 'sessions' },
      ],
      orderBys: [{ metric: { metricName: 'totalUsers' }, desc: true }],
      limit: 10,
    });

    return (response.rows || []).map(row => ({
      country: row.dimensionValues?.[0]?.value || 'Unknown',
      users: parseInt(row.metricValues?.[0]?.value || '0'),
      sessions: parseInt(row.metricValues?.[1]?.value || '0'),
    }));
  } catch (error) {
    console.error('Error fetching GA country data:', error);
    return [];
  }
}

/**
 * Get device breakdown from Google Analytics
 */
export async function getGADeviceData(startDate: string, endDate: string): Promise<GADeviceData[]> {
  if (!GA_PROPERTY_ID) {
    return [];
  }

  try {
    const client = getGAClient();
    const [response] = await client.runReport({
      property: `properties/${GA_PROPERTY_ID}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'deviceCategory' }],
      metrics: [
        { name: 'totalUsers' },
        { name: 'sessions' },
      ],
      orderBys: [{ metric: { metricName: 'totalUsers' }, desc: true }],
    });

    return (response.rows || []).map(row => ({
      deviceCategory: row.dimensionValues?.[0]?.value || 'Unknown',
      users: parseInt(row.metricValues?.[0]?.value || '0'),
      sessions: parseInt(row.metricValues?.[1]?.value || '0'),
    }));
  } catch (error) {
    console.error('Error fetching GA device data:', error);
    return [];
  }
}

/**
 * Get time series data from Google Analytics
 */
export async function getGATimeSeries(startDate: string, endDate: string): Promise<GATimeSeriesData[]> {
  if (!GA_PROPERTY_ID) {
    return [];
  }

  try {
    const client = getGAClient();
    const [response] = await client.runReport({
      property: `properties/${GA_PROPERTY_ID}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'date' }],
      metrics: [
        { name: 'totalUsers' },
        { name: 'sessions' },
        { name: 'screenPageViews' },
      ],
      orderBys: [{ dimension: { dimensionName: 'date' }, desc: false }],
    });

    return (response.rows || []).map(row => ({
      date: row.dimensionValues?.[0]?.value || '',
      users: parseInt(row.metricValues?.[0]?.value || '0'),
      sessions: parseInt(row.metricValues?.[1]?.value || '0'),
      pageViews: parseInt(row.metricValues?.[2]?.value || '0'),
    }));
  } catch (error) {
    console.error('Error fetching GA time series:', error);
    return [];
  }
}

// ============================================
// CLOUDFLARE GRAPHQL ANALYTICS API
// ============================================

export interface CloudflareMetrics {
  requests: number;
  pageViews: number;
  uniqueVisitors: number;
  bandwidth: number;
  threats: number;
  cachedRequests: number;
  cachedBandwidth: number;
}

export interface CloudflareCountryData {
  country: string;
  requests: number;
  bandwidth: number;
}

export interface CloudflareBrowserData {
  browser: string;
  requests: number;
  pageViews: number;
}

export interface CloudflareTimeSeriesData {
  date: string;
  requests: number;
  pageViews: number;
  uniqueVisitors: number;
}

/**
 * Execute Cloudflare GraphQL query
 */
async function cloudflareGraphQL(query: string, variables: Record<string, any> = {}): Promise<any> {
  if (!CLOUDFLARE_API_TOKEN || !CLOUDFLARE_ZONE_ID) {
    console.warn('Cloudflare credentials not configured');
    return null;
  }

  try {
    const response = await fetch('https://api.cloudflare.com/client/v4/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      throw new Error(`Cloudflare API error: ${response.status}`);
    }

    const data = await response.json();
    if (data.errors) {
      console.error('Cloudflare GraphQL errors:', data.errors);
      return null;
    }

    return data.data;
  } catch (error) {
    console.error('Error calling Cloudflare API:', error);
    return null;
  }
}

/**
 * Get Cloudflare analytics metrics
 */
export async function getCloudflareMetrics(startDate: string, endDate: string): Promise<CloudflareMetrics> {
  const query = `
    query GetZoneAnalytics($zoneTag: string!, $since: Time!, $until: Time!) {
      viewer {
        zones(filter: { zoneTag: $zoneTag }) {
          httpRequests1dGroups(
            limit: 1000
            filter: { date_geq: $since, date_lt: $until }
          ) {
            sum {
              requests
              pageViews
              bytes
              threats
              cachedRequests
              cachedBytes
            }
            uniq {
              uniques
            }
          }
        }
      }
    }
  `;

  const data = await cloudflareGraphQL(query, {
    zoneTag: CLOUDFLARE_ZONE_ID,
    since: startDate,
    until: endDate,
  });

  if (!data?.viewer?.zones?.[0]?.httpRequests1dGroups) {
    return {
      requests: 0,
      pageViews: 0,
      uniqueVisitors: 0,
      bandwidth: 0,
      threats: 0,
      cachedRequests: 0,
      cachedBandwidth: 0,
    };
  }

  const groups = data.viewer.zones[0].httpRequests1dGroups;
  const totals = groups.reduce(
    (acc: any, group: any) => ({
      requests: acc.requests + (group.sum?.requests || 0),
      pageViews: acc.pageViews + (group.sum?.pageViews || 0),
      bytes: acc.bytes + (group.sum?.bytes || 0),
      threats: acc.threats + (group.sum?.threats || 0),
      cachedRequests: acc.cachedRequests + (group.sum?.cachedRequests || 0),
      cachedBytes: acc.cachedBytes + (group.sum?.cachedBytes || 0),
      uniques: acc.uniques + (group.uniq?.uniques || 0),
    }),
    { requests: 0, pageViews: 0, bytes: 0, threats: 0, cachedRequests: 0, cachedBytes: 0, uniques: 0 }
  );

  return {
    requests: totals.requests,
    pageViews: totals.pageViews,
    uniqueVisitors: totals.uniques,
    bandwidth: totals.bytes,
    threats: totals.threats,
    cachedRequests: totals.cachedRequests,
    cachedBandwidth: totals.cachedBytes,
  };
}

/**
 * Get Cloudflare traffic by country
 */
export async function getCloudflareCountryData(startDate: string, endDate: string): Promise<CloudflareCountryData[]> {
  const query = `
    query GetCountryAnalytics($zoneTag: string!, $since: Time!, $until: Time!) {
      viewer {
        zones(filter: { zoneTag: $zoneTag }) {
          httpRequests1dGroups(
            limit: 1000
            filter: { date_geq: $since, date_lt: $until }
          ) {
            dimensions {
              clientCountryName
            }
            sum {
              requests
              bytes
            }
          }
        }
      }
    }
  `;

  const data = await cloudflareGraphQL(query, {
    zoneTag: CLOUDFLARE_ZONE_ID,
    since: startDate,
    until: endDate,
  });

  if (!data?.viewer?.zones?.[0]?.httpRequests1dGroups) {
    return [];
  }

  // Aggregate by country
  const countryMap = new Map<string, { requests: number; bandwidth: number }>();
  
  for (const group of data.viewer.zones[0].httpRequests1dGroups) {
    const country = group.dimensions?.clientCountryName || 'Unknown';
    const existing = countryMap.get(country) || { requests: 0, bandwidth: 0 };
    countryMap.set(country, {
      requests: existing.requests + (group.sum?.requests || 0),
      bandwidth: existing.bandwidth + (group.sum?.bytes || 0),
    });
  }

  return Array.from(countryMap.entries())
    .map(([country, data]) => ({ country, ...data }))
    .sort((a, b) => b.requests - a.requests)
    .slice(0, 10);
}

/**
 * Get Cloudflare time series data
 */
export async function getCloudflareTimeSeries(startDate: string, endDate: string): Promise<CloudflareTimeSeriesData[]> {
  const query = `
    query GetTimeSeriesAnalytics($zoneTag: string!, $since: Time!, $until: Time!) {
      viewer {
        zones(filter: { zoneTag: $zoneTag }) {
          httpRequests1dGroups(
            limit: 1000
            filter: { date_geq: $since, date_lt: $until }
            orderBy: [date_ASC]
          ) {
            dimensions {
              date
            }
            sum {
              requests
              pageViews
            }
            uniq {
              uniques
            }
          }
        }
      }
    }
  `;

  const data = await cloudflareGraphQL(query, {
    zoneTag: CLOUDFLARE_ZONE_ID,
    since: startDate,
    until: endDate,
  });

  if (!data?.viewer?.zones?.[0]?.httpRequests1dGroups) {
    return [];
  }

  return data.viewer.zones[0].httpRequests1dGroups.map((group: any) => ({
    date: group.dimensions?.date || '',
    requests: group.sum?.requests || 0,
    pageViews: group.sum?.pageViews || 0,
    uniqueVisitors: group.uniq?.uniques || 0,
  }));
}

// ============================================
// COMBINED ANALYTICS
// ============================================

export interface CombinedAnalytics {
  googleAnalytics: {
    metrics: GAMetrics;
    trafficSources: GATrafficSource[];
    topPages: GAPageData[];
    countries: GACountryData[];
    devices: GADeviceData[];
    timeSeries: GATimeSeriesData[];
  };
  cloudflare: {
    metrics: CloudflareMetrics;
    countries: CloudflareCountryData[];
    timeSeries: CloudflareTimeSeriesData[];
  };
}

/**
 * Get all external analytics data
 */
export async function getCombinedAnalytics(startDate: string, endDate: string): Promise<CombinedAnalytics> {
  // Fetch all data in parallel
  const [
    gaMetrics,
    gaTrafficSources,
    gaTopPages,
    gaCountries,
    gaDevices,
    gaTimeSeries,
    cfMetrics,
    cfCountries,
    cfTimeSeries,
  ] = await Promise.all([
    getGAMetrics(startDate, endDate),
    getGATrafficSources(startDate, endDate),
    getGATopPages(startDate, endDate),
    getGACountryData(startDate, endDate),
    getGADeviceData(startDate, endDate),
    getGATimeSeries(startDate, endDate),
    getCloudflareMetrics(startDate, endDate),
    getCloudflareCountryData(startDate, endDate),
    getCloudflareTimeSeries(startDate, endDate),
  ]);

  return {
    googleAnalytics: {
      metrics: gaMetrics,
      trafficSources: gaTrafficSources,
      topPages: gaTopPages,
      countries: gaCountries,
      devices: gaDevices,
      timeSeries: gaTimeSeries,
    },
    cloudflare: {
      metrics: cfMetrics,
      countries: cfCountries,
      timeSeries: cfTimeSeries,
    },
  };
}
