import TicketService from '../src/pairtest/TicketService';
import TicketTypeRequest from '../src/pairtest/lib/TicketTypeRequest';
import InvalidPurchaseException from '../src/pairtest/lib/InvalidPurchaseException';
import TicketPaymentService from '../src/thirdparty/paymentgateway/TicketPaymentService';
import SeatReservationService from '../src/thirdparty/seatbooking/SeatReservationService';

jest.mock('../src/thirdparty/paymentgateway/TicketPaymentService', () => ({
  makePayment: jest.fn(),
}));
jest.mock('../src/thirdparty/seatbooking/SeatReservationService.js' , () => ({
  reserveSeat: jest.fn(),
}));


describe('TicketService', () => {
  let ticketService;

  beforeEach(() => {
    ticketService = new TicketService();
  });

  describe('validatePurchase', () => {
    it('should throw InvalidPurchaseException for invalid ticket request', () => {
      const invalidRequest = 'invalidRequest';
      expect(() => ticketService.validatePurchase([invalidRequest])).toThrowError(InvalidPurchaseException);
    });

    it('should throw InvalidPurchaseException for invalid ticket type or quantity', () => {
      const validRequest = new TicketTypeRequest('ADULT', 5);
      expect(() => ticketService.validatePurchase([validRequest])).not.toThrowError(InvalidPurchaseException);
    });

    //Only a maximum of 20 tickets that can be purchased at a time.
    it('should throw InvalidPurchaseException for exceeding maximum tickets per purchase', () => {
      const validRequest = new TicketTypeRequest('ADULT', 25);
      expect(() => ticketService.validatePurchase([validRequest])).toThrowError(InvalidPurchaseException);
    });

    //Infants do not pay for a ticket and are not allocated a seat. They will be sitting on an Adult's lap.
    it('should throw InvalidPurchaseException for INFANT tickets without an ADULT ticket', () => {
      const childRequest = new TicketTypeRequest('INFANT', 2);
      const invalidRequests = [childRequest];
      expect(() => ticketService.validatePurchase(invalidRequests)).toThrowError(InvalidPurchaseException);
    });

    it('should not throw any exception for a valid purchase', () => {
      const validRequests = [new TicketTypeRequest('ADULT', 2), new TicketTypeRequest('CHILD', 1)];
      expect(() => ticketService.validatePurchase(validRequests)).not.toThrow();
    });
  });

  describe('purchaseTickets', () => {
    it('should make payment and reserve seat successfully', () => {
      const validRequests = [new TicketTypeRequest('ADULT', 2)];
      const accountId = 'testAccountId';
    
      ticketService.purchaseTickets(accountId, ...validRequests);
    
      
      expect(TicketPaymentService.makePayment).toHaveBeenCalledWith(accountId, 40);
      expect(SeatReservationService.reserveSeat).toHaveBeenCalledWith(accountId, 2);
    });
  });

  describe('totalAmount', () => {
    it('should calculate total amount correctly', () => {
      const requests = [new TicketTypeRequest('ADULT', 3), new TicketTypeRequest('CHILD', 1)];
      const result = ticketService.totalAmount(requests);
      expect(result).toBe(70); // (30 * 2) + (10 * 1)
    });
  });

  describe('totalSeats', () => {
    it('should calculate total seats correctly', () => {
      const requests = [new TicketTypeRequest('ADULT', 2), new TicketTypeRequest('CHILD', 1)];
      const result = ticketService.totalSeats(requests);
      expect(result).toBe(2); 
    });
  });
});
