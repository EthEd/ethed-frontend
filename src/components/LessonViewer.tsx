'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { motion } from 'motion/react';

interface LessonContent {
  id: number;
  title: string;
  content: string;
  duration: string;
  type: string;
}

const lessonContents: Record<number, LessonContent> = {
  1: {
    id: 1,
    title: 'Ethereum in Plain Language',
    duration: '15 min',
    type: 'reading',
    content: `
# Ethereum in Plain Language

Ethereum is often called "the world computer" - but what does that actually mean?

## What is Ethereum?

Think of Ethereum as a **global, decentralized computer** that never stops running. Unlike your laptop or phone, this computer isn't owned by any single person or company. Instead, it's maintained by thousands of computers around the world working together.

### Key Concepts

**Smart Contracts**: These are like digital vending machines. You put something in (like cryptocurrency), and if certain conditions are met, you automatically get something out. No middleman needed!

**Decentralization**: No single point of failure. If one computer goes down, thousands of others keep the network running.

**Transparency**: Every transaction and smart contract is visible to everyone. It's like having a public ledger that everyone can audit.

## Why Does This Matter?

Traditional applications run on servers owned by companies. If the company shuts down, your app disappears. Ethereum applications (called dApps) run on this global computer, so they can't be easily shut down or censored.

### Real-World Examples

- **DeFi**: Decentralized finance applications that let you lend, borrow, and trade without banks
- **NFTs**: Unique digital assets that prove ownership of digital items
- **DAOs**: Organizations that operate through smart contracts rather than traditional management

## The Ethereum Virtual Machine (EVM)

The EVM is like the "processor" of this world computer. It executes smart contracts in a standardized way, ensuring that the same code produces the same results on every computer in the network.

---

**Key Takeaway**: Ethereum enables programmable money and unstoppable applications by providing a global, decentralized computing platform.
    `
  },
  2: {
    id: 2,
    title: 'What is an EIP?',
    duration: '10 min',
    type: 'reading',
    content: `
# What is an EIP?

EIP stands for **Ethereum Improvement Proposal**. Think of EIPs as formal suggestions for making Ethereum better.

## The Purpose of EIPs

EIPs serve as the primary mechanism for:
- Proposing new features for Ethereum
- Documenting design decisions
- Providing a clear specification for implementers
- Building consensus within the community

## Who Can Create an EIP?

**Anyone!** You don't need special credentials or permissions. However, successful EIPs typically come from:
- Core developers
- Application developers
- Researchers
- Community members with deep technical knowledge

## The EIP Process

1. **Idea**: Someone identifies a need or improvement
2. **Draft**: They write a formal proposal following EIP standards
3. **Review**: The community and editors provide feedback
4. **Implementation**: Developers build the proposed changes
5. **Adoption**: The Ethereum network accepts the improvement

## EIP Structure

Every EIP follows a standard format:
- **Preamble**: Metadata about the EIP
- **Abstract**: Brief technical summary
- **Motivation**: Why this change is needed
- **Specification**: Detailed technical description
- **Rationale**: Design decisions and alternatives considered
- **Implementation**: Reference implementations

## Historical Context

The EIP process was inspired by Bitcoin's BIP (Bitcoin Improvement Proposal) system and Python's PEP (Python Enhancement Proposal) process. It provides a democratic way to evolve Ethereum while maintaining stability and security.

---

**Next**: Let's explore the different types of EIPs and how they're categorized.
    `
  },
  3: {
    id: 3,
    title: 'Types of EIPs',
    duration: '12 min',
    type: 'reading',
    content: `
# Types of EIPs

Not all EIPs are created equal. They're categorized into different types based on their scope and impact.

## Standards Track EIPs

These are the most common and impactful EIPs. They propose changes that affect:

### Core EIPs
- Changes to the Ethereum protocol itself
- Examples: EIP-1559 (Fee Market), EIP-4844 (Proto-Danksharding)
- Require network-wide consensus and hard forks

### Networking EIPs
- Changes to network protocols
- How Ethereum nodes communicate
- Examples: DevP2P improvements, discovery protocols

### Interface EIPs
- Application-level standards
- How applications interact with Ethereum
- Examples: ERC-20 (Token Standard), ERC-721 (NFT Standard)

### ERC (Ethereum Request for Comments)
- Application-level standards and conventions
- Most famous subcategory of Interface EIPs
- Create interoperability between applications

## Meta EIPs

These describe processes or propose changes to the EIP process itself:
- Guidelines for EIP formatting
- Community procedures
- Governance changes
- Example: EIP-1 (EIP Purpose and Guidelines)

## Informational EIPs

These provide information to the Ethereum community:
- Design rationales
- General guidelines
- Community announcements
- Don't propose new features, just document best practices

## Process Examples

**Standards Track**: "Let's change how gas fees work" (EIP-1559)
**Meta**: "Let's change how we write EIPs" (EIP formatting updates)
**Informational**: "Here's how to securely implement multi-sig wallets"

## Impact Levels

- **Core changes**: Affect every Ethereum user (require hard forks)
- **Interface changes**: Affect application developers
- **Informational**: Affect community practices

---

**Understanding these categories helps you know what type of EIP to write and what approval process it will follow.**
    `
  },
  4: {
    id: 4,
    title: 'EIP Lifecycle',
    duration: '18 min',
    type: 'reading',
    content: `
# EIP Lifecycle: How an Idea Becomes a Standard

Understanding the EIP lifecycle is crucial for anyone wanting to contribute to Ethereum's development.

## The Complete Journey

### 1. Idea Stage
- Someone identifies a problem or opportunity
- Initial research and informal discussion
- Gathering community interest
- **Duration**: Weeks to months

### 2. Draft Stage
- Author writes the formal EIP document
- Must follow EIP-1 formatting guidelines
- Assigned an EIP number by editors
- **Status**: "Draft"

### 3. Review Stage
- Community provides feedback
- Technical review by relevant experts
- Iterative improvements to the proposal
- **Status**: Still "Draft" but under active review

### 4. Last Call
- Final opportunity for community input
- Usually lasts 14 days minimum
- Address any remaining concerns
- **Status**: "Last Call"

### 5. Final Stage
- EIP is accepted by the community
- For Core EIPs: scheduled for network upgrade
- For Standards Track: reference implementation exists
- **Status**: "Final"

## Alternative Outcomes

### Withdrawn
- Author decides to abandon the EIP
- Can be reactivated later
- Common for early-stage ideas that need more work

### Rejected
- Community consensus is against the proposal
- Usually due to technical issues or philosophical disagreements
- Provides valuable documentation of what was considered

### Superseded
- A better solution is found
- Original EIP is replaced by a newer one
- Example: EIP-158 superseded parts of earlier EIPs

## Stagnant EIPs
- No activity for 6+ months
- Can be reactivated with renewed interest
- Many good ideas just need the right timing

## Real Timeline Examples

**EIP-1559 (Fee Market)**:
- Idea: 2018
- Draft: April 2019
- Extensive review: 2019-2021
- Final: August 2021 (London Hard Fork)
- **Total time**: ~3 years

**ERC-20 (Token Standard)**:
- Draft: November 2015
- Final: September 2017
- **Total time**: ~2 years

## Success Factors

1. **Clear problem statement**
2. **Strong technical specification**
3. **Community support**
4. **Reference implementation**
5. **Persistence through feedback cycles**

---

**The lifecycle ensures that only well-thought-out, community-supported changes make it into Ethereum.**
    `
  },
  5: {
    id: 5,
    title: 'Anatomy of an EIP',
    duration: '20 min',
    type: 'reading',
    content: `
# Anatomy of an EIP: Structure and Components

Let's dissect a real EIP to understand its structure and learn how to write effective proposals.

## Standard EIP Structure

### Preamble (Header)
\`\`\`
EIP: 20
Title: Token Standard
Author: Fabian Vogelsteller, Vitalik Buterin
Status: Final
Type: Standards Track
Category: ERC
Created: 2015-11-19
\`\`\`

**Key fields**:
- **EIP number**: Assigned by editors
- **Title**: Clear, concise description
- **Author**: Contributors and maintainers
- **Status**: Current stage in lifecycle
- **Type**: Standards Track, Meta, or Informational
- **Category**: Core, Networking, Interface, or ERC

### Abstract
A 2-3 sentence technical summary. Should be:
- Self-contained
- Understandable without reading the full EIP
- Technically precise

**Example**: "A standard interface for tokens. This standard provides basic functionality to transfer tokens, as well as allow tokens to be approved so they can be spent by another on-chain third party."

### Motivation
Explains **why** this EIP is needed:
- What problem does it solve?
- Why existing solutions are insufficient
- What benefits it provides

### Specification
The technical meat of the EIP:
- Detailed description of the proposed change
- API specifications
- Data structures
- Algorithms
- Should be precise enough for implementation

### Rationale
Design decisions and trade-offs:
- Why this approach vs alternatives
- Edge cases considered
- Backwards compatibility
- Security considerations

### Implementation
- Reference implementations
- Test cases
- Deployment considerations
- Links to working code

## Writing Best Practices

### Clear Language
- Use precise technical terms
- Define acronyms and domain-specific terms
- Structure with clear headings
- Include examples

### Complete Specifications
- Cover all edge cases
- Specify error conditions
- Include gas costs (for Core EIPs)
- Address security implications

### Community Engagement
- Solicit feedback early and often
- Address concerns constructively
- Document major changes
- Build consensus gradually

## Common Mistakes

1. **Vague specifications**: "Should be more efficient"
2. **Missing rationale**: Not explaining design choices
3. **Ignoring backwards compatibility**
4. **Insufficient community engagement**
5. **Premature finalization**

## ERC-20 Case Study

Let's examine why ERC-20 was so successful:

**Clear Problem**: No standard way for tokens to interact
**Simple Interface**: Just 6 functions + 2 events
**Backwards Compatible**: Didn't break existing contracts
**Reference Implementation**: Working code available
**Community Adoption**: Wallets and exchanges supported it

---

**A well-structured EIP is like a good blueprint - detailed enough for implementation, clear enough for review, and compelling enough for adoption.**
    `
  },
  6: {
    id: 6,
    title: 'Famous EIP Case Studies',
    duration: '25 min',
    type: 'reading',
    content: `
# Famous EIP Case Studies

Let's examine some of the most impactful EIPs to understand what makes them successful and how they shaped Ethereum.

## ERC-20: The Token That Changed Everything

**Problem**: In early Ethereum, every token contract had different interfaces. Wallets couldn't universally support tokens.

**Solution**: A standard interface that all tokens could implement.

### Key Features
\`\`\`solidity
function totalSupply() public view returns (uint256)
function balanceOf(address _owner) public view returns (uint256)
function transfer(address _to, uint256 _value) public returns (bool)
function approve(address _spender, uint256 _value) public returns (bool)
\`\`\`

**Impact**: Enabled the ICO boom, DeFi ecosystem, and universal wallet support.

**Lesson**: Simple, well-defined interfaces create network effects.

## ERC-721: Making Digital Ownership Real

**Problem**: ERC-20 tokens are fungible (identical). No way to represent unique items.

**Solution**: Non-Fungible Token (NFT) standard where each token is unique.

### Innovation
- Each token has a unique identifier
- Metadata can describe the token's properties
- Ownership transfer mechanisms
- Approval systems for marketplaces

**Impact**: Created the NFT market, digital art revolution, and gaming assets.

**Lesson**: Sometimes you need a completely different approach, not just an improvement.

## EIP-1559: Revolutionizing Gas Fees

**Problem**: Unpredictable gas fees, poor user experience, and economic inefficiencies.

**Solution**: Base fee + priority fee model with fee burning.

### Mechanism
- **Base Fee**: Automatically adjusted by protocol
- **Priority Fee**: Optional tip to miners
- **Fee Burning**: Base fees are destroyed, reducing ETH supply

**Before EIP-1559**:
- Users bid for gas in a first-price auction
- Extreme fee volatility
- Poor fee estimation

**After EIP-1559**:
- More predictable fees
- Better user experience
- Deflationary pressure on ETH

**Impact**: Improved usability and made ETH deflationary during high usage periods.

**Lesson**: Protocol-level changes can solve user experience problems that applications can't fix.

## EIP-4844: Proto-Danksharding

**Problem**: Ethereum's limited throughput makes Layer 2 solutions expensive.

**Solution**: Introduce "blob" transactions that provide cheap data availability.

### Technical Innovation
- New transaction type carrying large data blobs
- Blobs are only kept temporarily (not forever)
- Significantly cheaper than calldata
- Enables cheaper Layer 2 operations

**Impact**: Made Layer 2 solutions like Arbitrum and Optimism much more affordable.

**Lesson**: Sometimes you need to think outside existing paradigms to solve scalability.

## Common Success Patterns

### 1. Clear Problem-Solution Fit
Each successful EIP addressed a real, widely-felt problem with a clear solution.

### 2. Right Timing
- ERC-20: During early Ethereum adoption
- EIP-1559: When gas fees became a major UX issue
- EIP-4844: When Layer 2 solutions needed better economics

### 3. Implementation Before Finalization
All had working implementations that people could test and use.

### 4. Community Champion
Each had dedicated advocates who built consensus over time.

### 5. Backwards Compatibility
When possible, they maintained compatibility with existing systems.

## Learning from Failures

**EIP-999**: Proposed to restore funds from the Parity wallet bug.
- **Why it failed**: Community philosophical opposition to irregular state changes
- **Lesson**: Technical feasibility doesn't guarantee acceptance

**Various "Ethereum Killers"**: EIPs that proposed radical changes
- **Why they failed**: Too disruptive, insufficient community support
- **Lesson**: Evolution usually beats revolution

---

**Successful EIPs solve real problems, have strong technical merit, build community consensus, and often create positive network effects that extend far beyond their original scope.**
    `
  },
  7: {
    id: 7,
    title: 'Reading EIPs Like a Pro',
    duration: '15 min',
    type: 'reading',
    content: `
# Reading EIPs Like a Pro

EIPs can be dense and technical. Here's how to read them efficiently and extract the information you need.

## The Strategic Reading Approach

### 1. Start with Context (2 minutes)
- **Title + Abstract**: What problem is this solving?
- **Status**: Is this active, final, or historical?
- **Type**: Core change, application standard, or informational?
- **Authors**: Who's behind this? Known experts?

### 2. Understand the Why (5 minutes)
- **Motivation section**: Read this completely
- Why do we need this change?
- What's broken or missing currently?
- What benefits are promised?

### 3. Skim the How (Variable time)
- **Specification**: This is often the longest section
- Don't try to understand every detail on first read
- Look for key concepts and data structures
- Focus on interfaces and APIs if you're a developer

### 4. Learn from Decisions (3 minutes)
- **Rationale**: Why this approach vs alternatives?
- What trade-offs were made?
- Security considerations?

## Reading Strategies by EIP Type

### Core EIPs (Protocol Changes)
**Focus on**: Consensus implications, hard fork requirements, performance impact
**Questions to ask**: 
- How does this change validation rules?
- What's the migration path?
- Are there any breaking changes?

### Interface/ERC EIPs (Application Standards)
**Focus on**: API design, interoperability, implementation examples
**Questions to ask**:
- How will this integrate with existing applications?
- What new capabilities does this enable?
- Are there reference implementations?

### Informational EIPs
**Focus on**: Best practices, community guidelines, design patterns
**Questions to ask**:
- What problems is this addressing?
- How can I apply this to my projects?
- What are the recommended practices?

## Technical Reading Tips

### Understand the Jargon
- **MUST/SHOULD/MAY**: RFC 2119 keywords indicating requirement levels
- **Backwards compatible**: Won't break existing code
- **Hard fork**: Requires network upgrade
- **Gas cost**: Computational expense

### Code Examples
- Always included in good EIPs
- Start with simple examples
- Trace through the logic
- Think about edge cases

### State Changes
- How does this modify Ethereum's state?
- What new data structures are introduced?
- How is backwards compatibility maintained?

## Red Flags to Watch For

### Vague Specifications
- "Should be more efficient" without metrics
- Missing error conditions
- Incomplete API definitions

### Insufficient Rationale
- No explanation of design choices
- Missing alternatives analysis
- Lack of security considerations

### Community Issues
- Low engagement in discussions
- Significant unresolved objections
- Long periods of inactivity

## Practical Exercise: Reading EIP-1559

Let's apply this framework to EIP-1559:

**Context**: London hard fork, gas fee reform, Vitalik Buterin involved
**Motivation**: User experience problems with gas estimation
**Specification**: Base fee + priority fee, fee burning mechanism
**Rationale**: Better UX, economic benefits, alternatives considered

**Key insight**: This isn't just a technical change, it's an economic redesign of Ethereum's fee market.

## Building Your EIP Reading Skills

### Start Simple
- Begin with finalized ERC standards (ERC-20, ERC-721)
- Move to informational EIPs
- Gradually tackle core protocol EIPs

### Active Reading
- Take notes on key concepts
- Draw diagrams for complex flows
- Implement simple examples
- Discuss with others

### Stay Current
- Follow EIP discussions on GitHub
- Join Ethereum community calls
- Read EIP summaries from trusted sources

---

**Effective EIP reading is a skill that improves with practice. Start with your areas of interest and gradually expand your scope.**
    `
  },
  8: {
    id: 8,
    title: 'Draft Your First EIP',
    duration: '45 min',
    type: 'interactive',
    content: `
# Draft Your First EIP: Hands-On Workshop

Now it's time to put everything together and draft your first EIP using EIPsInsight's Proposal Builder.

## Workshop Overview

In this hands-on session, we'll:
1. Identify a real problem to solve
2. Research existing solutions
3. Design a proposal
4. Write the EIP draft
5. Review and refine

## Step 1: Problem Identification (10 minutes)

### Common Areas for EIP Ideas
- **Developer Experience**: Tools, APIs, debugging
- **User Experience**: Wallet interactions, gas estimation
- **Security**: New attack vectors, protection mechanisms
- **Scalability**: Layer 2 improvements, optimization
- **Interoperability**: Cross-chain, cross-application standards

### Problem Statement Template
"Currently, [describe current situation]. This causes [specific problems]. The impact is [quantify impact]. A solution would [describe benefits]."

### Example Problem
"Currently, there's no standard way for dApps to request specific wallet permissions. This causes users to grant excessive permissions and creates security risks. The impact is reduced user trust and potential fund loss. A solution would provide granular permission management."

## Step 2: Research Phase (10 minutes)

### Questions to Answer
- Has this been attempted before?
- What existing EIPs are related?
- Who else has this problem?
- Are there partial solutions?
- What would adoption look like?

### Research Tools
- **EIPs.ethereum.org**: Search existing EIPs
- **Ethereum Magicians**: Community discussions
- **GitHub Issues**: Developer pain points
- **Discord/Telegram**: Community feedback

## Step 3: Solution Design (15 minutes)

### Design Principles
- **Simplicity**: Easiest solution that works
- **Compatibility**: Don't break existing code
- **Extensibility**: Allow future improvements
- **Security**: Consider attack vectors
- **Adoption**: Make it easy to implement

### Solution Template
1. **Core Interface**: What functions/events are needed?
2. **Data Structures**: How is information stored?
3. **Workflow**: Step-by-step process
4. **Error Handling**: What can go wrong?
5. **Gas Costs**: Computational efficiency

## Step 4: Writing Your EIP (10 minutes)

### Using EIPsInsight's Proposal Builder

The Proposal Builder provides:
- **Template Generation**: Automatically creates proper EIP structure
- **Syntax Checking**: Ensures compliance with EIP-1
- **Example Library**: Reference implementations and patterns
- **Community Integration**: Connect with reviewers and implementers

### Essential Sections to Complete

**Abstract** (50 words max):
Write a 2-3 sentence summary that describes your proposed standard interface, its key capabilities, main benefits, and compatibility considerations.

**Motivation** (200-300 words):
- Current problem
- Why existing solutions are insufficient  
- Benefits of proposed solution
- Use cases

**Specification** (As detailed as needed):
- Interface definitions
- Data structures
- Algorithms
- Error conditions

## Step 5: Review and Refinement

### Self-Review Checklist
- [ ] Problem clearly stated?
- [ ] Solution addresses the problem?
- [ ] Specification complete enough to implement?
- [ ] Backwards compatibility considered?
- [ ] Security implications addressed?
- [ ] Examples provided?

### Getting Community Feedback
1. **Ethereum Magicians**: Post for initial feedback
2. **GitHub Draft**: Submit as draft EIP
3. **Developer Communities**: Share in relevant Discord/Telegram
4. **Implementation**: Build a proof of concept

## Sample EIP Outline: ERC-XXXX Permission Management

Here's an example of how your EIP might look:

**Header Section:**
- EIP: XXXX  
- Title: Granular dApp Permission Standard
- Author: Your Name
- Status: Draft
- Type: Standards Track
- Category: ERC

**Abstract:** A standard interface for dApps to request specific permissions from wallets, enabling users to grant granular access rights instead of blanket approvals.

**Specification Example:**
- requestPermission function for permission requests
- revokePermission function for removing access  
- hasPermission function for checking current permissions

This creates a foundation for safer wallet interactions.

## Next Steps After Workshop

1. **Refine Your Draft**: Incorporate feedback and add details
2. **Build a Prototype**: Create reference implementation
3. **Engage Community**: Present at Ethereum calls or conferences
4. **Submit Official EIP**: Follow the formal process
5. **Champion Adoption**: Help others implement your standard

---

**Congratulations! You've completed the EIPs 101 course. You now have the knowledge and tools to contribute to Ethereum's evolution through the EIP process.**

## Course Completion

You've mastered:
- ✅ Understanding Ethereum's architecture and EIP system
- ✅ Reading and analyzing existing EIPs
- ✅ Writing well-structured proposals
- ✅ Using EIPsInsight's tools for EIP development
- ✅ Engaging with the Ethereum community

**Ready to claim your EIP Expert NFT badge!**
    `
  }
};

