import { TicketManagerMongo as TicketsDAO } from "../dao/ticketsmanagerMongo";

let tickets = new TicketsDAO();

export class TicketsController {
  static createTicket = async (req, res, next) => {
    try {
      let newTicket = await tickets.createTicket(dataTicket);
      res.setHeader("Content-Type", "application/json");
      return res.status(200).json({ message: "Ticket created.", newTicket });
    } catch (error) {
      next(
        CustomError.createError(
          "Internal Error.",
          null,
          "Failed to create ticket.",
          TYPES_ERROR.INTERNAL_SERVER_ERROR
        )
      );
    }
  };

  static getTicketbyId = async (req, res, next) => {
    try {
      let ticket = tickets.getTicketbyId(id);
      res.setHeader("Content-Type", "application/json");
      return res.status(200).json({ ticket });
    } catch (error) {
      next(
        CustomError.createError(
          "Internal Error.",
          null,
          "Failed to get ticket.",
          TYPES_ERROR.INTERNAL_SERVER_ERROR
        )
      );
    }
  };
}
