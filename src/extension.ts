// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as path from "path";
import  {
	workspace as Workspace,
	window as Window,
	ExtensionContext,
	TextDocument,
	OutputChannel,
	
	WorkspaceFolder,
	Uri,
	WorkspaceConfiguration,
} from "vscode";
import { registerCommand } from "./commands/registerCommand";

import {
	LanguageClient,
	LanguageClientOptions,
	TransportKind,
	ServerOptions,
  } from "vscode-languageclient";
const SUPPORTED_EXTENSIONS = ["vue"];
let client: LanguageClient;
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
	// 注册命令
	registerCommand(context);
	let serverModule = context.asAbsolutePath(
		path.join('dist', 'server.js')
	);
	let debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };
	let serverOptions: ServerOptions = {
		run: { module: serverModule, transport: TransportKind.ipc },
		debug: {
			module: serverModule,
			transport: TransportKind.ipc,
			options: debugOptions
		}
	};

	// Options to control the language client
	let clientOptions: LanguageClientOptions = {
		// Register the server for plain text documents
		documentSelector: [{ scheme: 'file', language: 'vue' }],
		synchronize: {
			// Notify the server about file changes to '.clientrc files contained in the workspace
			fileEvents: Workspace.createFileSystemWatcher('**/*.vue')
		}
	};

	// Create the language client and start the client.
	client = new LanguageClient(
		'vue-genie-language-server',
		'vue-genie-language-server',
		serverOptions,
		clientOptions
	);

	// Start the client. This will also launch the server
	client.start();

	// const outputChannel: OutputChannel = Window.createOutputChannel("CSS Peek");
	//   const config: WorkspaceConfiguration = Workspace.getConfiguration("cssPeek");
	//   const peekFromLanguages: Array<string> = config.get(
	// 	"peekFromLanguages"
	//   ) as Array<string>;
	//   const peekToInclude = SUPPORTED_EXTENSIONS.map((l) => `**/*.${l}`);
	//   const peekToExclude: Array<string> = config.get("peekToExclude") as Array<
	// 	string
	//   >;
}

// this method is called when your extension is deactivated
export function deactivate() {
	if (!client) {
		return undefined;
	}
	return client.stop();
}
