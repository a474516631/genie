import * as vscode from 'vscode';

export let jumpToMenu =   vscode.commands.registerCommand('genie.showMenu', () => {
    vscode.commands.executeCommand('workbench.action.quickOpen',">jump to");
})

