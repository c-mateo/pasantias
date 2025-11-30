// types.ts

// Tipos escalares permitidos en tu base de datos
export type ScalarType = 'string' | 'number' | 'boolean' | 'DateTime';

// Shorthands para Enums
export type AllowedValues = (string | number)[];
export type TsEnumObject = { [key: string]: string | number } & { type?: never };

// Configuración Normalizada (Interna)
export type NormalizedConfig = 
    | { type: ScalarType } 
    | { type: 'enum'; values: (string | number)[]; name?: string };

// Lo que el usuario escribe en 'vars'
export type FieldDefinition = 
    | ScalarType       // 'number'
    | AllowedValues    // ['A', 'B']
    | TsEnumObject     // UserRole
    | { type: 'enum'; values: AllowedValues | TsEnumObject; name?: string }; // Config explícita

export type Schema = Record<string, FieldDefinition>;

// Operadores
export type PrismaOp = 'equals' | 'not' | 'in' | 'notIn' | 'lt' | 'lte' | 'gt' | 'gte' | 'contains' | 'startsWith' | 'endsWith';