import type { Dispatch, SetStateAction } from 'react';

type SettersFromState<T extends Record<string, any>> = {
  [K in keyof T as `set${Capitalize<string & K>}`]-?: (value: T[K]) => void;
};

/** Create typed setters from a React setState function. */
export function createSetters<T extends Record<string, any>>(
  setState: Dispatch<SetStateAction<T>>
): SettersFromState<T> {
  return new Proxy({} as SettersFromState<T>, {
    get: (_target, prop: string | symbol) => {
      if (typeof prop === 'string' && prop.startsWith('set')) {
        const key = prop.slice(3); // Remove 'set' prefix
        const fieldName = (key.charAt(0).toLowerCase() + key.slice(1)) as keyof T;

        return (value: T[typeof fieldName]) => {
          setState(prev => ({
            ...prev,
            [fieldName]: value,
          }));
        };
      }
      return undefined;
    },
  });
}