import * as assert from 'power-assert'
import { describe, it } from 'mocha'
import { CommandTree, CommandTreeNode, getChildren, fillSingleTemplate } from '../CommandTree'
import { fail } from 'assert'
import { TestArgumentParser } from './parsers/LineParser.spec'
import LineParser from '../parsers/LineParser'
import StringReader from '../utils/StringReader'
import ArgumentParserManager from '../parsers/ArgumentParserManager'
import Entity from '../types/Entity'
import ParsingError from '../types/ParsingError'
import Identity from '../types/Identity'
import Vector from '../types/Vector'
import NbtPath from '../types/NbtPath'

describe('CommandTree Tests', () => {
    describe('getChildren() Tests', () => {
        const tree: CommandTree = {
            line: { command: { redirect: 'commands' } },
            commands: { execute: { executable: true } }
        }
        it('Should return node.children if it exists', () => {
            const node: CommandTreeNode<any> = { children: { foo: {} } }
            const actual = getChildren(tree, node)
            assert.deepStrictEqual(actual, { foo: {} })
        })
        it('Should handle redirect', () => {
            const node: CommandTreeNode<any> = { redirect: 'line.command' }
            const actual = getChildren(tree, node)
            assert.deepStrictEqual(actual, { execute: { executable: true } })
        })
        it('Should handle single template', () => {
            const node: CommandTreeNode<any> = { template: 'line.command' }
            const actual = getChildren(tree, node)
            assert.deepStrictEqual(actual, { execute: { executable: true } })
        })
        it('Should handle children template', () => {
            const node: CommandTreeNode<any> = { template: 'line', description: 'test' }
            const actual = getChildren(tree, node)
            assert.deepStrictEqual(actual, { command: { redirect: 'commands', description: 'test' } })
        })
        it('Should return undefined when the template does not exist', () => {
            const node: CommandTreeNode<any> = { template: 'line.wtf' }
            const actual = getChildren(tree, node)
            assert(actual === undefined)
        })
        it('Should return undefined when none of `children`, `redirect` and `template` was found.', () => {
            const node: CommandTreeNode<any> = {}
            const actual = getChildren(tree, node)
            assert(actual === undefined)
        })
    })
    describe('fillSingleTemplate() Tests', () => {
        it('Should fill children', () => {
            const template: CommandTreeNode<any> = {
                template: '',
                children: {
                    foo: {
                        executable: true
                    }
                }
            }
            const single: CommandTreeNode<any> = {
                description: 'test'
            }
            const actual = fillSingleTemplate(template, single)
            assert.deepStrictEqual(actual, {
                description: 'test',
                children: {
                    foo: {
                        executable: true
                    }
                }
            })
        })
        it('Should fill description', () => {
            const template: CommandTreeNode<any> = {
                template: '',
                description: 'haha'
            }
            const single: CommandTreeNode<any> = {
                description: 'test'
            }
            const actual = fillSingleTemplate(template, single)
            assert.deepStrictEqual(actual, {
                description: 'haha'
            })
        })
        it('Should fill executable', () => {
            const template: CommandTreeNode<any> = {
                template: '',
                executable: true
            }
            const single: CommandTreeNode<any> = {
                description: 'test'
            }
            const actual = fillSingleTemplate(template, single)
            assert.deepStrictEqual(actual, {
                executable: true,
                description: 'test'
            })
        })
        it('Should fill parser', () => {
            const parser = new TestArgumentParser()
            const template: CommandTreeNode<any> = {
                template: '',
                parser: parser
            }
            const single: CommandTreeNode<any> = {
                description: 'test'
            }
            const actual = fillSingleTemplate(template, single)
            assert.deepStrictEqual(actual, {
                parser, description: 'test'
            })
        })
        it('Should fill permission', () => {
            const template: CommandTreeNode<any> = {
                template: '',
                permission: 4
            }
            const single: CommandTreeNode<any> = {
                description: 'test'
            }
            const actual = fillSingleTemplate(template, single)
            assert.deepStrictEqual(actual, {
                description: 'test',
                permission: 4
            })
        })
        it('Should fill recursively', () => {
            const template: CommandTreeNode<any> = {
                template: '',
                children: {
                    bar: {
                        executable: true
                    }
                }
            }
            const single: CommandTreeNode<any> = {
                description: 'test',
                children: {
                    foo: {
                        description: 'foo'
                    }
                }
            }
            const actual = fillSingleTemplate(template, single)
            assert.deepStrictEqual(actual, {
                description: 'test',
                children: {
                    foo: {
                        description: 'foo',
                        children: {
                            bar: {
                                executable: true
                            }
                        }
                    }
                }
            })
        })
    })
    describe.only('Just Fucking Parse', () => {
        const manager = new ArgumentParserManager()
        const cache = {
            advancements: {
                'minecraft:test': { def: [], ref: [] }
            }
        }
        it('advancement (grant|revoke) <targets> everything', () => {
            const parser = new LineParser(false, undefined, undefined, cache)
            const reader = new StringReader('advancement grant @s everything')
            const { data } = parser.parse(reader, -1, manager)
            assert.deepEqual(data.args, [
                { data: 'advancement', parser: 'literal' },
                { data: 'grant', parser: 'literal' },
                { data: new Entity(undefined, 's'), parser: 'entity' },
                { data: 'everything', parser: 'literal' }
            ])
            assert.deepEqual(data.path, ['command', 'advancement', 'grant_revoke', 'targets', 'everything'])
            assert.deepEqual(data.cache, undefined)
            assert.deepEqual(data.errors, undefined)
            assert.deepEqual(data.completions, undefined)
        })
        it('advancement (grant|revoke) <targets> only <advancement>', () => {
            const parser = new LineParser(false, undefined, undefined, cache)
            const reader = new StringReader('advancement grant @s only test')
            const { data } = parser.parse(reader, -1, manager)
            assert.deepEqual(data.args, [
                { data: 'advancement', parser: 'literal' },
                { data: 'grant', parser: 'literal' },
                { data: new Entity(undefined, 's'), parser: 'entity' },
                { data: 'only', parser: 'literal' },
                { data: new Identity(undefined, ['test']), parser: 'namespacedID' }
            ])
            assert.deepEqual(data.path, ['command', 'advancement', 'grant_revoke', 'targets', 'only', 'advancement'])
            assert.deepEqual(data.cache, {
                advancements: {
                    'minecraft:test': { def: [], ref: [{ range: { start: 26, end: 30 } }] }
                }
            })
            assert.deepEqual(data.errors, undefined)
            assert.deepEqual(data.completions, undefined)
        })
        it('advancement (grant|revoke) <targets> only <advancement> <criterion>', () => {
            const parser = new LineParser(false, undefined, undefined, cache)
            const reader = new StringReader('advancement grant @s only test aaa')
            const { data } = parser.parse(reader, -1, manager)
            assert.deepEqual(data.args, [
                { data: 'advancement', parser: 'literal' },
                { data: 'grant', parser: 'literal' },
                { data: new Entity(undefined, 's'), parser: 'entity' },
                { data: 'only', parser: 'literal' },
                { data: new Identity(undefined, ['test']), parser: 'namespacedID' },
                { data: 'aaa', parser: 'string' }
            ])
            assert.deepEqual(data.path, ['command', 'advancement', 'grant_revoke', 'targets', 'only', 'advancement', 'criterion'])
            assert.deepEqual(data.cache, {
                advancements: {
                    'minecraft:test': { def: [], ref: [{ range: { start: 26, end: 30 } }] }
                }
            })
            assert.deepEqual(data.errors, undefined)
            assert.deepEqual(data.completions, undefined)
        })
        it('advancement (grant|revoke) <targets> (from|through|until) <advancement>', () => {
            const parser = new LineParser(false, undefined, undefined, cache)
            const reader = new StringReader('advancement revoke @s through minecraft:test')
            const { data } = parser.parse(reader, -1, manager)
            assert.deepEqual(data.args, [
                { data: 'advancement', parser: 'literal' },
                { data: 'revoke', parser: 'literal' },
                { data: new Entity(undefined, 's'), parser: 'entity' },
                { data: 'through', parser: 'literal' },
                { data: new Identity(undefined, ['test']), parser: 'namespacedID' }
            ])
            assert.deepEqual(data.path, ['command', 'advancement', 'grant_revoke', 'targets', 'from_through_until', 'advancement'])
            assert.deepEqual(data.cache, {
                advancements: {
                    'minecraft:test': { def: [], ref: [{ range: { start: 30, end: 44 } }] }
                }
            })
            assert.deepEqual(data.errors, undefined)
            assert.deepEqual(data.completions, undefined)
        })
        it('data get block <targetPos> <path>', () => {
            const parser = new LineParser(false, undefined, undefined, cache)
            const reader = new StringReader('data get block ~ ~ ~ CustomName')
            const { data } = parser.parse(reader, -1, manager)
            assert.deepEqual(data.args, [
                { data: 'data', parser: 'literal' },
                { data: 'get', parser: 'literal' },
                { data: 'block', parser: 'literal' },
                { data: new Vector([{ type: 'relative', value: '' }, { type: 'relative', value: '' }, { type: 'relative', value: '' }]), parser: 'vector' },
                { data: new NbtPath(['CustomName']), parser: 'nbtPath' }
            ])
            assert.deepEqual(data.path, ['command', 'data', 'get', 'target', 'block', 'pos', 'path'])
            assert.deepEqual(data.cache, undefined)
            assert.deepEqual(data.errors, undefined)
            assert.deepEqual(data.completions, undefined)
        })
    })
})