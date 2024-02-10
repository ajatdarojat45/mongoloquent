# Mongoloquent

Mongoloquent is a lightweight MongoDB ORM library for JavaScript, inspired by the simplicity of Laravel Eloquent. It provides an intuitive and expressive syntax for working with MongoDB databases, making it easy to interact with your data in a Node.js environment.

## Table of content

-   [Installation](#installation)
-   [Usage](#usage)
-   [Queries](#queries)
-   [Relationships](#relationships)
-   [Soft Delete](#soft-delete)
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
import { Mongoloquent } from "mongoloquent";

class User extends Mongoloquent {
    static collection = "users";
    static timestamps = true; // default false
    static softDelete = true; // default false
}
```

```js
// with CommonJS
const { Mongoloquent } = require("mongoloquent");

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

<h3 id="paginate">paginate(page, limit)</h3>

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

<h3 id="where">where(column, operator, value)</h3>

Add a WHERE clause to the query.

The `where` method takes three parameters: `column: str`, `operator: str`, and `value: any`.

```js
import User from "./yourPath/User";

const users = await User.where("age", "eq", 17).get();
```

Also, you can use SQL’s comparation operators. For more detail, you can see it in the [comparison operator table](#comparation-operators).

```js
import User from "./yourPath/User";

const users = await User.where("age", "=", 17).get();
```

If you just pass two parameters, the second parameter will be assumed to be a value, and the operator is `eq` or `=`.

```js
import User from "./yourPath/User";

const users = await User.where("age", 17).get();
```

<h3 id="orwhere">orWhere(column, operator, value)</h3>

Add an `OR WHERE` clause to the query. You can combine this method with the `where` method.

```js
import User from "./yourPath/User";

const users = await User.where("age", 17).orWhere("name", "like", "udin").get();
```

<h3 id="wherein">whereIn(column, values)</h3>

Add a `WHERE IN` clause to the query. The `whereIn` method takes two parameters: `column: str`, and `values: any[]`.

```js
import User from "./yourPath/User";

const users = await User.whereIn("age", [17, 20]).get();
```

<h3 id="orwherein">orWhereIn(column, values)</h3>

Add an `OR WHERE IN` clause to the query. You can combine this method with the `whereIn` method.

```js
import User from "./yourPath/User";

const users = await User.whereIn("age", [17, 20])
    .orWhereIn("name", ["Udin", "Kosasih"])
    .get();
```

<h3 id="wherenotin">whereNotIn(column, values)</h3>

Add an `WHERE NOT IN` clause to the query. The `whereNotIn` method takes two parameters: `column: str`, and `values: any[]`.

```js
import User from "./yourPath/User";

const users = await User.whereNotIn("age", [17, 20]).get();
```

<h3 id="orwherenotin">orWhereNotIn(column, values)</h3>

Add an `OR WHERE NOT IN` clause to the query. You can combine this method with the `whereNotIn` method.

```js
import User from "./yourPath/User";

const users = await User.whereNotIn("age", [17, 20])
    .orWhereNotIn("name", ["Udin", "Kosasih"])
    .get();
```

<h3 id="wherebetween">whereBetween(column, values)</h3>

Add a `WHERE BETWEEN` clause to the query. The `whereBetween` method takes two parameters: `column: str` and `values: int[]`.

```js
import User from "./yourPath/User";

const users = await User.whereBetween("age", [17, 20]).get();
```

<h3 id="orwherebetween">orWhereBetween(column, values)</h3>

Add an `OR WHERE BETWEEN` clause to the query. You can combine this method with the `whereBetween` method.

```js
import User from "./yourPath/User";

const users = await User.whereBetween("age", [15, 20])
    .orWhereBetween("age", [50, 70])
    .get();
```

<h3 id="orderby">orderBy(column, direction?, isSensitive?)</h3>

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

<h3 id="hasmany">hasMany(Model, foreignKey, localKey)</h3>

A one-to-many relationship is used to define relationships where a single model is the parent to one or more child models. For example, a blog post may have an infinite number of comments. Like all other `Mongoloquent` relationships, one-to-many relationships are defined by defining a method on your `Mongoloquent` model.

```js
import { Mongoloquent } from "mongoloquent";
import Comment from "./yourPath/Comment";

class Post extends Mongoloquent {
    static collection = "posts";

    static comments() {
        return this.hasMany(Comment, "postId", "_id");
    }
}

// usage
const post = await Post.where("_id", "65ab7e3d05d58a1ad246ee87")
    .with("comments")
    .first();
```

Also, you can pass collection name as a Model.

> The softDelete is disabled in the target model when you pass the collection name as a model.

```js
import { Mongoloquent } from "mongoloquent";

class Post extends Mongoloquent {
    static collection = "posts";

    static comments() {
        return this.hasMany("comments", "postId", "_id");
    }
}

// usage
const post = await Post.where("_id", "65ab7e3d05d58a1ad246ee87")
    .with("comments")
    .first();
```

<h3 id="belongsto">belongsTo(Model, foreignKey, ownerKey)</h3>

Now that we can access all of a post's comments, let's define a relationship to allow a comment to access its parent post. To define the inverse of a `hasMany` relationship, define a relationship method on the child model which calls the `belongsTo` method:

```js
import { Mongoloquent } from "mongoloquent";
import Post from "./yourPath/Post";

class Comment extends Mongoloquent {
    static collection = "comments";

    static post() {
        return this.belongsTo(Post, "postId", "_id");
    }
}

// usage
const comments = await Comment.where("_id", "65ab7e3d05d58a1ad246ee87")
    .with("post")
    .get();
```

Also, you can pass collection name as a Model.

> The softDelete is disabled in the target model when you pass the collection name as a model.

```js
import { Mongoloquent } from "mongoloquent";

class Comment extends Mongoloquent {
    static collection = "comments";

    static post() {
        return this.hasMany("posts", "postId", "_id");
    }
}

// usage
const comments = await Comment.where("_id", "65ab7e3d05d58a1ad246ee87")
    .with("post")
    .get();
```

<h3 id="belongstomany">belongsToMany(Model, pivotModel, foreignKey, foreignKeyTarget)</h3>

Many-to-many relations are slightly more complicated than hasOne and hasMany relationships. An example of a many-to-many relationship is a user that has many roles and those roles are also shared by other users in the application. For example, a user may be assigned the role of "Author" and "Editor"; however, those roles may also be assigned to other users as well. So, a user has many roles and a role has many users.

#### Collection structure

To define this relationship, three database collections are needed: `users`, `roles`, and `roleUser`. The `roleUser` collection is derived from the alphabetical order of the related model names and contains `userId` and `roleId` columns. This collection is used as an intermediate collection linking the `users` and `roles`.

```
users
    _id - id
    name - string

roles
    _id - id
    name - string

roleUser
    _id - id
    userId - id
    roleId - id
```

#### Model structure

Many-to-many relationships are defined by writing a method that returns the result of the belongsToMany method. For example, let's define a `roles` method on our `User` model. The first argument passed to this method is the name of the related model class:

```js
import { Mongoloquent } from "mongoloquent";
import Role from "./yourPath/Role";
import RoleUser from "./yourPath/RoleUser";

class User extends Mongoloquent {
    static collection = "users";

    static roles() {
        return this.belongsToMany(Role, RoleUser, "userId", "roleId");
    }
}

// usage
const user = await User.where("_id", "65ab7e3d05d58a1ad246ee87")
    .with("roles")
    .first();
```

Also, you can pass collection name as a Model.

> The softDelete is disabled in the target model when you pass the collection name as a model.

```js
import { Mongoloquent } from "mongoloquent";

class User extends Mongoloquent {
    static collection = "users";

    static roles() {
        return this.belongsToMany("roles", "roleUser", "userId", "roleId");
    }
}

// usage
const user = await User.where("_id", "65ab7e3d05d58a1ad246ee87")
    .with("roles")
    .first();
```

<h3 id="hasmanythrough">hasManyThrough(Model, throughModel, foreignKey, throughForeignKey)</h3>

The "has-many-through" relationship provides a convenient way to access distant relations via an intermediate relation. For example, let's assume we are building a deployment platform. A `Project` model might access many `Deployment` models through an intermediate `Environment` model. Using this example, you could easily gather all deployments for a given project. Let's look at the collections required to define this relationship:

```
projects
    _id - id
    name - string

environments
    _id - id
    projectId - id
    name - string

deployments
    _id - id
    environmentId - id
    commitHash - string
```

Now that we have examined the collection structure for the relationship, let's define the relationship on the `Project` model:

```js
import { Mongoloquent } from "mongoloquent";
import Environment from "./yourPath/Environment";
import Deployment from "./yourPath/Deployment";

class Project extends Mongoloquent {
    static collection = "projects";

    static deployments() {
        return this.hasManyThrough(
            Deployment,
            Environment,
            "projectId",
            "environmentId"
        );
    }
}

// usage
const project = await Project.where("_id", "65ab7e3d05d58a1ad246ee87")
    .with("deployments")
    .first();
```

Also, you can pass collection name as a Model.

> The softDelete is disabled in the target model when you pass the collection name as a model.

```js
import { Mongoloquent } from "mongoloquent";
import Environment from "./yourPath/Environment";
import Deployment from "./yourPath/Deployment";

class Project extends Mongoloquent {
    static collection = "projects";

    static deployments() {
        return this.hasManyThrough(
            "deployments",
            "environments",
            "projectId",
            "environmentId"
        );
    }
}

// usage
const project = await Project.where("_id", "65ab7e3d05d58a1ad246ee87")
    .with("deployments")
    .first();
```

<h3 id="with">with(relation, options?)</h3>

The `with` method is used to perform eager loading of a specified relationship. it takes two parameters: `relation: str` and `options: obj`.

Before use this method make sure you have set relationship in your `Model`. For more detail you can see about relationship [here](#relationships).

```js
import { Mongoloquent } from "mongoloquent";
import User from "./yourpath/User";
import Comment from "./yourPath/Comment";

class Post extends Mongoloquent {
    static collection = "posts";

    static user() {
        return this.belongsto(User, "userid", "_id");
    }

    static comments() {
        return this.hasmany(Comment, "postId", "_id");
    }
}

// usage
const post = await Post.where("_id", "65ab7e3d05d58a1ad246ee87")
    .with("user")
    .with("comments")
    .first();
```

Also, you can pass an option to select some columns of the relation result.

```js
import { Mongoloquent } from "mongoloquent";
import User from "./yourpath/User";

class Post extends Mongoloquent {
    static collection = "posts";

    static user() {
        return this.belongsto(User, "userid", "_id");
    }
}

// usage
const posts = await Post.where("ispublish", true)
    .with("user", {
        select: ["username", "email"],
    })
    .get();
```

Or, exclude some columns of the relation result.

```js
import { Mongoloquent } from "mongoloquent";
import User from "./yourpath/User";

class Post extends Mongoloquent {
    static collection = "posts";

    static user() {
        return this.belongsto(User, "userid", "_id");
    }
}

// usage
const posts = await Post.where("ispublish", true)
    .with("user", {
        exclude: ["password", "email"],
    })
    .get();
```

<h3 id="has">has(relation, options?)</h3>

`has` method is an alias for the [`with`](#with) method.

## Soft Delete

In addition to actually removing records from your database, `Mongoloquent` can also `soft delete` models. When models are soft deleted, they are not actually removed from your database. Instead, a `isDeleted` and `deletedAt` attribute is set on the model indicating the date and time at which the model was "deleted". To enable soft deletes for a model, add the static property `softDelete` to the model.

```js
import { Mongoloquent } from "mongoloquent";

class User extends Mongoloquent {
    static collection = "users";
    static softDelete = true;
}
```

> The static property softDelete will automatically add the isDeleted and deletedAt attributes to your model.

<h3 id="withtrashed">withTrashed()</h3>

As noted above, soft deleted models will automatically be excluded from query results. However, you may force soft deleted models to be included in a query's results by calling the withTrashed method on the query.

```js
import User from "./yourPath/User";

const users = await User.withTrashed().where("age", ">=" 50).get()
```

<h3 id="onlytrashed">onlyTrashed()</h3>

The `onlyTrashed` method will retrieve only soft deleted models.

```js
import User from "./yourPath/User";

const users = await User.onlyTrashed().where("age", "gte" 50).get()
```

## API References

### Properties

| Property   | Type | Description                                                        |
| ---------- | ---- | ------------------------------------------------------------------ |
| collection | str  | The name of the MongoDB collection used by the model.              |
| softDelete | bool | Indicates whether the model supports soft deletion.                |
| timestamps | bool | Indicates whether the model stores creation and update timestamps. |

### Comparation operators

| Operator | Mongo Operator | Description                         |
| -------- | -------------- | ----------------------------------- |
| =        | eq             | Equals                              |
| !=       | ne             | Not equals                          |
| >        | gt             | Greater than                        |
| <        | lt             | Less than                           |
| >=       | gte            | Greater than or equal to            |
| <=       | lte            | Less than or equal to               |
| in       | in             | In                                  |
| notIn    | nin            | Not in                              |
| like     | regex          | Like (case-insensitive) using regex |

### Query methods

| Method                                                    | Description                                                         | Parameters                                           |
| --------------------------------------------------------- | ------------------------------------------------------------------- | ---------------------------------------------------- |
| [`create(data)`](<#create(data)>)                         | Create a new document with the provided data.                       | `data: obj`                                          |
| [`update(data)`](<#update(data)>)                         | Update documents matching the query criteria.                       | `data: obj`                                          |
| [`delete()`](<#delete()>)                                 | Delete documents matching the query criteria.                       | -                                                    |
| [`select(columns)`](<#select(columns)>)                   | Select specific columns to be displayed in the query results.       | `columns: str or str[]`                              |
| [`exclude(columns)`](<#exclude(columns)>)                 | Exclude specific columns from being displayed in the query results. | `columns: str or str[]`                              |
| [`get(columns)`](<#get(columns)>)                         | Get the documents matching the query criteria.                      | `columns: str or str[]`                              |
| [`paginate(page, limit)`](#paginate)                      | Paginate the query results.                                         | `page: int, limit: int`                              |
| [`first(columns)`](<#first(columns)>)                     | Get the first document matching the query criteria.                 | `columns: str or str[]`                              |
| [`find(id)`](<#find(id)>)                                 | Find a document by its ID.                                          | `id: str or ObjectId`                                |
| [`pluck(column)`](<#pluck(column)>)                       | Retrieve the values of a specific column from the query results.    | `column: str`                                        |
| [`limit(value)`](<#limit(value)>)                         | Limit the number of documents to be returned by the query.          | `value: int`                                         |
| [`take(value)`](<#take(value)>)                           | Alias for the `limit` method.                                       | `value: int`                                         |
| [`offset(value)`](<#offset(value)>)                       | Set an offset for the query results.                                | `value: int`                                         |
| [`skip(value)`](<#skip(value)>)                           | Skip a specified number of documents in the query results.          | `value: int`                                         |
| [`where(column, operator, value)`](#where)                | Add a WHERE clause to the query.                                    | `column: str`, `operator: str`, `value: any`         |
| [`orWhere(column, operator, value)`](#orwhere)            | Add an OR WHERE clause to the query.                                | `column: str`, `operator: str`, `value: any`         |
| [`whereIn(column, values)`](#wherein)                     | Add a WHERE IN clause to the query.                                 | `column: str`, `values: any[]`                       |
| [`orWhereIn(column, values)`](#orwherein)                 | Add an OR WHERE IN clause to the query.                             | `column: str,` `values: any[]`                       |
| [`whereNotIn(column, values)`](#wherenotin)               | Add a WHERE NOT IN clause to the query.                             | `column: str`, `values: any[]`                       |
| [`orWhereNotIn(column, values)`](#orwherenotin)           | Add an OR WHERE NOT IN clause to the query.                         | `column: str`, `values: any[]`                       |
| [`whereBetween(column, values)`](#wherebetween)           | Add a WHERE BETWEEN clause to the query.                            | `column: str`, `values: int[]`                       |
| [`orWhereBetween(column, array values)`](#orwherebetween) | Add an OR WHERE BETWEEN clause to the query.                        | `column: str`, `values: int[]`                       |
| [`orderBy(column, direction, isSensitive?)`](#orderby)    | Sort the query results by a specific column.                        | `column: str`, `direction: str`, `isSensitive: bool` |
| [`groupBy(column)`](<#groupby(column)>)                   | Group the query results by specific columns.                        | `column: str`                                        |
| [`min(column)`](<#min(column)>)                           | Retrieve the minimum value of a specific column.                    | `column: str`                                        |
| [`max(column)`](<#max(column)>)                           | Retrieve the maximum value of a specific column.                    | `column: str`                                        |
| [`sum(column)`](<#sum(column)>)                           | Calculate the sum of values in a specific column.                   | `column: str`                                        |
| [`avg(column)`](<#avg(column)>)                           | Calculate the average value of a specific column.                   | `column: str`                                        |
| [`count()`](<#count()>)                                   | Count the number of documents matching the query criteria.          | -                                                    |

### Relationships methods

| Relation Method                                                                         | Description                                                                                                         | Parameters                                                                                       |
| --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| [`hasMany(Model, foreignKey, localKey)`](#hasmany)                                      | Define a "has many" relationship between the current model and the related model.                                   | `related: Model or str`, `foreignKey: str`, `localKey: str`                                      |
| [`belongsTo(Model, foreignKey, ownerKey)`](#belongsto)                                  | Define a "belongs to" relationship between the current model and the related model.                                 | `Model: Model or str`, `foreignKey: str`, `ownerKey: str`                                        |
| [`belongsToMany(Model, pivotModel, foreignKey, foreignKeyTarget)`](#belongstomany)      | Define a "belongs to many" relationship between the current model and the related model through a pivot collection. | `Model: Model or str`, `pivotModel: Model or str`, `foreignKey: str`, `foreignKeyTarget: str`    |
| [`hasManyThrough(Model, throughModel, foreignKey, throughForeignKey)`](#hasmanythrough) | Define a "has many through" relationship between the current model and the related model through a pivot Model.     | `Model: Model or str`, `throughModel: Model or str`, `foreignKey: str`, `throughForeignKey: str` |
| [`with(relation, options?)`](#with)                                                     | To perform eager loading of specified relationship.                                                                 | `relation: str`, `options: obj`                                                                  |
| [`has(relation, options?)`](#has)                                                       | Alias for the `with` method.                                                                                        | `relation: str`, `options: obj`                                                                  |

### Soft delete methods

| Method                          | Description                                                                                                  | Parameters |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------ | ---------- |
| [`withTrashed()`](#withtrashed) | The `withTrashed` method will force soft deleted models to be included soft delete data in a query's results | -          |
| [`onlyTrashed()`](#onlytrashed) | The `onlyTrashed` method will retrieve only soft deleted models                                              | -          |
