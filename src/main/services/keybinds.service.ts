// SPDX-FileCopyrightText: 2025 The BAR Lobby Authors
//
// SPDX-License-Identifier: MIT

import fs from "fs";
import path from "path";
import { ipcMain } from "@main/typed-ipc";
import { WRITE_DATA_PATH } from "@main/config/app";

const UIKEYS_PATH = path.join(WRITE_DATA_PATH, "uikeys.txt");

function readUikeys(): string {
    try {
        return fs.readFileSync(UIKEYS_PATH, "utf-8");
    } catch {
        return "";
    }
}

function writeUikeys(content: string): void {
    fs.mkdirSync(path.dirname(UIKEYS_PATH), { recursive: true });
    fs.writeFileSync(UIKEYS_PATH, content, "utf-8");
}

function getUikeysPath(): string {
    return UIKEYS_PATH;
}

function registerIpcHandlers() {
    ipcMain.handle("keybinds:read", () => readUikeys());
    ipcMain.handle("keybinds:write", (_event, content: string) => writeUikeys(content));
    ipcMain.handle("keybinds:getPath", () => getUikeysPath());
}

export const keybindsService = {
    registerIpcHandlers,
};
