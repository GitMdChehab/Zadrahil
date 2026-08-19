# Security Specification: Zad Al-Raheel Center Firestore Security

## 1. Data Invariants
1. A Student record must have a non-empty name, valid status (`منتظم`, `متميز`, `تأخير متكرر`, `منقطع`), and valid branch name.
2. An Academic Circle record must have a non-empty name, teacher name, and valid branch.
3. A Donation record must have a non-empty donor name, positive amount, receipt number, and valid date.
4. A Financial Transaction must have a valid type (`income` or `expense`), non-empty category, and valid date.
5. Announcements and Activities must have valid titles, status, and dates.
6. User accounts must have valid non-empty usernames, passwords, roles, and names.
7. System metadata document holds general reference tables and exchange rates.
8. Document IDs must be valid alphanumeric strings without path traversal or excessive sizes (max 128 chars).

## 2. The "Dirty Dozen" Payloads (Must be rejected)
1. **Invalid Student Status**: `{ id: "st-1", name: "Ahmed", status: "invalid_status", branch: "مصيلح" }` -> REJECT
2. **Missing Required Name in Student**: `{ id: "st-2", status: "منتظم", branch: "مصيلح" }` -> REJECT
3. **Negative Donation Amount**: `{ id: "don-1", donorName: "Ali", amountUSD: -100, receiptNumber: "REC-1" }` -> REJECT
4. **Invalid Transaction Type**: `{ id: "tx-1", type: "illegal_type", amountUSD: 50, date: "2026-08-19" }` -> REJECT
5. **Junk Oversized String**: `{ id: "ann-1", title: "A".repeat(5000), content: "Text" }` -> REJECT
6. **Path Traversal / Poisoned ID**: ID with illegal symbols `../../system` -> REJECT
7. **Empty Username in UserAccount**: `{ id: "usr-1", name: "User", username: "", password: "123" }` -> REJECT
8. **Invalid Activity Status**: `{ id: "act-1", title: "Trip", status: "unknown" }` -> REJECT
9. **Corrupted Metadata Array**: Metadata document with malformed properties -> REJECT
10. **Unauthenticated Malicious Write Attempt**: Direct malicious modification without matching system schema -> REJECT
11. **Negative Circle Count**: `{ id: "cir-1", name: "Circle", studentsCount: -5 }` -> REJECT
12. **Ghost Fields Injection**: Sending unexpected arbitrary system control fields into collections -> REJECT
