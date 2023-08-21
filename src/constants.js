/**
 * @type {{ ADMIN: "ADMIN"; USER: "USER"} as const}
 */
export const UserRolesEnum = {
  ADMIN: 'ADMIN',
  USER: 'USER',
}

export const AvailableUserRoles = Object.values(UserRolesEnum)

export const UserLoginType = {
  GOOGLE: 'GOOGLE',
  EMAIL_PASSWORD: 'EMAIL_PASSWORD',
  AUTH0: 'AUTH0',
}

export const AvailableSocialLogins = Object.values(UserLoginType)

export const USER_TEMPORARY_TOKEN_EXPIRY = 20 * 60 * 1000 // 20 minutes

export const DB_NAME = 'todo'