interface LessonViewerProps {
  moduleId: string;
}

export default function LessonViewer({ moduleId }: LessonViewerProps) {
  const [lesson, setLesson] = useState<LessonContent | null>(null);
  const [completedModules, setCompletedModules] = useState<Set<number>>(new Set());

  const moduleNumber = parseInt(moduleId);
  const totalModules = Object.keys(lessonContents).length;

  useEffect(() => {
    const currentLesson = lessonContents[moduleNumber];
    if (currentLesson) {
      setLesson(currentLesson);
    }
    
    // Load completed modules from localStorage
    const saved = localStorage.getItem('eips-101-completed');
    if (saved) {
      setCompletedModules(new Set(JSON.parse(saved)));
    }
  }, [moduleNumber]);

  const markAsCompleted = () => {
    const newCompleted = new Set([...completedModules, moduleNumber]);
    setCompletedModules(newCompleted);
    localStorage.setItem('eips-101-completed', JSON.stringify([...newCompleted]));
  };

  const goToNextLesson = () => {
    if (moduleNumber < totalModules) {
      window.location.href = `/courses/eips-101/lesson/${moduleNumber + 1}`;
    } else {
      window.location.href = '/courses/eips-101';
    }
  };

  const goToPreviousLesson = () => {
    if (moduleNumber > 1) {
      window.location.href = `/courses/eips-101/lesson/${moduleNumber - 1}`;
    } else {
      window.location.href = '/courses/eips-101';
    }
  };

  if (!lesson) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Lesson Not Found</h1>
          <Button onClick={() => window.location.href = '/courses/eips-101'}>
            Back to Course
          </Button>
        </div>
      </div>
    );
  }

  const completionPercentage = (completedModules.size / totalModules) * 100;

  return (
    <div className="bg-background relative w-full overflow-hidden min-h-screen">
      {/* Background effects */}
      <div className="absolute inset-0 z-0">
        <div className="from-purple-400/10 via-background to-background absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))]"></div>
        <div className="bg-cyan-300/5 absolute top-0 left-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-20">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-cyan-400 hover:text-cyan-300"
                  onClick={() => window.location.href = '/courses/eips-101'}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Course
                </Button>
                <div className="text-sm text-slate-400">
                  Module {lesson.id} of {totalModules}
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-sm text-slate-400">
                  Progress: {Math.round(completionPercentage)}%
                </div>
                <Progress value={completionPercentage} className="w-24 h-2" />
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Lesson Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex items-center gap-4 mb-4">
              <Badge variant="secondary" className={`
                ${lesson.type === 'reading' 
                  ? 'bg-cyan-500/10 text-cyan-300 border-cyan-400/20' 
                  : 'bg-purple-500/10 text-purple-300 border-purple-400/20'
                }
              `}>
                {lesson.type === 'reading' ? 'Reading' : 'Interactive'}
              </Badge>
              <div className="flex items-center gap-1 text-slate-400">
                <Clock className="h-4 w-4" />
                {lesson.duration}
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent mb-4">
              {lesson.title}
            </h1>
          </motion.div>

          {/* Lesson Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-cyan-400/20 mb-8">
              <CardContent className="p-8">
                <div 
                  className="prose prose-invert prose-cyan max-w-none
                    prose-headings:font-bold prose-headings:leading-tight
                    prose-h1:text-4xl prose-h1:mb-8 prose-h1:mt-0 prose-h1:text-white prose-h1:font-extrabold
                    prose-h2:text-3xl prose-h2:mb-6 prose-h2:mt-8 prose-h2:text-cyan-300 prose-h2:font-bold
                    prose-h3:text-2xl prose-h3:mb-4 prose-h3:mt-6 prose-h3:text-emerald-300 prose-h3:font-semibold
                    prose-p:text-lg prose-p:text-slate-300 prose-p:leading-relaxed prose-p:mb-6
                    prose-strong:text-xl prose-strong:text-cyan-200 prose-strong:font-bold
                    prose-code:text-cyan-300 prose-code:bg-slate-800 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-base
                    prose-pre:bg-slate-800 prose-pre:border prose-pre:border-slate-700 prose-pre:rounded-lg prose-pre:p-4
                    prose-ul:text-lg prose-ul:text-slate-300 prose-ul:space-y-2 prose-ul:mb-6
                    prose-ol:text-lg prose-ol:text-slate-300 prose-ol:space-y-2 prose-ol:mb-6
                    prose-li:leading-relaxed prose-li:mb-2
                    prose-a:text-cyan-400 prose-a:no-underline prose-a:font-medium hover:prose-a:text-cyan-300
                    prose-blockquote:border-l-4 prose-blockquote:border-purple-400 prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-purple-200"
                  dangerouslySetInnerHTML={{ 
                    __html: (() => {
                      const lines = lesson.content.split('\n');
                      const result: string[] = [];
                      let inCodeBlock = false;
                      let inList = false;
                      let listType = '';
                      let codeBlockContent: string[] = [];
                      
                      for (let i = 0; i < lines.length; i++) {
                        const line = lines[i];
                        
                        // Handle code blocks first
                        if (line.trim() === '```' || line.startsWith('```')) {
                          if (!inCodeBlock) {
                            inCodeBlock = true;
                            // Start code block
                            codeBlockContent = [];
                            continue;
                          } else {
                            inCodeBlock = false;
                            result.push(`<pre class="bg-slate-950 border border-slate-700 rounded-lg p-4 my-4 overflow-x-auto"><code class="text-emerald-300">${codeBlockContent.join('\n')}</code></pre>`);
                            codeBlockContent = [];
                            continue;
                          }
                        }
                        
                        if (inCodeBlock) {
                          codeBlockContent.push(line);
                          continue;
                        }
                        
                        // Close existing list if we're not in a list item anymore
                        if (inList && !line.startsWith('- ') && !line.match(/^\d+\. /) && line.trim() !== '') {
                          result.push(listType === 'ul' ? '</ul>' : '</ol>');
                          inList = false;
                          listType = '';
                        }
                        
                        // Convert markdown headers
                        if (line.startsWith('### ')) {
                          result.push(`<h3 class="text-2xl font-semibold text-emerald-300 mb-4 mt-8">${line.slice(4)}</h3>`);
                        }
                        else if (line.startsWith('## ')) {
                          result.push(`<h2 class="text-3xl font-bold text-cyan-300 mb-6 mt-10">${line.slice(3)}</h2>`);
                        }
                        else if (line.startsWith('# ')) {
                          result.push(`<h1 class="text-4xl font-extrabold text-white mb-8 mt-0">${line.slice(2)}</h1>`);
                        }
                        // Handle lists properly
                        else if (line.startsWith('- ')) {
                          if (!inList || listType !== 'ul') {
                            if (inList) result.push('</ol>');
                            result.push('<ul class="list-none space-y-3 my-6 ml-6">');
                            inList = true;
                            listType = 'ul';
                          }
                          const content = line.slice(2);
                          const processedContent = content
                            .replace(/\*\*(.*?)\*\*/g, '<strong class="text-cyan-200">$1</strong>')
                            .replace(/`([^`]+)`/g, '<code class="bg-slate-800 text-emerald-300 px-2 py-1 rounded">$1</code>');
                          result.push(`<li class="flex items-start gap-3"><div class="w-2 h-2 bg-cyan-400 rounded-full mt-3 flex-shrink-0"></div><span class="text-lg text-slate-300">${processedContent}</span></li>`);
                        }
                        else if (line.match(/^\d+\. /)) {
                          if (!inList || listType !== 'ol') {
                            if (inList) result.push('</ul>');
                            result.push('<ol class="list-none space-y-3 my-6 ml-6">');
                            inList = true;
                            listType = 'ol';
                          }
                          const content = line.replace(/^\d+\. /, '');
                          const processedContent = content
                            .replace(/\*\*(.*?)\*\*/g, '<strong class="text-cyan-200 font-bold">$1</strong>')
                            .replace(/`([^`]+)`/g, '<code class="bg-slate-900 text-cyan-400 px-2 py-1 rounded border border-white/5">$1</code>');
                          const number = line.match(/^(\d+)\./)?.[1] || '1';
                          result.push(`<li class="flex items-start gap-4 mb-3"><span class="text-xl font-black text-cyan-400 mt-1 flex-shrink-0 min-w-[1.5rem] tracking-tighter">${number}.</span><span class="text-lg text-slate-300 leading-relaxed">${processedContent}</span></li>`);
                        }
                        // Handle blockquotes
                        else if (line.startsWith('> ')) {
                          result.push(`<blockquote class="border-l-4 border-cyan-400/30 pl-8 py-6 bg-cyan-400/5 italic my-10 rounded-r-2xl"><p class="text-xl text-slate-200 leading-relaxed">${line.slice(2)}</p></blockquote>`);
                        }
                        // Handle horizontal rules
                        else if (line.trim() === '---') {
                          result.push('<hr class="border-slate-800/50 my-12" />');
                        }
                        // Handle empty lines
                        else if (line.trim() === '') {
                          result.push('<div class="h-6"></div>');
                        }
                        // Handle regular paragraphs
                        else if (line.trim().length > 0) {
                          // Process inline markdown
                          const processedLine = line
                            .replace(/\*\*(.*?)\*\*/g, '<strong class="text-cyan-200 font-bold">$1</strong>')
                            .replace(/\*([^*]+)\*/g, '<em class="italic text-slate-200">$1</em>')
                            .replace(/`([^`]+)`/g, '<code class="bg-slate-900 text-cyan-400 px-2 py-1 rounded border border-white/5 text-sm">$1</code>')
                            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="text-cyan-400 hover:text-cyan-300 underline font-medium">$1</a>');
                          
                          result.push(`<p class="text-lg text-slate-300 leading-relaxed mb-6">${processedLine}</p>`);
                        }
                      }
                      
                      // Close any remaining lists
                      if (inList) {
                        result.push(listType === 'ul' ? '</ul>' : '</ol>');
                      }
                      
                      return result.join('');
                    })()
                  }}
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex items-center justify-between mt-8"
          >
            <Button
              variant="outline" 
              onClick={goToPreviousLesson}
              disabled={moduleNumber === 1}
              className="border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white rounded-xl"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous Lesson
            </Button>

            <div className="flex items-center gap-4">
              {!completedModules.has(moduleNumber) && (
                <Button
                  onClick={markAsCompleted}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mark Complete
                </Button>
              )}

              {completedModules.has(moduleNumber) && (
                <div className="flex items-center gap-2 text-cyan-400 px-4 py-2 bg-cyan-400/10 rounded-xl border border-cyan-400/20">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Completed</span>
                </div>
              )}

              <Button
                onClick={goToNextLesson}
                className="bg-purple-600 hover:bg-purple-500 text-white rounded-xl"
              >
                {moduleNumber === totalModules ? 'Finish Course' : 'Next Lesson'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}