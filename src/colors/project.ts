import * as vscode from "vscode";
import { mkdtempSync } from "fs";
import { tmpdir } from "os";
import { basename, join } from "path";

export async function getProjectName(): Promise<string | null> {
	const folder = vscode.workspace.workspaceFolders?.[0];
	if (!folder) {
		return null;
	}

	try {
		const pkgUri = vscode.Uri.joinPath(folder.uri, "package.json");
		const buf = await vscode.workspace.fs.readFile(pkgUri);
		const text = new TextDecoder("utf-8").decode(buf);
		const json = JSON.parse(text);
		const name = typeof json?.name === "string" ? json.name.trim() : "";
		if (name) {
			return name;
		}
	} catch {
		// ignore
	}

	return folder.name || basename(folder.uri.fsPath) || null;
}

export function hasWorkspace() {
	return !!vscode.workspace.workspaceFolders?.length;
}

export async function ensureWorkspaceFolder(
	ctx?: vscode.ExtensionContext
): Promise<void> {
	if (vscode.workspace.workspaceFolders?.length) {
		return;
	}

	if (!ctx || !isDevOrTest(ctx)) {
		throw new Error("No workspace and not in dev/test.");
	}

	const dir = mkdtempSync(join(tmpdir(), "vscode-ext-e2e-"));
	const uri = vscode.Uri.file(dir);

	const added = new Promise<void>((resolve, reject) => {
		const sub = vscode.workspace.onDidChangeWorkspaceFolders((e) => {
			if (e.added.some((f) => f.uri.toString() === uri.toString())) {
				sub.dispose();
				resolve();
			}
		});
		setTimeout(() => {
			sub.dispose();
			reject(new Error("Timed out waiting workspace add"));
		}, 500);
	});

	const ok = vscode.workspace.updateWorkspaceFolders(0, 0, { uri });
	if (!ok) {
		throw new Error("updateWorkspaceFolders failed.");
	}

	await added;
}

function isDevOrTest(ctx: vscode.ExtensionContext) {
	return (
		ctx.extensionMode === vscode.ExtensionMode.Development ||
		ctx.extensionMode === vscode.ExtensionMode.Test
	);
}
