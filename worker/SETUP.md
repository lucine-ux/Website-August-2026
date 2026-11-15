# Worker setup notes

Flodesk segment IDs for The Nervous System Audit (created 15 Nov 2026).
Add these in Cloudflare: Workers > btb-waitlist > Settings > Variables.

| Variable | Segment | ID |
|---|---|---|
| SEGMENT_AUDIT_ALL | Nervous System Audit: All | 6af8f7dfa053ea24051434ba |
| SEGMENT_AUDIT_AVOIDER | Nervous System Audit: Avoider | 6af8f7ee9ba48d38bbbe8560 |
| SEGMENT_AUDIT_INTERNALISER | Nervous System Audit: Internaliser | 6af8f82ff64dc72adc769015 |
| SEGMENT_AUDIT_OVERFUNCTIONER | Nervous System Audit: Overfunctioner | 6af8f806a1429d77c1f54ab8 |
| SEGMENT_AUDIT_ABSORBER | Nervous System Audit: Absorber | 6af8f841aa081bef4356a768 |
| SEGMENT_AUDIT_CARE | Nervous System Audit: Check on them | 6af8f8149ba48d38bbbe8561 |

Deployed 15 Nov 2026 with the six audit segment IDs. FLODESK_API_KEY is now a secret.
Still to add: SHEET_WEBHOOK and SHEET_TOKEN once the Google Sheet script is deployed, and SEGMENT_PROGRAM for the Capacity Program waitlist.
