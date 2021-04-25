import { describe, it } from 'mocha'
import snapshot from 'snap-shot-it'
import type { LiteralOptions } from '../../lib'
import { literal } from '../../lib'
import { showWhitespaceGlyph, testParser } from '../utils'

describe('literal()', () => {
	const cases: { options: string[] | [LiteralOptions], content: string }[] = [
		{ options: ['foo', 'foobar', 'bar'], content: '' },
		{ options: ['foo', 'foobar', 'bar'], content: 'foo qux' },
		{ options: ['foo', 'foobar', 'bar'], content: 'foobar qux' },
		{ options: ['foo', 'foobar', 'bar'], content: 'bar qux' },
		{ options: [{ pool: ['qux'] }], content: 'wrong' },
	]
	for (const { options, content } of cases) {
		it(`Parse "${showWhitespaceGlyph(content)}"`, () => {
			const parser = literal(...options as any)
			snapshot(testParser(parser, content))
		})
	}
})
