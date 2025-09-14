#!/usr/bin/env node
/**
 * Phaser Compliance Audit Script
 * Scans the codebase for Phaser anti-patterns and compliance issues
 */

const fs = require('fs');
const path = require('path');

class PhaserComplianceAuditor {
    constructor() {
        this.issues = [];
        this.scanDirectory('src');
    }

    scanDirectory(dir) {
        const files = fs.readdirSync(dir, { withFileTypes: true });
        
        for (const file of files) {
            const fullPath = path.join(dir, file.name);
            
            if (file.isDirectory()) {
                this.scanDirectory(fullPath);
            } else if (file.name.endsWith('.js')) {
                this.auditFile(fullPath);
            }
        }
    }

    auditFile(filePath) {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        
        lines.forEach((line, index) => {
            const lineNum = index + 1;
            
            // Check for double-rendering anti-pattern
            if (this.isDoubleRenderingPattern(line, lines, index)) {
                this.issues.push({
                    type: 'DOUBLE_RENDERING',
                    file: filePath,
                    line: lineNum,
                    content: line.trim(),
                    severity: 'CRITICAL',
                    description: 'Element added to both scene and container'
                });
            }
            
            // Check for API compliance issues
            if (this.isApiComplianceIssue(line)) {
                this.issues.push({
                    type: 'API_COMPLIANCE',
                    file: filePath,
                    line: lineNum,
                    content: line.trim(),
                    severity: 'HIGH',
                    description: 'Incorrect Phaser API usage'
                });
            }
            
            // Check for container management issues
            if (this.isContainerManagementIssue(line)) {
                this.issues.push({
                    type: 'CONTAINER_MANAGEMENT',
                    file: filePath,
                    line: lineNum,
                    content: line.trim(),
                    severity: 'MEDIUM',
                    description: 'Improper container usage'
                });
            }
            
            // Check for depth management issues
            if (this.isDepthManagementIssue(line)) {
                this.issues.push({
                    type: 'DEPTH_MANAGEMENT',
                    file: filePath,
                    line: lineNum,
                    content: line.trim(),
                    severity: 'MEDIUM',
                    description: 'Missing or incorrect depth management'
                });
            }
        });
    }

    isDoubleRenderingPattern(line, lines, index) {
        // Look for this.add.* followed by container.add
        if (line.includes('this.add.') && !line.includes('container')) {
            // Check next 10 lines for container.add
            for (let i = index + 1; i < Math.min(index + 10, lines.length); i++) {
                if (lines[i].includes('container.add') || lines[i].includes('.add(')) {
                    return true;
                }
            }
        }
        return false;
    }

    isApiComplianceIssue(line) {
        const patterns = [
            /this\.isActive\(\)/,
            /this\.isVisible\(\)/,
            /this\.isSleeping\(\)/,
            /this\.isShuttingDown\(\)/
        ];
        
        return patterns.some(pattern => pattern.test(line));
    }

    isContainerManagementIssue(line) {
        const patterns = [
            /addToDisplayList\(\)/,
            /container\.add\(/,
            /this\.add\.container\(/
        ];
        
        return patterns.some(pattern => pattern.test(line));
    }

    isDepthManagementIssue(line) {
        return line.includes('setDepth') || line.includes('depth:');
    }

    generateReport() {
        console.log('🔍 Phaser Compliance Audit Report\n');
        console.log('=' .repeat(50));
        
        const byType = this.issues.reduce((acc, issue) => {
            if (!acc[issue.type]) acc[issue.type] = [];
            acc[issue.type].push(issue);
            return acc;
        }, {});
        
        Object.keys(byType).forEach(type => {
            console.log(`\n📁 ${type} (${byType[type].length} issues)`);
            console.log('-'.repeat(30));
            
            byType[type].forEach(issue => {
                console.log(`  ${issue.severity} | ${issue.file}:${issue.line}`);
                console.log(`    ${issue.description}`);
                console.log(`    ${issue.content}`);
                console.log('');
            });
        });
        
        console.log(`\n📊 Summary: ${this.issues.length} total issues found`);
        
        const critical = this.issues.filter(i => i.severity === 'CRITICAL').length;
        const high = this.issues.filter(i => i.severity === 'HIGH').length;
        const medium = this.issues.filter(i => i.severity === 'MEDIUM').length;
        
        console.log(`  🔴 Critical: ${critical}`);
        console.log(`  🟠 High: ${high}`);
        console.log(`  🟡 Medium: ${medium}`);
    }
}

// Run the audit
const auditor = new PhaserComplianceAuditor();
auditor.generateReport();

