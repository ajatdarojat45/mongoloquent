# Mongoloquent

Mongoloquent is like a lightweight MongoDB ORM library for JavaScript, inspired by the simplicity of Laravel Eloquent. It provides an intuitive and expressive syntax for working with MongoDB databases, making it easy to interact with your data in a Node.js environment.

## Table of content

-   [Installation](#installation)
-   [Usage](#usage)
-   [Queries](#queries)
-   [Relationships](#relationships)
-   [API References](#api-references)

## Installation

```
npm install mongoloquent
```

## Usage

### Setup database name, connection & timezone

Add this code to your .env file.

```

# default: mongodb://localhost:27017
MONGOLOQUENT_URI=

# default: mongoloquent
MONGOLOQUENT_DATABASE=

# default: Asia/Jakarta
MONGOLOQUENT_TIMEZONE=
```

### Extends Mongoloquent to your class or model

```js
// with ES6
import Mongoloquent from "mongoloquent";

class User extends Mongoloquent {
    static collection = "users";
    static timestamps = true; // default false
    static softDelete = true; // default false
}
```

```js
// with CommonJS
const Mongoloquent = require("mongoloquent");

class User extends Mongoloquent {
    static collection = "users";
    static timestamps = true; // default false
    static softDelete = true; // default false
}
```

## Queries

### create(data)

Create a new document with the provided data.

```js
import User from "./yourPath/User";

const data = {
    name: "Udin",
    age: 17,
    email: "udin@mail.com",
};

const user = await User.create(data);
```

### update(data)

Update documents matching the query criteria.

```js
import User from "./yourPath/User";

const data = { name: "Udin Edited" };

const user = await User.where("_id", "65ab7e3d05d58a1ad246ee87").update(data);
```

### delete()

Delete documents matching the query criteria.

```js
import User from "./yourPath/User";

const user = await User.where("_id", "65ab7e3d05d58a1ad246ee87").delete();
```

### select(columns)

Select specific columns to be displayed in the query results.

```js
import User from "./yourPath/User";

const users = await User.select("name").select("age").get();
```

Also, you can pass a list of column names to select some columns.

```js
import User from "./yourPath/User";

const users = await User.select(["name", "age"]).get();
```

### exclude(columns)

Exclude specific columns from being displayed in the query results.

```js
import User from "./yourPath/User";

const users = await User.exclude("name").select("age").get();
```

Also, you can pass a list of column names to exclude some columns.

```js
import User from "./yourPath/User";

const users = await User.exclude(["name", "age"]).get();
```

### get(columns)

Get method return the documents matching the query criteria. The `get` method will return an array.

```js
import User from "./yourPath/User";

const users = await User.get();
```

Also, you can pass a column name to select specific columns.

```js
import User from "./yourPath/User";

const users = await User.get("name");
```

Or pass list a column names to select some columns.

```js
import User from "./yourPath/User";

const users = await User.get(["name", "age"]);
```

### paginate(page, limit)

You can use the `paginate` method to paginate the query results. It takes two parameters: `page: int` and `limit: int`.

The `paginate` method will return an object with `data` and `meta` properties.

```js
import User from "./yourPath/User";

const users = await User.paginate(1, 10);
```

### first(columns)

Get the first document matching the query criteria. The `first` method will return an object.

```js
import User from "./yourPath/User";

const user = await User.where("_id", "65ab7e3d05d58a1ad246ee87").first();
```

Also, you can pass a column name to select specific columns.

```js
import User from "./yourPath/User";

const user = await User.where("_id", "65ab7e3d05d58a1ad246ee87").first("name");
```

Or pass list a column names to select some columns.

```js
import User from "./yourPath/User";

const user = await User.where("_id", "65ab7e3d05d58a1ad246ee87").first([
    "name",
    "age",
]);
```

### find(id)

Find a document by its ID. The `find` method will return an object.

```js
import User from "./yourPath/User";
import { ObjectId } from "mongodb";

const user = await User.find(new ObjectId("65ab7e3d05d58a1ad246ee87"));
```

Also, you can pass a string id.

```js
import User from "./yourPath/User";

const user = await User.find("65ab7e3d05d58a1ad246ee87");
```

### pluck(column)

Retrieve the values of a specific column from the query results.

```js
import User from "./yourPath/User";

const users = await User.pluck("name").get();
```

### limit(value)

Limit the number of documents to be returned by the query.

```js
import User from "./yourPath/User";

const users = await User.limit(10).get();
```

### take(value)

Alias for the `limit` method.

```js
import User from "./yourPath/User";

const users = await User.take(10).get();
```

### offset(value)

Set an offset for the query results.

```js
import User from "./yourPath/User";

const users = await User.offset(10).get();
```

Also, you can use `offset` and `limit` methods to paginate your query results.

```js
import User from "./yourPath/User";

const users = await User.offset(10).limit(10).get();
```

### skip(value)

Alias for the `offset` method.

```js
import User from "./yourPath/User";

const users = await User.skip(10).get();
```

Also, you can use `skip` and `limit` methods to paginate your query results.

```js
import User from "./yourPath/User";

const users = await User.skip(10).limit(10).get();
```

### where(column, operator, value)

Add a WHERE clause to the query.

The `where` method takes three parameters: `column: str`, `operator: str`, and `value: any`.

```js
import User from "./yourPath/User";

const users = await User.where("age", "eq", 17).get();
```

Also, you can use SQL's comparation operators. For more detail, you can see the comparison operator table.

```js
import User from "./yourPath/User";

const users = await User.where("age", "=", 17).get();
```

If you just pass two parameters, the second parameter will be assumed to be a value, and the operator is `eq` or `=`.

```js
import User from "./yourPath/User";

const users = await User.where("age", 17).get();
```

### orWhere(column, operator, value)

Add an `OR WHERE` clause to the query. You can combine this method with the `where` method.

```js
import User from "./yourPath/User";

const users = await User.where("age", 17).orWhere("name", "like", "udin").get();
```

### whereIn(column, values)

Add a `WHERE IN` clause to the query. The `whereIn` method takes two parameters: `column: str`, and `values: any[]`.

```js
import User from "./yourPath/User";

const users = await User.whereIn("age", [17, 20]).get();
```

### orWhereIn(column, values)

Add an `OR WHERE IN` clause to the query. You can combine this method with the `whereIn` method.

```js
import User from "./yourPath/User";

const users = await User.whereIn("age", [17, 20])
    .orWhereIn("name", ["Udin", "Kosasih"])
    .get();
```

### whereNotIn(column, values)

Add an `WHERE NOT IN` clause to the query. The `whereNotIn` method takes two parameters: `column: str`, and `values: any[]`.

```js
import User from "./yourPath/User";

const users = await User.whereNotIn("age", [17, 20]).get();
```

### orWhereNotIn(column, values)

Add an `OR WHERE NOT IN` clause to the query. You can combine this method with the `whereNotIn` method.

```js
import User from "./yourPath/User";

const users = await User.whereNotIn("age", [17, 20])
    .orWhereNotIn("name", ["Udin", "Kosasih"])
    .get();
```

### whereBetween(column, values)

Add a `WHERE BETWEEN` clause to the query. The `whereBetween` method takes two parameters: `column: str` and `values: int[]`.

```js
import User from "./yourPath/User";

const users = await User.whereBetween("age", [17, 20]).get();
```

### orWhereBetween(column, values)

Add an `OR WHERE BETWEEN` clause to the query. You can combine this method with the `whereBetween` method.

```js
import User from "./yourPath/User";

const users = await User.whereBetween("age", [15, 20])
    .orWhereBetween("age", [50, 70])
    .get();
```

### orderBy(column, direction?, isSensitive?)

Sort the query results by a specific column. The `orderBy` method takes three parameters: `column: str`, `direction: str`, and `isSensitive: bool`.

The `direction` parameter is `asc` or `desc`. If you just pass one parameter, the direction is `asc`.

```js
import User from "./yourPath/User";

const users = await User.orderBy("age").get();
```

Alse, you can set the `isSensitive` parameter `true` to sort string values.

```js
import User from "./yourPath/User";

const users = await User.orderBy("name", "desc", true).get();
```

### groupBy(column)

Group the query results by specific column.

```js
import User from "./yourPath/User";

const users = await User.groupBy("age").get();
```

### min(column)

Retrieve the minimum value of a specific column. The `min` method will return a number.

```js
import Product from "./yourPath/Product";

const price = await Product.min("price");
```

### max(column)

Retrieve the maximum value of a specific column. The `max` method will return a number.

```js
import Product from "./yourPath/Product";

const price = await Product.max("price");
```

### sum(column)

Calculate the sum of values in a specific column. The `sum` method will return a number.

```js
import Product from "./yourPath/Product";

const price = await Product.sum("price");
```

### avg(column)

Calculate the average value of a specific column. The `avg` method will return a number.

```js
import Product from "./yourPath/Product";

const price = await Product.avg("price");
```

### count()

Count the number of documents matching the query criteria. The `count` method will return a number.

```js
import Product from "./yourPath/Product";

const products = await Product.where("price", ">=", 10000).count();
```

## Relationships

## API References

### Properties

### Comparation operators

### Query methods

| Method                                                    | Description                                                         | Parameters                                     |
| --------------------------------------------------------- | ------------------------------------------------------------------- | ---------------------------------------------- |
| [`create(data)`](#create)                                 | Create a new document with the provided data.                       | data: obj                                      |
| [`update(data)`](#update)                                 | Update documents matching the query criteria.                       | data: obj                                      |
| [`delete()`](#delete)                                     | Delete documents matching the query criteria.                       | -                                              |
| [`select(columns)`](#select)                              | Select specific columns to be displayed in the query results.       | columns: str or str[]                          |
| [`exclude(columns)`](#exclude)                            | Exclude specific columns from being displayed in the query results. | columns: str or str[]                          |
| [`get(columns)`](#get)                                    | Get the documents matching the query criteria.                      | columns: str or str[]                          |
| [`paginate(page, limit)`](#paginate)                      | Paginate the query results.                                         | page: int, limit: int                          |
| [`first(columns)`](#first)                                | Get the first document matching the query criteria.                 | columns: str or str[]                          |
| [`find(id)`](#find)                                       | Find a document by its ID.                                          | id: str or ObjectId                            |
| [`pluck(column)`](#pluck)                                 | Retrieve the values of a specific column from the query results.    | column: str                                    |
| [`limit(value)`](#limit)                                  | Limit the number of documents to be returned by the query.          | value: int                                     |
| [`take(value)`](#take)                                    | Alias for the `limit` method.                                       | value: int                                     |
| [`offset(value)`](#offset)                                | Set an offset for the query results.                                | value: int                                     |
| [`skip(value)`](#skip)                                    | Skip a specified number of documents in the query results.          | value: int                                     |
| [`where(column, operator, value)`](#where)                | Add a WHERE clause to the query.                                    | column: str, operator: str, value: any         |
| [`orWhere(column, operator, value)`](#orwhere)            | Add an OR WHERE clause to the query.                                | column: str, operator: str, value: any         |
| [`whereIn(column, values)`](#wherein)                     | Add a WHERE IN clause to the query.                                 | column: str, values: any[]                     |
| [`orWhereIn(column, values)`](#orwherein)                 | Add an OR WHERE IN clause to the query.                             | column: str, values: any[]                     |
| [`whereNotIn(column, values)`](#wherenotin)               | Add a WHERE NOT IN clause to the query.                             | column: str, values: any[]                     |
| [`orWhereNotIn(column, values)`](#orwherenotin)           | Add an OR WHERE NOT IN clause to the query.                         | column: str, values: any[]                     |
| [`whereBetween(column, values)`](#wherebetween)           | Add a WHERE BETWEEN clause to the query.                            | column: str, values: int[]                     |
| [`orWhereBetween(column, array values)`](#orwherebetween) | Add an OR WHERE BETWEEN clause to the query.                        | column: str, values: int[]                     |
| [`orderBy(column, direction, isSensitive?)`](#orderby)    | Sort the query results by a specific column.                        | column: str, direction: str, isSensitive: bool |
| [`groupBy(column)`](#groupby)                             | Group the query results by specific columns.                        | column: str                                    |
| [`min(column)`](#min)                                     | Retrieve the minimum value of a specific column.                    | column: str                                    |
| [`max(column)`](#max)                                     | Retrieve the maximum value of a specific column.                    | column: str                                    |
| [`sum(column)`](#sum)                                     | Calculate the sum of values in a specific column.                   | column: str                                    |
| [`avg(column)`](#avg)                                     | Calculate the average value of a specific column.                   | column: str                                    |
| [`count()`](#count)                                       | Count the number of documents matching the query criteria.          | -                                              |

### Relationships methods
