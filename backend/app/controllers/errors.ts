export const errors = {
    notFound(instance: string, resourceType: string, resourceId: string | number) {
        return {
            type: "https://pasantias.unraf.edu.ar/errors/not-found",
            title: "Resource not found",
            status: 404,
            detail: "The requested offer does not exist",
            instance: instance,
            resourceType: resourceType,
            resourceId: resourceId
        }
    }
}