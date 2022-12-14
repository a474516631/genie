import * as path from "path";
import {
  Location,
  SymbolInformation,
} from "vscode-languageserver";
import {
  getCSSLanguageService,
  getSCSSLanguageService,
  getLESSLanguageService,
  LanguageService,
  SymbolKind,
} from "vscode-css-languageservice";


import { TextDocument } from "vscode-languageserver-textdocument";

import { Selector, StylesheetMap } from "../types";
import { console } from "./../logger";

const languageServices: { [id: string]: LanguageService } = {
  css: getCSSLanguageService(),
  scss: getSCSSLanguageService(),
  less: getLESSLanguageService(),
};

export function isLanguageServiceSupported(serviceId: string) {
  return !!languageServices[serviceId];
}

export function getLanguageService(document: TextDocument) {
  let service = languageServices[document.languageId];
  if (!service) {
    console.log(
      "Document type is " + document.languageId + ", using css instead."
    );
    service = languageServices["css"];
  }
  return service;
}

function getSelection(selector: Selector): string {
  switch (selector.attribute) {
    case "id":
      return "#" + selector.value;
    case "class":
      return "." + selector.value;
    default:
      return selector.value;
  }
}

function resolveSymbolName(symbols: SymbolInformation[], i: number): string {
  const name = symbols[i].name;
  if (name.startsWith("&")) {
    return resolveSymbolName(symbols, i - 1) + name.slice(1);
  }
  return name;
}

export function findSymbols(
  selector: Selector,
  stylesheetMap: StylesheetMap
): SymbolInformation[] {
  const foundSymbols: SymbolInformation[] = [];

  // Construct RegExp of selector to test against the symbols
  let selection = getSelection(selector);
  const classOrIdSelector =
    selector.attribute === "class" || selector.attribute === "id";
  if (selection[0] === ".") {
    selection = "\\" + selection;
  }
  if (!classOrIdSelector) {
    // Tag selectors must have nothing, whitespace, or a combinator before it.
    selection = "(^|[\\s>+~])" + selection;
  }
  const re = new RegExp(
    selection + "(\\[[^\\]]*\\]|:{1,2}[\\w-()]+|\\.[\\w-]+|#[\\w-]+)*\\s*$",
    classOrIdSelector ? "" : "i"
  );

  // Test all the symbols against the RegExp
  Object.keys(stylesheetMap).forEach((uri) => {
    const { symbols } = stylesheetMap[uri];
    try {
      console.log(`${path.basename(uri)} has ${symbols.length} symbols`);

      symbols.forEach((symbol, i) => {
        let name = resolveSymbolName(symbols, i);

        console.log(
          `  ${symbol.location.range.start.line}:${
            symbol.location.range.start.character
          } ${symbol.deprecated ? "[deprecated] " : " "}${
            symbol.containerName ? `[container:${symbol.containerName}] ` : " "
          } [${symbol.kind}] ${name}`
        );

        if (name.search(re) !== -1) {
          foundSymbols.push(symbol);
        } else if (!classOrIdSelector) {
          // Special case for tag selectors - match "*" as the rightmost character
          if (/\*\s*$/.test(name)) {
            foundSymbols.push(symbol);
          }
        }
      });
    } catch (e:any) {
      console.log(e.stack);
    }
  });

  return foundSymbols;
}

export function findDefinition(
  selector: Selector,
  stylesheetMap: StylesheetMap
): Location[] {
  return findSymbols(selector, stylesheetMap).map(({ location }) => location);
}
