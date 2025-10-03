// Define routes that require authentication
export const protectedRoutes = ["/dashboard"];

// Define routes that are only accessible when not authenticated
export const authRoutes = ["/register", "/login", "/reset-password"];
