// This file is generated by `_generate.js`. Do not modify by hand.
import { showWhitespaceGlyph, testParser } from '@spyglassmc/core/test-out/utils.js'
import { describe, it } from 'mocha'
import snapshot from 'snap-shot-it'
import { identifier } from '@spyglassmc/mcdoc/lib/parser/index.js'
// @ts-ignore
import { McdocParserTestSuites } from '@spyglassmc/mcdoc/test/parser/_suites.js'

describe('mcdoc identifier', () => {
	for (const content of McdocParserTestSuites['terminator'].identifier.content) {
		it(`Parse "${showWhitespaceGlyph(content)}"`, () => {
			snapshot(testParser(identifier, content))
		})
	}
})