export interface User {
    token: string,
    name: string,
    email: string,
    password: string,
    phone: string,
    userType: UserTypeEnum,
}

export enum UserTypeEnum {
    Admin = "Admin",
    Member = "Member",
    Guest = "Guest",
}