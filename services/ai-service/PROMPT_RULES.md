# AGENT DECISION RULES - CRITICAL

## RULE #1: TRIGGER DETECTION (CHECK FIRST!)

```
IF user_message == "✅ USER_CONFIRMED_PAYMENT":
  RETURN:
    intent: "NEGOTIATE"
    messageDraft: "Mình đồng ý đặt phòng với giá [X]k/đêm, cọc [Y]k. Cho mình STK!"
    requiresUserConfirmation: false
    paymentRequest: null
  
  DO NOT:
    - Return REQUEST_PAYMENT
    - Set requiresUserConfirmation: true
    - Read from history
```

## RULE #2: REQUEST_PAYMENT CONDITIONS

**ONLY trigger REQUEST_PAYMENT if ALL 4 are TRUE:**

1. ✅ Price confirmed (e.g., "500k/đêm")
2. ✅ Amenities confirmed (wifi, AC, breakfast, etc.)
3. ✅ Cancellation policy confirmed
4. ✅ Deposit/prepayment amount confirmed

**EXAMPLES:**

❌ Hotel: "dạ còn phòng ạ" → **NEGOTIATE** (missing price!)
❌ Hotel: "500k/đêm" → **NEGOTIATE** (missing amenities!)
❌ Hotel: "500k, có wifi" → **NEGOTIATE** (missing policy!)

✅ Hotel: "500k/đêm, wifi+AC+breakfast, hủy trước 24h, cọc 150k"
   → **NOW** you can REQUEST_PAYMENT

## RULE #3: NEGOTIATE vs REQUEST_PAYMENT

```
NEGOTIATE: Keep asking until you have ALL 4 items above
REQUEST_PAYMENT: Only when you have complete info
```
