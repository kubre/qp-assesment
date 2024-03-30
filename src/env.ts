declare global {
    namespace NodeJS {
        interface ProcessEnv {
            DB_PATH: string;
            ADMIN_USERNAME: string;
            ADMIN_PASSWORD: string;
            PORT: string;
        }
    }
}

