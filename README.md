# VTEX Return App - PMI Custom Edition

A comprehensive return management system for VTEX IO that allows both traditional order-based returns and independent returns (PMI custom feature).

> ⚠️ **Important Notice**: This is a fork of the official VTEX Return App (`vtex.return-app@3.11.0`) with custom modifications for PMI. The original app is no longer maintained by VTEX as of June 1st, 2023.

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [PMI Custom Feature: Independent Returns](#pmi-custom-feature-independent-returns)
- [Architecture](#architecture)
- [Installation](#installation)
- [Configuration](#configuration)
- [Development](#development)
- [GraphQL API](#graphql-api)
- [Technical Details](#technical-details)
- [Troubleshooting](#troubleshooting)

## Overview

This app provides a complete return management solution for VTEX stores, featuring:
- Customer-facing interfaces for requesting returns
- Admin interfaces for managing and processing returns
- GraphQL API for programmatic access
- Email notifications for status updates
- Multi-locale support

## Key Features

### Core Functionality
- ✅ Order-based returns (original VTEX feature)
- ✅ **Independent returns without order ID** (PMI custom feature)
- ✅ Multi-locale support (12 languages)
- ✅ Customizable return reasons
- ✅ Multiple refund methods (card, bank transfer, gift card)
- ✅ Pickup point integration (Easypost)
- ✅ Item condition tracking
- ✅ Automated refund workflows
- ✅ Status timeline and history
- ✅ Admin verification workflow

### Admin Features
- Return request list with filters
- Detailed return request view
- Status management
- Item verification with partial approval
- Refund processing
- Comments and notes

### Store Features
- My Returns page
- Return request creation
- Order selection
- Product selection with reasons
- Status tracking
- Request cancellation

## PMI Custom Feature: Independent Returns

### Business Requirement
PMI requires the ability to process returns that are **not tied to a specific order ID**. This allows customers to return products based on SKU ownership verification rather than requiring an order reference.

### How It Works

#### 1. Security & Validation
- System validates that the customer actually purchased the SKU by checking their order history
- Only SKUs found in invoiced orders can be returned
- Returns without `orderItemIndex` are supported

#### 2. Sequence Number Format
- Traditional returns: `1`, `2`, `3`, etc.
- Independent returns: `IND-00001`, `IND-00002`, etc.
- Stored in VBase for persistence

#### 3. GraphQL API

**Query Products Available for Independent Return:**
```graphql
query {
  productsAvailableForIndependentReturn(
    storeUserEmail: "customer@example.com"
  ) {
    skuId
    name
    imageUrl
    currentPrice
    purchaseHistory {
      orderId
      purchaseDate
      quantityPurchased
      pricePaid
    }
  }
}
```

**Create Independent Return:**
```graphql
mutation {
  createReturnRequest(returnRequest: {
    independentReturn: true
    items: [{
      skuId: "123"
      quantity: 1
      condition: newWithBox
      returnReason: {
        reason: "Accidental Order"
      }
    }]
    customerProfileData: {
      name: "John Doe"
      email: "john@example.com"
      phoneNumber: "1234567890"
    }
    pickupReturnData: {
      address: "123 Main St"
      city: "New York"
      state: "NY"
      country: "US"
      zipCode: "10001"
      addressType: CUSTOMER_ADDRESS
    }
    refundPaymentData: {
      refundPaymentMethod: giftCard
    }
    locale: "en-US"
  }) {
    returnRequestId
  }
}
```

### Technical Implementation

#### Modified Schema Types
```graphql
type ReturnRequestResponse {
  orderId: String  # Now nullable (was String!)
  independentReturn: Boolean
  sequenceNumber: String
  # ... other fields
}

input ReturnRequestInput {
  orderId: String  # Now optional (was required)
  independentReturn: Boolean
  items: [ReturnRequestItemInput!]!
  # ... other fields
}

input ReturnRequestItemInput {
  orderItemIndex: Int  # Now optional (was required)
  skuId: String  # NEW: For independent returns
  sellingPrice: Int  # NEW: Can be specified
  # ... other fields
}
```

#### Key Files Modified
- `node/resolvers/productsAvailableForIndependentReturn.ts` - New query resolver
- `node/services/createIndependentReturnRequestService.ts` - New service
- `node/utils/generateIndependentSequenceNumber.ts` - Sequence generation
- `node/clients/catalog.ts` - Dynamic product data fetching
- `masterdata/returnRequest/schema.json` - Schema updates
- `react/common/components/ReturnDetails/OrderLink.tsx` - UI for independent returns

## Architecture

### Builders
- **admin**: Admin UI (`/admin/returns`)
- **react**: Store UI components
- **messages**: Multi-locale translations
- **node**: GraphQL resolvers and business logic
- **graphql**: Schema definitions
- **store**: Storefront blocks
- **masterdata**: Data persistence layer

### Data Flow

```
┌─────────────┐
│   Customer  │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────┐
│  GraphQL Query/Mutation     │
│  (React Components)         │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│  Resolver                   │
│  - productsAvailable...     │
│  - createReturnRequest      │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│  Service Layer              │
│  - Validate SKU ownership   │
│  - Generate sequence        │
│  - Fetch catalog data       │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│  Clients                    │
│  - OMS (orders)             │
│  - Catalog (products)       │
│  - VBase (counter)          │
│  - MasterData (storage)     │
└─────────────────────────────┘
```

## Installation

### Prerequisites
- VTEX IO CLI installed (`npm install -g vtex`)
- VTEX account credentials
- Node.js 14+ (for development)

### Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd return-app-pmi-poc
```

2. **Create a development workspace**
```bash
vtex use <workspace-name>
```

3. **Link the app**
```bash
vtex link
```

> ⚠️ **Important**: The first time you link in a new workspace, you must use `vtex link` (not install) to ensure MasterData schemas are created correctly.

4. **Access the app**
- Admin: `https://<workspace>--<account>.myvtex.com/admin/returns`
- Store: `https://<workspace>--<account>.myvtex.com/account#/my-returns`

### Production Installation Workaround

Due to a MasterData builder limitation:

1. Create a PROD workspace
2. Install the new version in PROD workspace
3. Create a DEV workspace and link
4. Verify documents appear at `/admin/returns/requests/`
5. Only then install to master

## Configuration

### App Settings

Navigate to `/admin/returns/settings` to configure:

#### Return Payment Options
- **Available payment methods**: Credit card, Gift card, Bank transfer
- **Automatically refund requests**: Enable/disable automatic invoice creation

#### Custom Return Reasons
- Add custom return options with specific max days
- Supports multi-locale translations

#### General Options
- **Max days for returns**: Global maximum (e.g., 365 days)
- **Allow "Other" option**: Let customers specify custom reasons
- **Allow pickup points**: Enable drop-off point selection
- **Proportional shipping**: Calculate shipping refund per item
- **Item condition selector**: Require condition selection (new/used, with/without box)
- **Excluded categories**: Prevent returns for specific product categories

### Message Center Templates

The app auto-creates email templates:
- `oms-return-request-confirmation_{locale}` - Confirmation email
- `oms-return-request-status-update_{locale}` - Status update email

## Development

### Project Structure
```
return-app-pmi-poc/
├── admin/                      # Admin routes
│   └── routes.json
├── graphql/                    # GraphQL schema
│   ├── schema.graphql
│   └── types/
│       ├── ReturnRequest.graphql
│       └── IndependentReturn.graphql
├── masterdata/                 # MasterData schemas
│   └── returnRequest/
│       └── schema.json
├── messages/                   # Translations
│   ├── en.json
│   ├── es.json
│   └── ...
├── node/                       # Backend logic
│   ├── index.ts
│   ├── clients/
│   │   ├── catalog.ts
│   │   ├── oms.ts
│   │   └── catalogGQL.ts
│   ├── resolvers/
│   │   ├── createReturnRequest.ts
│   │   └── productsAvailableForIndependentReturn.ts
│   ├── services/
│   │   ├── createIndependentReturnRequestService.ts
│   │   └── createReturnRequestService.ts
│   └── utils/
│       └── generateIndependentSequenceNumber.ts
├── react/                      # React components
│   ├── admin/
│   └── common/
└── manifest.json
```

### Development Commands

```bash
# Lint TypeScript
cd node && yarn lint

# Format code
yarn format

# Run tests
cd node && yarn test

# Link app (development)
vtex link

# Publish new version
vtex publish --verbose
```

### Testing Independent Returns

1. **Create an invoiced order**
   - Place an order with test products
   - Invoice the order through OMS

2. **Query available products**
```graphql
query {
  productsAvailableForIndependentReturn(
    storeUserEmail: "your-email@example.com"
  ) {
    skuId
    name
  }
}
```

3. **Create independent return**
```graphql
mutation {
  createReturnRequest(returnRequest: {
    independentReturn: true
    items: [{ skuId: "1", quantity: 1, ... }]
    # ... complete request data
  }) {
    returnRequestId
  }
}
```

4. **Verify in admin**
   - Go to `/admin/returns/requests/`
   - Check for sequence number starting with "IND-"
   - Verify `orderId` is null

## GraphQL API

### Queries

#### `productsAvailableForIndependentReturn`
Returns products that the customer can return based on purchase history.

**Arguments:**
- `searchTerm` (String, optional): Filter products by name
- `storeUserEmail` (String, optional): Override user email for admin use

**Returns:** `[ProductSummary!]!`

#### `returnRequest`
Get details of a specific return request.

**Arguments:**
- `requestId` (ID!): Return request ID

**Returns:** `ReturnRequestResponse`

#### `returnRequestList`
List all return requests with filters.

**Arguments:**
- `page` (Int!): Page number
- `perPage` (Int!): Items per page
- `status` (String, optional): Filter by status
- `orderId` (String, optional): Filter by order ID
- `sequenceNumber` (String, optional): Filter by sequence number
- `dateSubmitted` (DateRangeInput, optional): Date range filter

**Returns:** `ReturnRequestList!`

### Mutations

#### `createReturnRequest`
Create a new return request (order-based or independent).

**Arguments:**
- `returnRequest` (ReturnRequestInput!): Return request data

**Returns:** `ReturnRequestCreated!`

#### `updateReturnRequestStatus`
Update the status of a return request.

**Arguments:**
- `requestId` (ID!): Return request ID
- `status` (Status!): New status
- `comment` (String, optional): Comment
- `refundData` (RefundDataInput, optional): Refund details
- `visibleForCustomer` (Boolean): Show comment to customer

**Returns:** `ReturnRequestResponse!`

## Technical Details

### MasterData Entity

**Entity Name:** `returnRequest`

**Key Fields:**
- `id` (string): Unique identifier
- `orderId` (string | null): Order ID (null for independent returns)
- `independentReturn` (boolean): Flag for independent returns
- `sequenceNumber` (string): Sequential number (e.g., "1" or "IND-00001")
- `status` (string): Current status
- `items` (array): Return items with nullable `orderItemIndex`
- `refundableAmount` (integer): Total refundable amount in cents
- `customerProfileData` (object): Customer information
- `dateSubmitted` (string): ISO date

### Status Flow

```
new → processing → pickedUpFromClient → pendingVerification
    → packageVerified → amountRefunded
```

**Denied/Cancelled** can happen at any stage.

### Return Reasons

**Default reasons:**
- Accidental Order
- Better Price
- Performance
- Incompatible
- Item Damaged
- Missed Delivery
- Missing Parts
- Box Damaged
- Different Product
- Defective
- Arrived as Extra
- No Longer Needed
- Unauthorized Purchase
- Different From Website

**Custom reasons:** Can be configured in settings with specific max days.

### Payment Methods

- **card**: Refund to credit card (requires automatic refund enabled)
- **bank**: Bank transfer (requires IBAN and account holder name)
- **giftCard**: VTEX gift card
- **sameAsPurchase**: Use original payment method (NOT allowed for independent returns)

### Item Conditions

- `newWithBox`: New with box
- `newWithoutBox`: New without box
- `usedWithBox`: Used with box
- `usedWithoutBox`: Used without box
- `unspecified`: Condition not specified

## Troubleshooting

### Common Issues

#### 1. MasterData Schema Not Created

**Problem:** After installing, the schema doesn't exist.

**Solution:** Use `vtex link` instead of `vtex install` in a development workspace first. This forces MasterData schema creation.

#### 2. GraphQL Validation Errors

**Problem:** "orderId is required" error when creating independent return.

**Solution:** Ensure you're using the correct schema with `independentReturn: true` and `orderId` omitted or null.

#### 3. SKU Ownership Validation Fails

**Problem:** "SKU was not found in user's purchase history"

**Solution:**
- Verify the order is in "invoiced" status
- Check that the user email matches the order email
- For testing, ensure `maxDays` setting covers the order date

#### 4. Messages Not Showing (i18n)

**Problem:** Seeing keys like `store/return-app.*` instead of translated text.

**Solution:**
- Clear browser cache (hard reload: Cmd+Shift+R)
- Restart `vtex link`
- Check that the locale file exists (e.g., `en-GB.json`)

#### 5. Catalog API 500 Errors

**Problem:** Error fetching product data for SKU.

**Solution:** The app uses REST API `/api/catalog_system/pub/products/variations/{productId}`. Ensure the product and SKU exist in catalog.

### Debug Mode

Enable verbose logging in development:

```typescript
// Add console.log in resolvers
console.log('DEBUG: productsAvailableForIndependentReturn', { userEmail, skuIds })
```

### Support

For issues related to:
- **Original VTEX Return App**: Check [vtex-apps/return-app](https://github.com/vtex-apps/return-app) (archived)
- **PMI Custom Features**: Contact the development team
- **VTEX IO Platform**: [VTEX Help Center](https://help.vtex.com)

## Breaking Changes from Original App

### GraphQL Schema
- `ReturnRequestResponse.orderId`: Changed from `String!` to `String` (nullable)
- `ReturnRequestItem.orderItemIndex`: Changed from `Int!` to `Int` (nullable)

### New Fields
- `ReturnRequestInput.independentReturn`: Boolean flag
- `ReturnRequestItemInput.skuId`: SKU identifier
- `ReturnRequestItemInput.sellingPrice`: Optional price override

**Migration Note:** When upgrading from v3.11.0 to this version, a new major version should be used due to breaking changes in the GraphQL schema.

## License

This project is a fork of the official VTEX Return App with custom modifications for PMI. Original app by VTEX.

## Credits

- **Original App:** VTEX (vtex.return-app@3.11.0)
- **PMI Custom Features:** Developed for PMI requirements
- **Independent Returns Feature:** Custom implementation (2025)

---

**Version:** 3.11.0-pmi
**Last Updated:** October 2025
**VTEX IO:** Compatible
**Status:** Active Development
