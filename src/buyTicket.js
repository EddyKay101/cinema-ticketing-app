import TicketService from "./pairtest/TicketService.js";
import TicketPaymentService from "./thirdparty/paymentgateway/TicketPaymentService.js";
import SeatReservationService from "./thirdparty/seatbooking/SeatReservationService.js";
import TicketTypeRequest from "./pairtest/lib/TicketTypeRequest.js";

try {

  const ticketService = new TicketService();

  const adultRequest = new TicketTypeRequest('ADULT', 2);
  const childRequest = new TicketTypeRequest('CHILD', 1);


  ticketService.validatePurchase([adultRequest, childRequest]);


  const totalAmount = ticketService.totalAmount([adultRequest, childRequest]);
  console.log('Total Amount to Pay:', totalAmount);


  const totalSeats = ticketService.totalSeats([adultRequest, childRequest]);
  console.log('Total Seats to Allocate:', totalSeats);

  ticketService.purchaseTickets(20, adultRequest, childRequest);
  console.log('Tickets purchased successfully!');
} catch (error) {
  console.error('Error:', error.message);
}