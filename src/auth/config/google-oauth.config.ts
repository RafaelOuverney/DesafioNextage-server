import {registerAs} from "@nestjs/config"

export default registerAs("googleOauth", ()=> ({
    clientId: process.env.GOOGLE_CLIENT_ID || "your_google_client_id",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "your_google_client_secret",
    callbackUrl: process.env.GOOGLE_CALLBACK_URL || "http://localhost:3000/auth/google/callback",
}))
