export default interface Config {
    /**
     * Runtime environment.
     */
    env: {
        /**
         * `op-permission-level` defined in `server.properties`.
         * @default 2
         */
        permissionLevel: 0 | 1 | 2 | 3 | 4
    },
    /**
     * Lint rules.
     */
    lint: {
        /**
         * `always single`: Always use single quotes.  
         * `always double`: Always use double quotes.
         * `prefer single`: Always use single quotes, unless there are single quotes in the string.
         * `prefer double`: Always use double quotes, unless there are double quotes in the string.
         */
        quoteType: LintValue<'always single' | 'always double' | 'prefer single' | 'perfer double'>
    }
}

/**
 * Config which simulates the default vanilla command system.
 */
export const VanillaConfig: Config = {
    env: {
        permissionLevel: 2
    },
    lint: {
        quoteType: [true, 'perfer double']
    }
}

type LintValue<T> = boolean | [boolean, T]

export function shouldLint<T>(value: LintValue<T>) {
    if (typeof value === 'boolean') {
        return value
    } else {
        return value[0]
    }
}
