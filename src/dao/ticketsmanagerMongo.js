import { ticketsModel } from "./models/ticketsModel.js";

export class TicketManagerMongo {
  async getTickets() {
    return await ticketsModel.find().lean();
  }

  async getTicketbyId(id) {
    return await ticketsModel.findOne({ _id: id });
  }

  async createTicket(dataTicket) {
    let newTicket = await ticketsModel.create(dataTicket);
    return newTicket.toJSON();
  }

  async deleteTicket(id) {
    return await ticketsModel.deleteOne({ _id: id });
  }
}
