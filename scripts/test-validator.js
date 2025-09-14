#!/usr/bin/env node

/**
 * Test Configuration Validator for Phaser Scene Testing
 * 
 * This script validates test configurations and ensures all test files
 * are properly configured and ready for execution.
 * 
 * @author AI Assistant
 * @version 1.0.0
 * @since 2024
 */

import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class TestValidator {
    constructor() {
        this.projectRoot = join(__dirname, '..');
        this.testDir = join(this.projectRoot, 'tests');
        this.phaserTestDir = join(this.testDir, 'phaser');
        this.utilsDir = join(this.testDir, 'utils');
        this.configDir = join(this.testDir, 'config');
        this.errors = [];
        this.warnings = [];
    }

    validateTestStructure() {
        console.log('\n🔍 Validating Test Structure...');
        
        const requiredDirs = [
            this.testDir,
            this.phaserTestDir,
            this.utilsDir,
            this.configDir
        ];
        
        requiredDirs.forEach(dir => {
            if (!existsSync(dir)) {
                this.errors.push(`Missing required directory: ${dir}`);
            } else {
                console.log(`✅ Directory exists: ${dir}`);
            }
        });
    }

    validateTestFiles() {
        console.log('\n📁 Validating Test Files...');
        
        const requiredTestFiles = [
            'scene-transitions.test.js',
            'button-functionality.test.js',
            'scene-loading.test.js',
            'error-handling.test.js',
            'data-flow.test.js',
            'performance.test.js',
            'accessibility.test.js'
        ];
        
        requiredTestFiles.forEach(file => {
            const filePath = join(this.phaserTestDir, file);
            if (!existsSync(filePath)) {
                this.errors.push(`Missing required test file: ${file}`);
            } else {
                console.log(`✅ Test file exists: ${file}`);
                this.validateTestFileContent(filePath);
            }
        });
    }

    validateTestFileContent(filePath) {
        try {
            const content = readFileSync(filePath, 'utf8');
            
            // Check for required imports
            if (!content.includes('import { test, expect }')) {
                this.warnings.push(`Missing Playwright imports in ${filePath}`);
            }
            
            if (!content.includes('PhaserTestHelper')) {
                this.warnings.push(`Missing PhaserTestHelper import in ${filePath}`);
            }
            
            if (!content.includes('testConfig')) {
                this.warnings.push(`Missing testConfig import in ${filePath}`);
            }
            
            // Check for test structure
            if (!content.includes('test.describe(')) {
                this.warnings.push(`Missing test.describe in ${filePath}`);
            }
            
            if (!content.includes('test(')) {
                this.warnings.push(`Missing test cases in ${filePath}`);
            }
            
        } catch (error) {
            this.errors.push(`Error reading file ${filePath}: ${error.message}`);
        }
    }

    validateUtilityFiles() {
        console.log('\n🛠️ Validating Utility Files...');
        
        const utilityFiles = [
            'PhaserTestHelper.js'
        ];
        
        utilityFiles.forEach(file => {
            const filePath = join(this.utilsDir, file);
            if (!existsSync(filePath)) {
                this.errors.push(`Missing utility file: ${file}`);
            } else {
                console.log(`✅ Utility file exists: ${file}`);
                this.validateUtilityFileContent(filePath);
            }
        });
    }

    validateUtilityFileContent(filePath) {
        try {
            const content = readFileSync(filePath, 'utf8');
            
            // Check for class structure
            if (!content.includes('export class')) {
                this.warnings.push(`Missing class export in ${filePath}`);
            }
            
            // Check for static methods
            if (!content.includes('static async')) {
                this.warnings.push(`Missing static async methods in ${filePath}`);
            }
            
        } catch (error) {
            this.errors.push(`Error reading file ${filePath}: ${error.message}`);
        }
    }

    validateConfigFiles() {
        console.log('\n⚙️ Validating Configuration Files...');
        
        const configFiles = [
            'test-config.js',
            'global-setup.js',
            'global-teardown.js'
        ];
        
        configFiles.forEach(file => {
            const filePath = join(this.configDir, file);
            if (!existsSync(filePath)) {
                this.errors.push(`Missing config file: ${file}`);
            } else {
                console.log(`✅ Config file exists: ${file}`);
                this.validateConfigFileContent(filePath);
            }
        });
    }

    validateConfigFileContent(filePath) {
        try {
            const content = readFileSync(filePath, 'utf8');
            
            // Check for export
            if (!content.includes('export')) {
                this.warnings.push(`Missing export in ${filePath}`);
            }
            
        } catch (error) {
            this.errors.push(`Error reading file ${filePath}: ${error.message}`);
        }
    }

    validatePlaywrightConfig() {
        console.log('\n🎭 Validating Playwright Configuration...');
        
        const playwrightConfigPath = join(this.projectRoot, 'playwright.config.js');
        
        if (!existsSync(playwrightConfigPath)) {
            this.errors.push('Missing playwright.config.js');
        } else {
            console.log('✅ Playwright config exists');
            this.validatePlaywrightConfigContent(playwrightConfigPath);
        }
    }

    validatePlaywrightConfigContent(filePath) {
        try {
            const content = readFileSync(filePath, 'utf8');
            
            // Check for required configuration
            if (!content.includes('testDir')) {
                this.warnings.push('Missing testDir in Playwright config');
            }
            
            if (!content.includes('projects')) {
                this.warnings.push('Missing projects in Playwright config');
            }
            
            if (!content.includes('webServer')) {
                this.warnings.push('Missing webServer in Playwright config');
            }
            
        } catch (error) {
            this.errors.push(`Error reading Playwright config: ${error.message}`);
        }
    }

    validatePackageJson() {
        console.log('\n📦 Validating Package.json...');
        
        const packageJsonPath = join(this.projectRoot, 'package.json');
        
        if (!existsSync(packageJsonPath)) {
            this.errors.push('Missing package.json');
        } else {
            console.log('✅ Package.json exists');
            this.validatePackageJsonContent(packageJsonPath);
        }
    }

    validatePackageJsonContent(filePath) {
        try {
            const content = readFileSync(filePath, 'utf8');
            const packageJson = JSON.parse(content);
            
            // Check for required scripts
            const requiredScripts = [
                'test',
                'test:smoke',
                'test:regression',
                'test:performance',
                'test:accessibility',
                'test:error-handling',
                'test:phaser'
            ];
            
            requiredScripts.forEach(script => {
                if (!packageJson.scripts || !packageJson.scripts[script]) {
                    this.warnings.push(`Missing script: ${script}`);
                } else {
                    console.log(`✅ Script exists: ${script}`);
                }
            });
            
            // Check for required dependencies
            const requiredDeps = ['@playwright/test', 'phaser'];
            
            requiredDeps.forEach(dep => {
                if (!packageJson.dependencies?.[dep] && !packageJson.devDependencies?.[dep]) {
                    this.warnings.push(`Missing dependency: ${dep}`);
                } else {
                    console.log(`✅ Dependency exists: ${dep}`);
                }
            });
            
        } catch (error) {
            this.errors.push(`Error reading package.json: ${error.message}`);
        }
    }

    validateGitHubActions() {
        console.log('\n🔄 Validating GitHub Actions...');
        
        const workflowPath = join(this.projectRoot, '.github', 'workflows', 'phaser-tests.yml');
        
        if (!existsSync(workflowPath)) {
            this.warnings.push('Missing GitHub Actions workflow');
        } else {
            console.log('✅ GitHub Actions workflow exists');
        }
    }

    validateAll() {
        console.log('\n🎯 Running Complete Test Validation...');
        
        this.validateTestStructure();
        this.validateTestFiles();
        this.validateUtilityFiles();
        this.validateConfigFiles();
        this.validatePlaywrightConfig();
        this.validatePackageJson();
        this.validateGitHubActions();
        
        this.printResults();
    }

    printResults() {
        console.log('\n📊 Validation Results:');
        
        if (this.errors.length === 0 && this.warnings.length === 0) {
            console.log('✅ All validations passed! Test configuration is ready.');
        } else {
            if (this.errors.length > 0) {
                console.log('\n❌ Errors:');
                this.errors.forEach(error => console.log(`  - ${error}`));
            }
            
            if (this.warnings.length > 0) {
                console.log('\n⚠️ Warnings:');
                this.warnings.forEach(warning => console.log(`  - ${warning}`));
            }
        }
        
        console.log(`\n📈 Summary:`);
        console.log(`  - Errors: ${this.errors.length}`);
        console.log(`  - Warnings: ${this.warnings.length}`);
        console.log(`  - Status: ${this.errors.length === 0 ? '✅ Ready' : '❌ Issues Found'}`);
    }

    showHelp() {
        console.log(`
🔍 Phaser Test Validator

Usage: node scripts/test-validator.js [command]

Commands:
  structure         Validate test directory structure
  files             Validate test files
  utilities         Validate utility files
  config            Validate configuration files
  playwright        Validate Playwright configuration
  package           Validate package.json
  github            Validate GitHub Actions
  all               Run all validations
  help              Show this help message

Examples:
  node scripts/test-validator.js all
  node scripts/test-validator.js files
  node scripts/test-validator.js config
        `);
    }
}

// Main execution
const command = process.argv[2] || 'all';
const validator = new TestValidator();

switch (command) {
    case 'structure':
        validator.validateTestStructure();
        validator.printResults();
        break;
    case 'files':
        validator.validateTestFiles();
        validator.printResults();
        break;
    case 'utilities':
        validator.validateUtilityFiles();
        validator.printResults();
        break;
    case 'config':
        validator.validateConfigFiles();
        validator.printResults();
        break;
    case 'playwright':
        validator.validatePlaywrightConfig();
        validator.printResults();
        break;
    case 'package':
        validator.validatePackageJson();
        validator.printResults();
        break;
    case 'github':
        validator.validateGitHubActions();
        validator.printResults();
        break;
    case 'all':
        validator.validateAll();
        break;
    case 'help':
    default:
        validator.showHelp();
        break;
}

export default TestValidator;
