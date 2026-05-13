# Payment Risk Policy Extract

## Immediate Escalation

Escalate a case when any of the following are true:

- The same cardholder or device is linked to three or more high-risk merchants in 24 hours.
- A merchant receives multiple first-time customer payments and immediate refund requests.
- A transaction is routed through a merchant with a risk score of 80 or higher.
- The customer has a prior confirmed fraud case in the last 90 days.

## Conditional Hold

Place a conditional hold when:

- Transaction amount is more than 4x the customer's normal median payment.
- The merchant country differs from the customer's recent payment geography.
- Two-hop account graph reveals shared payout accounts with prior chargeback merchants.

## Release

Release payment when:

- Customer history is stable.
- Merchant risk score is below 50.
- No graph connection to prior fraud, chargeback, or mule-account networks is found.

