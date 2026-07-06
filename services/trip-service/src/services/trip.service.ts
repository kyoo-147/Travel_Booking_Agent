import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trip } from '../entities/trip.entity';
import { Itinerary } from '../entities/itinerary.entity';
import { ItineraryItem } from '../entities/itinerary-item.entity';
import { Booking } from '../entities/booking.entity';
import { TripNote } from '../entities/trip-note.entity';
import { CreateTripDto, UpdateTripDto } from '../dto/trip.dto';
import { CreateBookingDto, UpdateBookingDto } from '../dto/booking.dto';
import { CreateNoteDto, UpdateNoteDto } from '../dto/note.dto';

@Injectable()
export class TripService {
  constructor(
    @InjectRepository(Trip)
    private tripRepository: Repository<Trip>,
    @InjectRepository(Itinerary)
    private itineraryRepository: Repository<Itinerary>,
    @InjectRepository(ItineraryItem)
    private itineraryItemRepository: Repository<ItineraryItem>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(TripNote)
    private noteRepository: Repository<TripNote>,
  ) { }

  // Trip CRUD operations
  async createTrip(createTripDto: CreateTripDto): Promise<Trip> {
    // Validate dates
    const startDate = new Date(createTripDto.startDate);
    const endDate = new Date(createTripDto.endDate);

    if (startDate >= endDate) {
      throw new BadRequestException('Start date must be before end date');
    }

    if (startDate < new Date()) {
      throw new BadRequestException('Start date cannot be in the past');
    }

    const trip = this.tripRepository.create({
      userId: createTripDto.userId,
      name: createTripDto.name,
      startDate,
      endDate,
      participants: createTripDto.numberOfPeople || 1,
      destination: {
        country: 'Unknown',
        city: 'Unknown',
        coordinates: { lat: 0, lng: 0 }
      },
      budget: {
        total: createTripDto.budgetMax || 0,
        currency: createTripDto.currency || 'USD',
        breakdown: {
          flights: 0,
          accommodation: 0,
          activities: 0,
          food: 0,
          transport: 0,
          other: 0
        }
      },
      preferences: createTripDto.preferences || {
        pace: 'moderate',
        interests: [],
        mustSee: [],
        avoidances: []
      }
    });

    return await this.tripRepository.save(trip);
  }

  async findAllTrips(): Promise<Trip[]> {
    return await this.tripRepository.find({
      relations: ['itinerary', 'bookings'],
      order: { createdAt: 'DESC' },
    });
  }

  async findTripsByUser(userId: string, source?: 'manual' | 'agent_booking' | 'api_import'): Promise<Trip[]> {
    const whereCondition: any = { userId };

    // Add source filter if provided
    if (source) {
      whereCondition.source = source;
    }

    return await this.tripRepository.find({
      where: whereCondition,
      relations: ['itinerary', 'bookings'],
      order: { createdAt: 'DESC' },
    });
  }

  async findTripById(id: string): Promise<Trip> {
    const trip = await this.tripRepository.findOne({
      where: { id },
      relations: ['itinerary', 'bookings'],
    });

    if (!trip) {
      throw new NotFoundException(`Trip with ID ${id} not found`);
    }

    return trip;
  }

  async updateTrip(id: string, updateTripDto: UpdateTripDto): Promise<Trip> {
    const trip = await this.findTripById(id);

    // Validate dates if provided
    if (updateTripDto.startDate || updateTripDto.endDate) {
      const startDate = updateTripDto.startDate
        ? new Date(updateTripDto.startDate)
        : trip.startDate;
      const endDate = updateTripDto.endDate
        ? new Date(updateTripDto.endDate)
        : trip.endDate;

      if (startDate >= endDate) {
        throw new BadRequestException('Start date must be before end date');
      }
    }

    // Update basic fields
    if (updateTripDto.name) trip.name = updateTripDto.name;
    if (updateTripDto.status) trip.status = updateTripDto.status;
    if (updateTripDto.startDate) trip.startDate = new Date(updateTripDto.startDate);
    if (updateTripDto.endDate) trip.endDate = new Date(updateTripDto.endDate);
    if (updateTripDto.numberOfPeople) trip.participants = updateTripDto.numberOfPeople;

    // Update budget
    if (updateTripDto.budget) {
      trip.budget = updateTripDto.budget;
    } else if (updateTripDto.budgetMax || updateTripDto.currency) {
      trip.budget = {
        ...trip.budget,
        total: updateTripDto.budgetMax || trip.budget.total,
        currency: updateTripDto.currency || trip.budget.currency,
      };
    }

    // Update preferences
    if (updateTripDto.preferences) {
      trip.preferences = { ...trip.preferences, ...updateTripDto.preferences };
    }

    return await this.tripRepository.save(trip);
  }

  async deleteTrip(id: string): Promise<void> {
    const trip = await this.findTripById(id);
    await this.tripRepository.remove(trip);
  }

  // Itinerary operations
  async createItinerary(tripId: string): Promise<Itinerary> {
    // Verify trip exists
    await this.findTripById(tripId);

    const itinerary = this.itineraryRepository.create({
      tripId,
      totalDistance: 0,
      estimatedCost: 0,
    });

    return await this.itineraryRepository.save(itinerary);
  }

