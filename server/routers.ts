import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import { seedDatabase } from "./seed";
import { storagePut } from "./storage.js";
import { cache, CacheTTL } from "./cache";
import { generateMeetingLink } from "./meetingLinks";
import { sendBookingConfirmation, sendReschedulingNotification } from "./tourNotifications";
import { notifyOwner } from "./_core/notification";
import { sendResourceDownloadEmail } from "./emailService";
import { handleNewLeadNotifications } from "./leadEmailService";
import { whatsappRouter } from "./whatsapp/whatsappRouters";
import * as externalAnalytics from "./externalAnalytics";

// Admin procedure - requires admin role
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // Properties
  properties: router({
    list: publicProcedure.input(z.object({
      region: z.string().optional(),
      country: z.string().optional(),
      location: z.string().optional(),
      locationType: z.enum(['country', 'region', 'continent']).optional(),
      propertyType: z.string().optional(),
      minPrice: z.number().optional(),
      maxPrice: z.number().optional(),
      status: z.string().optional(),
      featured: z.boolean().optional(),
      search: z.string().optional(),
      limit: z.number().optional(),
      offset: z.number().optional(),
      sortBy: z.string().optional(),
      sortOrder: z.enum(['asc', 'desc']).optional(),
    }).optional()).query(({ input }) => db.getProperties(input)),
    
    getBySlug: publicProcedure.input(z.string()).query(({ input }) => db.getPropertyBySlug(input)),
    getById: publicProcedure.input(z.number()).query(({ input }) => db.getPropertyById(input)),
    countsByRegion: publicProcedure.query(() => db.getPropertyCountsByRegion()),
    countsByType: publicProcedure.query(() => db.getPropertyCountsByType()),
    
    create: adminProcedure.input(z.object({
      title: z.string(),
      realPropertyName: z.string().optional(),
      slug: z.string(),
      description: z.string().optional(),
      shortDescription: z.string().optional(),
      longDescription: z.string().optional(),
      region: z.enum(['Philippines', 'SouthEastAsia', 'Maldives', 'Europe', 'NorthAmerica', 'Caribbean']),
      country: z.string(),
      city: z.string().optional(),
      address: z.string().optional(),
      propertyType: z.enum(['Hospitality', 'Island', 'Resort', 'CityHotel', 'CountrysideHotel', 'MixedUse', 'Office', 'CityLand', 'Land', 'Residential', 'Retail', 'Commercial', 'Lot', 'HouseAndLot']),
      assetClass: z.enum(['Hospitality', 'Commercial', 'Residential', 'MixedUse', 'Land']).optional(),
      landSizeSqm: z.number().optional(),
      landSizeHa: z.number().optional(),
      buildingAreaSqm: z.number().optional(),
      floorAreaSqm: z.number().optional(),
      floors: z.number().optional(),
      units: z.number().optional(),
      unitsDetails: z.string().optional(),
      floorAreaRatio: z.number().optional(),
      askingPriceNet: z.number().optional(),
      askingPriceGross: z.number().optional(),
      incomeGenerating: z.boolean().optional(),
      incomeDetails: z.string().optional(),
      priceMin: z.number().optional(),
      priceMax: z.number().optional(),
      currency: z.string().optional(),
      roiPercent: z.number().optional(),
      possibleRoiPercent: z.number().optional(),
      expectedReturn: z.number().optional(),
      investmentTimeline: z.string().optional(),
      size: z.string().optional(),
      sizeUnit: z.string().optional(),
      bedrooms: z.number().optional(),
      bathrooms: z.number().optional(),
      yearBuilt: z.number().optional(),
      features: z.array(z.string()).optional(),
      amenities: z.array(z.string()).optional(),
      interiorFeatures: z.array(z.string()).optional(),
      exteriorFeatures: z.array(z.string()).optional(),
      images: z.array(z.string()).optional(),
      imageCaptions: z.record(z.string(), z.string()).optional(),
      mainImage: z.string().optional(),
      floorPlan: z.string().optional(),
      videoUrl: z.string().optional(),
      virtualTourUrl: z.string().optional(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
      status: z.enum(['available', 'reserved', 'sold', 'offMarket']).optional(),
      offMarket: z.boolean().optional(),
      others: z.string().optional(),
      featured: z.boolean().optional(),
      seoTitle: z.string().optional(),
      seoDescription: z.string().optional(),
      seoKeywords: z.string().optional(),
    })).mutation(({ input }) => db.createProperty(input as any)),
    
    update: adminProcedure.input(z.object({
      id: z.number(),
      data: z.record(z.string(), z.any()),
    })).mutation(({ input }) => db.updateProperty(input.id, input.data as any)),
    
    delete: adminProcedure.input(z.number()).mutation(({ input }) => db.deleteProperty(input)),
    
    incrementViews: publicProcedure.input(z.number()).mutation(({ input }) => db.incrementPropertyViews(input)),
    
    realPropertyNameStats: adminProcedure.query(async () => {
      return db.getRealPropertyNameStats();
    }),

    getFeaturedCount: adminProcedure.query(async () => {
      return db.getFeaturedPropertiesCount();
    }),

    toggleFeatured: adminProcedure.input(z.object({
      id: z.number(),
      featured: z.boolean(),
    })).mutation(async ({ input }) => {
      // Check current featured count if trying to feature a property
      if (input.featured) {
        const currentCount = await db.getFeaturedPropertiesCount();
        if (currentCount >= 3) {
          throw new Error('Maximum of 3 featured properties allowed. Please unfeature another property first.');
        }
      }
      return db.updateProperty(input.id, { featured: input.featured });
    }),
  }),

  // Services
  services: router({
    list: publicProcedure.input(z.boolean().optional()).query(async ({ input }) => {
      const cacheKey = `services:list:${input ?? true}`;
      return cache.getOrSet(cacheKey, () => db.getServices(input ?? true), CacheTTL.VERY_LONG);
    }),
    getBySlug: publicProcedure.input(z.string()).query(({ input }) => db.getServiceBySlug(input)),
    create: adminProcedure.input(z.object({
      title: z.string(),
      slug: z.string(),
      shortDescription: z.string().optional(),
      fullDescription: z.string().optional(),
      icon: z.string().optional(),
      image: z.string().optional(),
      features: z.array(z.string()).optional(),
      order: z.number().optional(),
      isActive: z.boolean().optional(),
    })).mutation(({ input }) => db.createService(input)),
    update: adminProcedure.input(z.object({ id: z.number(), data: z.record(z.string(), z.any()) })).mutation(async ({ input }) => {
      const result = await db.updateService(input.id, input.data as any);
      cache.invalidatePattern('services:');
      return result;
    }),
    delete: adminProcedure.input(z.number()).mutation(async ({ input }) => {
      const result = await db.deleteService(input);
      cache.invalidatePattern('services:');
      return result;
    }),
  }),

  // Locations
  locations: router({
    list: publicProcedure.input(z.boolean().optional()).query(async ({ input }) => {
      const cacheKey = `locations:list:${input ?? true}`;
      return cache.getOrSet(cacheKey, () => db.getLocations(input ?? true), CacheTTL.VERY_LONG);
    }),
    create: adminProcedure.input(z.object({
      name: z.string(),
      country: z.string(),
      region: z.string().optional(),
      description: z.string().optional(),
      image: z.string().optional(),
      projectCount: z.number().optional(),
      specialization: z.string().optional(),
      order: z.number().optional(),
      isActive: z.boolean().optional(),
    })).mutation(({ input }) => db.createLocation(input)),
    update: adminProcedure.input(z.object({ id: z.number(), data: z.record(z.string(), z.any()) })).mutation(async ({ input }) => {
      const result = await db.updateLocation(input.id, input.data as any);
      cache.invalidatePattern('locations:');
      return result;
    }),
    delete: adminProcedure.input(z.number()).mutation(async ({ input }) => {
      const result = await db.deleteLocation(input);
      cache.invalidatePattern('locations:');
      return result;
    }),
  }),

  // Success Stories
  successStories: router({
    list: publicProcedure.query(() => db.getSuccessStories()),
    create: adminProcedure.input(z.object({
      title: z.string(),
      slug: z.string(),
      clientName: z.string().optional(),
      clientType: z.enum(["FamilyOffice", "PrivateInvestor", "Institutional", "Developer", "Partner"]).optional(),
      location: z.string().optional(),
      propertyType: z.string().optional(),
      investmentAmount: z.string().optional(),
      returnAchieved: z.string().optional(),
      timeline: z.string().optional(),
      shortDescription: z.string().optional(),
      fullStory: z.string().optional(),
      challenge: z.string().optional(),
      solution: z.string().optional(),
      results: z.string().optional(),
      testimonial: z.string().optional(),
      image: z.string().optional(),
      featured: z.boolean().optional(),
      isActive: z.boolean().optional(),
    })).mutation(({ input }) => db.createSuccessStory(input)),
    update: adminProcedure.input(z.object({ id: z.number(), data: z.record(z.string(), z.any()) })).mutation(async ({ input }) => {
      const result = await db.updateSuccessStory(input.id, input.data as any);
      return result;
    }),
    delete: adminProcedure.input(z.number()).mutation(({ input }) => db.deleteSuccessStory(input)),
  }),

  // Market Reports
  marketReports: router({
    list: publicProcedure.query(() => db.getMarketReports()),
    create: adminProcedure.input(z.object({
      title: z.string(),
      slug: z.string(),
      description: z.string().optional(),
      category: z.string().optional(),
      region: z.string().optional(),
      fileUrl: z.string().optional(),
      thumbnailUrl: z.string().optional(),
      isActive: z.boolean().optional(),
      publishedAt: z.date().optional(),
    })).mutation(({ input }) => db.createMarketReport(input)),
    update: adminProcedure.input(z.object({ id: z.number(), data: z.record(z.string(), z.any()) })).mutation(async ({ input }) => {
      const result = await db.updateMarketReport(input.id, input.data as any);
      return result;
    }),
    delete: adminProcedure.input(z.number()).mutation(({ input }) => db.deleteMarketReport(input)),
  }),

  // Team Members
  team: router({
    list: publicProcedure.input(z.boolean().optional()).query(({ input }) => db.getTeamMembers(input ?? false)),
    experts: publicProcedure.query(() => db.getTeamMembers(true)),
    getById: publicProcedure.input(z.number()).query(({ input }) => db.getTeamMemberById(input)),
    create: adminProcedure.input(z.object({
      name: z.string(),
      role: z.string(),
      bio: z.string().optional(),
      shortBio: z.string().optional(),
      photo: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      linkedIn: z.string().optional(),
      calendlyUrl: z.string().optional(),
      googleMeetUrl: z.string().optional(),
      teamsUrl: z.string().optional(),
      zoomUrl: z.string().optional(),
      isExpert: z.boolean().optional(),
      order: z.number().optional(),
      isActive: z.boolean().optional(),
    })).mutation(({ input }) => db.createTeamMember(input)),
    update: adminProcedure.input(z.object({ id: z.number(), data: z.record(z.string(), z.any()) })).mutation(({ input }) => db.updateTeamMember(input.id, input.data as any)),
    delete: adminProcedure.input(z.number()).mutation(({ input }) => db.deleteTeamMember(input)),
  }),

  // Success Stories
  stories: router({
    list: publicProcedure.input(z.object({
      featured: z.boolean().optional(),
      clientType: z.string().optional(),
      limit: z.number().optional(),
      offset: z.number().optional(),
    }).optional()).query(({ input }) => db.getSuccessStories(input || {})),
    featured: publicProcedure.query(() => db.getFeaturedStory()),
    getBySlug: publicProcedure.input(z.string()).query(({ input }) => db.getStoryBySlug(input)),
    create: adminProcedure.input(z.object({
      title: z.string(),
      slug: z.string(),
      clientName: z.string().optional(),
      clientType: z.enum(['FamilyOffice', 'PrivateInvestor', 'Institutional', 'Developer', 'Partner']).optional(),
      location: z.string().optional(),
      propertyType: z.string().optional(),
      investmentAmount: z.string().optional(),
      returnAchieved: z.string().optional(),
      timeline: z.string().optional(),
      shortDescription: z.string().optional(),
      fullStory: z.string().optional(),
      challenge: z.string().optional(),
      solution: z.string().optional(),
      results: z.string().optional(),
      testimonial: z.string().optional(),
      image: z.string().optional(),
      images: z.array(z.string()).optional(),
      featured: z.boolean().optional(),
      featuredMonth: z.string().optional(),
      tags: z.array(z.string()).optional(),
      isActive: z.boolean().optional(),
    })).mutation(({ input }) => db.createSuccessStory(input)),
    update: adminProcedure.input(z.object({ id: z.number(), data: z.record(z.string(), z.any()) })).mutation(({ input }) => db.updateSuccessStory(input.id, input.data as any)),
    delete: adminProcedure.input(z.number()).mutation(({ input }) => db.deleteSuccessStory(input)),
  }),

  // Market Reports
  reports: router({
    list: publicProcedure.input(z.object({
      category: z.string().optional(),
      region: z.string().optional(),
      limit: z.number().optional(),
    }).optional()).query(({ input }) => db.getMarketReports(input || {})),
    create: adminProcedure.input(z.object({
      title: z.string(),
      slug: z.string(),
      description: z.string().optional(),
      category: z.string().optional(),
      region: z.string().optional(),
      fileUrl: z.string().optional(),
      thumbnailUrl: z.string().optional(),
      isActive: z.boolean().optional(),
      publishedAt: z.date().optional(),
    })).mutation(({ input }) => db.createMarketReport(input)),
    update: adminProcedure.input(z.object({ id: z.number(), data: z.record(z.string(), z.any()) })).mutation(({ input }) => db.updateMarketReport(input.id, input.data as any)),
    incrementDownloads: publicProcedure.input(z.number()).mutation(({ input }) => db.incrementReportDownloads(input)),
  }),

  // Leads
  leads: router({
    create: publicProcedure.input(z.object({
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      email: z.string().email(),
      phone: z.string().optional(),
      company: z.string().optional(),
      investorType: z.enum(['FamilyOffice', 'PrivateInvestor', 'Institutional', 'Developer', 'Partner', 'Other']).optional(),
      investmentRange: z.string().optional(),
      interestedRegions: z.array(z.string()).optional(),
      interestedPropertyTypes: z.array(z.string()).optional(),
      message: z.string().optional(),
      source: z.string().optional(),
      sourcePage: z.string().optional(),
      utmSource: z.string().optional(),
      utmMedium: z.string().optional(),
      utmCampaign: z.string().optional(),
      propertyId: z.number().optional(),
    })).mutation(async ({ input }) => {
      // Create the lead in database
      const leadId = await db.createLead(input);
      
      // Send email notifications to both 3B Solution team AND the lead
      try {
        // Use comprehensive notification service
        const notificationResult = await handleNewLeadNotifications({
          leadId,
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          phone: input.phone,
          company: input.company,
          investorType: input.investorType,
          investmentRange: input.investmentRange,
          interestedRegions: input.interestedRegions,
          interestedPropertyTypes: input.interestedPropertyTypes,
          message: input.message,
          source: input.source,
          sourcePage: input.sourcePage,
        });
        
        console.log('[Leads] Notifications sent:', {
          email: input.email,
          teamNotified: notificationResult.teamNotified,
          confirmationSent: notificationResult.confirmationSent,
        });
      } catch (notifyError) {
        // Don't fail the lead creation if notification fails
        console.error('[Leads] Failed to send notifications:', notifyError);
      }
      
      return leadId;
    }),
    list: adminProcedure.input(z.object({
      status: z.string().optional(),
      source: z.string().optional(),
      limit: z.number().optional(),
      offset: z.number().optional(),
    }).optional()).query(({ input }) => db.getLeads(input || {})),
    update: adminProcedure.input(z.object({ id: z.number(), data: z.record(z.string(), z.any()) })).mutation(({ input }) => db.updateLead(input.id, input.data as any)),
    respond: adminProcedure.input(z.object({
      leadId: z.number(),
      response: z.string(),
    })).mutation(async ({ input, ctx }) => {
      await db.updateLead(input.leadId, {
        adminResponse: input.response,
        respondedAt: new Date(),
        respondedBy: ctx.user.id,
        status: 'contacted',
      });
      // TODO: Send email notification to lead
      return { success: true };
    }),
  }),

  // Bookings (Virtual Tours)
  bookings: router({
    create: protectedProcedure.input(z.object({
      userId: z.number(),
      propertyId: z.number(),
      leadId: z.number().optional(),
      expertId: z.number().optional(),
      type: z.enum(['GoogleMeet', 'Teams', 'Zoom', 'Phone']),
      scheduledAt: z.date(),
      duration: z.number().optional(),
      timezone: z.string().optional(),
      meetingUrl: z.string().optional(),
      notes: z.string().optional(),
      userEmail: z.string(),
      userName: z.string(),
      status: z.enum(['scheduled', 'confirmed', 'completed', 'cancelled', 'rescheduled']).optional(),
    })).mutation(async ({ input }) => {
      // Generate meeting link if not provided
      let meetingUrl = input.meetingUrl;
      if (!meetingUrl && input.type !== 'Phone') {
        const { generateMeetingLink } = await import('./meetingLinks');
        const property = input.propertyId ? await db.getPropertyById(input.propertyId) : null;
        
        meetingUrl = await generateMeetingLink(input.type, {
          title: property ? `Virtual Tour - ${property.title}` : 'Virtual Property Tour',
          startTime: input.scheduledAt,
          duration: input.duration || 30,
          attendeeEmail: input.userEmail,
          attendeeName: input.userName
        }) || undefined;
      }
      
      // Create booking with generated meeting link
      const bookingId = await db.createBooking({
        ...input,
        meetingUrl
      });
      
      // Send confirmation email
      if (bookingId && input.propertyId) {
        const property = await db.getPropertyById(input.propertyId);
        if (property) {
          const { sendBookingConfirmation } = await import('./tourNotifications');
          const booking = await db.getBookingById(bookingId);
          if (booking) {
            await sendBookingConfirmation(booking, property.title, property.slug);
          }
        }
      }
      
      return bookingId;
    }),
    
    myBookings: protectedProcedure.query(({ ctx }) => db.getBookingsByUserId(ctx.user.id)),
    
    confirm: adminProcedure.input(z.object({
      bookingId: z.number(),
      adminNotes: z.string().optional(),
    })).mutation(async ({ input, ctx }) => {
      const booking = await db.getBookingById(input.bookingId);
      if (!booking) throw new TRPCError({ code: 'NOT_FOUND', message: 'Booking not found' });
      
      await db.updateBooking(input.bookingId, {
        status: 'confirmed',
        confirmedAt: new Date(),
        confirmedBy: ctx.user.id,
        adminNotes: input.adminNotes,
      });
      
      // Send confirmation notification
      await notifyOwner({
        title: 'Booking Confirmed',
        content: `Tour booking #${input.bookingId} has been confirmed for ${booking.userName} (${booking.userEmail}) on ${new Date(booking.scheduledAt).toLocaleString()}.`,
      });
      
      return { success: true };
    }),
    reschedule: protectedProcedure.input(z.object({
      bookingId: z.number(),
      newDate: z.date(),
      newTime: z.string(),
    })).mutation(async ({ input, ctx }) => {
      // Get existing booking
      const booking = await db.getBookingById(input.bookingId);
      if (!booking) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Booking not found' });
      }
      
      // Verify ownership
      if (booking.userId !== ctx.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized to reschedule this booking' });
      }
      
      // Parse new date and time
      const [hours, minutes] = input.newTime.split(':').map(Number);
      const scheduledAt = new Date(input.newDate);
      scheduledAt.setHours(hours, minutes, 0, 0);
      
      // Regenerate meeting link for new time
      const property = await db.getPropertyById(booking.propertyId || 0);
      let meetingUrl = booking.meetingUrl;
      
      if (booking.type) {
        const newMeetingUrl = await generateMeetingLink(booking.type, {
          title: `Virtual Tour: ${property?.title || 'Property'}`,
          startTime: scheduledAt,
          duration: 60,
          attendeeEmail: ctx.user.email ?? undefined,
          attendeeName: ctx.user.name ?? undefined,
        });
        if (newMeetingUrl) {
          meetingUrl = newMeetingUrl;
        }
      }
      
      // Update booking
      await db.updateBooking(input.bookingId, {
        scheduledAt,
        meetingUrl,
        status: 'scheduled',
        reminderSent: false, // Reset reminder flag
      });
      
      // Send rescheduling notification
      const notificationData = {
        userName: (ctx.user.name || ctx.user.email) as string,
        userEmail: ctx.user.email as string,
        propertyTitle: (property?.title || 'Property') as string,
        oldDateTime: new Date(booking.scheduledAt),
        newDateTime: scheduledAt,
        meetingUrl: (meetingUrl || '') as string,
      };
      await sendReschedulingNotification(notificationData);
      
      return { success: true };
    }),
    
    cancel: protectedProcedure.input(z.number()).mutation(async ({ ctx, input }) => {
      const booking = await db.getBookingById(input);
      if (!booking || booking.userId !== ctx.user.id) {
        throw new Error('Booking not found or unauthorized');
      }
      
      const success = await db.cancelBooking(input, ctx.user.id);
      
      if (success && booking.propertyId) {
        const property = await db.getPropertyById(booking.propertyId);
        if (property) {
          const { sendCancellationNotification } = await import('./tourNotifications');
          await sendCancellationNotification(booking, property.title);
        }
      }
      
      return success;
    }),
    
    list: adminProcedure.input(z.object({
      expertId: z.number().optional(),
      status: z.string().optional(),
      fromDate: z.date().optional(),
      limit: z.number().optional(),
    }).optional()).query(({ input }) => db.getBookings(input || {})),
    
    update: adminProcedure.input(z.object({ id: z.number(), data: z.record(z.string(), z.any()) })).mutation(({ input }) => db.updateBooking(input.id, input.data as any)),
  }),

  // Market Alerts
  alerts: router({
    subscribe: publicProcedure.input(z.object({
      email: z.string().email(),
      name: z.string().optional(),
      regions: z.array(z.string()).optional(),
      propertyTypes: z.array(z.string()).optional(),
      priceRange: z.string().optional(),
      frequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
    })).mutation(({ input }) => db.createMarketAlert(input)),
    list: adminProcedure.query(() => db.getMarketAlerts()),
  }),

  // Site Settings
  settings: router({
    get: publicProcedure.input(z.string()).query(({ input }) => db.getSetting(input)),
    getByCategory: publicProcedure.input(z.string()).query(({ input }) => db.getSettingsByCategory(input)),
    getAll: publicProcedure.query(() => db.getAllSettings()),
    upsert: adminProcedure.input(z.object({
      key: z.string(),
      value: z.string(),
      type: z.enum(['text', 'number', 'json', 'html']).optional(),
      category: z.string().optional(),
    })).mutation(({ input }) => db.upsertSetting(input.key, input.value, input.type, input.category)),
  }),

  // Portfolio Stats
  stats: router({
    list: publicProcedure.query(async () => {
      return cache.getOrSet('stats:list', () => db.getPortfolioStats(), CacheTTL.LONG);
    }),
    upsert: adminProcedure.input(z.object({
      id: z.number().optional(),
      label: z.string(),
      value: z.string(),
      suffix: z.string().optional(),
      order: z.number().optional(),
      isActive: z.boolean().optional(),
    })).mutation(async ({ input }) => {
      const result = await db.upsertPortfolioStat(input);
      cache.invalidate('stats:list');
      return result;
    }),
  }),

  // Analytics
  analytics: router({
    track: publicProcedure.input(z.object({
      eventType: z.string(),
      eventData: z.record(z.string(), z.any()).optional(),
      page: z.string().optional(),
      propertyId: z.number().optional(),
      sessionId: z.string().optional(),
    })).mutation(async ({ input }) => { await db.trackEvent(input as any); return { success: true }; }),
    summary: adminProcedure.input(z.object({
      fromDate: z.date().optional(),
      toDate: z.date().optional(),
    }).optional()).query(({ input }) => db.getAnalyticsSummary(input?.fromDate, input?.toDate)),
    salesFunnel: adminProcedure.query(() => db.getSalesFunnelStats()),
    recentUsers: adminProcedure.input(z.object({ limit: z.number().optional() }).optional()).query(({ input }) => db.getRecentUsers(input?.limit || 10)),
    userEngagement: adminProcedure.input(z.object({ userId: z.string() })).query(({ input }) => db.getUserEngagement(input.userId)),
    
    // External Analytics - Google Analytics & Cloudflare
    external: adminProcedure.input(z.object({
      startDate: z.string(),
      endDate: z.string(),
    })).query(async ({ input }) => {
      return externalAnalytics.getCombinedAnalytics(input.startDate, input.endDate);
    }),
    
    googleAnalytics: router({
      metrics: adminProcedure.input(z.object({
        startDate: z.string(),
        endDate: z.string(),
      })).query(({ input }) => externalAnalytics.getGAMetrics(input.startDate, input.endDate)),
      
      trafficSources: adminProcedure.input(z.object({
        startDate: z.string(),
        endDate: z.string(),
      })).query(({ input }) => externalAnalytics.getGATrafficSources(input.startDate, input.endDate)),
      
      topPages: adminProcedure.input(z.object({
        startDate: z.string(),
        endDate: z.string(),
      })).query(({ input }) => externalAnalytics.getGATopPages(input.startDate, input.endDate)),
      
      countries: adminProcedure.input(z.object({
        startDate: z.string(),
        endDate: z.string(),
      })).query(({ input }) => externalAnalytics.getGACountryData(input.startDate, input.endDate)),
      
      devices: adminProcedure.input(z.object({
        startDate: z.string(),
        endDate: z.string(),
      })).query(({ input }) => externalAnalytics.getGADeviceData(input.startDate, input.endDate)),
      
      timeSeries: adminProcedure.input(z.object({
        startDate: z.string(),
        endDate: z.string(),
      })).query(({ input }) => externalAnalytics.getGATimeSeries(input.startDate, input.endDate)),
    }),
    
    cloudflare: router({
      metrics: adminProcedure.input(z.object({
        startDate: z.string(),
        endDate: z.string(),
      })).query(({ input }) => externalAnalytics.getCloudflareMetrics(input.startDate, input.endDate)),
      
      countries: adminProcedure.input(z.object({
        startDate: z.string(),
        endDate: z.string(),
      })).query(({ input }) => externalAnalytics.getCloudflareCountryData(input.startDate, input.endDate)),
      
      timeSeries: adminProcedure.input(z.object({
        startDate: z.string(),
        endDate: z.string(),
      })).query(({ input }) => externalAnalytics.getCloudflareTimeSeries(input.startDate, input.endDate)),
    }),
  }),

  // FX Rates
  fx: router({
    list: publicProcedure.input(z.string().optional()).query(({ input }) => db.getFxRates(input ?? 'USD')),
    getRate: publicProcedure.input(z.object({
      base: z.string(),
      target: z.string(),
    })).query(({ input }) => db.getLatestFxRate(input.base, input.target)),
    update: adminProcedure.input(z.object({
      baseCurrency: z.string(),
      targetCurrency: z.string(),
      rate: z.string(),
      source: z.string().optional(),
    })).mutation(({ input }) => db.upsertFxRate({ ...input, fetchedAt: new Date() })),
  }),

  // Legal Pages
  legalPages: router({
    list: publicProcedure.query(() => db.getLegalPages()),
    getBySlug: publicProcedure.input(z.string()).query(({ input }) => db.getLegalPageBySlug(input)),
    listAll: adminProcedure.query(() => db.getAllLegalPages()),
    create: adminProcedure.input(z.object({
      slug: z.string(),
      title: z.string(),
      content: z.string().optional(),  // JSON format: {en: "...", de: "...", zh: "..."}
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
      isActive: z.boolean().optional(),
      order: z.number().optional(),
    })).mutation(({ input }) => db.createLegalPage(input)),
    update: adminProcedure.input(z.object({
      id: z.number(),
      slug: z.string().optional(),
      title: z.string().optional(),
      content: z.string().optional(),  // JSON format: {en: "...", de: "...", zh: "..."}
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
      isActive: z.boolean().optional(),
      order: z.number().optional(),
    })).mutation(({ input }) => db.updateLegalPage(input.id, input)),
    delete: adminProcedure.input(z.number()).mutation(({ input }) => db.deleteLegalPage(input)),
  }),

  // Storage
  storage: router({
    uploadImage: adminProcedure.input(z.object({
      filename: z.string(),
      contentType: z.string(),
      data: z.string(), // base64 encoded
    })).mutation(async ({ input }) => {
      // Convert base64 to buffer
      const buffer = Buffer.from(input.data, 'base64');
      
      // Generate unique filename
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(7);
      const ext = input.filename.split('.').pop() || 'jpg';
      const fileKey = `properties/${timestamp}-${randomStr}.${ext}`;
      
      // Upload to S3
      const result = await storagePut(buffer, input.contentType, fileKey);
      
      return result;
    }),

    uploadVideo: adminProcedure.input(z.object({
      filename: z.string(),
      contentType: z.string(),
      data: z.string(), // base64 encoded
    })).mutation(async ({ input }) => {
      // Convert base64 to buffer
      const buffer = Buffer.from(input.data, 'base64');
      
      // Generate unique filename
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(7);
      const ext = input.filename.split('.').pop() || 'mp4';
      const fileKey = `properties/videos/${timestamp}-${randomStr}.${ext}`;
      
      // Upload to S3
      const result = await storagePut(buffer, input.contentType, fileKey);
      
      return result;
    }),
  }),

  // Saved Searches
  savedSearches: router({
    list: protectedProcedure.query(({ ctx }) => db.getSavedSearchesByUserId(ctx.user.id)),
    
    create: protectedProcedure.input(z.object({
      name: z.string(),
      filters: z.object({
        region: z.string().optional(),
        country: z.string().optional(),
        propertyType: z.string().optional(),
        priceMin: z.number().optional(),
        priceMax: z.number().optional(),
        bedrooms: z.number().optional(),
        status: z.string().optional(),
      }),
      notificationsEnabled: z.boolean().default(true),
    })).mutation(({ ctx, input }) => db.createSavedSearch({
      userId: ctx.user.id,
      ...input,
    })),
    
    delete: protectedProcedure.input(z.number()).mutation(({ ctx, input }) => 
      db.deleteSavedSearch(input, ctx.user.id)
    ),
    
    toggleNotifications: protectedProcedure.input(z.object({
      id: z.number(),
      enabled: z.boolean(),
    })).mutation(({ ctx, input }) => 
      db.toggleSavedSearchNotifications(input.id, ctx.user.id, input.enabled)
    ),
  }),

  // Wishlist
  wishlist: router({
    list: protectedProcedure.query(({ ctx }) => db.getWishlistByUserId(ctx.user.id)),
    
    add: protectedProcedure.input(z.number()).mutation(({ ctx, input }) => 
      db.addToWishlist(ctx.user.id, input)
    ),
    
    remove: protectedProcedure.input(z.number()).mutation(({ ctx, input }) => 
      db.removeFromWishlist(ctx.user.id, input)
    ),
    
    check: protectedProcedure.input(z.number()).query(({ ctx, input }) => 
      db.isInWishlist(ctx.user.id, input)
    ),
  }),

  // Tour Feedback
  feedback: router({
    submit: protectedProcedure.input(z.object({
      bookingId: z.number(),
      propertyId: z.number(),
      rating: z.number().min(1).max(5),
      tourQuality: z.number().min(1).max(5).optional(),
      propertyInterest: z.enum(['very_interested', 'interested', 'neutral', 'not_interested']).optional(),
      wouldRecommend: z.boolean().optional(),
      comments: z.string().optional(),
      nextSteps: z.enum(['schedule_visit', 'request_info', 'make_offer', 'not_ready', 'other']).optional(),
    })).mutation(async ({ ctx, input }) => {
      const feedbackId = await db.createTourFeedback({
        ...input,
        userId: ctx.user.id,
      });
      
      // Update booking status to completed
      await db.updateBooking(input.bookingId, { status: 'completed' });
      
      return feedbackId;
    }),
    
    byProperty: publicProcedure.input(z.number()).query(({ input }) => 
      db.getTourFeedbackByPropertyId(input)
    ),
    
    all: adminProcedure.query(() => db.getAllTourFeedback()),
    
    propertyRating: publicProcedure.input(z.number()).query(({ input }) => 
      db.getPropertyAverageRating(input)
    ),
  }),

  // Seed database (admin only)
  seed: adminProcedure.mutation(async () => {
    await seedDatabase();
    return { success: true };
  }),

  // Downloads tracking
  downloads: router({
    track: publicProcedure.input(z.object({
      fullName: z.string(),
      email: z.string().email(),
      resourceType: z.enum(['report', 'brochure', 'photo', 'document', 'guide']),
      resourceId: z.number().optional(),
      resourceTitle: z.string(),
      resourceUrl: z.string(),
    })).mutation(async ({ input, ctx }) => {
      // Get IP address and user agent from request
      const ipAddress = ctx.req.ip || ctx.req.headers['x-forwarded-for'] as string || ctx.req.socket.remoteAddress;
      const userAgent = ctx.req.headers['user-agent'];
      
      const downloadId = await db.trackDownload({
        ...input,
        ipAddress,
        userAgent,
      });
      
      // Also create a lead for marketing purposes
      await db.createLead({
        email: input.email,
        source: `${input.resourceType}_download`,
        message: `Downloaded by ${input.fullName}: ${input.resourceTitle}`,
      });
      
      return downloadId;
    }),
    
    list: adminProcedure.query(() => db.getAllDownloads()),
    
    byEmail: adminProcedure.input(z.string().email()).query(({ input }) => 
      db.getDownloadsByEmail(input)
    ),
    
    byType: adminProcedure.input(z.enum(['report', 'brochure', 'photo', 'document', 'guide'])).query(({ input }) => 
      db.getDownloadsByResourceType(input)
    ),
    
    stats: adminProcedure.query(() => db.getDownloadStats()),
    
    // Tag management
    tags: router({
      list: adminProcedure.query(() => db.getAllDownloadTags()),
      
      create: adminProcedure
        .input(z.object({
          name: z.string().min(1).max(50),
          color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
          description: z.string().optional(),
        }))
        .mutation(({ input }) => db.createDownloadTag(input)),
      
      update: adminProcedure
        .input(z.object({
          id: z.number(),
          name: z.string().min(1).max(50).optional(),
          color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
          description: z.string().optional(),
        }))
        .mutation(({ input }) => {
          const { id, ...data } = input;
          return db.updateDownloadTag(id, data);
        }),
      
      delete: adminProcedure
        .input(z.number())
        .mutation(({ input }) => db.deleteDownloadTag(input)),
      
      assign: adminProcedure
        .input(z.object({
          downloadId: z.number(),
          tagId: z.number(),
        }))
        .mutation(({ input }) => db.assignTagToDownload(input.downloadId, input.tagId)),
      
      remove: adminProcedure
        .input(z.object({
          downloadId: z.number(),
          tagId: z.number(),
        }))
        .mutation(({ input }) => db.removeTagFromDownload(input.downloadId, input.tagId)),
      
      getForDownload: adminProcedure
        .input(z.number())
        .query(({ input }) => db.getTagsForDownload(input)),
    }),
    
    withTags: adminProcedure.query(() => db.getDownloadsWithTags()),
    
    byTag: adminProcedure
      .input(z.number())
      .query(({ input }) => db.getDownloadsByTag(input)),
  }),

  // Exchange rates for Investment Calculator
  exchangeRates: router({
    get: publicProcedure.query(async () => {
      try {
        // Fetch from Frankfurter API (free, no API key required)
        const symbols = "EUR,GBP,PHP,SGD,CNY";
        const response = await fetch(`https://api.frankfurter.dev/v1/latest?base=USD&symbols=${symbols}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch exchange rates");
        }
        
        const data = await response.json();
        
        // Build rates object with USD as base (rate = 1)
        const rates: Record<string, number> = { USD: 1 };
        Object.keys(data.rates).forEach(code => {
          rates[code] = data.rates[code];
        });
        
        return {
          rates,
          date: data.date,
          success: true,
        };
      } catch (error) {
        console.error("Error fetching exchange rates:", error);
        // Return fallback rates
        return {
          rates: {
            USD: 1,
            EUR: 0.95,
            GBP: 0.79,
            PHP: 58.5,
            SGD: 1.35,
            CNY: 7.25,
          },
          date: new Date().toISOString().split("T")[0],
          success: false,
        };
      }
    }),
  }),

  // Resources & Downloads
  resources: router({
    list: publicProcedure.query(() => db.getActiveResources()),
    
    byCategory: publicProcedure
      .input(z.object({ category: z.string() }))
      .query(({ input }) => db.getResourcesByCategory(input.category)),
    
    download: publicProcedure
      .input(z.object({
        resourceId: z.number(),
        fullName: z.string().min(1),
        email: z.string().email(),
      }))
      .mutation(async ({ input, ctx }) => {
        const resource = await db.getResourceById(input.resourceId);
        if (!resource) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Resource not found' });
        }
        
        // Track the download
        await db.trackDownload({
          fullName: input.fullName,
          email: input.email,
          resourceType: 'guide',
          resourceId: input.resourceId,
          resourceTitle: resource.title,
          resourceUrl: resource.fileUrl,
          ipAddress: ctx.req.ip || ctx.req.headers['x-forwarded-for'] as string || '',
          userAgent: ctx.req.headers['user-agent'] || '',
        });
        
        // Increment download count
        await db.incrementResourceDownloadCount(input.resourceId);
        
        // Send email to user with download link
        await sendResourceDownloadEmail({
          recipientEmail: input.email,
          recipientName: input.fullName,
          resourceTitle: resource.title,
          resourceUrl: resource.fileUrl,
          resourceCategory: resource.category,
        });
        
        return {
          success: true,
          downloadUrl: resource.fileUrl,
          title: resource.title,
        };
      }),
  }),

    // WhatsApp Team Accounts
  whatsapp: whatsappRouter,

  // Admin Data Management - Enhanced with time periods and data type selection
  adminData: router({
    // Get counts of all test data with optional time period filter
    getCounts: adminProcedure
      .input(z.object({
        period: z.enum([
          'all',
          'last_day',
          'last_week',
          'last_2_weeks',
          'last_3_weeks',
          'last_1_month',
          'last_3_months',
          'last_6_months',
          'last_9_months',
          'last_12_months',
        ]).optional().default('all'),
      }).optional())
      .query(async ({ input }) => {
        const period = input?.period || 'all';
        return db.getTestDataCountsByPeriod(period);
      }),
    
    // Reset selected data types with optional time period filter
    resetByTypeAndPeriod: adminProcedure
      .input(z.object({
        dataTypes: z.array(z.enum([
          'leads',
          'bookings',
          'downloads',
          'tourFeedback',
          'analyticsEvents',
          'whatsappClicks',
          'marketAlerts',
        ])),
        period: z.enum([
          'all',
          'last_day',
          'last_week',
          'last_2_weeks',
          'last_3_weeks',
          'last_1_month',
          'last_3_months',
          'last_6_months',
          'last_9_months',
          'last_12_months',
        ]).optional().default('all'),
      }))
      .mutation(async ({ input }) => {
        const results = await db.resetDataByTypeAndPeriod(input.dataTypes, input.period);
        return {
          success: true,
          deleted: results,
          dataTypes: input.dataTypes,
          period: input.period,
          message: 'Selected data has been reset successfully',
        };
      }),
    
    // Legacy endpoint - Reset all test data (for backward compatibility)
    resetAll: adminProcedure.mutation(async () => {
      const results = await db.resetAllTestData();
      return {
        success: true,
        deleted: results,
        message: 'All test data has been reset successfully',
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
