# MCP Server Setup Guide

This guide explains how to configure Model Context Protocol (MCP) servers for the Wiro 4x4 Tour project.

## What are MCP Servers?

MCP servers extend Claude's capabilities by connecting to external tools and services:
- **MongoDB Server**: Direct database operations through Claude
- **GitHub Server**: Repository management and operations

## Setup Instructions

### 1. Configure Environment Variables

The MCP configuration uses environment variables to keep secrets secure.

#### macOS/Linux (add to `~/.zshrc` or `~/.bashrc`):
```bash
export GITHUB_PERSONAL_ACCESS_TOKEN="your_github_token_here"
```

#### Windows (PowerShell):
```powershell
[Environment]::SetEnvironmentVariable("GITHUB_PERSONAL_ACCESS_TOKEN", "your_github_token_here", "User")
```

### 2. Create Your GitHub Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a descriptive name (e.g., "Claude Code MCP")
4. Select scopes based on your needs:
   - `repo` - Full control of private repositories
   - `read:org` - Read org and team membership
   - `user:email` - Access user email addresses
5. Click "Generate token"
6. Copy the token and add it to your environment variables

### 3. Verify MCP Configuration

After setting environment variables, restart your terminal and verify:

```bash
# Check if environment variable is set
echo $GITHUB_PERSONAL_ACCESS_TOKEN

# Should show your token (on macOS/Linux)
```

### 4. Enable MCP Servers in Claude

The `.claude/settings.local.json` file already enables both servers:
```json
{
  "enabledMcpjsonServers": [
    "mongodb",
    "github"
  ]
}
```

## MCP Configuration File Structure

### `.mcp.json` (active configuration - not in git)
Contains the actual MCP server configurations with environment variable references.

### `.mcp.json.example` (template - in git)
Template for other developers to set up their own MCP configuration.

## MongoDB Server

Connects to your local MongoDB instance at `mongodb://localhost:27017`.

**Prerequisites:**
- MongoDB must be running locally
- Default connection string works for local development
- For MongoDB Atlas, update the connection string in `.mcp.json`

**Usage through Claude:**
- Query bookings directly from the database
- View collection schemas
- Run aggregation pipelines
- Monitor database stats

## GitHub Server

Enables repository operations through Claude.

**Capabilities:**
- Create issues and pull requests
- Search code and repositories
- Manage branches
- View commit history
- File operations

## Security Best Practices

✅ **DO:**
- Use environment variables for tokens
- Keep `.mcp.json` in `.gitignore`
- Use `.mcp.json.example` as a template
- Rotate tokens periodically
- Use minimal required token scopes

❌ **DON'T:**
- Commit `.mcp.json` with actual tokens
- Share your personal access tokens
- Use tokens with excessive permissions
- Store tokens in plain text in committed files

## Troubleshooting

### MCP servers not working
1. Verify environment variables are set (restart terminal after setting)
2. Check `.mcp.json` syntax is valid JSON
3. Ensure MongoDB is running for the MongoDB server
4. Verify GitHub token has required scopes

### MongoDB connection errors
```bash
# Check if MongoDB is running
brew services list | grep mongodb

# Start MongoDB if not running
brew services start mongodb-community

# Test connection
mongosh "mongodb://localhost:27017/wiro4x4tour"
```

### GitHub authentication errors
- Verify token is correctly set in environment variable
- Check token hasn't expired
- Verify token has required scopes in GitHub settings

## Additional Resources

- [MCP Documentation](https://modelcontextprotocol.io/)
- [MongoDB MCP Server](https://github.com/modelcontextprotocol/servers/tree/main/src/mongodb)
- [GitHub MCP Server](https://github.com/modelcontextprotocol/servers/tree/main/src/github)
