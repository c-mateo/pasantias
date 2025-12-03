import { parse as peggyParse } from "./parser.mjs"; // Tu archivo generado
import { astToPrisma, compactPrismaQuery } from "./transformer.js";
import { Schema } from "./types";

export function parseFIQL(input: string, vars?: Schema): object {
    // 1. Obtener AST crudo de Peggy
    const rawAst = peggyParse(input);
    
    // 2. Transformar a estructura Prisma (incluye validación si hay vars)
    const prismaObj = astToPrisma(rawAst, vars);

    // 3. Compactar y limpiar (ANDs y equals)
    const finalQuery = compactPrismaQuery(prismaObj);

    // 4. Asegurar que el resultado final sea válido para Prisma
    // Prisma requiere un OR top-level si hay un array, o un objeto directo
    // Nuestra función astToPrisma ya devuelve objetos con OR/AND, así que retornamos directo.
    return finalQuery;
}


// // 1. Definimos un Enum real de TS
// enum Role {
//     ADMIN = 'ADMIN',
//     USER = 'USER'
// }

// // 2. Tu esquema súper flexible
// const myVars: Schema = {
//     // Opción A: Enum pasando el objeto TS directamente
//     role: Role, 

//     // Opción B: Enum pasando lista de valores (Shorthand)
//     status: ['OPEN', 'CLOSED', 'PENDING'], 

//     // Opción C: Tipo básico
//     age: 'number',
// };

// --- PRUEBAS ---

// // 1. Enum TS
// console.log(await parse("role==ADMIN", myVars)); // OK -> { role: { equals: 'ADMIN' } }

// // 2. Lista de Valores
// console.log(await parse("status==OPEN", myVars)); // OK

// // 3. Error en Lista
// // parse("status==ARCHIVED", myVars); // Error: Valor 'ARCHIVED' no permitido...

// console.log(JSON.stringify(await parse("first_name==foo*,last_name==*bar,asd==fgh,(age<55;age>5),type=in=(books,magazines)", {
//     first_name: 'string',
//     last_name: 'string',
//     asd: 'string',
//     age: 'number',
//     type: ['books', 'magazines']
// })));