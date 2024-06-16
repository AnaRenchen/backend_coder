import { TicketManagerMongo as TicketsDAO } from "../dao/ticketsmanagerMongo";

let tickets = new TicketsDAO();

export class TicketsController {
  static createTicket = async (req, res) => {
    try {
      let newTicket = await tickets.createTicket(dataTicket);
      res.setHeader("Content-Type", "application/json");
      return res.status(200).json({ message: "Ticket created.", newTicket });
    } catch (error) {
      res.setHeader("Content-Type", "application/json");
      return res.status(500).json({ error: "Internal server error." });
    }
  };
}
