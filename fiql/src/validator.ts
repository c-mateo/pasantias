// validator.ts
import { Schema, FieldDefinition, NormalizedConfig, ScalarType } from './types';

const STRING_ONLY_OPS = ['contains', 'startsWith', 'endsWith'];

// --- Helpers ---

function getEnumValues(values: any): (string | number)[] {
    if (Array.isArray(values)) return values;
    return Object.values(values).filter(v => typeof v === 'string' || typeof v === 'number');
}

// Convierte todo a una estructura uniforme: { type: ..., values?: ... }
function normalizeDefinition(def: FieldDefinition): NormalizedConfig {
    // 1. String simple ('number', 'string')
    if (typeof def === 'string') {
        return { type: def };
    }

    // 2. Array de valores (Shorthand Enum) -> ['A', 'B']
    if (Array.isArray(def)) {
        return { type: 'enum', values: def };
    }

    // 3. Enum de TypeScript (Objeto) -> UserRole
    // Detectamos si es un objeto simple sin propiedad 'type'
    if (typeof def === 'object' && !('type' in def)) {
        return { type: 'enum', values: getEnumValues(def) };
    }

    // 4. Configuración explícita { type: 'enum', values: ... }
    if (typeof def === 'object' && def.type === 'enum') {
        return {
            type: 'enum',
            values: getEnumValues(def.values),
            name: def.name
        };
    }

    // Fallback por seguridad
    throw new Error(`Definición de tipo inválida.`);
}

export function validateAndCast(
    field: string, 
    operator: string, 
    value: any, 
    schema?: Schema
): any {
    if (!schema) return value;

    const rawDefinition = schema[field];
    if (!rawDefinition) {
        throw new Error(`El campo '${field}' no está permitido.`);
    }

    // Ahora 'config' tiene un tipo sólido (NormalizedConfig)
    const config = normalizeDefinition(rawDefinition);
    const type = config.type;

    // --- Validación de Operadores ---
    if ((type === 'enum' || type === 'boolean') && STRING_ONLY_OPS.includes(operator)) {
         throw new Error(`El operador '${operator}' no es válido para el tipo ${type}.`);
    }

    // --- Lógica de Arrays para IN / NOT IN ---
    // Si el valor viene como array (ej: operator 'in'), validamos cada item
    if (Array.isArray(value)) {
         return value.map(v => castSingleValue(field, v, config));
    }
    
    // Si el valor es simple, validamos uno solo
    return castSingleValue(field, value, config);
}

function castSingleValue(field: string, value: any, config: NormalizedConfig): any {
    // 1. Lógica Enum
    if (config.type === 'enum') {
        // config.values existe aquí seguro porque TS sabe que type es 'enum'
        const validValues = config.values; 
        
        // Intento de conversión numérica para enums mixtos o numéricos
        const numVal = Number(value);
        const checkVal = isNaN(numVal) ? value : numVal;

        if (!validValues.includes(checkVal)) {
             throw new Error(`Valor '${value}' no permitido en '${field}'. Opciones: [${validValues.join(', ')}]`);
        }
        return checkVal;
    }

    // 2. Lógica Escalar
    // TypeScript ahora sabe que si no es 'enum', config.type es ScalarType
    return castScalar(field, value, config.type);
}

function castScalar(field: string, value: any, type: ScalarType): any {
    switch (type) {
        case 'number':
            const num = Number(value);
            if (isNaN(num)) throw new Error(`'${value}' no es número en '${field}'.`);
            return num;
        case 'boolean':
            // Manejo flexible de booleanos
            if (String(value) === 'true') return true;
            if (String(value) === 'false') return false;
            throw new Error(`'${value}' no es booleano en '${field}'.`);
        case 'DateTime':
            const date = new Date(value);
            if (isNaN(date.getTime())) throw new Error(`'${value}' no es fecha en '${field}'.`);
            return date;
        case 'string':
        default:
            return String(value);
    }
}