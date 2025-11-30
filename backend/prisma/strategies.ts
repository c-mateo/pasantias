// utils/db-strategies.ts
import { apiErrors } from '#exceptions/myExceptions';
import { Prisma } from '@prisma/client';

type Strategy = (error: Prisma.PrismaClientKnownRequestError, model: any, input: any) => Promise<void> | void;

// The names of the fields that form a compound unique constraint
type Constraint = string[];

// --- ESTRATEGIA: UNIQUE CONSTRAINT (P2002) ---
export function checkUnique(fields: (string | Constraint)[]): Strategy {
  return async (error, model, input) => {
    if (error.code !== 'P2002') return;

    // 1. Filtrar campos presentes en el input
    const checks = fields.map(field => {
      if (typeof field === 'string') {
        return input[field] !== undefined ? { [field]: input[field] } : null;
      } else {
        // Compuestos: Todos los campos deben estar presentes
        const hasAll = field.every(f => input[f] !== undefined);
        return hasAll ? field.reduce((acc, f) => ({ ...acc, [f]: input[f] }), {}) : null;
      }
    }).filter(Boolean);

    if (checks.length === 0) return;

    // 2. Diagnóstico: Buscar colisión en DB
    const conflict = await model.findFirst({ where: { OR: checks } });
    if (!conflict) return; 

    // 3. Mapear al error correcto del catálogo
    const resourceType = model.name || 'Resource'; // Prisma suele tener model.name en runtime

    for (const field of fields) {
      if (typeof field === 'string') {
        // Caso: Campo Simple
        if (conflict[field] === input[field]) {
          // Caso Especial: Email (según tu catálogo)
          if (field === 'email') {
            throw apiErrors.emailAlreadyRegistered(input.email);
          }
          // Caso Genérico
          throw apiErrors.alreadyExists(resourceType, field, String(input[field]));
        }
      } else {
        // Caso: Campo Compuesto (@@unique)
        const isMatch = field.every(f => conflict[f] === input[f]);
        if (isMatch) {
          // Usamos 'multipleUniqueConflicts' para compuestos
          throw apiErrors.multipleUniqueConflicts(
            resourceType,
            field.map(f => ({ field: f, value: input[f] }))
          );
        }
      }
    }
  };
}

// --- ESTRATEGIA: FOREIGN KEY (P2003 - Input Inválido) ---
export function checkFK(fields: string[]): Strategy {
  return (error, _model, input) => {
    if (error.code !== 'P2003') return;

    // Intentamos obtener el campo de meta, o inferimos del input
    const metaField = error.meta?.field_name as string;
    
    let culprit = metaField && fields.includes(metaField) 
      ? metaField 
      : fields.find(f => input[f] !== undefined);

    if (culprit) {
      // Usamos validationError porque el ID enviado no es válido
      throw apiErrors.validationError([{
        field: culprit,
        message: `The referenced ${culprit} does not exist.`
      }]);
    }
  };
}

// --- ESTRATEGIA: DELETE RESTRICT (P2003 - Recurso en Uso) ---
// Pensado para onDelete: Restrict
export function checkDeleteRestrict(resourceType: string): Strategy {
  return (error, _model, input) => { // input aquí será el objeto 'where'
    if (error.code === 'P2003') {
       // Intentamos sacar el ID del input (que es el where)
       const id = input.id || 'unknown'; 
       
       throw apiErrors.resourceInUse(
          resourceType,
          id,
          {},
          'Cannot delete because it has dependent records.'
       );
    }
  };
}