const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// 1. Define the project root and workspace root
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

// 2. Get the default config
const config = getDefaultConfig(projectRoot);

// 3. Add the workspace root to watchFolders
config.watchFolders = [workspaceRoot];

// 4. Tell Metro to look in both node_modules folders
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 5. Force Metro to resolve packages correctly (avoids duplicate react versions)
config.resolver.disableHierarchicalLookup = true;

module.exports = config;