#!/usr/bin/env node

// figma-ui-generator fallback helper
//
// What this script is for:
// This script creates the basic files and folders for a UI component when the normal Figma
// connection is not available. Think of it as a starter-file creator, not the final UI generator.
//
// When this script will be used:
// Use it only when Figma Desktop MCP cannot be reached, but you still want the project to have the
// right component location, file names, and simple framework-specific placeholder code.
//
// What this script will do:
// It reads inputs like framework, component name, and feature name, then creates a small starter
// component for Angular, React, React Native, Flutter, iOS, Android, or plain Web.



const fs = require("fs");
const path = require("path");

// Registry of supported fallback targets and their scaffold file definitions.
// Each entry owns its default style extension and returns path/content pairs for that platform.
const FRAMEWORKS = {
  // Angular fallback: create a conventional feature component with HTML, style, and TypeScript files.
  // Uses kebab-case for Angular selectors and file names, and PascalCase for the component class.
  angular: {
    styleDefault: "scss",
    files: ({ component, feature, style }) => {
      const kebab = toKebabCase(component);
      const className = toPascalCase(component);
      const dir = path.join("src", "app", "features", feature, "components", kebab);
      return [
        {
          path: path.join(dir, `${kebab}.component.html`),
          contents: `<section class="${kebab}">\n  <!-- Replace with UI generated from Figma MCP design context. -->\n</section>\n`,
        },
        {
          path: path.join(dir, `${kebab}.component.${style}`),
          contents: `.${kebab} {\n  display: flex;\n  flex-direction: column;\n  gap: 16px;\n}\n`,
        },
        {
          path: path.join(dir, `${kebab}.component.ts`),
          contents: `import { Component } from '@angular/core';\n\n@Component({\n  selector: 'app-${kebab}',\n  templateUrl: './${kebab}.component.html',\n  styleUrls: ['./${kebab}.component.${style}']\n})\nexport class ${className}Component {}\n`,
        },
      ];
    },
  },
  // React fallback: create a TSX function component and companion style file.
  // Tailwind mode still gets a CSS file because the placeholder only anchors class naming.
  react: {
    styleDefault: "css",
    files: ({ component, feature, style }) => {
      const kebab = toKebabCase(component);
      const className = toPascalCase(component);
      const styleExt = style === "tailwind" ? "css" : style;
      const dir = path.join("src", "features", feature, "components", className);
      return [
        {
          path: path.join(dir, `${className}.tsx`),
          contents: `import './${className}.${styleExt}';\n\nexport function ${className}() {\n  return <section className="${kebab}">{/* Replace with UI generated from Figma MCP design context. */}</section>;\n}\n`,
        },
        {
          path: path.join(dir, `${className}.${styleExt}`),
          contents: `.${kebab} {\n  display: flex;\n  flex-direction: column;\n  gap: 16px;\n}\n`,
        },
      ];
    },
  },
  // React Native fallback: create a TSX component using native primitives and StyleSheet.
  // Keeps the placeholder free of DOM, HTML, CSS, Tailwind, and browser-only APIs.
  "react-native": {
    styleDefault: "ts",
    files: ({ component, feature }) => {
      const className = toPascalCase(component);
      const dir = path.join("src", "features", feature, "components");
      return [
        {
          path: path.join(dir, `${className}.tsx`),
          contents: `import React from 'react';\nimport { StyleSheet, View } from 'react-native';\n\nexport function ${className}() {\n  return <View style={styles.root} />;\n}\n\nconst styles = StyleSheet.create({\n  root: {\n    flexDirection: 'column',\n    gap: 16,\n  },\n});\n`,
        },
      ];
    },
  },
  // Flutter fallback: create a Dart widget file in a feature widgets folder.
  // Uses snake_case for the file name and PascalCase for the StatelessWidget class.
  flutter: {
    styleDefault: "dart",
    files: ({ component, feature }) => {
      const className = toPascalCase(component);
      const snake = toSnakeCase(component);
      const dir = path.join("lib", "features", feature, "widgets");
      return [
        {
          path: path.join(dir, `${snake}.dart`),
          contents: `import 'package:flutter/widgets.dart';\n\nclass ${className} extends StatelessWidget {\n  const ${className}({super.key});\n\n  @override\n  Widget build(BuildContext context) {\n    return const Column(children: []);\n  }\n}\n`,
        },
      ];
    },
  },
  // iOS fallback: create a SwiftUI view placeholder under the requested feature path.
  // Full SwiftUI/UIKit delivery decisions still belong to references/ios-guideline.md.
  ios: {
    styleDefault: "swift",
    files: ({ component, feature }) => {
      const className = toPascalCase(component);
      const dir = path.join(feature, className);
      return [
        {
          path: path.join(dir, `${className}View.swift`),
          contents: `import SwiftUI\n\nstruct ${className}View: View {\n    var body: some View {\n        VStack(spacing: 16) {\n            // Replace with UI generated from Figma MCP design context.\n        }\n    }\n}\n`,
        },
      ];
    },
  },
  // Android fallback: create a Jetpack Compose Kotlin placeholder.
  // XML vs Compose selection is handled by the skill guideline; this helper only creates a safe stub.
  android: {
    styleDefault: "kt",
    files: ({ component, feature }) => {
      const className = toPascalCase(component);
      const dir = path.join("app", "src", "main", "java", "ui", feature);
      return [
        {
          path: path.join(dir, `${className}.kt`),
          contents: `import androidx.compose.foundation.layout.Column\nimport androidx.compose.runtime.Composable\n\n@Composable\nfun ${className}() {\n    Column {\n        // Replace with UI generated from Figma MCP design context.\n    }\n}\n`,
        },
      ];
    },
  },
  // Web fallback: create plain HTML and CSS-style placeholders for framework-free targets.
  // Uses kebab-case for folder names and CSS classes so generated paths remain predictable.
  web: {
    styleDefault: "css",
    files: ({ component, feature, style }) => {
      const kebab = toKebabCase(component);
      const dir = path.join(feature, kebab);
      return [
        {
          path: path.join(dir, "index.html"),
          contents: `<section class="${kebab}">\n  <!-- Replace with UI generated from Figma MCP design context. -->\n</section>\n`,
        },
        {
          path: path.join(dir, `styles.${style}`),
          contents: `.${kebab} {\n  display: flex;\n  flex-direction: column;\n  gap: 16px;\n}\n`,
        },
      ];
    },
  },
};

