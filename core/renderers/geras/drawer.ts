/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Renderer that preserves the look and feel of Blockly pre-2019.
 */

/**
 * Renderer that preserves the look and feel of Blockly pre-2019.
 * @class
 */


import type {BlockSvg} from '../../block_svg';
import * as svgPaths from '../../utils/svg_paths';
import * as debug from '../common/debug';
import {Drawer as BaseDrawer} from '../common/drawer';
import {Row} from '../measurables/row';

import type {ConstantProvider} from './constants';
import {Highlighter} from './highlighter';
import type {RenderInfo} from './info';
import type {InlineInput} from './measurables/inline_input';
import type {PathObject} from './path_object';


/**
 * An object that draws a block based on the given rendering information.
 * @alias Blockly.geras.Drawer
 */
export class Drawer extends BaseDrawer {
  highlighter_: AnyDuringMigration;
  // TODO(b/109816955): remove '!', see go/strict-prop-init-fix.
  override constants_!: ConstantProvider;

  /**
   * @param block The block to render.
   * @param info An object containing all information needed to render this
   *     block.
   * @internal
   */
  constructor(block: BlockSvg, info: RenderInfo) {
    super(block, info);
    // Unlike Thrasos, Geras has highlights and drop shadows.
    this.highlighter_ = new Highlighter(info);
  }

  override draw() {
    this.hideHiddenIcons_();
    this.drawOutline_();
    this.drawInternals_();

    const pathObject = this.block_.pathObject as PathObject;
    pathObject.setPath(this.outlinePath_ + '\n' + this.inlinePath_);
    pathObject.setHighlightPath(this.highlighter_.getPath());
    if (this.info_.RTL) {
      pathObject.flipRTL();
    }
    if (debug.isDebuggerEnabled()) {
      this.block_.renderingDebugger.drawDebug(this.block_, this.info_);
    }
    this.recordSizeOnBlock_();
  }

  override drawTop_() {
    this.highlighter_.drawTopCorner(this.info_.topRow);
    this.highlighter_.drawRightSideRow(this.info_.topRow);

    super.drawTop_();
  }

  override drawJaggedEdge_(row: Row) {
    this.highlighter_.drawJaggedEdge_(row);

    super.drawJaggedEdge_(row);
  }

  override drawValueInput_(row: Row) {
    this.highlighter_.drawValueInput(row);

    super.drawValueInput_(row);
  }

  override drawStatementInput_(row: Row) {
    this.highlighter_.drawStatementInput(row);

    super.drawStatementInput_(row);
  }

  override drawRightSideRow_(row: Row) {
    this.highlighter_.drawRightSideRow(row);

    this.outlinePath_ += svgPaths.lineOnAxis('H', row.xPos + row.width) +
        svgPaths.lineOnAxis('V', row.yPos + row.height);
  }

  override drawBottom_() {
    this.highlighter_.drawBottomRow(this.info_.bottomRow);

    super.drawBottom_();
  }

  /**
   * Add steps for the left side of the block, which may include an output
   * connection
   */
  protected override drawLeft_() {
    this.highlighter_.drawLeft();

    super.drawLeft_();
  }

  override drawInlineInput_(input: InlineInput) {
    this.highlighter_.drawInlineInput(input as InlineInput);

    super.drawInlineInput_(input);
  }

  override positionInlineInputConnection_(input: InlineInput) {
    const yPos = input.centerline - input.height / 2;
    // Move the connection.
    if (input.connectionModel) {
      // xPos already contains info about startX
      let connX =
          input.xPos + input.connectionWidth + this.constants_.DARK_PATH_OFFSET;
      if (this.info_.RTL) {
        connX *= -1;
      }
      input.connectionModel.setOffsetInBlock(
          connX,
          yPos + input.connectionOffsetY + this.constants_.DARK_PATH_OFFSET);
    }
  }

  override positionStatementInputConnection_(row: Row) {
    const input = row.getLastInput();
    if (input.connectionModel) {
      let connX = row.xPos + row.statementEdge + input.notchOffset;
      if (this.info_.RTL) {
        connX *= -1;
      } else {
        connX += this.constants_.DARK_PATH_OFFSET;
      }
      input.connectionModel.setOffsetInBlock(
          connX, row.yPos + this.constants_.DARK_PATH_OFFSET);
    }
  }

  override positionExternalValueConnection_(row: Row) {
    const input = row.getLastInput();
    if (input.connectionModel) {
      let connX = row.xPos + row.width + this.constants_.DARK_PATH_OFFSET;
      if (this.info_.RTL) {
        connX *= -1;
      }
      input.connectionModel.setOffsetInBlock(connX, row.yPos);
    }
  }

  override positionNextConnection_() {
    const bottomRow = this.info_.bottomRow;

    if (bottomRow.connection) {
      const connInfo = bottomRow.connection;
      const x = connInfo.xPos;  // Already contains info about startX.
      const connX =
          (this.info_.RTL ? -x : x) + this.constants_.DARK_PATH_OFFSET / 2;
      connInfo.connectionModel.setOffsetInBlock(
          connX, bottomRow.baseline + this.constants_.DARK_PATH_OFFSET);
    }
  }
}