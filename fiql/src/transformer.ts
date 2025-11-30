import { Schema } from './types';
import { validateAndCast } from './validator';
import { flattenString, deepMerge } from './utils';

// Detecta si es contains, startsWith, etc. basado en los asteriscos
function detectOperatorAndValue(valArr: any[]): { op: string, val: any } {
    // Asumiendo estructura de Peggy: [prefix, chars, suffix] o similar
    // Ajusta índices según tu output exacto si cambia
    
    // Si es lista (IN): ["(", list, ")"]
    if (valArr[0] === "(" && valArr[valArr.length-1] === ")") {
        // Aplanamos y limpiamos paréntesis para obtener array limpio
        const rawStr = flattenString(valArr); 
        const cleanList = rawStr.replace(/[()]/g, '').split(',');
        return { op: 'in', val: cleanList }; 
        // Nota: El operador 'in' se reajustará abajo si el operador original era '=out='
    }

    const prefix = valArr[0]; // "*" o null
    const chars = flattenString(valArr[1]);
    const suffix = valArr[2]; // "*" o null
    
    if (prefix === '*' && suffix === '*') return { op: 'contains', val: chars };
    if (prefix === '*') return { op: 'endsWith', val: chars };
    if (suffix === '*') return { op: 'startsWith', val: chars };
    
    return { op: 'equals', val: chars };
}

// Función recursiva principal
export function astToPrisma(node: any, vars?: Schema): any {
    if (!node || node.length === 0) return null;

    // 1. Lógica (AND / OR) - Detectar Head + Tail
    if (Array.isArray(node) && node.length === 2 && Array.isArray(node[1])) {
        const head = node[0];
        const tail = node[1];
        
        // Si no hay tail, devolvemos el head procesado directamente
        if (tail.length === 0) return astToPrisma(head, vars);

        const operatorSymbol = tail[0][0]; 
        const logicOp = operatorSymbol === ',' ? 'OR' : 'AND';

        const children = [astToPrisma(head, vars)];
        tail.forEach((t: any) => children.push(astToPrisma(t[1], vars)));
        
        return { [logicOp]: children };
    }

    // 2. Grupos con Paréntesis
    if (Array.isArray(node) && node.length === 3 && node[0] === "(") {
        return astToPrisma(node[1], vars);
    }

    // 3. Comparación (Campo op Valor)
    if (Array.isArray(node) && node.length === 3 && typeof node[1] === 'string') {
        const fieldRaw = node[0];
        const fiqlOp = node[1];
        const valueRaw = node[2];

        const field = flattenString(fieldRaw);
        let { op, val } = detectOperatorAndValue(valueRaw);

        // Refinar operador basado en el símbolo FIQL
        if (op === 'equals' || op === 'in') {
            if (fiqlOp === '<') op = 'lt';
            else if (fiqlOp === '>') op = 'gt';
            else if (fiqlOp === '<=') op = 'lte';
            else if (fiqlOp === '>=') op = 'gte';
            else if (fiqlOp === '!=') op = 'not';
            else if (fiqlOp === '=out=') op = 'notIn';
            else if (fiqlOp === '=in=') op = 'in';
        }

        // VALIDAR Y CASTEAR (Si vars es undefined, devuelve val tal cual)
        const castedVal = validateAndCast(field, op, val, vars);

        return {
            [field]: { [op]: castedVal }
        };
    }

    return null;
}

// Post-procesador para compactar ANDs y simplificar equals
export function compactPrismaQuery(obj: any): any {
    if (typeof obj !== 'object' || obj === null) return obj;
    if (Array.isArray(obj)) return obj.map(compactPrismaQuery);

    // Simplificar equals: { field: { equals: val } } -> { field: val }
    const keys = Object.keys(obj);
    if (keys.length === 1 && keys[0] === 'equals') return obj['equals'];

    // Procesar hijos recursivamente
    const processed: any = {};
    for (const key in obj) {
        processed[key] = compactPrismaQuery(obj[key]);
    }

    // Compactar AND
    if (processed.AND && Array.isArray(processed.AND)) {
        let mergedAnd = {};
        for (const item of processed.AND) {
            deepMerge(mergedAnd, item);
        }
        
        // Si solo hay AND, lo reemplazamos por el objeto mergeado
        if (Object.keys(processed).length === 1) {
            return mergedAnd;
        } else {
            delete processed.AND;
            Object.assign(processed, mergedAnd);
        }
    }

    return processed;
}