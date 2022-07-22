// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import { jumpTo } from "./utils/jumpTo";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('jumpToTemplate');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let jumpToTemplate = vscode.commands.registerCommand('genie.jumpToTemplate', () => {
		console.log('jumpToTemplate');
		const document = vscode.window.activeTextEditor?.document;
		if(document){
			jumpTo(document, '<template');
		}
	});

	let jumpToScript = vscode.commands.registerCommand('genie.jumpToScript', () => {
		const document = vscode.window.activeTextEditor?.document;
		if(document){
			jumpTo(document, '<script');
		}
	});

	let jumpToStyle = vscode.commands.registerCommand('genie.jumpToStyle', () => {
		const document = vscode.window.activeTextEditor?.document;
		if(document){
			jumpTo(document, '<style');
		}
	});

	context.subscriptions.push(jumpToScript);
	context.subscriptions.push(jumpToStyle);
	context.subscriptions.push(jumpToTemplate);

}

// this method is called when your extension is deactivated
export function deactivate() {}
