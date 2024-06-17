import { TicketManagerMongo as TicketsDAO } from "../dao/ticketsmanagerMongo.js";

class TicketsServices {
  constructor(dao) {
    this.dao = dao;
  }

  createTicket = async (dataTicket) => {
    return await this.dao.createTicket(dataTicket);
  };

  getTicketbyId = async (id) => {
    return await this.dao.getTicketbyId({ _id: id });
  };
}

export const ticketsServices = new TicketsServices(new TicketsDAO());
