// Role constants for the application
export const ROLES = {
    ADMIN: "admin",
    REVIEWER: "reviewer",
    PENGELOLA: "pengelola",
};

// Array of all valid roles
export const ALL_ROLES = Object.values(ROLES);

// Roles that can be requested via account request
export const REQUESTABLE_ROLES = [ROLES.REVIEWER, ROLES.PENGELOLA];

export default ROLES;
