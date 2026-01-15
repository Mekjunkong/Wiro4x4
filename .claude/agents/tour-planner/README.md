# Tour Planner Multi-Agent System

A comprehensive, modular tour planning system with specialized sub-agents for professional-grade itinerary creation.

## System Architecture

```
tour-planner (Master Orchestrator)
    ├── destination-researcher (Weather, events, timing)
    ├── cost-calculator (Pricing & budgets)
    ├── guide-coordinator (Guide selection & management)
    ├── logistics-manager (Transport, hotels, timing)
    └── safety-specialist (Risk assessment & protocols)
```

## Agent Overview

### 🎯 **tour-planner.md** (Master Agent)
**Role**: Orchestrator and quality controller
**Purpose**: Coordinates all sub-agents and synthesizes outputs into cohesive tour plans
**Tools**: Task (to delegate), Read, Write, Edit, AskUserQuestion

**Key Responsibilities**:
- Gather client requirements
- Delegate to specialist sub-agents
- Synthesize outputs into master plan
- Quality assurance and conflict resolution
- Produce final deliverable package

---

### 🌍 **destination-researcher.md**
**Role**: Destination intelligence specialist
**Purpose**: Research weather, events, and optimal visit timing
**Tools**: WebFetch, WebSearch, Read, Write

**Delivers**:
- Climate and weather analysis
- Local events and festivals calendar
- Seasonal considerations and crowd patterns
- Best time to visit recommendations
- Current conditions and advisories

---

### 💰 **cost-calculator.md**
**Role**: Financial analyst
**Purpose**: Calculate comprehensive tour costs with multiple pricing tiers
**Tools**: WebFetch, WebSearch, Read, Write, Edit

**Delivers**:
- Detailed cost breakdowns (accommodations, transport, guides, meals, activities)
- Budget/Standard/Premium pricing tiers
- Operating margins and contingencies
- Payment terms and cancellation policies
- Price comparison tables

---

### 👨‍🏫 **guide-coordinator.md**
**Role**: Guide management specialist
**Purpose**: Select, schedule, and coordinate tour guides
**Tools**: Read, Write, Edit, Grep

**Delivers**:
- Guide qualification verification
- Availability confirmation
- Guide-to-tour matching
- Backup guide arrangements
- Pre-tour coordination and briefings
- Guide assignment reports

---

### 🚌 **logistics-manager.md**
**Role**: Operations coordinator
**Purpose**: Plan all transport, accommodations, timing, and permits
**Tools**: Read, Write, Edit, WebFetch, WebSearch

**Delivers**:
- Hotel bookings and rooming plans
- Transportation coordination (inter-city, local, transfers)
- Daily schedules with timing buffers
- Meal reservations
- Activity bookings and permits
- Contingency plans
- Master logistics document

---

### 🛡️ **safety-specialist.md**
**Role**: Risk management expert
**Purpose**: Ensure participant safety through assessment and protocols
**Tools**: WebFetch, WebSearch, Read, Write, Edit

**Delivers**:
- Destination risk analysis (security, health, environmental)
- Participant health screening
- Prevention protocols and safety briefings
- Emergency response plans (medical, security, evacuation)
- Safety documentation and compliance
- Crisis communication plans

---

## How to Use This System

### Option 1: Use the Master Orchestrator

```bash
# Invoke the main tour-planner agent
# It will automatically delegate to sub-agents as needed
```

The tour-planner will:
1. Ask you questions to gather requirements
2. Delegate research to destination-researcher and safety-specialist
3. Once itinerary outline exists, deploy guide-coordinator, logistics-manager, and cost-calculator
4. Synthesize all outputs into a comprehensive tour plan

### Option 2: Use Individual Sub-Agents

You can invoke sub-agents directly for specific tasks:

```bash
# Just need destination research?
Use: destination-researcher

# Just need cost estimation?
Use: cost-calculator

# Just need guide recommendations?
Use: guide-coordinator
```

### Option 3: Custom Workflow

Mix and match agents based on your needs. For example:
1. Run destination-researcher first to determine best time to visit
2. Based on that, run logistics-manager to plan details
3. Finally, run cost-calculator to price it out

## Workflow Diagram

```
User Request
     ↓
tour-planner (Requirements Gathering)
     ↓
     ├─→ destination-researcher ──┐
     ├─→ safety-specialist ────────┤
     │                             ↓
     │                    [Research Complete]
     │                             ↓
     │                     [Itinerary Outline]
     │                             ↓
     ├─→ guide-coordinator ────────┤
     ├─→ logistics-manager ────────┤
     └─→ cost-calculator ──────────┘
                 ↓
         [All Outputs Ready]
                 ↓
    tour-planner (Synthesis & QA)
                 ↓
      Final Tour Plan Document
```

## Example Usage

```
User: "Plan a 10-day tour of Italy for 8 people in September"

tour-planner will:

Phase 1: Ask clarifying questions
  - Which regions? (Rome, Florence, Venice, Amalfi?)
  - Budget tier?
  - Group demographics and interests?
  - Specific dates in September?

Phase 2: Research (Parallel execution)
  - destination-researcher → Weather in Sep, festivals, crowd levels
  - safety-specialist → Travel advisories, health requirements

Phase 3: Detailed Planning (Parallel after Phase 2)
  - logistics-manager → Hotels, transport, daily schedule
  - guide-coordinator → Find Italian-speaking guides
  - cost-calculator → Full pricing for all components

Phase 4: Synthesis
  - Combine all outputs
  - Create day-by-day itinerary
  - Add safety protocols
  - Build contingency plans
  - Deliver comprehensive tour plan
```

## File Structure

```
.claude/agents/tour-planner/
├── README.md                      # This file
├── tour-planner.md                # Master orchestrator
├── destination-researcher.md      # Weather & timing specialist
├── cost-calculator.md             # Pricing specialist
├── guide-coordinator.md           # Guide management
├── logistics-manager.md           # Operations coordinator
└── safety-specialist.md           # Risk & safety expert
```

## Key Features

✅ **Modular Architecture** - Each agent has a single, clear responsibility
✅ **Parallel Execution** - Independent sub-agents can run simultaneously
✅ **Comprehensive Coverage** - All aspects of tour planning addressed
✅ **Professional Standards** - Industry best practices built-in
✅ **Flexible Usage** - Use full system or individual components
✅ **Scalable** - Easy to add new specialist agents

## Customization

### Adding a New Sub-Agent

1. Create a new `.md` file in this directory
2. Use the frontmatter format:
```yaml
---
name: agent-name
description: Brief description
tools: Tool1, Tool2, Tool3
---
```
3. Update tour-planner.md to include the new agent in the workflow
4. Document it in this README

### Modifying Existing Agents

Each agent file is self-contained. Edit the agent's `.md` file to:
- Add new protocols
- Adjust output formats
- Refine quality standards
- Update checklists

## Tips for Best Results

1. **Be Specific with Dates** - Exact dates get better weather/event research
2. **Provide Group Details** - Age, fitness, interests matter for itinerary
3. **State Budget Clearly** - Helps all agents make appropriate choices
4. **Mention Special Needs Early** - Dietary, accessibility, health considerations
5. **Trust the Process** - Let the orchestrator delegate; it knows the workflow

## Support & Customization

These agents are templates. Customize them for your specific needs:
- Add your preferred hotel chains or suppliers
- Adjust pricing formulas
- Modify safety protocols for your risk tolerance
- Update communication styles
- Add destination-specific expertise

---

**Built with**: Claude Code Agent System
**Architecture**: Modular multi-agent delegation pattern
**Maintenance**: Each agent is independently updateable
