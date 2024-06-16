import { TicketManagerMongo as TicketsDAO } from "../dao/ticketsmanagerMongo.js";

class TicketsServices {
  constructor(dao) {
    this.dao = dao;
  }

  createTicket = async (dataTicket) => {
    return await this.dao.createTicket(dataTicket);
  };
}

export const ticketsSertices = new TicketsServices(new TicketsDAO());
