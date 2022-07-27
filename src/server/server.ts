import {
    createConnection,
    TextDocuments,
    Diagnostic,
    DiagnosticSeverity,
    ProposedFeatures,
    InitializeParams,
    DidChangeConfigurationNotification,
    CompletionItem,
    CompletionItemKind,
    TextDocumentPositionParams,
    TextDocumentSyncKind,
    InitializeResult,
      Definition,

} from 'vscode-languageserver/node';
import {
    TextDocument
} from 'vscode-languageserver-textdocument';
import { getLESSLanguageService } from 'vscode-css-languageservice';
let connection = createConnection(ProposedFeatures.all);
import findSelector from "./core/findSelector";
import {findDefinition} from "./core/findDefinition";
import { Uri, StylesheetMap, Selector } from "./types";

// Create a simple text document manager.
let documents: TextDocuments < TextDocument > = new TextDocuments(TextDocument);

let hasConfigurationCapability: boolean = false;
let hasWorkspaceFolderCapability: boolean = false;
let hasDiagnosticRelatedInformationCapability: boolean = false;


let lessService = getLESSLanguageService()

let styleSheets: StylesheetMap = {};
// 连接初始化时触发
connection.onInitialize((params: InitializeParams) => {
    let capabilities = params.capabilities;

    // Does the client support the `workspace/configuration` request?
    // If not, we fall back using global settings.
    hasConfigurationCapability = !!(
        capabilities.workspace && !!capabilities.workspace.configuration
    );
    hasWorkspaceFolderCapability = !!(
        capabilities.workspace && !!capabilities.workspace.workspaceFolders
    );
    hasDiagnosticRelatedInformationCapability = !!(
        capabilities.textDocument &&
        capabilities.textDocument.publishDiagnostics &&
        capabilities.textDocument.publishDiagnostics.relatedInformation
    );

    const result: InitializeResult = {
        capabilities: {
            textDocumentSync: TextDocumentSyncKind.Incremental,
            // Tell the client that this server supports code completion.
            completionProvider: {
                resolveProvider: true
            }
        }
    };
    if (hasWorkspaceFolderCapability) {
        result.capabilities.workspace = {
            workspaceFolders: {
                supported: true
            }
        };
    }
    return result;
});

// 初始化完成后触发
connection.onInitialized(() => {
    if (hasConfigurationCapability) {
        // Register for all configuration changes.
        connection.client.register(DidChangeConfigurationNotification.type, undefined);
    }
    if (hasWorkspaceFolderCapability) {
        connection.workspace.onDidChangeWorkspaceFolders(_event => {
            connection.console.log('Workspace folder change event received.');
        });
    }
});



// The example settings
interface ExampleSettings {
    // maxNumberOfProblems: number;
}

// The global settings, used when the `workspace/configuration` request is not supported by the client.
// Please note that this is not the case when using this server with the client provided in this example
// but could happen with other clients.
const defaultSettings: ExampleSettings = {
    // maxNumberOfProblems: 1000
};
let globalSettings: ExampleSettings = defaultSettings;

// Cache the settings of all open documents
let documentSettings: Map < string, Thenable < ExampleSettings >> = new Map();

connection.onDidChangeConfiguration(change => {
    if (hasConfigurationCapability) {
        // Reset all cached document settings
        documentSettings.clear();
    } else {
        globalSettings = < ExampleSettings > (
            (change.settings.languageServerExample || defaultSettings)
        );
    }

    // Revalidate all open text documents
    documents.all().forEach(validateTextDocument);
});

function getDocumentSettings(resource: string): Thenable < ExampleSettings > {
    if (!hasConfigurationCapability) {
        return Promise.resolve(globalSettings);
    }
    let result = documentSettings.get(resource);
    if (!result) {
        result = connection.workspace.getConfiguration({
            scopeUri: resource,
            section: 'languageServerExample'
        });
        documentSettings.set(resource, result);
    }
    return result;
}

// Only keep settings for open documents
documents.onDidClose(e => {
    documentSettings.delete(e.document.uri);
});



async function validateTextDocument(textDocument: TextDocument): Promise < void > {
    // In this simple example we get the settings for every validate run.
    let settings = await getDocumentSettings(textDocument.uri);

    // The validator creates diagnostics for all uppercase words length 2 and more
    let text = textDocument.getText();
    let pattern = /\b[A-Z]{2,}\b/g;
    let m: RegExpExecArray | null;

    let problems = 0;
    let diagnostics: Diagnostic[] = [];
    // Send the computed diagnostics to VS Code.
    connection.sendDiagnostics({
        uri: textDocument.uri,
        diagnostics
    });
}
connection.onDefinition(
    async (
      textDocumentPositon: TextDocumentPositionParams
    ): Promise<Definition|null> => {
      const documentIdentifier = textDocumentPositon.textDocument;
      const position = textDocumentPositon.position;

      const document = documents.get(documentIdentifier.uri);

      if (document?.languageId !== "vue") {
        return null;
      }
      const settings = await getDocumentSettings(document.uri);

      const selector: Selector |null = findSelector(document, position,{
        supportTags: false,
      });
      if (!selector) {
        return null;
      }

      return findDefinition(selector, styleSheets);
    }
  );

/**
 * An event that fires when a text document managed by this manager
 * has been opened or the content changes.
 * 文件打开或者变化时触发
 */
documents.onDidChangeContent( async (change) => {
    // 获取 vue 文件的 less symbols
    const document = documents.get(change.document.uri);
    if (document?.languageId !== "vue") {
        return;
    }
    const settings = await getDocumentSettings(document.uri);
    const styleSheets: StylesheetMap = lessService.parseStylesheet(document);
    // styleSheets.forEach(styleSheet => {
    //     styleSheet.selectors.forEach(selector => {
    //         const diagnostics: Diagnostic[] = [];
    //         selector.rules.forEach(rule => {
    //             rule.declarations.forEach(declaration => {
    //                 const range = new Range(
    //                     new Position(declaration.line, declaration.column),
    //                     new Position(declaration.line, declaration.column + declaration.name.length)
    //                 );
    //                 const diagnostic: Diagnostic = {
    //                     severity: DiagnosticSeverity.Error,
    //                     range,
    //                     message: `${declaration.name} is not a valid property name.`
    //                 };
    //                 diagnostics.push(diagnostic);
    //             });
    //         });
    //         connection.sendDiagnostics({
    //             uri: document.uri,
    //             diagnostics
    //         });
    //     });
    // });
});

// The content of a text document has changed. This event is emitted
connection.onDidChangeWatchedFiles(_change => {
    // Monitored files have change in VS Code
    connection.console.log('We received a file change event');
});

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();


