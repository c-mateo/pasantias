import router from "@adonisjs/core/services/router";

export default function getRoute(name: string, params?: Record<string, any>) {
    // Pass params to the router builder so routes with params can be generated.
    // Builder typings may not include the params overload, cast to any to avoid TS errors.
    return router.builder().params(params).make(name)
}