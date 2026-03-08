# The Right Way to Ask "Are You Sure?" — Angular Material Dialogs for Confirm Actions

## Building a Delete Confirmation Dialog with MatDialog, Proper Result Handling, and Reuse Across the App

Every app that deletes data needs a confirmation step. The naive approach — a browser `window.confirm()` — is ugly, can't be styled, and doesn't integrate with Angular's change detection. Angular Material's `MatDialog` solves all of this: a fully styled, keyboard-accessible, injectable dialog that returns an Observable result you can act on.

This article builds the `ConfirmDialogComponent` from the **TalentManagement** app — a reusable dialog used in eight places across the codebase (employee list, employee detail, department list, department detail, position list, position detail, salary range list, and salary range detail). You'll see the complete dialog component, how data flows in via `MAT_DIALOG_DATA`, how results flow out via `MatDialogRef`, and the two different patterns for handling the result depending on whether you navigate after deletion.

![Employee CRUD Operations](https://raw.githubusercontent.com/workcontrolgit/AngularNetTutorial/master/docs/images/angular/employee-crud-operations.png)

---

This article is part of the **AngularNetTutorial** series. The full-stack tutorial — covering Angular 20, .NET 10 Web API, and OAuth 2.0 with Duende IdentityServer — has been published at [Building Modern Web Applications with Angular, .NET, and OAuth 2.0](https://medium.com/scrum-and-coke/building-modern-web-applications-with-angular-net-and-oauth-2-0-complete-tutorial-series-7ea97ed3fc56). **This article dives deep into how Angular Material dialogs are used for delete confirmations with proper result handling.**

---

## 📚 What You'll Learn

* The three structural elements every Material dialog needs: `mat-dialog-title`, `mat-dialog-content`, `mat-dialog-actions`
* How `MAT_DIALOG_DATA` passes typed data into the dialog component
* How `MatDialogRef.close(value)` returns a result to the caller
* `cdkFocusInitial` — why the destructive button should get focus, not the cancel button
* Opening a dialog with `MatDialog.open()` and passing config options
* `dialogRef.afterClosed().subscribe()` — the Observable that fires when the dialog closes
* The `if (!confirmed) return;` guard for handling dismiss-without-action
* Two result-handling patterns: reload-the-list vs navigate-with-snackbar

---

## 🏗️ The ConfirmDialogData Interface

The dialog needs to be reusable across many different contexts — deleting an employee, a department, a position. The content (title, message, button labels) comes from the caller, not from the dialog component itself.

A TypeScript interface defines the contract:

```typescript
export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}
```

`title` and `message` are required — every confirmation needs both. `confirmText` and `cancelText` are optional with defaults ("Delete" and "Cancel") applied in the template. The caller decides the wording:

```typescript
// Deleting an employee
data: {
  title: 'Delete Employee',
  message: `Are you sure you want to delete ${name}? This action cannot be undone.`,
  confirmText: 'Delete',
  cancelText: 'Cancel',
}
```

The interface is exported alongside the component — consumers import both from the same file:

```typescript
import { ConfirmDialogComponent, ConfirmDialogData }
  from '../../shared/components/confirm-dialog/confirm-dialog';
```

---

## 🧩 The Dialog Component

The complete `ConfirmDialogComponent` is deliberately minimal:

```typescript
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.html',
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
})
export class ConfirmDialogComponent {
  readonly dialogRef = inject(MatDialogRef<ConfirmDialogComponent>);
  readonly data     = inject<ConfirmDialogData>(MAT_DIALOG_DATA);

  confirm(): void {
    this.dialogRef.close(true);
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
```

### MAT_DIALOG_DATA: Receiving Data

`MAT_DIALOG_DATA` is an injection token that carries whatever object the caller passed in the `data` config option. Using `inject<ConfirmDialogData>(MAT_DIALOG_DATA)` gives the component typed access to the caller's data object — no `@Input()` decorators, no component bindings.

```typescript
readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
```

In the template, `data.title`, `data.message`, `data.confirmText`, and `data.cancelText` are all accessible directly.

### MatDialogRef: Returning a Result

`MatDialogRef<ConfirmDialogComponent>` is the handle for the currently open dialog. Calling `.close(value)` closes the dialog and emits `value` through the `afterClosed()` Observable on the caller's side.

```typescript
confirm(): void { this.dialogRef.close(true); }
cancel(): void  { this.dialogRef.close(false); }
```

The caller receives `true` if the user confirmed, `false` if they cancelled, and `undefined` if they clicked outside the dialog or pressed Escape (Material's default dismiss behavior).

---

## 🎨 The Dialog Template

```html
<h2 mat-dialog-title>
  <mat-icon color="warn" style="vertical-align: middle; margin-right: 8px;">
    warning
  </mat-icon>
  {{ data.title }}
</h2>

<mat-dialog-content>
  <p>{{ data.message }}</p>
</mat-dialog-content>

<mat-dialog-actions align="end">
  <button mat-button (click)="cancel()">
    {{ data.cancelText || 'Cancel' }}
  </button>
  <button mat-raised-button color="warn" (click)="confirm()" cdkFocusInitial>
    {{ data.confirmText || 'Delete' }}
  </button>
</mat-dialog-actions>
```

### The Three Structural Elements

**`mat-dialog-title`** (on the `<h2>`) — marks the element as the dialog title for accessibility. Screen readers announce this as the dialog's label. Material styles it with the correct typography.

**`mat-dialog-content`** — the scrollable body of the dialog. If the content is taller than the dialog allows, this section scrolls while the title and actions stay fixed.

**`mat-dialog-actions`** — the footer area containing action buttons. `align="end"` right-aligns the buttons, following Material Design conventions for dialogs.

### Default Button Labels

```html
{{ data.cancelText || 'Cancel' }}
{{ data.confirmText || 'Delete' }}
```

The `||` fallback means callers don't have to pass button labels if the defaults work. A delete confirmation that doesn't need custom labels can omit `confirmText` and `cancelText` from the `data` object entirely.

### cdkFocusInitial: Accessibility

```html
<button mat-raised-button color="warn" (click)="confirm()" cdkFocusInitial>
```

`cdkFocusInitial` (from Angular CDK) sets keyboard focus on this button when the dialog opens. For a delete confirmation, the destructive action button — not Cancel — gets initial focus. This is a deliberate UX choice: users who accidentally opened the dialog can immediately press Enter to confirm, which is the expected behavior. Users who want to cancel must move focus explicitly.

Without `cdkFocusInitial`, focus goes to the first focusable element in the dialog (usually the first button). In this layout, that would be Cancel — which would make accidental Enter presses safe but require tab-navigation to reach Confirm.

---

## 🚀 Opening the Dialog

On the caller side, `MatDialog` is injected and `open()` is called with the component class and config:

```typescript
private dialog = inject(MatDialog);

deleteEmployee(employee: Employee): void {
  const name = this.getFullName(employee);

  const dialogRef = this.dialog.open(ConfirmDialogComponent, {
    width: '400px',
    data: {
      title: 'Delete Employee',
      message: `Are you sure you want to delete ${name}? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
    } as ConfirmDialogData,
  });

  dialogRef.afterClosed().subscribe(confirmed => {
    if (!confirmed) return;
    // proceed with deletion
  });
}
```

**`width: '400px'`** — sets the dialog panel width. Without this, Material uses a default width that may be too narrow or too wide depending on the content.

**`data: { ... } as ConfirmDialogData`** — the object passed as `MAT_DIALOG_DATA` inside the dialog. The `as ConfirmDialogData` cast documents the intent without adding runtime overhead.

**`dialogRef.afterClosed()`** — returns a cold Observable that emits once when the dialog closes, with the value passed to `MatDialogRef.close()`. Subscribing here handles the result.

---

## ✅ Two Result-Handling Patterns

The app uses `ConfirmDialogComponent` in two distinct contexts, each with a different post-delete flow.

### Pattern 1: Delete from a List — Reload the Table

The employee list stays on the same page after deletion, so it just reloads:

```typescript
dialogRef.afterClosed().subscribe(confirmed => {
  if (!confirmed) return;   // user cancelled or dismissed — do nothing

  this.employeeService.delete(employee.id).subscribe({
    next: () => {
      this.snackBar.open(`${name} has been deleted.`, 'Close', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
      });
      this.loadEmployees();   // refresh the table
    },
    error: error => {
      console.error('Error deleting employee:', error);
      this.snackBar.open(
        'Failed to delete employee. Please try again.',
        'Close',
        { duration: 4000, horizontalPosition: 'end', verticalPosition: 'top' }
      );
    },
  });
});
```

**`if (!confirmed) return;`** — the most important line. `afterClosed()` fires for every close event: button click, Escape key, clicking the backdrop. The `confirmed` value is `false` for Cancel and `undefined` for Escape/backdrop. `!confirmed` catches both — only a `true` value proceeds to the API call.

### Pattern 2: Delete from a Detail Page — Navigate Away

The detail page shows a single employee. After deletion, there's nothing left to show — navigate to the list. But navigation should happen after the snackbar has had a chance to appear:

```typescript
dialogRef.afterClosed().subscribe(confirmed => {
  if (!confirmed) return;

  this.employeeService.delete(this.employee!.id).subscribe({
    next: () => {
      const snackBarRef = this.snackBar.open(
        `${name} has been deleted.`,
        'Close',
        { duration: 3000, horizontalPosition: 'end', verticalPosition: 'top' }
      );

      // Navigate after snackbar dismisses automatically
      snackBarRef.afterDismissed().subscribe(
        () => this.router.navigate(['/employees'])
      );
      // OR navigate immediately if user clicks "Close"
      snackBarRef.onAction().subscribe(
        () => this.router.navigate(['/employees'])
      );
    },
    error: error => { /* ... */ }
  });
});
```

`snackBarRef.afterDismissed()` fires when the snackbar disappears (after 3 seconds). `snackBarRef.onAction()` fires if the user clicks the "Close" action button before the timer expires. Both events trigger navigation — whichever happens first. This ensures the user sees the success message briefly before being taken to the list.

---

## ♻️ Reuse Across the App

`ConfirmDialogComponent` is used in eight places across four entity types:

```
routes/employees/
├── employee-list.component.ts    → dialog.open(ConfirmDialogComponent, ...)
└── employee-detail.component.ts  → dialog.open(ConfirmDialogComponent, ...)

