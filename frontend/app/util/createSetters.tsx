import React from 'react'

// Create typed setter helpers for object properties.
const createPropertySetter = <T extends object, K extends keyof T>(
  setter: React.Dispatch<React.SetStateAction<T>>,
  prop: K
) => (newValue: T[K]) => setter((prev) => ({ ...prev, [prop]: newValue }))

type SetterRecord<T> = {
  [K in keyof T as K extends string ? `set${Capitalize<K>}` : never]-?: (v: T[K]) => void
}

/**
 * Return a proxy object with `setXxx` setters for each property of T.
 */
export const createSetters = <T extends object>(
  setter: React.Dispatch<React.SetStateAction<T>>
): SetterRecord<T> => {
  const setters = {} as SetterRecord<T>
  const handler: ProxyHandler<SetterRecord<T>> = {
    get: (_target, proxyKey: string | symbol) => {
      if (typeof proxyKey === 'symbol') return undefined
      const keyString = String(proxyKey)
      if (!keyString.startsWith('set')) return undefined
      const original = keyString.slice(3)
      if (!original) return undefined
      const name = original.charAt(0).toLowerCase() + original.slice(1)
      return createPropertySetter(setter, name as keyof T)
    },
  }
  return new Proxy(setters, handler)
}