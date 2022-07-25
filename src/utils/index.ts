import { Position, TextDocument, CompletionItem, CompletionItemKind, TextEdit, Range } from "vscode";

export function getCurrentLine(
    document: TextDocument,
    position: Position
  ): string {
    return document.getText(document.lineAt(position).range);
}
