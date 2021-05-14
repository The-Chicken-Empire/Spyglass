import { showWhitespaceGlyph, testParser } from '@spyglassmc/core/test-out/utils'
import { describe, it } from 'mocha'
import snapshot from 'snap-shot-it'
import { CommandArgumentTestSuites } from './_suites'
import { argument } from '../../../../lib/mcfunction/parser'
import type { ArgumentTreeNode } from '../../../../lib/mcfunction/tree'

describe('mcfunction argument minecraft:nbt_compound_tag', () => {
	for (const { content, properties } of CommandArgumentTestSuites['minecraft:nbt_compound_tag']!) {
		const treeNode: ArgumentTreeNode = {
			type: 'argument',
			parser: 'minecraft:nbt_compound_tag',
			properties,
		}
		for (const string of content) {
			it(`Parse "${showWhitespaceGlyph(string)}"${properties ? ` with ${JSON.stringify(properties)}` : ''}`, () => {
				snapshot(testParser(argument('test', treeNode)!, string))
			})
		}
	}
})