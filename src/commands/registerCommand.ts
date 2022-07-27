import * as vscode from "vscode";

import { jumpToMenu } from "./commandExecute";

import { jumpTo } from "../utils/jumpTo";

export const registerCommand = (context: vscode.ExtensionContext) => {
    let jumpToTemplate = vscode.commands.registerCommand(
        "genie.jumpToTemplate",
        () => {
          console.log("jumpToTemplate");
          const document = vscode.window.activeTextEditor?.document;
          if (document) {
            jumpTo(document, "<template");
          }
        }
      );
      context.subscriptions.push(jumpToTemplate);
      let jumpToScript = vscode.commands.registerCommand(
        "genie.jumpToScript",
        () => {
          const document = vscode.window.activeTextEditor?.document;
          if (document) {
            jumpTo(document, "<script");
          }
        }
      );
      context.subscriptions.push(jumpToScript);
      let jumpToStyle = vscode.commands.registerCommand("genie.jumpToStyle", () => {
        const document = vscode.window.activeTextEditor?.document;
        if (document) {
          jumpTo(document, "<style");
        }
      });
      context.subscriptions.push(jumpToStyle);
      // 显示跳转菜单
      context.subscriptions.push(jumpToMenu);
      // const mode: DocumentFilter[] = [{ language: "vue", scheme: "file" }];
      // const definitionProvider = new CSSModuleDefinitionProvider();
      // context.subscriptions.push(
      //   languages.registerDefinitionProvider(
      //     mode,
      //     definitionProvider
      //   )
      // );
}