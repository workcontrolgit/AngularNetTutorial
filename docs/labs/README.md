# Hands-On Labs: CAT Pattern Tutorial Series

## 🎯 Overview

These hands-on labs complement the main tutorial series by providing practical, step-by-step exercises using the **actual TalentManagement source code**. Each lab builds your skills progressively, from setup verification to advanced deployment scenarios.

---

## 📋 Lab Structure

Each lab follows this format:
- **Objective:** What you'll learn
- **Prerequisites:** What you need before starting
- **Duration:** Expected time to complete
- **Steps:** Detailed instructions with file paths
- **Verification Checklist:** How to confirm success
- **Troubleshooting:** Common issues and solutions
- **Bonus Challenges:** Optional advanced tasks

---

## 🗂️ Lab Series

### Foundation Labs

#### [LAB-01: Verify Setup & First Code Change](LAB-01-verify-setup.md) ⭐ **START HERE**
**Duration:** 15 minutes
**Difficulty:** Beginner
**Goal:** Confirm your development environment works and make your first code change

**You'll learn:**
- How to verify all three services are running correctly
- How to make a simple UI change and see hot-reload in action
- How to inspect network requests in browser DevTools
- How to navigate the project structure

**Prerequisites:**
- Completed Part 1: Foundation tutorial
- All three services running (IdentityServer, API, Angular)

---

### Authentication & Security Labs

#### [LAB-02: Inspect JWT Tokens with DevTools](LAB-02-inspect-tokens.md) ⭐ **ESSENTIAL**
**Duration:** 20 minutes
**Difficulty:** Beginner
**Goal:** Understand OAuth 2.0/OIDC authentication by inspecting actual tokens

**You'll learn:**
- How to capture access tokens from HTTP requests
- How to decode and inspect JWT token contents
- How to modify token lifetime and test expiration
- How to debug authentication issues using browser DevTools

**Prerequisites:**
- Completed Part 2: Token Service Deep Dive tutorial
- LAB-01 completed
- Familiarity with browser DevTools

---

### Backend Development Labs

#### [LAB-03: Extend API with New Property](LAB-03-extend-api.md) ⭐ **ESSENTIAL**
**Duration:** 30 minutes
**Difficulty:** Intermediate
**Goal:** Learn the full vertical slice by adding a new "Notes" field to Employee

**You'll learn:**
- How to extend domain entities
- How to create and apply Entity Framework migrations
- How to update commands, validators, and handlers
- How to test API changes using Swagger
- How Clean Architecture layers interact

**Prerequisites:**
- Completed Part 3: API Resource Deep Dive tutorial
- LAB-01 and LAB-02 completed
- Basic C# and EF Core knowledge

---

### Frontend Development Labs

#### [LAB-04: Build Angular Search Component](LAB-04-build-component.md) ⭐ **ESSENTIAL**
**Duration:** 45 minutes
**Difficulty:** Intermediate
**Goal:** Create a reusable search component with Material Design

**You'll learn:**
- How to generate standalone Angular components
- How to use Material Design form components
- How to implement component communication with @Output
- How to integrate with API services using RxJS
- How to handle query parameters and pagination

**Prerequisites:**
- Completed Part 4: Angular Client Deep Dive tutorial
- LAB-03 completed (API must be working)
- Basic Angular and TypeScript knowledge

---

### Testing & Quality Labs

#### [LAB-05: Write Unit Tests](LAB-05-write-tests.md) 📝 **IMPORTANT**
**Duration:** 30 minutes
**Difficulty:** Intermediate
**Goal:** Implement test-driven development practices

**You'll learn:**
- How to write FluentValidation tests for commands
- How to write Angular service tests with mocks
- How to write component tests using TestBed
- How to run tests and interpret results

**Prerequisites:**
- Completed Part 3 and Part 4 tutorials
- LAB-03 and LAB-04 completed
- Understanding of unit testing concepts

---

### DevOps & Deployment Labs

#### [LAB-06: Docker Containerization](LAB-06-docker-deploy.md) 🐳 **VALUABLE**
**Duration:** 40 minutes
**Difficulty:** Advanced
**Goal:** Containerize the application using Docker

**You'll learn:**
- How to build Docker images for each service
- How to create docker-compose configuration
- How to run the full stack in containers
- How to debug containerization issues
- How to prepare for production deployment

**Prerequisites:**
- Completed Part 5: Advanced Topics tutorial
- Docker Desktop installed and running
- All previous labs completed

---

## 🎓 Learning Paths

