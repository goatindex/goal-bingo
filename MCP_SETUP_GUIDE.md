# MCP Setup Guide for Goal Bingo

## What are MCPs?
Model Context Protocol (MCP) servers provide enhanced capabilities to AI assistants like Cursor, allowing them to interact with your development environment more effectively.

## Quick Setup

### Option 1: Automated Setup (Recommended)
Run the PowerShell script to automatically set up all MCPs:

```powershell
.\setup_mcps.ps1
```

### Option 2: Manual Setup
1. Install MCP servers globally:
```bash
npm install -g @modelcontextprotocol/server-github
npm install -g @modelcontextprotocol/server-filesystem
npm install -g @modelcontextprotocol/server-terminal
npm install -g @modelcontextprotocol/server-browser
npm install -g @modelcontextprotocol/server-playwright
npm install -g @modelcontextprotocol/server-context7
```

2. Add to Cursor settings (`%APPDATA%\Cursor\User\globalStorage\cursor.mcp\settings.json`):
```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "your_token_here"
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
```

## Available MCPs

### 🔧 GitHub MCP
- **Purpose**: Version control and repository management
- **Capabilities**: 
  - Create and manage repositories
  - Handle pull requests and issues
  - Manage branches and commits
  - Access repository information

### 📁 Filesystem MCP
- **Purpose**: File operations and project management
- **Capabilities**:
  - Read and write files
  - Manage directories
  - Search for files and content
  - Monitor file changes

### 💻 Terminal MCP
- **Purpose**: Command execution and development tasks
- **Capabilities**:
  - Run terminal commands
  - Execute build scripts
  - Run tests and development servers
  - Manage processes

### 🌐 Browser MCP
- **Purpose**: Web testing and automation
- **Capabilities**:
  - Take screenshots
  - Navigate web pages
  - Test user interactions
  - Monitor network requests

### 🎭 Playwright MCP
- **Purpose**: Advanced browser testing
- **Capabilities**:
  - End-to-end testing
  - Cross-browser testing
  - Performance testing
  - Visual regression testing

### 📚 Context7 MCP
- **Purpose**: Documentation and context management
- **Capabilities**:
  - Access external documentation
  - Get library information
  - Research best practices
  - Context-aware assistance

## Configuration Notes

### GitHub Token (Optional)
If you want to use GitHub MCP features, you'll need to:
1. Create a GitHub Personal Access Token
2. Add it to the MCP configuration
3. Or set it as an environment variable

### Working Directory
The filesystem MCP is configured to work in the Goal Bingo project directory (`D:/goal-bingo`).

### Security
MCPs run with the same permissions as your user account. Only install MCPs from trusted sources.

## Testing MCPs

After setup, you can test MCPs by asking the AI assistant to:
- "Show me the current project structure"
- "Run the development server"
- "Take a screenshot of the game"
- "Check for any linting errors"
- "Help me implement a new Phaser scene"

## Troubleshooting

### MCP Not Working
1. Restart Cursor after configuration
2. Check that MCP servers are installed
3. Verify the configuration file syntax
4. Check Cursor's MCP logs

### Permission Issues
1. Ensure you have write permissions to the project directory
2. Check that Node.js and npm are properly installed
3. Verify the working directory path is correct

### Performance Issues
1. Only enable MCPs you actually need
2. Check system resources
3. Monitor MCP server processes

## Next Steps

Once MCPs are set up:
1. Restart Cursor
2. Test the MCPs with simple commands
3. Start developing with enhanced AI assistance
4. Use MCPs for testing, debugging, and deployment

---

*For more information about MCPs, visit: https://modelcontextprotocol.io/*

