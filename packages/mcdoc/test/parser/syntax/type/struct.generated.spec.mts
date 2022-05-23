// This file is generated by `_generate.mts`. Do not modify by hand.
import { showWhitespaceGlyph, testParser } from '@spyglassmc/core/test-out/utils.mjs'
import { describe, it } from 'mocha'
import snapshot from 'snap-shot-it'
import { struct } from '@spyglassmc/mcdoc/lib/parser/index.mjs'
// @ts-ignore
import { McdocParserTestSuites } from '@spyglassmc/mcdoc/test/parser/_suites.mjs'

describe('mcdoc struct', () => {
	for (const content of McdocParserTestSuites['syntax/type'].struct.content) {
		it(`Parse "${showWhitespaceGlyph(content)}"`, () => {
			snapshot(testParser(struct, content))
		})
	}
})