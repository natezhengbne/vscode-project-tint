import * as vscode from "vscode";

export async function resetColorCustomizations(
	scope: "global" | "workspace" = "workspace"
) {
	const target =
		scope === "workspace"
			? vscode.ConfigurationTarget.Workspace
			: vscode.ConfigurationTarget.Global;
	const config = vscode.workspace.getConfiguration();

	// Remove the setting entirely → back to defaults
	await config.update("workbench.colorCustomizations", undefined, target);
	await config.update("window.titleBarStyle", undefined, target);
}
