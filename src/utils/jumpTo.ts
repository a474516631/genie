import * as vscode from 'vscode';


const getTagLineNumber = (document: vscode.TextDocument, tag: string): number => {
    let position = document.positionAt(document.getText().indexOf(tag));
    return document.lineAt(position).lineNumber;
}


export const jumpTo = (document: vscode.TextDocument, tag: string): void => {
    let lineNumber = getTagLineNumber(document, tag);
    if(vscode.window.activeTextEditor) {
        // 移动光标
        vscode.window.activeTextEditor.selection = new vscode.Selection(lineNumber, 0, lineNumber, 0);
        // 设置滚动条
        vscode.window.activeTextEditor.revealRange(new vscode.Range(lineNumber, 0, lineNumber, 0), vscode.TextEditorRevealType.InCenter);
    }
}