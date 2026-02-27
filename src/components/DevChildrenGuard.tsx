"use client";

import React from "react";

// Development-only guard that throws when a React child is a plain object
// (this reproduces / surfaces React error #418 with a useful stack).
export default function DevChildrenGuard({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV !== "production") {
    const seen = new WeakSet();
    const safeStringify = (v: unknown) => {
      try {
        return JSON.stringify(v, (_k, val) => {
          if (typeof val === "object" && val !== null) {
            if (seen.has(val as object)) return "[Circular]";
            seen.add(val as object);
          }
          return val;
        }, 2);
      } catch {
        return String(v);
      }
    };

    const checkNode = (node: React.ReactNode) => {
      if (node == null) return;
      if (Array.isArray(node)) {
        node.forEach(checkNode);
        return;
      }
      // primitives and valid React elements are ok
      if (typeof node === "string" || typeof node === "number" || typeof node === "boolean") return;
      if (React.isValidElement(node)) return;

      // anything left that is an object (plain object, Date, etc.) is problematic when used as a child
      if (typeof node === "object") {
        const preview = safeStringify(node).slice(0, 1000);
        const err = new Error(`Detected non-primitive React child (object) — rendering this will cause React error #418.\n\nPreview: ${preview}`);
        // Log and throw so React overlay & stacktrace point to the offending component in dev
        // eslint-disable-next-line no-console
        console.error(err);
        throw err;
      }
    };

    React.Children.forEach(children, checkNode);
  }

  return <>{children}</>;
}
