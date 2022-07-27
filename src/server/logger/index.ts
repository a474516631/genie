import { RemoteConsole } from "vscode-languageserver";

export let console: any = null;
export function create(nConsole: RemoteConsole) {
  console = nConsole;
}
