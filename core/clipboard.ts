/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Blockly's internal clipboard for managing copy-paste.
 */

/**
 * Blockly's internal clipboard for managing copy-paste.
 * @namespace Blockly.clipboard
 */


import {CopyData, ICopyable} from './interfaces/i_copyable';


/** Metadata about the object that is currently on the clipboard. */
let copyData: CopyData|null = null;

/**
 * Copy a block or workspace comment onto the local clipboard.
 * @param toCopy Block or Workspace Comment to be copied.
 * @alias Blockly.clipboard.copy
 * @internal
 */
export function copy(toCopy: ICopyable) {
  copyData = toCopy.toCopyData();
}

/**
 * Paste a block or workspace comment on to the main workspace.
 * @return The pasted thing if the paste was successful, null otherwise.
 * @alias Blockly.clipboard.paste
 * @internal
 */
export function paste(): ICopyable|null {
  if (!copyData) {
    return null;
  }
  // Pasting always pastes to the main workspace, even if the copy
  // started in a flyout workspace.
  let workspace = copyData.source;
  if (workspace.isFlyout) {
    workspace = workspace.targetWorkspace;
  }
  if (copyData.typeCounts &&
      workspace.isCapacityAvailable(copyData.typeCounts)) {
    return workspace.paste(copyData.saveInfo);
  }
  return null;
}

/**
 * Duplicate this block and its children, or a workspace comment.
 * @param toDuplicate Block or Workspace Comment to be duplicated.
 * @return The block or workspace comment that was duplicated, or null if the
 *     duplication failed.
 * @alias Blockly.clipboard.duplicate
 * @internal
 */
export function duplicate(toDuplicate: ICopyable): ICopyable|null {
  const oldCopyData = copyData;
  copy(toDuplicate);
  const pastedThing = toDuplicate.toCopyData().source.paste(copyData!.saveInfo);
  copyData = oldCopyData;
  return pastedThing;
}