  async findItineraryByTrip(tripId: string): Promise<Itinerary | null> {
    await this.findTripById(tripId); // Verify trip exists

    return await this.itineraryRepository.findOne({
      where: { tripId },
      relations: ['items'],
    });
  }

  async updateItinerary(id: string, updateData: Partial<{ totalDistance: number; estimatedCost: number }>): Promise<Itinerary> {
    const itinerary = await this.itineraryRepository.findOne({
      where: { id },
    });

    if (!itinerary) {
      throw new NotFoundException(`Itinerary with ID ${id} not found`);
    }

    Object.assign(itinerary, updateData);
    return await this.itineraryRepository.save(itinerary);
  }

  // Booking operations
  async createBooking(createBookingDto: CreateBookingDto): Promise<Booking> {
    // Verify trip exists
    await this.findTripById(createBookingDto.tripId);

    const booking = this.bookingRepository.create({
      tripId: createBookingDto.tripId,
      providerId: 'provider-1', // Default provider for now
      type: createBookingDto.type,
      providerBookingRef: createBookingDto.providerReference,
      details: createBookingDto.bookingDetails || {},
      price: {
        amount: createBookingDto.amount || 0,
        currency: createBookingDto.currency || 'USD',
        breakdown: {
          base: createBookingDto.amount || 0,
          taxes: 0,
          fees: 0,
          discounts: 0,
        }
      },
    });

    return await this.bookingRepository.save(booking);
  }

  async findBookingsByTrip(tripId: string): Promise<Booking[]> {
    await this.findTripById(tripId); // Verify trip exists

    return await this.bookingRepository.find({
      where: { tripId },
      order: { createdAt: 'DESC' },
    });
  }

  async findBookingById(id: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    return booking;
  }

  async updateBooking(id: string, updateBookingDto: UpdateBookingDto): Promise<Booking> {
    const booking = await this.findBookingById(id);

    if (updateBookingDto.status) booking.status = updateBookingDto.status;
    if (updateBookingDto.serviceName) booking.details = { ...booking.details, serviceName: updateBookingDto.serviceName };
    if (updateBookingDto.amount || updateBookingDto.currency) {
      booking.price = {
        ...booking.price,
        amount: updateBookingDto.amount || booking.price.amount,
        currency: updateBookingDto.currency || booking.price.currency,
      };
    }

    return await this.bookingRepository.save(booking);
  }

  async deleteBooking(id: string): Promise<void> {
    const booking = await this.findBookingById(id);
    await this.bookingRepository.remove(booking);
  }

  // Business logic methods
  async getTripSummary(tripId: string) {
    const trip = await this.findTripById(tripId);
    const itinerary = await this.findItineraryByTrip(tripId);
    const bookings = await this.findBookingsByTrip(tripId);

    const totalBookingCost = bookings.reduce((sum, booking) => {
      return sum + (booking.price?.amount || 0);
    }, 0);

    const daysCount = Math.ceil(
      (trip.endDate.getTime() - trip.startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      trip,
      totalDays: daysCount,
      totalItineraryItems: itinerary?.items?.length || 0,
      totalBookings: bookings.length,
      totalBookingCost,
      currency: trip.budget.currency,
      itinerary,
      bookingsByType: this.groupBookingsByType(bookings),
    };
  }

  private groupBookingsByType(bookings: Booking[]): Record<string, Booking[]> {
    const grouped: Record<string, Booking[]> = {};

    bookings.forEach(booking => {
      const type = booking.type.toString();
      if (!grouped[type]) {
        grouped[type] = [];
      }
      grouped[type].push(booking);
    });

    return grouped;
  }

  // =====================
  // NOTE OPERATIONS
  // =====================
  async findNotesByTrip(tripId: string): Promise<TripNote[]> {
    await this.findTripById(tripId); // Verify trip exists

    return await this.noteRepository.find({
      where: { tripId },
      order: { isPinned: 'DESC', createdAt: 'DESC' },
    });
  }

  async createNote(tripId: string, createNoteDto: CreateNoteDto): Promise<TripNote> {
    await this.findTripById(tripId); // Verify trip exists

    const note = this.noteRepository.create({
      tripId,
      content: createNoteDto.content,
      isPinned: createNoteDto.isPinned || false,
    });

    return await this.noteRepository.save(note);
  }

  async updateNote(noteId: string, updateNoteDto: UpdateNoteDto): Promise<TripNote> {
    const note = await this.noteRepository.findOne({
      where: { id: noteId },
    });

    if (!note) {
      throw new NotFoundException(`Note with ID ${noteId} not found`);
    }

    if (updateNoteDto.content !== undefined) {
      note.content = updateNoteDto.content;
    }
    if (updateNoteDto.isPinned !== undefined) {
      note.isPinned = updateNoteDto.isPinned;
    }

    return await this.noteRepository.save(note);
  }

  async deleteNote(noteId: string): Promise<void> {
    const note = await this.noteRepository.findOne({
      where: { id: noteId },
    });

    if (!note) {
      throw new NotFoundException(`Note with ID ${noteId} not found`);
    }

    await this.noteRepository.remove(note);
  }
}