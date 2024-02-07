# Mongoloquent

Mongoloquent is like a lightweight MongoDB ORM library for JavaScript, inspired by the simplicity of Laravel Eloquent. It provides an intuitive and expressive syntax for working with MongoDB databases, making it easy to interact with your data in a Node.js environment.

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

Get method return the documents matching the query criteria.

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

### paginate

```js
import User from "./yourPath/User";

const users = await User.paginate(1, 10);
```

### first

```js
import User from "./yourPath/User";

const user = await User.where("_id", "65ab7e3d05d58a1ad246ee87").first();
```

```js
import User from "./yourPath/User";

const user = await User.where("_id", "65ab7e3d05d58a1ad246ee87").first("name");
```

```js
import User from "./yourPath/User";

const user = await User.where("_id", "65ab7e3d05d58a1ad246ee87").first([
    "name",
    "age",
]);
```

### find(id)

```js
import User from "./yourPath/User";
import { ObjectId } from "mongodb";

const user = await User.find(new ObjectId("65ab7e3d05d58a1ad246ee87"));
```

```js
import User from "./yourPath/User";

const user = await User.find("65ab7e3d05d58a1ad246ee87");
```

### pluck(key)

```js
import User from "./yourPath/User";

const users = await User.pluck("name").get();
```

### limit(value)

```js
import User from "./yourPath/User";

const users = await User.limit(10).get();
```

### take

```js
import User from "./yourPath/User";

const users = await User.take(10).get();
```

### offset

```js
import User from "./yourPath/User";

const users = await User.offset(10).get();
```

```js
import User from "./yourPath/User";

const users = await User.offset(10).limit(10).get();
```

### skip

```js
import User from "./yourPath/User";

const users = await User.skip(10).get();
```

```js
import User from "./yourPath/User";

const users = await User.skip(10).limit(10).get();
```

### where

```js
import User from "./yourPath/User";

const users = await User.where("age", 17).get();
```

```js
import User from "./yourPath/User";

const users = await User.where("age", "eq", 17).get();
```

```js
import User from "./yourPath/User";

const users = await User.where("age", "=", 17).get();
```

### orWhere

```js
import User from "./yourPath/User";

const users = await User.where("age", 17).orWhere("name", "like", "udin").get();
```

### whereIn

```js
import User from "./yourPath/User";

const users = await User.whereIn("age", [17, 20]).get();
```

### orWhereIn

```js
import User from "./yourPath/User";

const users = await User.whereIn("age", [17, 20])
    .orWhereIn("name", ["Udin", "Kosasih"])
    .get();
```

### whereNotIn

```js
import User from "./yourPath/User";

const users = await User.whereNotIn("age", [17, 20]).get();
```

### orWhereNotIn

```js
import User from "./yourPath/User";

const users = await User.whereNotIn("age", [17, 20])
    .orWhereNotIn("name", ["Udin", "Kosasih"])
    .get();
```

### whereBetween

```js
import User from "./yourPath/User";

const users = await User.whereBetween("age", [17, 20]).get();
```

### orWhereBetween

```js
import User from "./yourPath/User";

const users = await User.whereBetween("age", [15, 20])
    .orWhereBetween("age", [50, 70])
    .get();
```

### orderBy

```js
import User from "./yourPath/User";

const users = await User.orderBy("age").get();
```

```js
import User from "./yourPath/User";

const users = await User.orderBy("name", "desc", true).get();
```

### groupBy

```js
import User from "./yourPath/User";

const users = await User.groupBy("age").get();
```

### min

```js
import Product from "./yourPath/Product";

const price = await Product.min("price");
```

### max

```js
import Product from "./yourPath/Product";

const price = await Product.max("price");
```

### sum

```js
import Product from "./yourPath/Product";

const price = await Product.sum("price");
```

### avg

```js
import Product from "./yourPath/Product";

const price = await Product.avg("price");
```

### count

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
| [`paginate(page, perPage)`](#paginate)                    | Paginate the query results.                                         | page: int, perPage: int                        |
| [`first(columns)`](#first)                                | Get the first document matching the query criteria.                 | columns: str or str[]                          |
| [`find(id)`](#find)                                       | Find a document by its ID.                                          | id: str or ObjectId                            |
| [`pluck(column)`](#pluck)                                 | Retrieve the values of a specific column from the query results.    | column: str                                    |
| [`limit(value)`](#limit)                                  | Limit the number of documents to be returned by the query.          | value: int                                     |
| [`take(value)`](#take)                                    | Alias for the `limit` method.                                       | value: int                                     |
| [`offset(value)`](#offset)                                | Set an offset for the query results.                                | value: int                                     |
| [`skip(value)`](#skip)                                    | Skip a specified number of documents in the query results.          | value: int                                     |
| [`where(column, operator, value)`](#where)                | Add a WHERE clause to the query.                                    | column: str, operator: str, value: any         |
| [`orWhere(column, operator, value)`](#orwhere)            | Add an OR WHERE clause to the query.                                | column: str, operator: str, value: any         |
| [`whereIn(column, values)`](#wherein)                     | Add a WHERE IN clause to the query.                                 | column: str, values: int[]                     |
| [`orWhereIn(column, values)`](#orwherein)                 | Add an OR WHERE IN clause to the query.                             | column: str, values: any[]                     |
| [`whereNotIn(column, values)`](#wherenotin)               | Add a WHERE NOT IN clause to the query.                             | column: str, values: int[]                     |
| [`orWhereNotIn(column, values)`](#orwherenotin)           | Add an OR WHERE NOT IN clause to the query.                         | column: str, values: list[any]                 |
| [`whereBetween(column, values)`](#wherebetween)           | Add a WHERE BETWEEN clause to the query.                            | column: str, values: int[]                     |
| [`orWhereBetween(column, array values)`](#orwherebetween) | Add an OR WHERE BETWEEN clause to the query.                        | column: str, values: any[]                     |
| [`orderBy(column, direction, insensitive?)`](#orderby)    | Sort the query results by a specific column.                        | column: str, direction: str, insensitive: bool |
| [`groupBy(column)`](#groupby)                             | Group the query results by specific columns.                        | columns: str                                   |
| [`min(column)`](#min)                                     | Retrieve the minimum value of a specific column.                    | column: str                                    |
| [`max(column)`](#max)                                     | Retrieve the maximum value of a specific column.                    | column: str                                    |
| [`sum(column)`](#sum)                                     | Calculate the sum of values in a specific column.                   | column: str                                    |
| [`avg(column)`](#avg)                                     | Calculate the average value of a specific column.                   | column: str                                    |
| [`count(column)`](#count)                                 | Count the number of documents matching the query criteria.          | column: str                                    |

### Relationships methods