### Path 1: Quick Start (Minimum Viable Understanding)
**Time:** 1-2 hours
**Labs:** LAB-01 → LAB-02
**Outcome:** Environment working, basic understanding of authentication

### Path 2: Full Stack Developer (Comprehensive)
**Time:** 3-4 hours
**Labs:** LAB-01 → LAB-02 → LAB-03 → LAB-04
**Outcome:** Can build features across all three tiers

### Path 3: Production Ready (Complete Mastery)
**Time:** 5-6 hours
**Labs:** All labs (LAB-01 through LAB-06)
**Outcome:** Ready to deploy and maintain the application

---

## 📁 Folder Structure

```
docs/labs/
├── README.md                          (this file)
├── LAB-01-verify-setup.md            (Foundation)
├── LAB-02-inspect-tokens.md          (Authentication)
├── LAB-03-extend-api.md              (Backend)
├── LAB-04-build-component.md         (Frontend)
├── LAB-05-write-tests.md             (Testing)
├── LAB-06-docker-deploy.md           (DevOps)
│
└── solutions/                         (Lab answers & hints)
    ├── lab-01-solution.md
    ├── lab-02-solution.md
    ├── lab-03-solution.md
    ├── lab-04-solution.md
    ├── lab-05-solution.md
    └── lab-06-solution.md
```

---

## 🆘 Getting Help

### During Labs

Each lab includes:
- **Verification Checklist:** Confirm you completed each step correctly
- **Troubleshooting Section:** Common errors and solutions
- **File Path References:** Exact locations in the codebase

### If You Get Stuck

1. **Check the Solutions folder:** `labs/solutions/lab-XX-solution.md`
2. **Review the main tutorial:** Ensure you understand the concepts
3. **Check GitHub Issues:** Someone may have encountered the same problem
4. **Ask in Discussions:** Share your issue with the community

---

## 📊 Progress Tracking

Use this checklist to track your lab completion:

- [ ] **LAB-01:** Verify Setup & First Code Change
- [ ] **LAB-02:** Inspect JWT Tokens with DevTools
- [ ] **LAB-03:** Extend API with New Property
- [ ] **LAB-04:** Build Angular Search Component
- [ ] **LAB-05:** Write Unit Tests
- [ ] **LAB-06:** Docker Containerization

**Completion Goal:** 🎉 All 6 labs = You're ready to build production CAT pattern applications!

---

## 🔗 Related Resources

### Tutorial Series
- [Part 1: Foundation](../01-foundation.md)
- [Part 2: Token Service Deep Dive](../02-token-service-deep-dive.md)
- [Part 3: API Resource Deep Dive](../03-api-resource-deep-dive.md)
- [Part 4: Angular Client Deep Dive](../04-angular-client-deep-dive.md)
- [Part 5: Advanced Topics](../05-advanced-topics.md)
- [Part 6: Real-World Features](../06-real-world-features.md)

### Navigation Guides
- [Code Map: Quick Navigation](../CODE-MAP.md) - Find files quickly
- [Tutorial Home](../TUTORIAL.md) - Overview of entire series

### Repository Resources
- [Main README](../../README.md) - Project overview
- [Setup Guide](../../SETUP-SUBMODULES.md) - Git submodules
- [CLAUDE.md](../../CLAUDE.md) - Developer guidance

---

## 💡 Lab Development Philosophy

### Why Hands-On Labs?

**Reading teaches knowledge.**
**Building teaches skill.**

These labs bridge the gap between understanding architecture and actually building features. Each lab:

1. **Uses real source code** - No toy examples, work with the actual project
2. **Provides clear verification** - You know when you've succeeded
3. **Includes troubleshooting** - Common issues addressed proactively
4. **Builds progressively** - Each lab prepares you for the next
5. **Offers bonus challenges** - Extend your learning if you want to go deeper

### Target Outcomes

After completing these labs, you should be able to:
- ✅ Run and debug the application confidently
- ✅ Add new features to any of the three tiers
- ✅ Understand the flow of data through the system
- ✅ Test your changes effectively
- ✅ Deploy the application to production
- ✅ Explain the CAT pattern to your team

---

## 🚀 Ready to Start?

Begin with **[LAB-01: Verify Setup & First Code Change](LAB-01-verify-setup.md)**

This lab ensures your environment is working correctly and gives you confidence that you're ready to proceed.

**Good luck, and happy building!** 🎉

---

*Last Updated: February 2026*
*Part of the [CAT Pattern Tutorial Series](../TUTORIAL.md)*
