// Supabase Service Manager Library
// Main entry point

// Main class export
export {ServiceManager} from "./core/service-manager";

// Type exports
export * from "./types/result";
export * from "./types/user";
export * from "./types/auth";

// TODO: Uncomment these exports as modules are implemented
// export * from './core/user-manager';

// Service exports for advanced usage
export {AuthService} from "./services/auth.service";
export {UserService} from "./services/user.service";
export {CrudService} from "./services/crud.service";

// Library metadata
export const version = "1.0.0";
