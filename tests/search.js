// @ts-check

import { test } from 'uvu';
import * as assert from 'uvu/assert';

import {
  isInRange,
  findCommentRanges,
  search,
  configPatternsToRegex,
  getSearchMatches,
} from '../dist/checks/search-check';

test('isInRange()', () => {
  const existingRanges = [
    [10, 20],
    [40, 90],
  ];

  // @ts-ignore
  assert.ok(isInRange(existingRanges, 44, 60));

  // @ts-ignore
  assert.ok(isInRange(existingRanges, 10, 20));

  // @ts-ignore
  assert.not.ok(isInRange(existingRanges, 15, 25));

  // @ts-ignore
  assert.not.ok(isInRange(existingRanges, 20, 40));

  assert.not.ok(isInRange([[36, 32]], 69, 22));
  assert.not.ok(isInRange([[36, 32]], 68, 1));
});

const SAMPLE_FILE = `
// LinkedList.cpp: implementation of a LinkedList data structure
/******************************/
//Author: Josephus Paye II
//Course: SENG1120
//Date  : 2016-04-01

#include "LinkedList.h"

// The constructor
LinkedList::LinkedList() {
    this->head = NULL;
    this->tail = NULL;
    this->current = NULL;
    this->lengthOfList = 0;

    /* here's another comment
        on multiple
        lines
        LinkedList here
    */
}`.trim();

test('findCommentRanges()', () => {
  assert.equal(findCommentRanges(SAMPLE_FILE, [['/*', '*/'], '//']), [
    [65, 32],
    [342, 90],
    [0, 65],
    [98, 27],
    [125, 19],
    [144, 22],
    [191, 19],
  ]);
});

test('search()', () => {
  assert.equal(search(SAMPLE_FILE, configPatternsToRegex(['list'], {})), [
    {
      text: 'List',
      context: ['// Linked', '.cpp: implementation of a L'],
      line: 1,
      offset: 9,
      offsetInFile: 9,
      lineSpan: 1,
    },
    {
      text: 'List',
      context: ['mentation of a Linked', ' data structure'],
      line: 1,
      offset: 45,
      offsetInFile: 45,
      lineSpan: 1,
    },
    {
      text: 'List',
      context: ['#include "Linked', '.h"'],
      line: 7,
      offset: 16,
      offsetInFile: 182,
      lineSpan: 1,
    },
    {
      text: 'List',
      context: ['Linked', '::LinkedList() {'],
      line: 10,
      offset: 6,
      offsetInFile: 216,
      lineSpan: 1,
    },
    {
      text: 'List',
      context: ['LinkedList::Linked', '() {'],
      line: 10,
      offset: 18,
      offsetInFile: 228,
      lineSpan: 1,
    },
    {
      text: 'List',
      context: ['    this->lengthOf', ' = 0;'],
      line: 14,
      offset: 18,
      offsetInFile: 327,
      lineSpan: 1,
    },
    {
      text: 'List',
      context: ['        Linked', ' here'],
      line: 19,
      offset: 14,
      offsetInFile: 416,
      lineSpan: 1,
    },
  ]);

  assert.equal(
    search(
      SAMPLE_FILE,
      configPatternsToRegex(['list'], {
        matchCase: true,
      })
    ),
    [] // there's no lowercase 'list' in the sample file
  );

  assert.equal(
    search(
      SAMPLE_FILE,
      configPatternsToRegex(['\\w+::\\w+'], {
        matchAsRegex: true,
      })
    ),
    [
      {
        text: 'LinkedList::LinkedList',
        context: ['', '() {'],
        line: 10,
        offset: 0,
        offsetInFile: 210,
        lineSpan: 1,
      },
    ]
  );

  assert.equal(
    search(
      SAMPLE_FILE,
      configPatternsToRegex(['\\w+::\\w+'], {
        matchAsRegex: false,
      })
    ),
    [] // empty because we're not matching as regex
  );
});

test('getSearchMatches()', () => {
  let skipComments = true;

  assert.equal(getSearchMatches(SAMPLE_FILE, configPatternsToRegex(['list'], {}), skipComments), [
    {
      text: 'List',
      context: ['#include "Linked', '.h"'],
      line: 7,
      offset: 16,
      offsetInFile: 182,
      lineSpan: 1,
    },
    {
      text: 'List',
      context: ['Linked', '::LinkedList() {'],
      line: 10,
      offset: 6,
      offsetInFile: 216,
      lineSpan: 1,
    },
    {
      text: 'List',
      context: ['LinkedList::Linked', '() {'],
      line: 10,
      offset: 18,
      offsetInFile: 228,
      lineSpan: 1,
    },
    {
      text: 'List',
      context: ['    this->lengthOf', ' = 0;'],
      line: 14,
      offset: 18,
      offsetInFile: 327,
      lineSpan: 1,
    },
  ]);
});

test.run();
