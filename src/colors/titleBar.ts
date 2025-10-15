import * as vscode from "vscode";

type ColorMap = Record<string, string>;

/**
 * Apply title bar colors.
 * @param bg HEX like #ff0000
 * @param fg HEX like #ffffff
 * @param scope 'global' to write user settings, 'workspace' to write workspace settings
 */
export async function applyTitleBarColors(bg: string, fg: string) {
	if (!vscode.workspace.workspaceFolders?.length) {
		return;
	}

	const target = vscode.ConfigurationTarget.Workspace;
	const desired: ColorMap = {
		"titleBar.activeBackground": bg,
		"titleBar.activeForeground": fg,
		"titleBar.inactiveBackground": bg,
		"titleBar.inactiveForeground": fg,
		"titleBar.border": fg,
	};

	// If settings file is unsaved in this window, save it first (compatible with .code-workspace / .vscode/settings.json)
	const wsFile = vscode.workspace.workspaceFile?.toString();
	const folder = vscode.workspace.workspaceFolders?.[0];
	const settingsUri =
		folder && vscode.Uri.joinPath(folder.uri, ".vscode", "settings.json");
	const targetUriStr = wsFile ?? settingsUri?.toString();
	const dirtyDoc = vscode.workspace.textDocuments.find(
		(d) => d.uri.toString() === targetUriStr
	);
	if (dirtyDoc?.isDirty) {
		await dirtyDoc.save();
	}

	const snap = vscode.workspace.getConfiguration();
	const current = (snap.get<ColorMap>("workbench.colorCustomizations") ??
		{}) as ColorMap;
	await snap.update(
		"workbench.colorCustomizations",
		{ ...current, ...desired },
		target
	);

	const ok = await confirmPersist(desired);
	if (!ok) {
		vscode.window.setStatusBarMessage(
			"Project Tint: color applied (verification delayed).",
			3000
		);
	}
}

function eqColors(a: ColorMap, b: ColorMap) {
	return Object.keys(b).every(
		(k) => (a[k] ?? "").toLowerCase() === b[k].toLowerCase()
	);
}

async function wait(ms: number) {
	return new Promise((res) => setTimeout(res, ms));
}

/** Check if the desired colors are persisted */
async function confirmPersist(
	desired: ColorMap,
	timeoutMs = 1500,
	intervalMs = 100
): Promise<boolean> {
	const deadline = Date.now() + timeoutMs;
	while (Date.now() < deadline) {
		const fresh = vscode.workspace.getConfiguration();
		const after = (fresh.get<ColorMap>("workbench.colorCustomizations") ??
			{}) as ColorMap;
		if (eqColors(after, desired)) {
			return true;
		}
		await wait(intervalMs);
	}
	return false;
}
