import { Position, TextDocument, CompletionItem, CompletionItemKind, TextEdit, Range } from "vscode";
import { Selector } from "../types/types";

export function getCurrentLine(
    document: TextDocument,
    position: Position
  ): string {
    return document.getText(document.lineAt(position).range);
}



export default function (selector: Selector): string {
  switch (selector.attribute) {
    case "id":
      return "#" + selector.value;
    case "class":
      return "." + selector.value;
    default:
      return selector.value;
  }
}