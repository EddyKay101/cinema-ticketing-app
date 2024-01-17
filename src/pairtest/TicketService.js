import TicketTypeRequest from './lib/TicketTypeRequest.js';
import InvalidPurchaseException from './lib/InvalidPurchaseException.js';
import TicketPaymentService from '../thirdparty/paymentgateway/TicketPaymentService.js';
import SeatReservationService from '../thirdparty/seatbooking/SeatReservationService.js';
export default class TicketService {
  #ticketPrices = {
    'ADULT': 20,
    'CHILD': 10,
    'INFANT': 0
  };

  #maximumTicketsPerPurchase = 20;

  
  validatePurchase(ticketTypeRequests) {
    let totalTickets = 0;
    for (const request of ticketTypeRequests) {
      if (!(request instanceof TicketTypeRequest)) {
        throw new InvalidPurchaseException('Invalid ticket request');
      }

      const type = request.getTicketType();
      const noOfTickets = request.getNoOfTickets();

      if (!this.#ticketPrices.hasOwnProperty(type) || noOfTickets <= 0) {
        throw new InvalidPurchaseException('Invalid ticket type or quantity');
      }

      totalTickets += noOfTickets;
    }

    if (totalTickets > this.#maximumTicketsPerPurchase) {
      throw new InvalidPurchaseException('Exceeded maximum tickets per purchase');
    }

    for (const request of ticketTypeRequests) {
      const type = request.getTicketType();
      const noOfTickets = request.getNoOfTickets();

      if ((type === 'CHILD' || type === 'INFANT') && noOfTickets > 0) {
        const adultRequest = ticketTypeRequests.find(req => req.getTicketType() === 'ADULT');
        if (!adultRequest || adultRequest.getNoOfTickets() < noOfTickets) {
          throw new InvalidPurchaseException(`${type} tickets cannot be purchased without an ADULT ticket`);
        }
      }
    }
  }

  totalAmount(ticketTypeRequests) {
    return ticketTypeRequests.reduce((total, request) => {
      const type = request.getTicketType();
      const noOfTickets = request.getNoOfTickets();
      return total + this.#ticketPrices[type] * noOfTickets;
    }, 0);
  }

  totalSeats(ticketTypeRequests) {
    return ticketTypeRequests.reduce((total, request) => {
      const type = request.getTicketType();
      const noOfTickets = request.getNoOfTickets();
      return total + (type === 'ADULT' ? noOfTickets : 0);
    }, 0);
  }

  purchaseTickets(accountId, ...ticketTypeRequests) {
    this.validatePurchase(ticketTypeRequests);

    const totalAmountToPay = this.totalAmount(ticketTypeRequests);
    const totalSeatsToAllocate = this.totalSeats(ticketTypeRequests);

    TicketPaymentService.makePayment(accountId, totalAmountToPay);
    SeatReservationService.reserveSeat(accountId, totalSeatsToAllocate);

  }

  
}
