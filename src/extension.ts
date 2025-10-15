import * as vscode from "vscode";
import { applyTitleBarColors } from "./colors/titleBar";
import { ensureWorkspaceFolder, getProjectName } from "./colors/project";
import { resetColorCustomizations } from "./colors/reset";
import { colorFromProjectName, contrastingText } from "./colors/hash";

export async function activate(context: vscode.ExtensionContext) {
	const channel = getChannel();
	await ensureWorkspaceFolder(context);

	const projectName = await getProjectName();
	channel.appendLine(`Root folders on activate: ${projectName}`);

	// Auto-apply on startup (no prompt)
	const cfg = vscode.workspace.getConfiguration("projectTint");
	const autoApply = cfg.get<boolean>("autoApply", true);
	const bg = projectName
		? colorFromProjectName(projectName)
		: cfg.get<string>("defaultBg", "#ff0000");
	const fg = projectName
		? contrastingText(bg)
		: cfg.get<string>("defaultFg", "#ffffff");

	if (autoApply) {
		try {
			await applyTitleBarColors(bg, fg);
		} catch (err: any) {
			vscode.window.showErrorMessage(
				`Project Tint: Auto-apply failed — ${err?.message ?? err}`
			);
		}
	}

	// Commands (still available)
	context.subscriptions.push(
		vscode.commands.registerCommand("projectTint.apply", async () => {
			try {
				await applyTitleBarColors(bg, fg);
				vscode.window.showInformationMessage(
					`Project Tint: Applied to ${bg} ${fg}.`
				);
			} catch (err: any) {
				vscode.window.showErrorMessage(
					`Project Tint: Failed to apply — ${err?.message ?? err}`
				);
			}
		}),
		vscode.commands.registerCommand("projectTint.reset", async () => {
			await resetColorCustomizations();
			vscode.window.showInformationMessage(`Project Tint: Restored defaults.`);
		})
	);
}

export function deactivate() {}

let out: vscode.OutputChannel | undefined;
function getChannel(): vscode.OutputChannel {
	if (!out) {
		out = vscode.window.createOutputChannel("Project Tint");
	}
	return out;
}
