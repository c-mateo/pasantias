import type { IAPIClient } from "./IAPIClient";
import type {
  CoursesListResponse,
  CourseResponse,
  CourseDTO,
  CourseCreateRequest,
  CourseUpdateRequest,
} from "./types";
import { BaseRepository } from "./baseRepository";

export class CoursesRepository extends BaseRepository<
  CourseDTO,
  CourseCreateRequest,
  CourseUpdateRequest,
  CoursesListResponse
> {
  constructor(client: IAPIClient) {
    super(client, "courses");
  }
}
