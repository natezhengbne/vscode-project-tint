import * as vscode from "vscode";

/**
 * Apply title bar colors.
 * @param bg HEX like #ff0000
 * @param fg HEX like #ffffff
 * @param scope 'global' to write user settings, 'workspace' to write workspace settings
 */
export async function applyTitleBarColors(bg: string, fg: string) {
	const target = vscode.ConfigurationTarget.Workspace;

	const config = vscode.workspace.getConfiguration();
	const current = config.get("workbench.colorCustomizations") ?? {};

	const next = {
		...current,
		"titleBar.activeBackground": bg,
		"titleBar.activeForeground": fg,
		"titleBar.inactiveBackground": bg,
		"titleBar.inactiveForeground": fg,
		"titleBar.border": fg,
	};

	await config.update("workbench.colorCustomizations", next, target);
}
