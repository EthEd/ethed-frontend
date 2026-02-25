export const eips101Content: Record<number, string> = {
  1: "Watch the 10‑minute intro video, then continue with the lessons below.",
  2: `
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
`,
  3: `
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
`,
  4: `
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

## Success Factors- Persistence through feedback cycles

---

**The lifecycle ensures that only well-thought-out, community-supported changes make it into Ethereum.**
`,
  5: `
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

---

**A well-structured EIP is like a good blueprint - detailed enough for implementation, clear enough for review, and compelling enough for adoption.**
`,
  6: `
# Famous EIP Case Studies

Let's examine some of the most impactful EIPs to understand what makes them successful and how they shaped Ethereum.

## ERC-20: The Token That Changed Everything

**Problem**: In early Ethereum, every token contract had different interfaces. Wallets couldn't universally support tokens.

**Solution**: A standard interface that all tokens could implement.

**Impact**: Enabled the ICO boom, DeFi ecosystem, and universal wallet support.

**Lesson**: Simple, well-defined interfaces create network effects.

## ERC-721: Making Digital Ownership Real

**Problem**: ERC-20 tokens are fungible (identical). No way to represent unique items.

**Solution**: Non-Fungible Token (NFT) standard where each token is unique.

**Impact**: Created the NFT market, digital art revolution, and gaming assets.

**Lesson**: Sometimes you need a completely different approach, not just an improvement.

## EIP-1559: Revolutionizing Gas Fees

**Problem**: Unpredictable gas fees, poor user experience, and economic inefficiencies.

**Solution**: Base fee + priority fee model with fee burning.

**Impact**: Improved usability and made ETH deflationary during high usage periods.

**Lesson**: Protocol-level changes can solve user experience problems that applications can't fix.

---

**Successful EIPs solve real problems, have strong technical merit, build community consensus, and often create positive network effects that extend far beyond their original scope.**
`,
  7: `
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

---

**Effective EIP reading is a skill that improves with practice. Start with your areas of interest and gradually expand your scope.**
`,
  8: `
# Draft Your First EIP: Hands-On Workshop

Now it's time to put everything together and draft your first EIP using EthEd's Proposal Builder.

## Step 1: Problem Identification (10 minutes)

### Common Areas for EIP Ideas
- **Developer Experience**: Tools, APIs, debugging
- **User Experience**: Wallet interactions, gas estimation
- **Security**: New attack vectors, protection mechanisms

### Step 2: Research Phase (10 minutes)

### Step 3: Solution Design (15 minutes)

### Step 4: Writing Your EIP (10 minutes)

### Step 5: Review and Refinement

---

**Congratulations! You've completed the EIPs 101 course. You now have the knowledge and tools to contribute to Ethereum's evolution through the EIP process.**
`,
  9: "Answer the short quiz. Score ≥ 70% to mint the EIP Expert NFT."
};

export const ens101Content: Record<number, string> = {
  1: "Intro to Ethereum Name Service and why it matters",
  2: `
# Registering Your First ENS Name

ENS makes it easy to get a human-readable name for your Ethereum address.

## Steps to Register

1. Go to app.ens.domains
2. Connect your wallet
3. Search for your desired .eth name
4. Register and pay the fee

**Tip:** Choose a name that represents you or your project!

## Why Register?

- Easier to share your address
- Use with dApps  
- Build your Web3 identity

> Remember: Your ENS name is your digital identity in Web3!`,
  3: "How to resolve ENS names in your app using ethers.js",
  4: "Test your knowledge of ENS concepts"
};