// Parse CLI arguments in --key=value format into a plain object.
// Boolean-style flags are stored as the string "true" for simple downstream checks.
function parseArgs(argv) {
  const args = {};
  for (const arg of argv) {
    if (!arg.startsWith("--")) continue;
    const [key, ...valueParts] = arg.slice(2).split("=");
    args[key] = valueParts.length ? valueParts.join("=") : "true";
  }
  return args;
}

// Read a required argument and fail early when it is absent.
// This keeps scaffold generation from creating ambiguous or misplaced files.
function requireArg(args, name) {
  if (!args[name] || args[name] === "true") {
    throw new Error(`Missing required argument: --${name}=<value>`);
  }
  return args[name];
}

// Convert user-provided component names into PascalCase class/function names.
// Non-alphanumeric separators are removed after each word is capitalized.
function toPascalCase(value) {
  return value
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

// Convert component names into kebab-case for selectors, CSS classes, and file names.
// Handles existing camelCase/PascalCase names as well as names with spaces or symbols.
function toKebabCase(value) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

// Convert component names into snake_case for ecosystems that prefer it.
// This is used for Dart file names and any future lowercase underscore paths.
function toSnakeCase(value) {
  return toKebabCase(value).replace(/-/g, "_");
}

// Fetch parsed Figma data from the optional local MCP adapter when configured.
// If FIGMA_MCP_URL is missing, return an offline marker and generate scaffold only.
async function fetchFigmaData(figmaUrl) {
  const server = process.env.FIGMA_MCP_URL;
  if (!server) {
    return {
      mode: "offline",
      note: "FIGMA_MCP_URL is not set. Generated scaffold only; use Figma Desktop MCP for production UI.",
      figmaUrl,
    };
  }

  const response = await fetch(`${server.replace(/\/$/, "")}/parse`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ url: figmaUrl }),
  });

  if (!response.ok) {
    throw new Error(`Figma MCP request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Write a generated file while respecting existing files by default.
// Parent folders are created automatically; --overwrite=true allows replacement.
function writeFileIfMissing(filePath, contents, overwrite) {
  if (!overwrite && fs.existsSync(filePath)) {
    return { filePath, action: "skipped" };
  }
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, contents, "utf8");
  return { filePath, action: "written" };
}

// Build framework-specific placeholder file definitions from the generic config map.
// Adding a new target should only require another FRAMEWORKS entry, not a new flow.
function scaffold({ framework, component, feature, style, overwrite }) {
  const config = FRAMEWORKS[framework];
  if (!config) {
    throw new Error(`Unsupported fallback framework: ${framework}`);
  }

  return config
    .files({ component, feature, style: style || config.styleDefault })
    .map((file) => writeFileIfMissing(file.path, file.contents, overwrite));
}

// Main CLI flow: validate inputs, choose the framework scaffold, and write files.
// Prints a JSON summary so callers can inspect generated or skipped paths.
async function main() {
  const args = parseArgs(process.argv.slice(2));
  const figmaUrl = requireArg(args, "figma");
  const component = requireArg(args, "component");
  const feature = requireArg(args, "feature");
  const framework = (args.framework || "web").toLowerCase();
  const overwrite = args.overwrite === "true";

  const design = await fetchFigmaData(figmaUrl);
  const files = scaffold({
    framework,
    component,
    feature,
    style: args.style,
    overwrite,
  });

  console.log(
    JSON.stringify(
      {
        status: "ok",
        framework,
        feature,
        component,
        designMode: design.mode || "figma-mcp",
        files,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
