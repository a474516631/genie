import {
    DefinitionProvider,
    TextDocument,
    Position,
    CancellationToken,
    Location,
    Uri,
  } from "vscode";
  import { getCurrentLine } from "../utils";

//   import { AliasFromUserOptions, CamelCaseValues, ExtensionOptions } from "./options";
  import * as path from "path";
  import * as fs from "fs";
//   import { getRealPathAlias } from "./path-alias";
  interface ClickInfo {
    importModule: string;
    targetClass: string;
  }
  
  interface Keyword {
    obj: string;
    field: string;
  }
  
  function getWords(line: string, position: Position): string {
    const headText = line.slice(0, position.character);
    const startIndex = headText.search(/[a-zA-Z0-9._]*$/);
    // not found or not clicking object field
    if (startIndex === -1 || headText.slice(startIndex).indexOf(".") === -1) {
      return "";
    }
  
    const match = /^([a-zA-Z0-9._]*)/.exec(line.slice(startIndex));
    if (match === null) {
      return "";
    }
    return match[1];
  }

  function getPosition(
    document: TextDocument,
    className: string,
  ): Position | null {
    const filePath = document.uri.fsPath;
    const content = fs.readFileSync(filePath, { encoding: "utf8" });
    const lines = content.split("\n");

    let lineNumber = -1;
    let character = -1;
    let keyWord = className;
    // const classTransformer = getTransformer(camelCaseConfig);
    // if (camelCaseConfig !== true) {
    //   // is false or 'dashes'
    //   keyWord = `.${className}`;
    // }

    const keyWordMatchReg = new RegExp(`${keyWord.replace(/^\./, '\\.')}(?![_0-9a-zA-Z-])`);
  
    for (let i = 0; i < lines.length; i++) {
      const originalLine = lines[i];
      const line = originalLine
      let isMatchChar = keyWordMatchReg.test(line);
      character = line.indexOf(keyWord);
      if (isMatchChar) {
        lineNumber = i;
        break;
      }
    }
    if (lineNumber === -1) {
      return null;
    } else {
      return new Position(lineNumber, character + 1);
    }
  }
  

  function getKeyword(currentLine: string, position: Position): Keyword | null {
    const words = getWords(currentLine, position);
    if (words === "" || words.indexOf(".") === -1) {
      return null;
    }
    const [obj, field] = words.split(".");
    if (!obj || !field) {
      // probably a spread operator
      return null;
    }
    return { obj, field };
  }
  function getClickInfoByKeyword(
    document: TextDocument,
    currentLine: string,
    position: Position
  ): ClickInfo | null {
    const keyword = getKeyword(currentLine, position);
    if (!keyword) {
      return null;
    }
    const importModule = '';
    const targetClass = keyword.field;
    return {
      importModule,
      targetClass,
    };
  }
  function getClickInfo(
    document: TextDocument,
    currentLine: string,
    position: Position
  ): ClickInfo | null {
    return getClickInfoByKeyword(document, currentLine, position);
  }
  export class CSSModuleDefinitionProvider implements DefinitionProvider {
    constructor() {
    }
    public async provideDefinition(
      document: TextDocument,
      position: Position,
      token: CancellationToken
    ): Promise<Location|null> {
    //   const currentDir = path.dirname(document.uri.fsPath);
      const currentLine = getCurrentLine(document, position);
      const clickInfo = getClickInfo(document, currentLine, position);
      if (!clickInfo) {
        return Promise.resolve(null);
      }
      let targetPosition: Position | null = null;
      if (clickInfo.targetClass) {
        targetPosition = getPosition(
          document,
          clickInfo.targetClass,
        );
      } else {
        targetPosition = new Position(0, 0);
      }
      if (targetPosition === null) {
        return Promise.resolve(null);
      } else {
        return Promise.resolve(
          new Location(Uri.file(document.uri.fsPath), targetPosition)
        );
      }
    }
  }
  export default CSSModuleDefinitionProvider;