routes/departments/
├── department-list.component.ts  → dialog.open(ConfirmDialogComponent, ...)
└── department-detail.component.ts → dialog.open(ConfirmDialogComponent, ...)

routes/positions/
├── position-list.component.ts    → dialog.open(ConfirmDialogComponent, ...)
└── position-detail.component.ts  → dialog.open(ConfirmDialogComponent, ...)

routes/salary-ranges/
├── salary-range-list.component.ts  → dialog.open(ConfirmDialogComponent, ...)
└── salary-range-detail.component.ts → dialog.open(ConfirmDialogComponent, ...)
```

Every one of them passes a different `title` and `message` — the dialog component itself never changes. The `ConfirmDialogData` interface is the only contract between the dialog and its callers.

A department deletion looks identical in structure:

```typescript
const dialogRef = this.dialog.open(ConfirmDialogComponent, {
  width: '400px',
  data: {
    title: 'Delete Department',
    message: `Are you sure you want to delete "${dept.name}"? This action cannot be undone.`,
    confirmText: 'Delete',
    cancelText: 'Cancel',
  } as ConfirmDialogData,
});
```

The same eight lines. Same pattern. Same result handling. One component serves them all.

---

## 🔐 Three Layers of Delete Protection

The dialog is the user-facing safeguard, but it's part of a larger protection stack:

```
Layer 1: *appHasRole="['HRAdmin']"
  → Delete button removed from DOM for non-HRAdmin users
  → The dialog is never opened if the user can't see the button

