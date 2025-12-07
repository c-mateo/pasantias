import axios from "axios";

const instance = axios.create({
    baseURL: "http://localhost:4000/"
})

// Convierte una unión en una intersección (clave para tipado preciso)
type UnionToIntersection<U> =
  (U extends any ? (k: U) => void : never) extends
  (k: infer I) => void ? I : never;

// Extrae los tipos retornados por todos los mixins y los combina
type MergeMixins<T extends Array<(url: string) => any>> =
  UnionToIntersection<ReturnType<T[number]>>;

export function withCreate<T>(endpoint: string) {
    return {
        async create(data: Partial<T>): Promise<T> {
            try {
                const response = await instance.post(endpoint, data);
                return response.data;
            }
            catch (error) {
                console.error("Error al crear:", error);
                throw error;
            }
        }
    };
}

export function withList<T>(endpoint: string) {
    return {
        async list(): Promise<T[]> {
            try {
                const response = await instance.get(endpoint);
                return response.data;
            } catch (error) {
                console.error("Error al listar:", error);
                throw error;
            }
        }
    };
}

export function withUpdate<T>(endpoint: string) {
    return {
        async update(id: number, data: Partial<T>): Promise<T> {
            try {
                const response = await instance.put(`${endpoint}/${id}`, data);
                return response.data;
            } catch (error) {
                console.error("Error al actualizar:", error);
                throw error;
            }
        }
    };
}

export function withDelete<T>(endpoint: string) {
    return {
        async delete(id: number): Promise<void> {
            try {
                await instance.delete(`${endpoint}/${id}`);
            } catch (error) {
                console.error("Error al eliminar:", error);
                throw error;
            }
        }
    };
}

export function withGetById<T>(endpoint: string) {
    return {
        async getById(id: number): Promise<T> {
            try {
                const response = await instance.get(`${endpoint}/${id}`);
                return response.data;
            } catch (error) {
                console.error("Error al obtener por ID:", error);
                throw error;
            }
        }
    };
}

export function createApi(baseUrl: string) {
    return <Mixins extends Array<(url: string) => any>>(
        ...mixins: Mixins
    ): MergeMixins<Mixins> => {
    return mixins.reduce((acc, mixin) => {
      return { ...acc, ...mixin(baseUrl) };
    }, {}) as MergeMixins<Mixins>;
  };
}


// export function createApi<T extends Array<(url: string) => any>>(mixins: T, endpoint: string): MergeMixins<T> {
//     const api = {} as MergeMixins<T>;
//     mixins.forEach(mixin => {
//         Object.assign(api, mixin(endpoint));
//     });
//     return api;
// }

export interface Company {
    id: number;
    name: string;
    email: string;
    phone: string;
    address: string;
    website: string;
    description: string;
    logo?: string;
}

const setLogo = async(company: Company, logo: File): Promise<Company> => {
    const formData = new FormData();
    formData.append("image", logo);

    try {
        const response = await instance.post(`/companies/${company.id}/logo`, formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error al subir logo:", error);
        throw error;
    }
}

// export const companies = createApi("/companies")(
//     withCreate<Company>,
//     withList<Company>,
//     withUpdate<Company>,
//     withDelete<Company>,
//     withGetById<Company>
// );

export const companies = {
    get: withGetById<Company>("/companies"),
    list: withList<Company>("/companies"),
    create: withCreate<Company>("/companies"),
    update: withUpdate<Company>("/companies"),
    delete: withDelete<Company>("/companies"),
    async setLogo(company: Company, logo: File): Promise<Company> {
        const formData = new FormData();
        formData.append("image", logo);

        try {
            const response = await instance.post(`/companies/${company.id}/logo`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error al subir logo:", error);
            throw error;
        }
    },
    async getLogo(company: Company): Promise<Image> {
        try {
            const response = await instance.get(`/companies/${company.id}/logo`);
            return response.data;
        } catch (error) {
            console.error("Error al obtener logo:", error);
            throw error;
        }
    }
}

// companies.get()

export interface Course {
    id: number;
    name: string;
}

export const courses = createApi("/courses")(
    withCreate<Course>,
    withList<Course>,
    withUpdate<Course>,
    withDelete<Course>,
    withGetById<Course>
);

export interface Application {
    id: number;
    offerId: number;
    status: string;
    createdAt: string;
    updatedAt: string;
    userId: number;
}
