import assert = require('power-assert')
import { describe, it } from 'mocha'
import StringReader from '../../utils/StringReader'
import StringArgumentParser, { StringType } from '../../parsers/StringArgumentParser'
import ParsingError from '../../types/ParsingError'
import ParsingContext, { constructContext } from '../../types/ParsingContext'
import { $ } from '../utils.spec'
import StringNode from '../../types/nodes/StringNode'

describe('StringArgumentParser Tests', () => {
    describe('parse() Tests', () => {
        let ctx: ParsingContext
        before(async () => {
            ctx = await constructContext({})
        })
        it('Should parse unquoted string', () => {
            const reader = new StringReader('foo')
            const parser = new StringArgumentParser(StringType.Unquoted)
            const { data, errors } = parser.parse(reader, ctx)
            assert.deepStrictEqual(errors, [])
            assert.deepStrictEqual(data, $(new StringNode('foo', 'foo', { start: 0 }), [0, 3]))
        })
        it('Should parse quotable phrase', () => {
            const reader = new StringReader("'foo'")
            const parser = new StringArgumentParser(StringType.String)
            const { data, errors } = parser.parse(reader, ctx)
            assert.deepStrictEqual(errors, [])
            assert.deepStrictEqual(data, $(new StringNode('foo', "'foo'", { start: 1 }), [0, 5]))
        })
        it('Should parse greedy phrase', () => {
            const reader = new StringReader('"#$What is this?')
            const parser = new StringArgumentParser(StringType.Greedy)
            const { data, errors } = parser.parse(reader, ctx)
            assert.deepStrictEqual(errors, [])
            assert.deepStrictEqual(data, $(new StringNode('"#$What is this?', '"#$What is this?', {}), [0, 16]))
        })
        it('Should return errors when the string does not exist in the options', () => {
            const reader = new StringReader('qux')
            const parser = new StringArgumentParser(StringType.String, ['foo', 'dou"ble', "sin'gle"])
            const { errors } = parser.parse(reader, ctx)
            assert.deepStrictEqual(errors, [new ParsingError({ start: 0, end: 3 }, `Expected ‘foo’, ‘dou"ble’, or ‘sin'gle’ but got ‘qux’`)])
        })
        it('Should return completions outside the quotation marks', async () => {
            const reader = new StringReader('')
            const parser = new StringArgumentParser(StringType.String, ['foo', 'dou"ble', "sin'gle"], ['warning', true], ['warning', 'prefer double'])
            const ctx = await constructContext({ cursor: 0 })
            const actual = parser.parse(reader, ctx)
            assert.deepStrictEqual(actual.completions, [
                { label: 'foo', insertText: '"foo"' },
                { label: 'dou"ble', insertText: `'dou"ble'` },
                { label: "sin'gle", insertText: `"sin'gle"` },
            ])
        })
        it('Should return completions inside double quotation marks', async () => {
            const reader = new StringReader('""')
            const parser = new StringArgumentParser(StringType.String, ['foo', 'dou"ble', "sin'gle"], ['warning', true], ['warning', 'prefer double'])
            const ctx = await constructContext({ cursor: 1 })
            const actual = parser.parse(reader, ctx)
            assert.deepStrictEqual(actual.completions, [
                { label: 'foo', insertText: 'foo' },
                { label: 'dou"ble', insertText: 'dou\\"ble' },
                { label: "sin'gle", insertText: "sin'gle" },
            ])
        })
        it('Should return completions inside single quotation marks', async () => {
            const reader = new StringReader("''")
            const parser = new StringArgumentParser(StringType.String, ['foo', 'dou"ble', "sin'gle"], ['warning', true], ['warning', 'prefer double'])
            const ctx = await constructContext({ cursor: 1 })
            const actual = parser.parse(reader, ctx)
            assert.deepStrictEqual(actual.completions, [
                { label: 'foo', insertText: 'foo' },
                { label: 'dou"ble', insertText: 'dou"ble' },
                { label: "sin'gle", insertText: "sin\\'gle" },
            ])
        })
    })
    describe('toHint() Tests', () => {
        it('Should return correctly for non-optional node', () => {
            const parser = new StringArgumentParser()
            const actual = parser.toHint('id', false)
            assert(actual === '<id: string>')
        })
        it('Should return correctly for optional node', () => {
            const parser = new StringArgumentParser()
            const actual = parser.toHint('id', true)
            assert(actual === '[<id: string>]')
        })
    })
    describe('getExamples() Tests', () => {
        it('Should return correctly', () => {
            const parser = new StringArgumentParser()
            const actual = parser.getExamples()
            assert.deepStrictEqual(actual, [])
        })
    })
})
