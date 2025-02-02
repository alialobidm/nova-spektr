/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2016 Formidable
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software. THE SOFTWARE IS PROVIDED
 * "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT
 * LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
 * PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/**
 * Absorb source code for `measure-text` to resolve security vulnerability until
 * a new version of `measure-text` is released.
 *
 * @see https://github.com/matt-d-rat/react-middle-truncate/issues/4
 */

import units from 'units-css';

type UnitsParseResult = { value: number; unit: string };

const DEFAULT_CANVAS = document.createElement('canvas');
const DEFAULT_FONT_WEIGHT = 400;
const DEFAULT_FONT_STYLE = 'normal';

const measureHeight = (size: any, lineHeight: any): UnitsParseResult => {
  // If the line-height is unitless,
  // multiply it by the font size.
  if (!lineHeight.unit) {
    return units.parse(`${size.value * lineHeight.value}${size.unit}`);
  }

  // units-css requires the user to provide
  // DOM nodes for these units. We don't want
  // to pollute our API with that for the time being.
  const unitBlacklist = ['%', 'ch', 'cm', 'em', 'ex'];
  if (unitBlacklist.indexOf(lineHeight.unit) !== -1) {
    // eslint-disable-line no-magic-numbers
    throw new Error(
      `We do not currently support the unit ${lineHeight.unit}
      from the provided line-height ${lineHeight.value}.
      Unsupported units include ${unitBlacklist.join(', ')}.`,
    );
  }

  // Otherwise, the height is equivalent
  // to the provided line height.
  // Non-px units need conversion.
  if (lineHeight.unit === 'px') {
    return lineHeight;
  }

  return units.parse(units.convert(lineHeight, 'px'));
};

const measureText = ({
  text = '',
  fontFamily,
  fontSize = '',
  lineHeight = 1,
  fontWeight = DEFAULT_FONT_WEIGHT,
  fontStyle = DEFAULT_FONT_STYLE,
  canvas = DEFAULT_CANVAS,
}: {
  text: string;
  fontFamily?: string;
  fontSize?: string;
  lineHeight?: number;
  fontWeight?: string | number;
  fontStyle?: string;
  canvas?: HTMLCanvasElement;
}) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get canvas context.');
  }

  ctx.font = `${fontWeight} ${fontStyle} ${fontSize} ${fontFamily}`;

  const measure = (line: string): { text: string; width: UnitsParseResult; height: UnitsParseResult } => {
    return {
      text: line,
      width: units.parse(`${ctx.measureText(line).width}px`),
      height: measureHeight(units.parse(fontSize, 'fontSize'), units.parse(lineHeight, 'lineHeight')),
    };
  };

  // If multiline, measure the bounds
  // of all of the lines combined
  if (Array.isArray(text)) {
    return text.map(measure).reduce((prev, curr) => {
      const width = curr.width.value > prev.width.value ? curr.width : prev.width;
      const height = units.parse(`${prev.height.value + curr.height.value}${curr.height.unit}`);
      const longest = curr.text.length > prev.text.length ? curr.text : prev.text;

      return { width, height, text: longest };
    });
  }

  return measure(text);
};

export const getTextMeasurement = (ref: HTMLElement | null) => {
  if (!ref) {
    return {};
  }

  const text = ref.textContent || '';

  const { fontFamily, fontSize, fontWeight, fontStyle } = window.getComputedStyle(ref);

  const { width, height } = measureText({
    text,
    fontFamily,
    fontSize,
    fontWeight,
    fontStyle,
    lineHeight: 1,
  });

  return { width, height };
};

export const getContainerMeasurement = (ref: HTMLElement | null) => {
  if (!ref) {
    return {};
  }

  const width = ref && ref.offsetWidth ? ref.offsetWidth : 0;
  const height = ref && ref.offsetHeight ? ref.offsetHeight : 0;

  return {
    width: units.parse(width, 'px'),
    height: units.parse(height, 'px'),
  };
};
