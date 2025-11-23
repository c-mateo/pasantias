// import type { HttpContext } from '@adonisjs/core/http'

import { prisma } from "#start/prisma"
import { createCourseValidator, idValidator, updateCourseValidator } from "#validators/course"
import { HttpContext } from "@adonisjs/core/http"
import { errors } from "./errors.js"

export default class CoursesController {
    // GET /courses
    async list() {
        return {
            data: await prisma.course.findMany()
        }
    }

    // POST /courses
    async create({ request, response }: HttpContext) {
        const data = await request.validateUsing(createCourseValidator)
        const course = await prisma.course.create({ data })
        
        response.created({ data: course })
    }
    
    // GET /courses/:id
    async get({ request, response }: HttpContext) {
        const { params } = await request.validateUsing(idValidator)
        const course = await prisma.course.findUnique({
            where: { id: params.id },
        })
        if (!course) {
            // TODO: Ver si es posible hacer esto automáticamente mediante middleware
            response.notFound(errors.notFound(`/api/v1/courses/${params.id}`, "Course", params.id))
        }
        return {
            data: course
        }
    }

    // PATCH /courses/:id
    async update({ request }: HttpContext) {
        const { params, ...data } = await request.validateUsing(updateCourseValidator)
        const course = await prisma.course.update({
            where: { id: params.id },
            data
        })
        return {
            data: course
        }
    }

    // DELETE /courses/:id
    async delete({ request, response }: HttpContext) {
        const { params } = await request.validateUsing(idValidator)

        await prisma.course.delete({
            where: { id: params.id },
        })

        response.noContent()
    }
}