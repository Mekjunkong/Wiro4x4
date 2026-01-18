# MCP Server Usage Examples

This document provides practical examples of using MCP servers with the Wiro 4x4 Tour project.

## MongoDB MCP Server Examples

Once the MongoDB MCP server is connected, you can interact with your database directly through Claude.

### Example Queries You Can Ask Claude

#### 1. View All Bookings
```
"Show me all bookings in the database"
```
Claude will query the `bookings` collection and display the results.

#### 2. Filter Bookings by Status
```
"Show me all pending bookings"
"List confirmed bookings from the last 30 days"
"Find all cancelled bookings"
```

#### 3. Search by Date Range
```
"Show bookings with pickup dates between June 1 and June 30, 2024"
"Find all bookings for next month"
```

#### 4. Analyze Booking Data
```
"How many bookings do we have by status?"
"What are the most popular destinations?"
"Show me bookings that include children"
"Which attractions are most frequently selected?"
```

#### 5. Database Schema Information
```
"Show me the structure of the bookings collection"
"What fields are in the Booking schema?"
```

#### 6. Aggregation Queries
```
"Calculate total number of adults across all confirmed bookings"
"Group bookings by destination and count them"
"Show average number of guests per booking"
```

### Direct Database Operations

The MongoDB MCP server can also help with:
- Creating test data
- Updating booking statuses in bulk
- Cleaning up old or test bookings
- Validating data integrity
- Exporting data for reports

## GitHub MCP Server Examples

### Repository Operations

#### 1. Code Search
```
"Search for all files that use the TourBookingFormData interface"
"Find where we handle booking status updates"
```

#### 2. Issue Management
```
"Create an issue for adding payment processing"
"List all open issues in the repository"
"Show me issues labeled 'bug'"
```

#### 3. Pull Request Operations
```
"Create a pull request for the current branch"
"Show me all open pull requests"
"What files changed in PR #5?"
```

#### 4. Branch Management
```
"Create a new branch called feature/payment-integration"
"List all branches in the repository"
```

#### 5. File Operations
```
"Show me the contents of package.json from the main branch"
"Update README.md with new setup instructions"
```

## Combined MCP Workflow Examples

### Example 1: Bug Investigation
```
User: "Why are some bookings missing the hotel information?"

Claude (using MongoDB MCP):
1. Queries bookings where includesHotels is true but hotelPreferences is empty
2. Analyzes the data patterns
3. Identifies the issue

Claude (using GitHub MCP):
4. Searches codebase for hotel-related validation
5. Creates an issue documenting the bug
6. Suggests fixes based on code analysis
```

### Example 2: Feature Planning
```
User: "I want to add a payment field to bookings"

Claude (using MongoDB MCP):
1. Checks current schema structure
2. Identifies where to add payment fields
3. Verifies no existing payment tracking

Claude (using GitHub MCP):
4. Searches for similar implementations in other projects
5. Creates an issue with implementation plan
6. Suggests which files need updates based on architecture
```

### Example 3: Data Migration
```
User: "Add a 'createdAt' timestamp to all existing bookings"

Claude (using MongoDB MCP):
1. Counts bookings without createdAt field
2. Performs bulk update with current timestamp
3. Verifies all records updated

Claude (using GitHub MCP):
4. Creates a commit documenting the migration
5. Updates schema documentation
```

## Practical Workflow Tips

### When to Use MongoDB MCP
- Viewing real booking data
- Testing database queries
- Data analysis and reporting
- Quick database updates
- Schema validation
- Debugging data issues

### When to Use GitHub MCP
- Code exploration and search
- Creating issues and PRs
- Branch management
- Documentation updates
- Code review assistance
- Repository maintenance

### Best Practices

1. **Always verify before database changes**: Ask Claude to show you what will change before executing updates
2. **Use transactions for critical updates**: Request transactional operations for important data changes
3. **Regular backups**: Ensure MongoDB backups are in place before bulk operations
4. **Test queries first**: Run SELECT/find queries before UPDATE/delete operations
5. **Document changes**: Use GitHub MCP to commit and document database schema changes

## Advanced Usage

### Complex Aggregation Pipeline
```
"Create an aggregation pipeline that:
1. Groups bookings by month
2. Calculates total guests (adults + children)
3. Shows the most popular destinations per month
4. Exports results to a CSV"
```

### Automated Reporting
```
"Every Monday, show me:
- New bookings from the past week
- Upcoming tours in the next 7 days
- Bookings requiring follow-up (pending status > 3 days)"
```

### Code and Data Consistency Check
```
"Compare the TypeScript interface in tourBooking.ts with the actual MongoDB schema
and report any mismatches"
```

## Security Reminders

- MCP servers have full access to MongoDB and GitHub
- Always review operations before executing
- Don't share MCP configurations with tokens
- Use read-only tokens when possible
- Regularly rotate access tokens
- Monitor MCP server logs for unusual activity

## Troubleshooting

### MongoDB MCP not responding
```
Check: Is MongoDB running?
Check: Is connection string correct in .mcp.json?
Check: Network/firewall blocking port 27017?
```

### GitHub MCP authentication failed
```
Check: Is GITHUB_PERSONAL_ACCESS_TOKEN environment variable set?
Check: Is token still valid (not expired)?
Check: Does token have required scopes?
```

### MCP server crashes
```
Check: Node.js version compatibility
Check: Network connectivity
Check: Server logs in Claude Code output
Try: Restart Claude Code
Try: Update MCP server packages (npx -y @modelcontextprotocol/server-*)
```

## Next Steps

1. Set up your environment variables (see MCP_SETUP.md)
2. Start MongoDB locally
3. Test connection by asking Claude to list databases
4. Try the example queries above
5. Explore advanced features as needed

## Resources

- Project setup: See CLAUDE.md
- MCP configuration: See MCP_SETUP.md
- Database operations: See MongoDB commands in CLAUDE.md
