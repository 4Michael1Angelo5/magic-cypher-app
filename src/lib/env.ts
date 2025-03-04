export const env = {
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ?? throwEnvError("GOOGLE_CLIENT_ID"),
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ?? throwEnvError("GOOGLE_CLIENT_SECRET"),
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ?? throwEnvError("NEXTAUTH_SECRET"),
  };
  
  function throwEnvError(varName: string): never {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
  