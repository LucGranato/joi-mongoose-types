# joi-mongoose-types

Joi extension for validate mongoose types like `ObjectId` and `Model`.

## Installing

~~~bash
npm i joi-mongoose-types
~~~

## Use

~~~javascript
const Joi = require('joi');
const mongoose = require('mongoose');
const JoiMongooseTypes = require('joi-mongoose-types');

const JoiExtended = Joi.extend(JoiMongooseTypes(Joi, mongoose));
~~~

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
