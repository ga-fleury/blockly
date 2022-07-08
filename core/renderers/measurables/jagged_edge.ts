/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Objects representing a jagged edge in a row of a rendered
 * block.
 */

/**
 * Objects representing a jagged edge in a row of a rendered
 * block.
 * @class
 */


import type {ConstantProvider} from '../common/constants';

import {Measurable} from './base';
import {Types} from './types';


/**
 * An object containing information about the jagged edge of a collapsed block
 * takes up during rendering
 * @struct
 * @alias Blockly.blockRendering.JaggedEdge
 */
export class JaggedEdge extends Measurable {
  /**
   * @param constants The rendering constants provider.
   * @internal
   */
  constructor(constants: ConstantProvider) {
    super(constants);
    this.type |= Types.JAGGED_EDGE;
    this.height = this.constants_.JAGGED_TEETH.height;
    this.width = this.constants_.JAGGED_TEETH.width;
  }
}