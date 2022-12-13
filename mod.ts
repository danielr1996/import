import * as esbuild from 'https://deno.land/x/esbuild@v0.15.16/mod.js'
import httpFetch from 'https://raw.githubusercontent.com/danielr1996/esbuild-plugin-http-fetch/main/index.js'
const AsyncFunction = async function () {}.constructor

export const build = async (options: Record<string, unknown>) => {
    try{
        await esbuild.initialize({})
        const output = await esbuild.build({
            bundle: true,
            write: false,
            plugins: [httpFetch],
            minify: true,
            logLevel: 'silent',
            format: 'esm',
            ...options
        })
        esbuild.stop()
        return output.outputFiles?.[0].text
    }catch(e){
        esbuild.stop()
        throw new ModuleBuildError(e)
    }
}

export const parseBuildOutput = (module: string): string => {
    return module
        .replace(/\{(\w+) as (\w+)}/, `{'$2':$1}`)
        .replace('export{','return{')
}

export const importModule = async (module: string) => {
    const text = await build({
        entryPoints: [module]
    })
    return AsyncFunction(parseBuildOutput(text))()
}

export class ModuleBuildError extends Error {
    constructor(public error: Error){
        super(error.message);
        this.error = error;
    }
}
