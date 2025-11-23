import { APIError, HandlerResponse, middleware } from "encore.dev/api";

export const catchErrors = middleware(async (req, next) => {
    try {
        return await next(req);
    } catch (error) {
        console.error("Error occurred:", error);
        // Catch my own errors
        if (error.type) {
            const response = new HandlerResponse({error});
            response.status = error.status || 500;
            return response;
        }
        throw APIError.internal("An unexpected error occurred. Please try again later.");
    }
});