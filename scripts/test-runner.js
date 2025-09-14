#!/usr/bin/env node

/**
 * Automated Test Runner for Phaser Scene Testing
 * 
 * This script provides automated test execution with different configurations
 * for development, CI/CD, and various test categories.
 * 
 * @author AI Assistant
 * @version 1.0.0
 * @since 2024
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

class TestRunner {
    constructor() {
        this.testResultsDir = 'test-results';
        this.reportsDir = 'test-reports';
        this.ensureDirectories();
    }

    ensureDirectories() {
        if (!existsSync(this.testResultsDir)) {
            mkdirSync(this.testResultsDir, { recursive: true });
        }
        if (!existsSync(this.reportsDir)) {
            mkdirSync(this.reportsDir, { recursive: true });
        }
    }

    runCommand(command, options = {}) {
        try {
            console.log(`\n🚀 Running: ${command}`);
            const result = execSync(command, { 
                stdio: 'inherit', 
                encoding: 'utf8',
                ...options 
            });
            console.log(`✅ Command completed successfully`);
            return result;
        } catch (error) {
            console.error(`❌ Command failed: ${error.message}`);
            process.exit(1);
        }
    }

    runSmokeTests() {
        console.log('\n🧪 Running Smoke Tests...');
        this.runCommand('npm run test:smoke');
    }

    runRegressionTests() {
        console.log('\n🔄 Running Regression Tests...');
        this.runCommand('npm run test:regression');
    }

    runPerformanceTests() {
        console.log('\n⚡ Running Performance Tests...');
        this.runCommand('npm run test:performance');
    }

    runAccessibilityTests() {
        console.log('\n♿ Running Accessibility Tests...');
        this.runCommand('npm run test:accessibility');
    }

    runErrorHandlingTests() {
        console.log('\n🛡️ Running Error Handling Tests...');
        this.runCommand('npm run test:error-handling');
    }

    runAllPhaserTests() {
        console.log('\n🎮 Running All Phaser Tests...');
        this.runCommand('npm run test:phaser:full');
    }

    runCITests() {
        console.log('\n🤖 Running CI Tests...');
        this.runCommand('npm run test:phaser:ci');
    }

    runWithCoverage() {
        console.log('\n📊 Running Tests with Coverage...');
        this.runCommand('npm run test:coverage');
    }

    generateReport() {
        console.log('\n📋 Generating Test Report...');
        this.runCommand('npm run test:report');
    }

    cleanResults() {
        console.log('\n🧹 Cleaning Test Results...');
        this.runCommand('npm run test:clean');
    }

    installDependencies() {
        console.log('\n📦 Installing Test Dependencies...');
        this.runCommand('npm run test:install');
        this.runCommand('npm run test:install-deps');
    }

    runDevelopmentTests() {
        console.log('\n🔧 Running Development Test Suite...');
        this.runSmokeTests();
        this.runRegressionTests();
    }

    runPreCommitTests() {
        console.log('\n🚀 Running Pre-Commit Test Suite...');
        this.runSmokeTests();
        this.runErrorHandlingTests();
    }

    runFullTestSuite() {
        console.log('\n🎯 Running Full Test Suite...');
        this.runAllPhaserTests();
        this.runWithCoverage();
        this.generateReport();
    }

    runCIPipeline() {
        console.log('\n🔄 Running CI Pipeline...');
        this.installDependencies();
        this.runCITests();
        this.runWithCoverage();
    }

    showHelp() {
        console.log(`
🎮 Phaser Test Runner

Usage: node scripts/test-runner.js [command]

Commands:
  smoke              Run smoke tests (quick validation)
  regression         Run regression tests
  performance        Run performance tests
  accessibility      Run accessibility tests
  error-handling     Run error handling tests
  all                Run all Phaser tests
  ci                 Run CI pipeline tests
  dev                 Run development test suite
  pre-commit         Run pre-commit test suite
  full               Run full test suite with coverage
  coverage           Run tests with coverage analysis
  report             Generate test report
  clean              Clean test results
  install            Install test dependencies
  help               Show this help message

Examples:
  node scripts/test-runner.js smoke
  node scripts/test-runner.js ci
  node scripts/test-runner.js full
        `);
    }
}

// Main execution
const command = process.argv[2] || 'help';
const runner = new TestRunner();

switch (command) {
    case 'smoke':
        runner.runSmokeTests();
        break;
    case 'regression':
        runner.runRegressionTests();
        break;
    case 'performance':
        runner.runPerformanceTests();
        break;
    case 'accessibility':
        runner.runAccessibilityTests();
        break;
    case 'error-handling':
        runner.runErrorHandlingTests();
        break;
    case 'all':
        runner.runAllPhaserTests();
        break;
    case 'ci':
        runner.runCIPipeline();
        break;
    case 'dev':
        runner.runDevelopmentTests();
        break;
    case 'pre-commit':
        runner.runPreCommitTests();
        break;
    case 'full':
        runner.runFullTestSuite();
        break;
    case 'coverage':
        runner.runWithCoverage();
        break;
    case 'report':
        runner.generateReport();
        break;
    case 'clean':
        runner.cleanResults();
        break;
    case 'install':
        runner.installDependencies();
        break;
    case 'help':
    default:
        runner.showHelp();
        break;
}

export default TestRunner;
