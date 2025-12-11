import React from 'react';

// Función auxiliar para convertir "propName" a "PropName"
const toPascalCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Crea la función setter base para una propiedad específica.
 * El React Compiler garantiza que esta función será estable.
 */
const createPropertySetter = <T extends object, K extends keyof T>(
    setter: React.Dispatch<React.SetStateAction<T>>,
    prop: K
) => {
    return (newValue: T[K]) => {
        setter((prev) => ({
            ...prev,
            [prop]: newValue
        }));
    };
};

/**
 * Define el tipo de retorno: un objeto con claves 'setPropiedad'
 * Ejemplo: { setFirstName: (value: string) => void }
 */
type SetterRecord<T> = {
    [K in keyof T as K extends string 
        ? `set${Capitalize<K>}` 
        : never
    ]-?: (newValue: T[K]) => void
};

/**
 * Hook para generar un objeto con setters prefijados con 'set' para cada propiedad del estado T.
 * * @template T El tipo del objeto de estado.
 * @param setter El setter principal del estado.
 * @param state El objeto de estado actual (opcional, ayuda a TypeScript/Compilador).
 * @returns Un objeto con claves 'setPropiedad' y sus funciones setter.
 */
export const useSettersForObject = <T extends object>(
    setter: React.Dispatch<React.SetStateAction<T>>,
    state?: T 
): SetterRecord<T> => {
    
    // El objeto vacío tipado para ser llenado por el Proxy.
    const setters = {} as SetterRecord<T>;

    const handler: ProxyHandler<SetterRecord<T>> = {
        get: (_target, proxyKey: string | symbol) => {
            if (typeof proxyKey === 'symbol') {
                return undefined;
            }
            
            const keyString = String(proxyKey);
            
            // 1. Verificamos si la clave solicitada (ej: "setFirstName") empieza con "set"
            if (!keyString.startsWith('set')) {
                // Si alguien pide una clave que no empieza con 'set', podemos devolver undefined
                return undefined;
            }

            // 2. Extraemos la propiedad original (ej: "FirstName" -> "firstName")
            const originalPropPascalCase = keyString.slice(3); // Remueve "set"
            if (!originalPropPascalCase) {
                return undefined; // Solo era "set"
            }
            
            // Convertimos 'FirstName' a 'firstName' (la clave real del objeto T)
            const originalPropName = originalPropPascalCase.charAt(0).toLowerCase() + originalPropPascalCase.slice(1);

            // 3. Devolvemos el setter para la propiedad original
            // El Proxy devuelve una función que acepta el valor y llama a nuestro setter principal.
            return createPropertySetter(setter, originalPropName as keyof T);
        }
    };

    // Devolvemos el Proxy que interceptará las llamadas como setFirstName, etc.
    return new Proxy(setters, handler);
};