# Homework Assignment #2
## The Assignment (Scenario):
You are building the API for a pizza-delivery company. Don't worry about a frontend, just build the API. Here's the spec from your project manager:
1. New users can be created, their information can be edited, and they can be deleted. We should store their name, email address, and street address.
2. Users can log in and log out by creating or destroying a token.
3. When a user is logged in, they should be able to GET all the possible menu items (these items can be hardcoded into the system).
4. A logged-in user should be able to fill a shopping cart with menu items
5. A logged-in user should be able to create an order. You should integrate with the Sandbox of [Stripe.com](https://stripe.com/) to accept their payment. <br />*Note: Use the stripe sandbox for your testing. Follow this link and click on the "tokens" tab to see the fake tokens you can use server-side to confirm the integration is working: [https://stripe.com/docs/testing#cards](https://stripe.com/docs/testing#cards)*
6. When an order is placed, you should email the user a receipt. You should integrate with the sandbox of [Mailgun.com](https://www.mailgun.com/) for this. <br />*Every Mailgun account comes with a sandbox email account domain (whatever@sandbox123.mailgun.org) that you can send from by default. So, there's no need to setup any DNS for your domain for this task [documentation](https://documentation.mailgun.com/en/latest/faqs.html#how-do-i-pick-a-domain-name-for-my-mailgun-account)*

*Important Note: If you use external libraries (NPM) to integrate with Stripe or Mailgun, you will not pass this assignment. You must write your API calls from scratch. Look up the "Curl" documentation for both APIs so you can figure out how to craft your API calls.*

**This is an open-ended assignment. You may take any direction you'd like to go with it, as long as your project includes the requirements. It can include anything else you wish as well.**

P.S. Don't forget to document how a client should interact with the API you create!

# Pizza Delivery API documentation

## Process
1. Create a user
2. Create a token
3. List a menu
4. Add items to cart
5. Place the order

## Ping
Checks the status of the app
```
GET /ping
```

## Users
New users can be created, their information can be edited, and they can be deleted. We should store their name, email address, and street address.

### Create new user:
Required fields:
* name - string
* email - string
* password - string
* streetAddress -string
```
POST /users
```

### Get user information
Requires token in headers
Required fields:
* email - string
```
GET /users
```

### Update user information:
Requires token in headers
Required fields:
* email - string
At least one of below should be specified:
* name - string
* password - string
* streetAddress -string
```
PUT /users
```

### Delete user
Requires token in headers
Required fields:
* email - string
```
DELETE /users
```


## Tokens
Users can log in and log out by creating or destroying a token.
### Create new token:
Required fields:
* email - string
* password - string
```
POST /tokens
```

### Get token information
Required fields:
* id - string
```
GET /tokens
```

### Update token information:
Required fields:
* id - string
* extend - boolean
```
PUT /tokens
```

### Delete token
Required fields:
* id - string
```
DELETE /tokens
```


## Menu
When a user is logged in, they should be able to GET all the possible menu items (these items can be hardcoded into the system).
### Get the menu
Requires token in headers
```
GET /menu
```


## Shopping Cart
A logged-in user should be able to fill a shopping cart with menu items
There is only one shopping cart per user, which is created based on the token

### Add item to shopping cart
Adding menu item to shopping cart.
If such item already exists in shopping cart, then update it's amount
Requires token in headers
Required fields:
* menu_item - string
* amount - number

```
POST /shopping-cart
```

### See what's currently in the shopping cart
Requires token in headers
```
GET /shopping-cart
```

### Delete shopping cart or remove/decrease item
Requires token in headers
* If no parameters provided, the whole cart will be deleted
* If menu_item - string is specified, then only this item will be removed from the cart
* If menu_item - string and amount - number are specified, then only this amount of menu item will be removed from the cart
```
DELETE /shopping-cart
```

## Orders
* A logged-in user should be able to create an order. You should integrate with the Sandbox of [Stripe.com](https://stripe.com/) to accept their payment.
* When an order is placed, you should email the user a receipt. You should integrate with the sandbox of [Mailgun.com](https://www.mailgun.com/) for this.

### See the data of the current order
Requires token in headers
```
GET /orders
```

### Place the order
Requires token in headers
Required data:
* source - string (Stripe source key)

```
POST /orders
```
