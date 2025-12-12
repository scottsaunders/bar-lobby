// SPDX-FileCopyrightText: 2025 The BAR Lobby Authors
//
// SPDX-License-Identifier: MIT

import * as fs from "fs";
import * as path from "path";
import { app } from "electron";
import { STATE_PATH } from "@main/config/app";

const ERROR_LOG_FILE = "errors.txt";

function getErrorLogPath(): string {
    // In development, write to workspace root. In production, write to state directory.
    if (!app.isPackaged) {
        // Try to find the workspace root (where package.json is)
        let currentDir = process.cwd();
        const maxDepth = 10;
        let depth = 0;
        while (depth < maxDepth) {
            const packageJsonPath = path.join(currentDir, "package.json");
            if (fs.existsSync(packageJsonPath)) {
                return path.join(currentDir, ERROR_LOG_FILE);
            }
            const parentDir = path.dirname(currentDir);
            if (parentDir === currentDir) break; // Reached root
            currentDir = parentDir;
            depth++;
        }
        // Fallback to process.cwd() if we can't find package.json
        return path.join(process.cwd(), ERROR_LOG_FILE);
    }
    // In production, use state directory
    return path.join(STATE_PATH, ERROR_LOG_FILE);
}

export function logErrorToFile(error: unknown, context?: string): void {
    try {
        const errorLogPath = getErrorLogPath();
        const timestamp = new Date().toISOString();
        let errorMessage = `\n\n=== Error at ${timestamp} ===\n`;
        
        if (context) {
            errorMessage += `Context: ${context}\n`;
        }
        
        if (error instanceof Error) {
            errorMessage += `Error: ${error.message}\n`;
            if (error.stack) {
                errorMessage += `Stack:\n${error.stack}\n`;
            }
        } else if (typeof error === "string") {
            errorMessage += `Error: ${error}\n`;
        } else {
            errorMessage += `Error: ${JSON.stringify(error, null, 2)}\n`;
        }
        
        errorMessage += "=".repeat(50) + "\n";
        
        // Append to file (create if it doesn't exist)
        fs.appendFileSync(errorLogPath, errorMessage, "utf8");
    } catch (writeError) {
        // If we can't write to the error log, at least log to console
        console.error("Failed to write error to error log file:", writeError);
        console.error("Original error:", error);
    }
}

