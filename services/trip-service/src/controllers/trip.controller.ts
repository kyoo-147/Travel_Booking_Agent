import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { TripService } from '../services/trip.service';
import { CreateTripDto, UpdateTripDto } from '../dto/trip.dto';
import { CreateBookingDto, UpdateBookingDto } from '../dto/booking.dto';
import { CreateNoteDto, UpdateNoteDto } from '../dto/note.dto';

@ApiTags('trips')
@Controller('trips')
export class TripController {
  constructor(private readonly tripService: TripService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new trip' })
  @ApiResponse({ status: 201, description: 'Trip created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createTrip(@Body() createTripDto: CreateTripDto) {
    return await this.tripService.createTrip(createTripDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all trips or trips by user' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filter trips by user ID' })
  @ApiQuery({ name: 'source', required: false, description: 'Filter trips by source (manual/agent_booking/api_import)' })
  @ApiResponse({ status: 200, description: 'Trips retrieved successfully' })
  async findTrips(
    @Query('userId') userId?: string,
    @Query('source') source?: 'manual' | 'agent_booking' | 'api_import'
  ) {
    if (userId) {
      return await this.tripService.findTripsByUser(userId, source);
    }
    return await this.tripService.findAllTrips();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get trip by ID' })
  @ApiParam({ name: 'id', description: 'Trip ID' })
  @ApiResponse({ status: 200, description: 'Trip retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Trip not found' })
  async findTripById(@Param('id') id: string) {
    return await this.tripService.findTripById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update trip' })
  @ApiParam({ name: 'id', description: 'Trip ID' })
  @ApiResponse({ status: 200, description: 'Trip updated successfully' })
  @ApiResponse({ status: 404, description: 'Trip not found' })
  async updateTrip(
    @Param('id') id: string,
    @Body() updateTripDto: UpdateTripDto,
  ) {
    return await this.tripService.updateTrip(id, updateTripDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete trip' })
  @ApiParam({ name: 'id', description: 'Trip ID' })
  @ApiResponse({ status: 204, description: 'Trip deleted successfully' })
  @ApiResponse({ status: 404, description: 'Trip not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTrip(@Param('id') id: string) {
    await this.tripService.deleteTrip(id);
  }

  @Get(':id/summary')
  @ApiOperation({ summary: 'Get trip summary with statistics' })
  @ApiParam({ name: 'id', description: 'Trip ID' })
  @ApiResponse({ status: 200, description: 'Trip summary retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Trip not found' })
  async getTripSummary(@Param('id') id: string) {
    return await this.tripService.getTripSummary(id);
  }

  // =====================
  // NOTE ENDPOINTS
  // =====================
  @Get(':id/notes')
  @ApiOperation({ summary: 'Get all notes for a trip' })
  @ApiParam({ name: 'id', description: 'Trip ID' })
  @ApiResponse({ status: 200, description: 'Notes retrieved successfully' })
  async getNotes(@Param('id') tripId: string) {
    return await this.tripService.findNotesByTrip(tripId);
  }

  @Post(':id/notes')
  @ApiOperation({ summary: 'Create a note for a trip' })
  @ApiParam({ name: 'id', description: 'Trip ID' })
  @ApiResponse({ status: 201, description: 'Note created successfully' })
  async createNote(
    @Param('id') tripId: string,
    @Body() createNoteDto: CreateNoteDto,
  ) {
    return await this.tripService.createNote(tripId, createNoteDto);
  }

  @Patch('notes/:noteId')
  @ApiOperation({ summary: 'Update a note' })
  @ApiParam({ name: 'noteId', description: 'Note ID' })
  @ApiResponse({ status: 200, description: 'Note updated successfully' })
  async updateNote(
    @Param('noteId') noteId: string,
    @Body() updateNoteDto: UpdateNoteDto,
  ) {
    return await this.tripService.updateNote(noteId, updateNoteDto);
  }

  @Delete('notes/:noteId')
  @ApiOperation({ summary: 'Delete a note' })
  @ApiParam({ name: 'noteId', description: 'Note ID' })
  @ApiResponse({ status: 204, description: 'Note deleted successfully' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteNote(@Param('noteId') noteId: string) {
    await this.tripService.deleteNote(noteId);
  }

  // Itinerary endpoints
  @Post(':id/itinerary')
  @ApiOperation({ summary: 'Create itinerary for trip' })
  @ApiParam({ name: 'id', description: 'Trip ID' })
  @ApiResponse({ status: 201, description: 'Itinerary created successfully' })
  @ApiResponse({ status: 404, description: 'Trip not found' })
  async createItinerary(@Param('id') tripId: string) {
    return await this.tripService.createItinerary(tripId);
  }

  @Get(':id/itinerary')
  @ApiOperation({ summary: 'Get itinerary for trip' })
  @ApiParam({ name: 'id', description: 'Trip ID' })
  @ApiResponse({ status: 200, description: 'Itinerary retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Trip not found' })
  async getItinerary(@Param('id') tripId: string) {
    return await this.tripService.findItineraryByTrip(tripId);
  }

  // Booking endpoints
  @Post(':id/bookings')
  @ApiOperation({ summary: 'Create booking for trip' })
  @ApiParam({ name: 'id', description: 'Trip ID' })
  @ApiResponse({ status: 201, description: 'Booking created successfully' })
  @ApiResponse({ status: 404, description: 'Trip not found' })
  async createBooking(
    @Param('id') tripId: string,
    @Body() createBookingDto: CreateBookingDto,
  ) {
    createBookingDto.tripId = tripId;
    return await this.tripService.createBooking(createBookingDto);
  }

  @Get(':id/bookings')
  @ApiOperation({ summary: 'Get all bookings for trip' })
  @ApiParam({ name: 'id', description: 'Trip ID' })
  @ApiResponse({ status: 200, description: 'Bookings retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Trip not found' })
  async getBookings(@Param('id') tripId: string) {
    return await this.tripService.findBookingsByTrip(tripId);
  }

  @Get('bookings/:bookingId')
  @ApiOperation({ summary: 'Get booking by ID' })
  @ApiParam({ name: 'bookingId', description: 'Booking ID' })
  @ApiResponse({ status: 200, description: 'Booking retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async getBookingById(@Param('bookingId') bookingId: string) {
    return await this.tripService.findBookingById(bookingId);
  }

  @Patch('bookings/:bookingId')
  @ApiOperation({ summary: 'Update booking' })
  @ApiParam({ name: 'bookingId', description: 'Booking ID' })
  @ApiResponse({ status: 200, description: 'Booking updated successfully' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async updateBooking(
    @Param('bookingId') bookingId: string,
    @Body() updateBookingDto: UpdateBookingDto,
  ) {
    return await this.tripService.updateBooking(bookingId, updateBookingDto);
  }

  @Delete('bookings/:bookingId')
  @ApiOperation({ summary: 'Delete booking' })
  @ApiParam({ name: 'bookingId', description: 'Booking ID' })
  @ApiResponse({ status: 204, description: 'Booking deleted successfully' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBooking(@Param('bookingId') bookingId: string) {
    await this.tripService.deleteBooking(bookingId);
  }
}