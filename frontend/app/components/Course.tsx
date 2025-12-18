import { courses, type Course } from "api/api";
import { Field } from "./Field";
import { Form } from "@heroui/react";
// import './test.css'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@heroui/button";

export function CargarCurso({ value }: { value?: Course }) {
    const { id, name, tag } = value || {};

    const submitText = value ? "Guardar cambios" : "Crear curso";

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const data = Object.fromEntries(formData.entries());
        if (id) {
        // Actualizar curso existente
        await courses.update(id, data);
        } else {
        // Crear nuevo curso
        await courses.create(data);
        }
    };

    return (
        <Form onSubmit={handleSubmit} className="w-full">
            <Field label="Nombre del Curso" type="text" name="name" initialValue={name} required />
            <Field label="Etiqueta del Curso" type="text" name="tag" initialValue={tag} required />
            <Button type="submit">{submitText}</Button>
        </Form>
    );
}

export function Curso({ name, tag }: Omit<Course, "id">) {
    return (
        <div className="curso">
        <h2>{name}</h2>
        <p>Etiqueta: {tag}</p>
        </div>
    );
}

export function CursoList({ courses }: { courses: Course[] }) {
    return (
        <div className="curso-list">
            <div className="row">
                <h1>Lista de Cursos</h1>
                <div className="curso-list-actions">
                    <Button className="add-button">Crear curso</Button>
                    <Button className="delete-button">Eliminar seleccionados</Button>
                </div>
            </div>
            <div className="table">
                <div className="table-row">
                    <div></div>
                    <div className="left">Nombre</div>
                    <div className="left">Etiqueta</div>
                    <div className="center">Acciones</div>
                </div>
                {courses.map(course => (
                    // <Curso key={course.id} {...course} />
                    <a key={course.id} className="table-row" href={`/courses/${course.id}`}>
                        <div><input type="checkbox" id={`course-${course.id}`} /></div>
                        <div className="left">{course.name}</div>
                        <div className="left">{course.tag}</div>
                        <div className="center">
                            <FontAwesomeIcon icon={faTrash} size="sm" />
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
}

// export function CursoList({ courses }: { courses: Course[] }) {
//     return (
//         <div className="curso-list">
//             <div className="row">
//                 <h1>Lista de Cursos</h1>
//                 <div className="curso-list-actions">
//                     <button className="add-button">Crear curso</button>
//                     <button className="delete-button">Eliminar seleccionados</button>
//                 </div>
//             </div>
//             <div className="table">
//                 <table>
//                     <colgroup>
//                         <col style={{ width: "50px" }} />
//                         {/* <col style={{ width: "200px" }} />
//                         <col style={{ width: "100px" }} /> */}
//                         <col />
//                         <col />
//                         <col style={{ width: "50px" }} />
//                     </colgroup>
//                     <thead>
//                         <tr>
//                             <th></th>
//                             <th className="left">Nombre</th>
//                             <th className="left">Etiqueta</th>
//                             <th className="center">Acciones</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {courses.map(course => (
//                             // <Curso key={course.id} {...course} />
//                             <tr key={course.id} >
//                                 <td><input type="checkbox" id={`course-${course.id}`} /></td>
//                                 <td className="left">{course.name}</td>
//                                 <td className="left">{course.tag}</td>
//                                 <td className="center">
//                                     <FontAwesomeIcon icon={faTrash} size="sm" />
//                                 </td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>

//             </div>
//         </div>
//     );
// }

// Test data for development
export const testCourses: Course[] = [
    {
        id: 1,
        name: "Curso de Prueba",
        tag: "prueba"
    },
    {
        id: 2,
        name: "Curso de Desarrollo Web",
        tag: "web"
    },
    {
        id: 3,
        name: "Curso de Programación Avanzada",
        tag: "avanzado"
    }
];

export function CargarCursoDemo() {
    return (
        <CargarCurso value={{
            id: 1,
            name: "Curso de Ejemplo",
            tag: "ejemplo"
        }} />
    );
}

export function CursoDemo() {
    return (
        <Curso name="Curso de Ejemplo" tag="ejemplo" />
    );
}

export function CursoListDemo() {
    return (
        <CursoList courses={testCourses} />
    );
}
