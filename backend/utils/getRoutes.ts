import router from "@adonisjs/core/services/router";

export default function getRoute(name: string, params?: Record<string, any>) {
    // Build route with optional params
    return router.builder().params(params).make(name)
}