import router from "@adonisjs/core/services/router";

export default function getRoute(name: string) {
    return router.builder().make(name)
}