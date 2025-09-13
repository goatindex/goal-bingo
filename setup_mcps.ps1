# MCP Setup Script for Goal Bingo
# This script helps set up Model Context Protocol servers for development

Write-Host "🎯 Setting up MCPs for Goal Bingo..." -ForegroundColor Green

# Check if Node.js is installed
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Node.js found: $(node --version)" -ForegroundColor Green

# Install MCP servers
Write-Host "📦 Installing MCP servers..." -ForegroundColor Yellow

$mcpServers = @(
    "@modelcontextprotocol/server-github",
    "@modelcontextprotocol/server-filesystem", 
    "@modelcontextprotocol/server-terminal",
    "@modelcontextprotocol/server-browser",
    "@modelcontextprotocol/server-playwright",
    "@modelcontextprotocol/server-context7"
)

foreach ($server in $mcpServers) {
    Write-Host "Installing $server..." -ForegroundColor Cyan
    try {
        npx -y $server --version
        Write-Host "✅ $server installed successfully" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  $server installation failed, but continuing..." -ForegroundColor Yellow
    }
}

# Create Cursor MCP configuration
Write-Host "🔧 Creating Cursor MCP configuration..." -ForegroundColor Yellow

$cursorConfig = @"
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": ""
      }
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem"],
      "cwd": "D:/goal-bingo"
    },
    "terminal": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-terminal"]
    },
    "browser": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-browser"]
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-playwright"]
    },
    "context7": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-context7"]
    }
  }
}
"@

# Save to user's Cursor settings directory
$cursorSettingsPath = "$env:APPDATA\Cursor\User\globalStorage\cursor.mcp\settings.json"
$cursorDir = Split-Path $cursorSettingsPath -Parent

if (!(Test-Path $cursorDir)) {
    New-Item -ItemType Directory -Path $cursorDir -Force
    Write-Host "📁 Created Cursor MCP directory: $cursorDir" -ForegroundColor Green
}

$cursorConfig | Out-File -FilePath $cursorSettingsPath -Encoding UTF8
Write-Host "✅ Cursor MCP configuration saved to: $cursorSettingsPath" -ForegroundColor Green

# Create local MCP configuration
$mcpConfigPath = "D:\goal-bingo\mcp_config.json"
$cursorConfig | Out-File -FilePath $mcpConfigPath -Encoding UTF8
Write-Host "✅ Local MCP configuration saved to: $mcpConfigPath" -ForegroundColor Green

Write-Host "`n🎉 MCP setup complete!" -ForegroundColor Green
Write-Host "`n📋 Next steps:" -ForegroundColor Yellow
Write-Host "1. Restart Cursor to load the new MCP configuration" -ForegroundColor White
Write-Host "2. Set your GitHub token in the MCP configuration if needed" -ForegroundColor White
Write-Host "3. Test the MCPs by asking me to help with Phaser development" -ForegroundColor White

Write-Host "`n🔧 Available MCPs:" -ForegroundColor Cyan
Write-Host "• GitHub MCP - Version control and repository management" -ForegroundColor White
Write-Host "• Filesystem MCP - File operations and project management" -ForegroundColor White
Write-Host "• Terminal MCP - Command execution and development tasks" -ForegroundColor White
Write-Host "• Browser MCP - Web testing and automation" -ForegroundColor White
Write-Host "• Playwright MCP - Advanced browser testing" -ForegroundColor White
Write-Host "• Context7 MCP - Documentation and context management" -ForegroundColor White

Write-Host "`n🚀 Ready to develop Goal Bingo with enhanced MCP support!" -ForegroundColor Green

