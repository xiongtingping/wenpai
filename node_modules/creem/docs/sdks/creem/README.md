# Creem SDK

## Overview

Creem API: Creem is an all-in-one platform for managing subscriptions and recurring revenue, tailored specifically for today's SaaS companies. It enables you to boost revenue, enhance customer retention, and scale your operations seamlessly.'

### Available Operations

* [retrieveProduct](#retrieveproduct) - Retrieve a product
* [createProduct](#createproduct) - Creates a new product.
* [searchProducts](#searchproducts) - List all products
* [retrieveCustomer](#retrievecustomer) - Retrieve a customer
* [generateCustomerLinks](#generatecustomerlinks) - Generate Customer Links
* [retrieveSubscription](#retrievesubscription) - Retrieve a subscription
* [cancelSubscription](#cancelsubscription) - Cancel a subscription.
* [updateSubscription](#updatesubscription) - Update a subscription.
* [upgradeSubscription](#upgradesubscription) - Upgrade a subscription to a different product
* [retrieveCheckout](#retrievecheckout) - Retrieve a new checkout session.
* [createCheckout](#createcheckout) - Creates a new checkout session.
* [activateLicense](#activatelicense) - Activates a license key.
* [deactivateLicense](#deactivatelicense) - Deactivate a license key instance.
* [validateLicense](#validatelicense) - Validates a license key or instance.
* [retrieveDiscount](#retrievediscount) - Retrieve discount
* [createDiscount](#creatediscount) - Create a discount.
* [deleteDiscount](#deletediscount) - Delete a discount.
* [searchTransactions](#searchtransactions) - List all transactions

## retrieveProduct

Retrieve a product

### Example Usage

```typescript
import { Creem } from "creem";

const creem = new Creem();

async function run() {
  const result = await creem.retrieveProduct({
    productId: "<id>",
    xApiKey: "<value>",
  });

  // Handle the result
  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { CreemCore } from "creem/core.js";
import { retrieveProduct } from "creem/funcs/retrieveProduct.js";

// Use `CreemCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const creem = new CreemCore();

async function run() {
  const res = await retrieveProduct(creem, {
    productId: "<id>",
    xApiKey: "<value>",
  });

  if (!res.ok) {
    throw res.error;
  }

  const { value: result } = res;

  // Handle the result
  console.log(result);
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [operations.RetrieveProductRequest](../../models/operations/retrieveproductrequest.md)                                                                                         | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[components.ProductEntity](../../models/components/productentity.md)\>**

### Errors

| Error Type      | Status Code     | Content Type    |
| --------------- | --------------- | --------------- |
| errors.APIError | 4XX, 5XX        | \*/\*           |

## createProduct

Creates a new product.

### Example Usage

```typescript
import { Creem } from "creem";

const creem = new Creem();

async function run() {
  const result = await creem.createProduct({
    xApiKey: "<value>",
    createProductRequestEntity: {
      name: "<value>",
      imageUrl: "https://picsum.photos/200/300",
      price: 400,
      currency: "EUR",
      billingType: "recurring",
      billingPeriod: "every-month",
      taxMode: "inclusive",
      taxCategory: "saas",
      defaultSuccessUrl: "https://example.com/?status=successful",
      customField: [
        {
          type: "text",
          key: "<key>",
          label: "<value>",
        },
      ],
    },
  });

  // Handle the result
  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { CreemCore } from "creem/core.js";
import { createProduct } from "creem/funcs/createProduct.js";

// Use `CreemCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const creem = new CreemCore();

async function run() {
  const res = await createProduct(creem, {
    xApiKey: "<value>",
    createProductRequestEntity: {
      name: "<value>",
      imageUrl: "https://picsum.photos/200/300",
      price: 400,
      currency: "EUR",
      billingType: "recurring",
      billingPeriod: "every-month",
      taxMode: "inclusive",
      taxCategory: "saas",
      defaultSuccessUrl: "https://example.com/?status=successful",
      customField: [
        {
          type: "text",
          key: "<key>",
          label: "<value>",
        },
      ],
    },
  });

  if (!res.ok) {
    throw res.error;
  }

  const { value: result } = res;

  // Handle the result
  console.log(result);
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [operations.CreateProductRequest](../../models/operations/createproductrequest.md)                                                                                             | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[components.ProductEntity](../../models/components/productentity.md)\>**

### Errors

| Error Type      | Status Code     | Content Type    |
| --------------- | --------------- | --------------- |
| errors.APIError | 4XX, 5XX        | \*/\*           |

## searchProducts

List all products

### Example Usage

```typescript
import { Creem } from "creem";

const creem = new Creem();

async function run() {
  const result = await creem.searchProducts({
    xApiKey: "<value>",
  });

  // Handle the result
  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { CreemCore } from "creem/core.js";
import { searchProducts } from "creem/funcs/searchProducts.js";

// Use `CreemCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const creem = new CreemCore();

async function run() {
  const res = await searchProducts(creem, {
    xApiKey: "<value>",
  });

  if (!res.ok) {
    throw res.error;
  }

  const { value: result } = res;

  // Handle the result
  console.log(result);
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [operations.SearchProductsRequest](../../models/operations/searchproductsrequest.md)                                                                                           | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[components.ProductListEntity](../../models/components/productlistentity.md)\>**

### Errors

| Error Type      | Status Code     | Content Type    |
| --------------- | --------------- | --------------- |
| errors.APIError | 4XX, 5XX        | \*/\*           |

## retrieveCustomer

Retrieve a customer

### Example Usage

```typescript
import { Creem } from "creem";

const creem = new Creem();

async function run() {
  const result = await creem.retrieveCustomer({
    xApiKey: "<value>",
  });

  // Handle the result
  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { CreemCore } from "creem/core.js";
import { retrieveCustomer } from "creem/funcs/retrieveCustomer.js";

// Use `CreemCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const creem = new CreemCore();

async function run() {
  const res = await retrieveCustomer(creem, {
    xApiKey: "<value>",
  });

  if (!res.ok) {
    throw res.error;
  }

  const { value: result } = res;

  // Handle the result
  console.log(result);
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [operations.RetrieveCustomerRequest](../../models/operations/retrievecustomerrequest.md)                                                                                       | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[components.CustomerEntity](../../models/components/customerentity.md)\>**

### Errors

| Error Type      | Status Code     | Content Type    |
| --------------- | --------------- | --------------- |
| errors.APIError | 4XX, 5XX        | \*/\*           |

## generateCustomerLinks

Generate Customer Links

### Example Usage

```typescript
import { Creem } from "creem";

const creem = new Creem();

async function run() {
  const result = await creem.generateCustomerLinks({
    xApiKey: "<value>",
    createCustomerPortalLinkRequestEntity: {
      customerId: "<id>",
    },
  });

  // Handle the result
  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { CreemCore } from "creem/core.js";
import { generateCustomerLinks } from "creem/funcs/generateCustomerLinks.js";

// Use `CreemCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const creem = new CreemCore();

async function run() {
  const res = await generateCustomerLinks(creem, {
    xApiKey: "<value>",
    createCustomerPortalLinkRequestEntity: {
      customerId: "<id>",
    },
  });

  if (!res.ok) {
    throw res.error;
  }

  const { value: result } = res;

  // Handle the result
  console.log(result);
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [operations.GenerateCustomerLinksRequest](../../models/operations/generatecustomerlinksrequest.md)                                                                             | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[components.CustomerLinksEntity](../../models/components/customerlinksentity.md)\>**

### Errors

| Error Type      | Status Code     | Content Type    |
| --------------- | --------------- | --------------- |
| errors.APIError | 4XX, 5XX        | \*/\*           |

## retrieveSubscription

Retrieve a subscription

### Example Usage

```typescript
import { Creem } from "creem";

const creem = new Creem();

async function run() {
  const result = await creem.retrieveSubscription({
    subscriptionId: "<id>",
    xApiKey: "<value>",
  });

  // Handle the result
  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { CreemCore } from "creem/core.js";
import { retrieveSubscription } from "creem/funcs/retrieveSubscription.js";

// Use `CreemCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const creem = new CreemCore();

async function run() {
  const res = await retrieveSubscription(creem, {
    subscriptionId: "<id>",
    xApiKey: "<value>",
  });

  if (!res.ok) {
    throw res.error;
  }

  const { value: result } = res;

  // Handle the result
  console.log(result);
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [operations.RetrieveSubscriptionRequest](../../models/operations/retrievesubscriptionrequest.md)                                                                               | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[components.SubscriptionEntity](../../models/components/subscriptionentity.md)\>**

### Errors

| Error Type      | Status Code     | Content Type    |
| --------------- | --------------- | --------------- |
| errors.APIError | 4XX, 5XX        | \*/\*           |

## cancelSubscription

Cancel a subscription.

### Example Usage

```typescript
import { Creem } from "creem";

const creem = new Creem();

async function run() {
  const result = await creem.cancelSubscription({
    id: "<id>",
    xApiKey: "<value>",
  });

  // Handle the result
  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { CreemCore } from "creem/core.js";
import { cancelSubscription } from "creem/funcs/cancelSubscription.js";

// Use `CreemCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const creem = new CreemCore();

async function run() {
  const res = await cancelSubscription(creem, {
    id: "<id>",
    xApiKey: "<value>",
  });

  if (!res.ok) {
    throw res.error;
  }

  const { value: result } = res;

  // Handle the result
  console.log(result);
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [operations.CancelSubscriptionRequest](../../models/operations/cancelsubscriptionrequest.md)                                                                                   | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[components.SubscriptionEntity](../../models/components/subscriptionentity.md)\>**

### Errors

| Error Type      | Status Code     | Content Type    |
| --------------- | --------------- | --------------- |
| errors.APIError | 4XX, 5XX        | \*/\*           |

## updateSubscription

Update a subscription.

### Example Usage

```typescript
import { Creem } from "creem";

const creem = new Creem();

async function run() {
  const result = await creem.updateSubscription({
    id: "<id>",
    xApiKey: "<value>",
    updateSubscriptionRequestEntity: {},
  });

  // Handle the result
  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { CreemCore } from "creem/core.js";
import { updateSubscription } from "creem/funcs/updateSubscription.js";

// Use `CreemCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const creem = new CreemCore();

async function run() {
  const res = await updateSubscription(creem, {
    id: "<id>",
    xApiKey: "<value>",
    updateSubscriptionRequestEntity: {},
  });

  if (!res.ok) {
    throw res.error;
  }

  const { value: result } = res;

  // Handle the result
  console.log(result);
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [operations.UpdateSubscriptionRequest](../../models/operations/updatesubscriptionrequest.md)                                                                                   | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[components.SubscriptionEntity](../../models/components/subscriptionentity.md)\>**

### Errors

| Error Type      | Status Code     | Content Type    |
| --------------- | --------------- | --------------- |
| errors.APIError | 4XX, 5XX        | \*/\*           |

## upgradeSubscription

Upgrade a subscription to a different product

### Example Usage

```typescript
import { Creem } from "creem";

const creem = new Creem();

async function run() {
  const result = await creem.upgradeSubscription({
    id: "<id>",
    xApiKey: "<value>",
    upgradeSubscriptionRequestEntity: {
      productId: "prod_123",
    },
  });

  // Handle the result
  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { CreemCore } from "creem/core.js";
import { upgradeSubscription } from "creem/funcs/upgradeSubscription.js";

// Use `CreemCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const creem = new CreemCore();

async function run() {
  const res = await upgradeSubscription(creem, {
    id: "<id>",
    xApiKey: "<value>",
    upgradeSubscriptionRequestEntity: {
      productId: "prod_123",
    },
  });

  if (!res.ok) {
    throw res.error;
  }

  const { value: result } = res;

  // Handle the result
  console.log(result);
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [operations.UpgradeSubscriptionRequest](../../models/operations/upgradesubscriptionrequest.md)                                                                                 | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[components.SubscriptionEntity](../../models/components/subscriptionentity.md)\>**

### Errors

| Error Type      | Status Code     | Content Type    |
| --------------- | --------------- | --------------- |
| errors.APIError | 4XX, 5XX        | \*/\*           |

## retrieveCheckout

Retrieve a new checkout session.

### Example Usage

```typescript
import { Creem } from "creem";

const creem = new Creem();

async function run() {
  const result = await creem.retrieveCheckout({
    checkoutId: "<id>",
    xApiKey: "<value>",
  });

  // Handle the result
  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { CreemCore } from "creem/core.js";
import { retrieveCheckout } from "creem/funcs/retrieveCheckout.js";

// Use `CreemCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const creem = new CreemCore();

async function run() {
  const res = await retrieveCheckout(creem, {
    checkoutId: "<id>",
    xApiKey: "<value>",
  });

  if (!res.ok) {
    throw res.error;
  }

  const { value: result } = res;

  // Handle the result
  console.log(result);
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [operations.RetrieveCheckoutRequest](../../models/operations/retrievecheckoutrequest.md)                                                                                       | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[components.CheckoutEntity](../../models/components/checkoutentity.md)\>**

### Errors

| Error Type      | Status Code     | Content Type    |
| --------------- | --------------- | --------------- |
| errors.APIError | 4XX, 5XX        | \*/\*           |

## createCheckout

Creates a new checkout session.

### Example Usage

```typescript
import { Creem } from "creem";

const creem = new Creem();

async function run() {
  const result = await creem.createCheckout({
    xApiKey: "<value>",
    createCheckoutRequest: {
      productId: "prod_1234567890",
      units: 1,
      discountCode: "SUMMER2024",
      customer: {
        id: "cust_1234567890",
        email: "user@example.com",
      },
      customField: [
        {
          type: "text",
          key: "<key>",
          label: "<value>",
        },
        {
          type: "text",
          key: "<key>",
          label: "<value>",
        },
        {
          type: "text",
          key: "<key>",
          label: "<value>",
        },
      ],
      metadata: {
        "userId": "user_123",
        "visitCount": 42,
        "lastVisit": "2023-04-01",
      },
    },
  });

  // Handle the result
  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { CreemCore } from "creem/core.js";
import { createCheckout } from "creem/funcs/createCheckout.js";

// Use `CreemCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const creem = new CreemCore();

async function run() {
  const res = await createCheckout(creem, {
    xApiKey: "<value>",
    createCheckoutRequest: {
      productId: "prod_1234567890",
      units: 1,
      discountCode: "SUMMER2024",
      customer: {
        id: "cust_1234567890",
        email: "user@example.com",
      },
      customField: [
        {
          type: "text",
          key: "<key>",
          label: "<value>",
        },
        {
          type: "text",
          key: "<key>",
          label: "<value>",
        },
        {
          type: "text",
          key: "<key>",
          label: "<value>",
        },
      ],
      metadata: {
        "userId": "user_123",
        "visitCount": 42,
        "lastVisit": "2023-04-01",
      },
    },
  });

  if (!res.ok) {
    throw res.error;
  }

  const { value: result } = res;

  // Handle the result
  console.log(result);
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [operations.CreateCheckoutRequest](../../models/operations/createcheckoutrequest.md)                                                                                           | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[components.CheckoutEntity](../../models/components/checkoutentity.md)\>**

### Errors

| Error Type      | Status Code     | Content Type    |
| --------------- | --------------- | --------------- |
| errors.APIError | 4XX, 5XX        | \*/\*           |

## activateLicense

Activates a license key.

### Example Usage

```typescript
import { Creem } from "creem";

const creem = new Creem();

async function run() {
  const result = await creem.activateLicense({
    xApiKey: "<value>",
    activateLicenseRequestEntity: {
      key: "<key>",
      instanceName: "<value>",
    },
  });

  // Handle the result
  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { CreemCore } from "creem/core.js";
import { activateLicense } from "creem/funcs/activateLicense.js";

// Use `CreemCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const creem = new CreemCore();

async function run() {
  const res = await activateLicense(creem, {
    xApiKey: "<value>",
    activateLicenseRequestEntity: {
      key: "<key>",
      instanceName: "<value>",
    },
  });

  if (!res.ok) {
    throw res.error;
  }

  const { value: result } = res;

  // Handle the result
  console.log(result);
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [operations.ActivateLicenseRequest](../../models/operations/activatelicenserequest.md)                                                                                         | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[components.LicenseEntity](../../models/components/licenseentity.md)\>**

### Errors

| Error Type      | Status Code     | Content Type    |
| --------------- | --------------- | --------------- |
| errors.APIError | 4XX, 5XX        | \*/\*           |

## deactivateLicense

Deactivate a license key instance.

### Example Usage

```typescript
import { Creem } from "creem";

const creem = new Creem();

async function run() {
  const result = await creem.deactivateLicense({
    xApiKey: "<value>",
    deactivateLicenseRequestEntity: {
      key: "<key>",
      instanceId: "<id>",
    },
  });

  // Handle the result
  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { CreemCore } from "creem/core.js";
import { deactivateLicense } from "creem/funcs/deactivateLicense.js";

// Use `CreemCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const creem = new CreemCore();

async function run() {
  const res = await deactivateLicense(creem, {
    xApiKey: "<value>",
    deactivateLicenseRequestEntity: {
      key: "<key>",
      instanceId: "<id>",
    },
  });

  if (!res.ok) {
    throw res.error;
  }

  const { value: result } = res;

  // Handle the result
  console.log(result);
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [operations.DeactivateLicenseRequest](../../models/operations/deactivatelicenserequest.md)                                                                                     | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[components.LicenseEntity](../../models/components/licenseentity.md)\>**

### Errors

| Error Type      | Status Code     | Content Type    |
| --------------- | --------------- | --------------- |
| errors.APIError | 4XX, 5XX        | \*/\*           |

## validateLicense

Validates a license key or instance.

### Example Usage

```typescript
import { Creem } from "creem";

const creem = new Creem();

async function run() {
  const result = await creem.validateLicense({
    xApiKey: "<value>",
    validateLicenseRequestEntity: {
      key: "<key>",
      instanceId: "<id>",
    },
  });

  // Handle the result
  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { CreemCore } from "creem/core.js";
import { validateLicense } from "creem/funcs/validateLicense.js";

// Use `CreemCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const creem = new CreemCore();

async function run() {
  const res = await validateLicense(creem, {
    xApiKey: "<value>",
    validateLicenseRequestEntity: {
      key: "<key>",
      instanceId: "<id>",
    },
  });

  if (!res.ok) {
    throw res.error;
  }

  const { value: result } = res;

  // Handle the result
  console.log(result);
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [operations.ValidateLicenseRequest](../../models/operations/validatelicenserequest.md)                                                                                         | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[components.LicenseEntity](../../models/components/licenseentity.md)\>**

### Errors

| Error Type      | Status Code     | Content Type    |
| --------------- | --------------- | --------------- |
| errors.APIError | 4XX, 5XX        | \*/\*           |

## retrieveDiscount

Retrieve discount

### Example Usage

```typescript
import { Creem } from "creem";

const creem = new Creem();

async function run() {
  const result = await creem.retrieveDiscount({
    xApiKey: "<value>",
  });

  // Handle the result
  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { CreemCore } from "creem/core.js";
import { retrieveDiscount } from "creem/funcs/retrieveDiscount.js";

// Use `CreemCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const creem = new CreemCore();

async function run() {
  const res = await retrieveDiscount(creem, {
    xApiKey: "<value>",
  });

  if (!res.ok) {
    throw res.error;
  }

  const { value: result } = res;

  // Handle the result
  console.log(result);
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [operations.RetrieveDiscountRequest](../../models/operations/retrievediscountrequest.md)                                                                                       | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[components.DiscountEntity](../../models/components/discountentity.md)\>**

### Errors

| Error Type      | Status Code     | Content Type    |
| --------------- | --------------- | --------------- |
| errors.APIError | 4XX, 5XX        | \*/\*           |

## createDiscount

Create a discount.

### Example Usage

```typescript
import { Creem } from "creem";

const creem = new Creem();

async function run() {
  const result = await creem.createDiscount({
    xApiKey: "<value>",
    createDiscountRequestEntity: {
      name: "Holiday Sale",
      code: "HOLIDAY2024",
      type: "fixed",
      amount: 20,
      currency: "USD",
      percentage: 15,
      expiryDate: new Date("2024-12-31T23:59:59Z"),
      maxRedemptions: 100,
      duration: "repeating",
      durationInMonths: 6,
      appliesToProducts: [
        "prod_123",
        "prod_456",
      ],
    },
  });

  // Handle the result
  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { CreemCore } from "creem/core.js";
import { createDiscount } from "creem/funcs/createDiscount.js";

// Use `CreemCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const creem = new CreemCore();

async function run() {
  const res = await createDiscount(creem, {
    xApiKey: "<value>",
    createDiscountRequestEntity: {
      name: "Holiday Sale",
      code: "HOLIDAY2024",
      type: "fixed",
      amount: 20,
      currency: "USD",
      percentage: 15,
      expiryDate: new Date("2024-12-31T23:59:59Z"),
      maxRedemptions: 100,
      duration: "repeating",
      durationInMonths: 6,
      appliesToProducts: [
        "prod_123",
        "prod_456",
      ],
    },
  });

  if (!res.ok) {
    throw res.error;
  }

  const { value: result } = res;

  // Handle the result
  console.log(result);
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [operations.CreateDiscountRequest](../../models/operations/creatediscountrequest.md)                                                                                           | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[components.DiscountEntity](../../models/components/discountentity.md)\>**

### Errors

| Error Type      | Status Code     | Content Type    |
| --------------- | --------------- | --------------- |
| errors.APIError | 4XX, 5XX        | \*/\*           |

## deleteDiscount

Delete a discount.

### Example Usage

```typescript
import { Creem } from "creem";

const creem = new Creem();

async function run() {
  const result = await creem.deleteDiscount({
    id: "<id>",
    xApiKey: "<value>",
  });

  // Handle the result
  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { CreemCore } from "creem/core.js";
import { deleteDiscount } from "creem/funcs/deleteDiscount.js";

// Use `CreemCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const creem = new CreemCore();

async function run() {
  const res = await deleteDiscount(creem, {
    id: "<id>",
    xApiKey: "<value>",
  });

  if (!res.ok) {
    throw res.error;
  }

  const { value: result } = res;

  // Handle the result
  console.log(result);
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [operations.DeleteDiscountRequest](../../models/operations/deletediscountrequest.md)                                                                                           | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[components.DiscountEntity](../../models/components/discountentity.md)\>**

### Errors

| Error Type      | Status Code     | Content Type    |
| --------------- | --------------- | --------------- |
| errors.APIError | 4XX, 5XX        | \*/\*           |

## searchTransactions

List all transactions

### Example Usage

```typescript
import { Creem } from "creem";

const creem = new Creem();

async function run() {
  const result = await creem.searchTransactions({
    xApiKey: "<value>",
  });

  // Handle the result
  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { CreemCore } from "creem/core.js";
import { searchTransactions } from "creem/funcs/searchTransactions.js";

// Use `CreemCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const creem = new CreemCore();

async function run() {
  const res = await searchTransactions(creem, {
    xApiKey: "<value>",
  });

  if (!res.ok) {
    throw res.error;
  }

  const { value: result } = res;

  // Handle the result
  console.log(result);
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [operations.SearchTransactionsRequest](../../models/operations/searchtransactionsrequest.md)                                                                                   | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[components.TransactionListEntity](../../models/components/transactionlistentity.md)\>**

### Errors

| Error Type      | Status Code     | Content Type    |
| --------------- | --------------- | --------------- |
| errors.APIError | 4XX, 5XX        | \*/\*           |