Layer 2: ConfirmDialogComponent
  → Explicit confirmation required before the API call is made
  → User must actively click "Delete", not just the row action button

Layer 3: API [Authorize(Policy = "AdminPolicy")]
  → DELETE /api/v1/employees/{id} requires HRAdmin role claim in JWT
  → Even a direct API call without the UI returns 403 Forbidden
```

The dialog is a UX protection — it prevents accidental deletion by requiring deliberate intent. The API is the security protection — it enforces authorization regardless of what the UI does.

---

## 🎯 Key Design Decisions

**`MAT_DIALOG_DATA` injection over component inputs** — Angular Material's dialog service creates the component dynamically. `@Input()` bindings don't work on dynamically created components; `MAT_DIALOG_DATA` is the intended mechanism for passing data to dialogs.

**Boolean result via `MatDialogRef.close(true/false)`** — a simple boolean is enough for a confirm dialog. More complex dialogs (like a form dialog) can close with an object: `this.dialogRef.close(formValue)`. The `afterClosed()` Observable receives whatever value is passed to `close()`.

**`cdkFocusInitial` on the destructive button** — placing focus on Confirm (not Cancel) follows the Material Design guideline that the most likely action in a confirm dialog should be immediately actionable from the keyboard. If this were a "Save" confirmation (not destructive), Cancel would typically get focus instead.

**`if (!confirmed) return;` not `if (confirmed === true)`** — using `!confirmed` handles both `false` (Cancel click) and `undefined` (Escape/backdrop dismiss) without needing to check for each separately.

**The same component, 8 call sites** — keeping the dialog in `shared/components/` and exporting the `ConfirmDialogData` interface with it makes the pattern easy to discover and adopt. New entity types can add confirmation with four lines of import and eight lines of `dialog.open()`.

---

## 📖 Series Navigation

**AngularNetTutorial Blog Series:**

* [Building Modern Web Applications with Angular, .NET, and OAuth 2.0](https://medium.com/scrum-and-coke/building-modern-web-applications-with-angular-net-and-oauth-2-0-complete-tutorial-series-7ea97ed3fc56) — Main tutorial
* [Stop Juggling Multiple Repos: Manage Your Full-Stack App Like a Workspace](#) — Git Submodules
* [End-to-End Testing Made Simple: How Playwright Transforms Testing](#) — Playwright Overview
* [Why Your Angular App Needs PKCE: OAuth 2.0 Explained with a Working Demo](#) — OAuth 2.0 PKCE Flow
* [Lock Down Your Angular Routes: Auth Guards with OIDC in 5 Minutes](#) — Route Guards
* [Never Forget a Bearer Token Again: Angular's HTTP Interceptor Explained](#) — HTTP Interceptor
* [Show the Right Buttons to the Right People: Role-Based UI in Angular](#) — Role-Based UI
* [How to Structure a .NET 10 API So It Doesn't Become a Mess](#) — Clean Architecture
* [How Your .NET API Knows to Trust Angular: JWT Validation Explained](#) — JWT Validation
* [Future-Proof Your .NET API: Add Versioning Without Breaking Existing Clients](#) — API Versioning
* [Test Your Secured .NET API Without Writing a Single Line of Frontend Code](#) — Swagger with JWT
* [Build a Production-Ready Data Table in Angular Material: Sort, Filter, Page](#) — Data Tables
* [Reactive Forms Done Right: Validation Patterns Every Angular Developer Should Know](#) — Reactive Forms
* **The Right Way to Ask "Are You Sure?"** — This article
* [Why We Didn't Build the Admin Shell from Scratch: ng-matero Explained](#) — Admin Shell

---

**📌 Tags:** #angular #angularmaterial #matdialog #dialogs #ux #typescript #fullstack #dotnet #materialdesign #frontend #spa #webdevelopment #reactiveforms #accessibility #cdk
