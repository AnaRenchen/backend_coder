export class UsersDTO {
  constructor(user) {
    this.firstname = user.name;
    this.lastname = user.last_name ? user.last_name : null;
    this.fullName = user.last_name
      ? `${this.firstname} ${this.lastname}`
      : this.firstname;
    this.email = user.email;
    this.role = user.role;
  }
}
