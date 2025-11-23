function isPlainObject(value: any): value is Record<string, any> {
    return (
        typeof value === "object" &&
        value !== null &&
        Object.getPrototypeOf(value) === Object.prototype
    );
}

export function fiql(filter: string) {
    const where: Record<string, any> = {}

    const name = /^[a-zA-Z_][a-zA-Z0-9_]*$/
    const operators = /(==|!=|=lt=|=le=|=gt=|=ge=)/g

    let i = 0
    const stack = [ {} ]

    while (i < filter.length) {
        const ctx = stack[stack.length - 1]
        const c = filter[i];
        if (c === "("){
            stack.push({})
        }
        else if (c === ")") {
            const start = stack.pop()
            if (start === undefined) {
                throw new Error("Unmatched closing parenthesis in FIQL filter")
            }
        }
        else if (c === ",") {
            // Separator found (OR)
            stack.push({ OR: [] })
        }
        const m = filter.match(name)
        const name = m?.[0]
        if (!name) {
            break
        }

    }
    // filter.matchAll(/,|;/g).forEach(match => {
    //     const separator = match[0]
    //     if (separator == ',') {
    //         // OR
    //         where.OR = [

    //         ]
    //     }
    //     else {
    //         // AND
    //     }
    // }
    filter.split(/;|,/).forEach(part => {
        const [key, value] = part.split(/==|!=|=lt=|=le=|=gt=|=ge=/)
        console.log(`Key: ${key}, Value: ${value}`)

        if (key in where) {
            // Check if is object and append
            // if (isPlainObject(where[key])) {
            //     where[key]
            // }
            // 
            // else 
            throw new Error(`Duplicate filter key: ${key}`)
        }
        else {
            where[key] = value
        }
    })
    return where
}