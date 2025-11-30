// tests/index.test.ts
import { describe, test, expect } from 'vitest'; // O 'jest'
import { parse } from '../src/index';
import { Schema } from '../src/types';

enum UserRole {
    ADMIN = 'ADMIN',
    USER = 'USER',
    GUEST = 'GUEST'
}

const testSchema: Schema = {
    name: 'string',
    age: 'number',
    isActive: 'boolean',
    createdAt: 'DateTime',
    role: UserRole, // Enum TS
    status: ['OPEN', 'CLOSED'], // Shorthand
};

describe('FIQL to Prisma Parser', () => {

    // --- GRUPO 1: Tipos Básicos ---
    test('Casteo de Números', async () => {
        const res = await parse('age==25', testSchema);
        expect(res).toEqual({ age: 25 });
    });

    test('Casteo de Booleanos', async () => {
        const res = await parse('isActive==true', testSchema);
        expect(res).toEqual({ isActive: true });
    });

    test('Casteo de Fechas', async () => {
        const res: any = await parse('createdAt==2023-01-01', testSchema);
        expect(res.createdAt).toBeInstanceOf(Date);
        expect(res.createdAt.toISOString()).toContain('2023-01-01');
    });

    // --- GRUPO 2: Wildcards y Operadores ---
    test('Contains (asteriscos)', async () => {
        const res = await parse('name==*juan*', testSchema);
        expect(res).toEqual({ name: { contains: 'juan' } });
    });

    test('Comparadores matemáticos', async () => {
        const res = await parse('age>=18', testSchema);
        expect(res).toEqual({ age: { gte: 18 } });
    });

    // --- GRUPO 3: Enums y Listas ---
    test('Validación de Enum TS', async () => {
        const res = await parse('role==ADMIN', testSchema);
        expect(res).toEqual({ role: 'ADMIN' });
    });

    test('Operador IN con Lista', async () => {
        const res = await parse('status=in=(OPEN,CLOSED)', testSchema);
        expect(res).toEqual({ status: { in: ['OPEN', 'CLOSED'] } });
    });

    // --- GRUPO 4: Lógica ---
    test('AND implícito y compactación', async () => {
        const res = await parse('age>18;isActive==true', testSchema);
        expect(res).toEqual({ age: { gt: 18 }, isActive: true });
    });

    test('OR explícito', async () => {
        const res = await parse('status==OPEN,status==CLOSED', testSchema);
        expect(res).toEqual({ OR: [{ status: 'OPEN' }, { status: 'CLOSED' }] });
    });
    
    test('Fusión de rango (Merge)', async () => {
        const res = await parse('age>18;age<30', testSchema);
        expect(res).toEqual({ age: { gt: 18, lt: 30 } });
    });

    // --- GRUPO 5: Errores Esperados ---
    test('Debe fallar si campo no existe', async () => {
        await expect(parse('salary==1000', testSchema))
            .rejects.toThrow(/no está permitido/);
    });

    test('Debe fallar si valor Enum es inválido', async () => {
        await expect(parse('role==SUPERMAN', testSchema))
            .rejects.toThrow(/Valor 'SUPERMAN' no permitido/);
    });

    test('Debe fallar si tipo es incorrecto', async () => {
        await expect(parse('age==veinte', testSchema))
            .rejects.toThrow(/no es numérico/);
    });
});