declare global {
    namespace NodeJS {
        interface ProcessEnv {
            DB_PATH: string;
            ADMIN_USERNAME: string;
            ADMIN_PASSWORD: string;
            DEMOUSER_USERNAME: string;
            DEMOUSER_PASSWORD: string;
            PORT: string;
            SECRET_KEY: string;
        }
    }

    namespace Express {
        interface Request {
            user?: { id: number, role: "admin" | "user" };
        }
    }
}

