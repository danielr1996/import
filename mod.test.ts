import {importModule, parseBuildOutput} from "./import.ts";
import { EOL } from "https://deno.land/std@0.167.0/fs/eol.ts"
import {describe, it} from "https://deno.land/std@0.165.0/testing/bdd.ts";
import {assertEquals} from "https://deno.land/std@0.165.0/testing/asserts.ts";
import * as path from "https://deno.land/x/std@0.167.0/path/mod.ts";

describe('import',()=>{
    describe('importModule() should import a module ',()=>{
        describe('with a named export ',()=>{
            it('without any imports', async ()=>{
                const dir = await Deno.makeTempDir();
                const file = path.join(dir, 'module.ts')
                await Deno.writeTextFile(file,`export const config = {key:"value"}`)
                const {config} = await importModule(file)
                assertEquals(config, {key: 'value'})
            })
            it('with a http import', async ()=>{
                const dir = await Deno.makeTempDir();
                const file = path.join(dir, 'module.ts')
                await Deno.writeTextFile(file,'import { EOL } from "https://deno.land/std@0.167.0/fs/eol.ts";export const config = {key:EOL}')
                const {config} = await importModule(file)
                assertEquals(config, {key: EOL})
            })
            it('with a local import', async ()=>{
                const dir = await Deno.makeTempDir();
                const file = path.join(dir, 'module.ts')
                const file2 = path.join(dir,'lib.ts')
                await Deno.writeTextFile(file2,'export const test = 123')
                await Deno.writeTextFile(file,'import { test } from "./lib.ts";export const config = {key:test}')
                const {config} = await importModule(file)
                assertEquals(config, {key: 123})
            })
        })
        describe('with a default export',()=>{
            it('without any imports', async ()=>{
                const dir = await Deno.makeTempDir();
                const file = path.join(dir, 'test.ts')
                await Deno.writeTextFile(file,`export default {key:"value"}`)
                const config = (await importModule(file)).default
                assertEquals(config, {key: 'value'})
            })
            it('with a http import', async ()=>{
                const dir = await Deno.makeTempDir();
                const file = path.join(dir, 'module.ts')
                await Deno.writeTextFile(file,'import { EOL } from "https://deno.land/std@0.167.0/fs/eol.ts";export default {key:EOL}')
                const config = (await importModule(file)).default
                assertEquals(config, {key: EOL})
            })
            it('with a local import', async ()=>{
                const dir = await Deno.makeTempDir();
                const file = path.join(dir, 'module.ts')
                const file2 = path.join(dir,'lib.ts')
                await Deno.writeTextFile(file2,'export const test = 123')
                await Deno.writeTextFile(file,'import { test } from "./lib.ts";export default {key:test}')
                const config = (await importModule(file)).default
                assertEquals(config, {key: 123})
            })
        })
    })

    describe('parseBuildOutput', ()=>{
        it('should parse a named module', ()=>{
            const module = 'var e={key:"value"};export{e as config};'
            const expected = `var e={key:"value"};return{'config':e};`
            const actual = parseBuildOutput(module)
            assertEquals(actual, expected)
        })
        it('should parse a default module', ()=>{
            const module = 'var e={key:"value"};export{e as default};'
            const expected = `var e={key:"value"};return{'default':e};`
            const actual = parseBuildOutput(module)
            assertEquals(actual, expected)
        })
    })
})
