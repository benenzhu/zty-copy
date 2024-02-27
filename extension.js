// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const path = require("path");

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
	let gotoSelectFileWithLineNumber = function () {

		let editor = vscode.window.activeTextEditor;
		let doc = editor.document;
		// let path = vscode.workspace.asRelativePath(doc.fileName);
		let lineNumbers = [];
	
		editor.selections.forEach((selection) => {
			lineNumbers.push(selection.active.line + 1);
		});
		// let selectedText = editor.document.getText(editor.selection);
		let currentLine = editor.selection.active.line;
		let lineText = editor.document.lineAt(currentLine).text;

		let regex = /\[(.*?)\]\((.*?)\)/g;
		let match = regex.exec(lineText);
		let url = match ? match[2] : null;
		let linenum = parseInt(url.split(":")[1]) - 1;
		urlbackup = url;
		url = url.split(":")[0];
		let workspaceFoler = vscode.workspace.rootPath;
		let absolutePath = path.resolve(workspaceFoler, url);
		if (url) {
			
			vscode.workspace.fs.readFile(vscode.Uri.parse(absolutePath)).then((data) => {
				lines = data.toString();
			}).catch(error => {
				vscode.window.showErrorMessage('Error reading file: ' + error);
			})
			// url 结构 path:100#line▪️line xx
			// vscode.window.showInformationMessage(lines)
			if(urlbackup.includes("#") && lines){
				codeline = urlbackup.split("#")[1].replace(/▪️/g, " ");
				lines = lines.split("\n");
				for(let i = 0; i < lines.length; i++){
					if(linenum - i >= 0){
						if(lines[linenum - i].includes(codeline)){
							linenum = linenum - i;
							vscode.window.showWarningMessage(linenum, "use line num here", linenum);
							break;
						}
					}
					if(linenum + i < lines.length){
						if(lines[linenum + i].includes(codeline)){
							linenum = linenum + i;
							vscode.window.showWarningMessage(linenum, "use line num here", linenum);
							break;
						}
					}
				}
			}
			let uri = vscode.Uri.file(absolutePath);
			let line = new vscode.Position(linenum,0)
			let options = {
				selection: new vscode.Range(line, line)
			}
			vscode.window.showWarningMessage(uri);
			vscode.window.showWarningMessage(linenum);
			vscode.commands.executeCommand('workbench.action.focusLeftGroup').then(() => {
				vscode.commands.executeCommand('vscode.open', uri, options);
			});

		} else {
			vscode.window.showErrorMessage('No URL found in the selected text.');
		}
		// let uri = vscode.Uri.file("/Users/z/code/tensorflow/tensorflow/java/BUILD");
		// let line = new vscode.Position(100,0)
		// let options = {
		// 	selection: new vscode.Range(line, line)
		// }
		// vscode.commands.executeCommand('vscode.open', uri, options);
	}
	let copyPathLines = function (withLineNumber = false, withSelectedText = false) {
		let alertMessage = "File path not found!";
		if (!vscode.workspace.rootPath) {
		  vscode.window.showWarningMessage(alertMessage);
		  return false;
		}
	
		let editor = vscode.window.activeTextEditor;
		if (!editor) {
		  vscode.window.showWarningMessage(alertMessage);
		  return false;
		}
	
		let doc = editor.document;
		if (doc.isUntitled) {
		  vscode.window.showWarningMessage(alertMessage);
		  return false;
		}
	
		let path = vscode.workspace.asRelativePath(doc.fileName);
		let lineNumbers = [];
	
		if (withLineNumber) {
		  editor.selections.forEach((selection) => {
			if (selection.isSingleLine) {
			  lineNumbers.push(selection.active.line + 1);
			} else {
			  lineNumbers.push(
				selection.start.line + 1 + "~" + (selection.end.line + 1)
			  );
			}
		  });
		  if (withSelectedText){
			let selectedText = editor.document.getText(editor.selection);
			let line = editor.document.getText().split("\n")[lineNumbers[0]-1].trim()
			// line .strip and replace space with a unormal unicode char like ▪️
			line = line.replace(/\s/g, "▪️");
			return "[" + selectedText + "](" + path + ":" + lineNumbers.join(",") +"#" + line +  ")";
		  }
	
		  return path + ":" + lineNumbers.join(",");
		} else {
		  return path;
		}
	  };
	
	  let toast = function (message) {
		vscode.window.setStatusBarMessage(
		  "`" + message + "` is copied to clipboard",
		  3000
		);
	  };

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log(
		'Congratulations, your extension "copy-relative-path-and-line-numbers" is now active!'
	);


	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let cmdBoth = vscode.commands.registerCommand(
		"copy-relative-path-and-line-numbers.both",
		() => {
		  let message = copyPathLines(true);
		  if (message !== false) {
			vscode.env.clipboard.writeText(message).then(() => {
			  toast(message);
			});
		  }
		}
	  );
	
	  let cmdPathOnly = vscode.commands.registerCommand(
		"copy-relative-path-and-line-numbers.path-only",
		() => {
		  let message = copyPathLines(true, true);
		  if (message !== false) {
			vscode.env.clipboard.writeText(message).then(() => {
			  toast(message);
			});
		  }
		}
	  );


	  let cmdPathOnly2 = vscode.commands.registerCommand(
		"copy-relative-path-and-line-numbers.zztest",
		() => {
		  let message = gotoSelectFileWithLineNumber();
		  if (message !== false) {
			vscode.env.clipboard.writeText(message).then(() => {
			  toast(message);
			});
		  }
		}
	  );

	  context.subscriptions.push(cmdBoth, cmdPathOnly, cmdPathOnly2);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}
exports.deactivate = deactivate;
