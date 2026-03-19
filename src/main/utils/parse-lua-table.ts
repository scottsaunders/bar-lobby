// SPDX-FileCopyrightText: 2025 The BAR Lobby Authors
//
// SPDX-License-Identifier: MIT

/* eslint-disable @typescript-eslint/no-explicit-any */
import type { LocalStatement, ReturnStatement, TableConstructorExpression, Expression, UnaryExpression, BinaryExpression } from "luaparse";
import luaparse from "luaparse";
import { logger } from "@main/utils/logger";

const log = logger("parse-lua-table.ts");

type ParseLuaTableOptions = {
    tableVariableName?: string;
};

export function parseLuaTable(luaFile: Buffer, options?: ParseLuaTableOptions): any {
    const parsedLua = luaparse.parse(luaFile.toString(), { comments: false });

    let tableConstructorExpression: TableConstructorExpression | undefined;
    if (options?.tableVariableName) {
        const localStatement = parsedLua.body.find((body) => body.type === "LocalStatement" && body.variables.find((variable) => variable.name === options?.tableVariableName)) as
            | LocalStatement
            | undefined;
        if (localStatement) {
            tableConstructorExpression = localStatement.init.find((obj) => obj.type === "TableConstructorExpression") as TableConstructorExpression | undefined;
        } else {
            throw new Error(`Could not find local statement for local table: ${options?.tableVariableName}`);
        }
    } else {
        // Try LocalStatement first (e.g., local x = { ... })
        const localStatement = parsedLua.body.find((body) => body.type === "LocalStatement") as LocalStatement | undefined;
        if (localStatement) {
            tableConstructorExpression = localStatement?.init.find((obj) => obj.type === "TableConstructorExpression") as TableConstructorExpression | undefined;
        }
        // Fall through to ReturnStatement (e.g., return { ... })
        if (!tableConstructorExpression) {
            const returnStatement = parsedLua.body.find((body) => body.type === "ReturnStatement") as ReturnStatement | undefined;
            tableConstructorExpression = returnStatement?.arguments.find((obj) => obj.type === "TableConstructorExpression") as TableConstructorExpression | undefined;
        }
        // Fall through to AssignmentStatement (e.g., WeaponDefs = { ... })
        if (!tableConstructorExpression) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const assignmentStatement = parsedLua.body.find((body) => body.type === "AssignmentStatement") as any;
            if (assignmentStatement) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                tableConstructorExpression = assignmentStatement.init?.find((init: any) => init.type === "TableConstructorExpression") as TableConstructorExpression | undefined;
            }
        }
    }

    if (!tableConstructorExpression) {
        throw new Error("Could not find table");
    }
    return luaTableToObj(tableConstructorExpression);
}

function luaTableToObj(table: TableConstructorExpression): any {
    const blocks: any[] = [];
    const obj: Record<string, unknown> = {};
    for (const field of table.fields) {
        if (field.type === "TableKeyString") {
            const key = field.key.name;
            const value = field.value;
            obj[key] = parseLuaAst(value);
        } else if (field.type === "TableKey") {
            const key = parseLuaAst(field.key);
            if (key !== undefined) obj[String(key)] = parseLuaAst(field.value);
        } else if (field.type === "TableValue") {
            blocks.push(parseLuaAst(field.value));
        }
    }
    return blocks.length > 0 ? blocks : obj;
}

function parseLuaAst(value: Expression) {
    switch (value.type) {
        case "BinaryExpression":
            return parseBinaryExpression(value as unknown as BinaryExpression);
        case "StringLiteral": {
            if (value.value) return value.value;
            const rawString = value.raw.slice(1, -1);
            return rawString.replaceAll(/\x5c(\d+)/g, ""); //Some values have a color code embedded for the old chobby text coloring lets strip that out
        }
        case "BooleanLiteral":
            return value.value;
        case "NumericLiteral":
            return value.value;
        case "UnaryExpression":
            return parseUnaryExpression(value);
        case "TableConstructorExpression":
            return luaTableToObj(value);
        default:
            break;
    }
}

function parseBinaryExpression(value: BinaryExpression): string | number {
    const left = parseLuaAst(value.left);
    const right = parseLuaAst(value.right);
    if (value.operator === "..") {
        return `${left}${right}`;
    }
    if (typeof left === "number" && typeof right === "number") {
        switch (value.operator) {
            case "+": return left + right;
            case "-": return left - right;
            case "*": return left * right;
            case "/": return right !== 0 ? left / right : 0;
            case "%": return right !== 0 ? left % right : 0;
            case "^": return Math.pow(left, right);
        }
    }
    log.warn(`Unhandled BinaryExpression operator '${value.operator}'`);
    return 0;
}

function parseUnaryExpression(value: UnaryExpression) {
    switch (value.operator) {
        case "-":
            return -parseLuaAst(value.argument);
        case "not":
            return !parseLuaAst(value.argument);
        case "#":
            return parseLuaAst(value.argument).length;
        default:
            log.warn(`Unhandled UnaryExpression operator '${value.operator}'`);
    }
}
