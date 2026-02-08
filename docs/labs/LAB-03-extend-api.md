# LAB-03: Extend API with New Property

## 🎯 Objective

Learn the **full vertical slice** of Clean Architecture by adding a new "Notes" field to the Employee entity. This lab demonstrates the complete workflow: **Domain → Migration → Application → Testing**.

---

## 📋 Prerequisites

**Completed:**
- ✅ [LAB-01: Verify Setup](LAB-01-verify-setup.md)
- ✅ [LAB-02: Inspect JWT Tokens](LAB-02-inspect-tokens.md)

**Time Required:** 30-40 minutes

---

## 🚀 Steps

### Step 1: Add Property to Domain Entity

File: `TalentManagementAPI.Domain/Entities/Employee.cs`

Add after the `Phone` property:

```csharp
/// <summary>
/// Internal notes about the employee (max 500 characters).
/// </summary>
public string Notes { get; set; }
```

### Step 2: Create Migration

```bash
cd ApiResources/TalentManagement-API
dotnet ef migrations add AddNotesToEmployee --project TalentManagementAPI.Infrastructure.Persistence --startup-project TalentManagementAPI.WebApi
```

### Step 3: Apply Migration

```bash
dotnet ef database update --project TalentManagementAPI.Infrastructure.Persistence --startup-project TalentManagementAPI.WebApi
```

### Step 4: Update Commands

Add to `CreateEmployeeCommand.cs` and `UpdateEmployeeCommand.cs`:

```csharp
public string Notes { get; set; }
```

### Step 5: Add Validation

In `CreateEmployeeCommandValidator.cs`:

```csharp
RuleFor(v => v.Notes)
    .MaximumLength(500).WithMessage("Notes must not exceed 500 characters.");
```

### Step 6: Test in Swagger

1. Rebuild: `dotnet build`
2. Run: `dotnet run --project TalentManagementAPI.WebApi`
3. Test at: `https://localhost:44378/swagger`

---

## ✅ Verification

- [ ] Migration created and applied
- [ ] API builds without errors
- [ ] Swagger shows `notes` field
- [ ] Can create employee with notes
- [ ] Validation works (501+ chars rejected)

---

*[LAB-04: Build Angular Component →](LAB-04-build-component.md)*
