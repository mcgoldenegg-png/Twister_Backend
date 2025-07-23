const sequelize = require('../config/database');
const User = require('./User');
const Video = require('./Video');
const Rating = require('./Rating');
const Like = require('./Like');
const Report = require('./Report');
const Continent = require('./Continent');
const Activity = require('./Activitie');
const Country = require('./Country');
const VideoContinentRating = require('./VideoContinentRating');
// Initialize associations
const models = {
  User,
  Video,
  Rating,
  Like,
  Report,
  Continent,
  Activity,
  Country,
  VideoContinentRating
};

// Call associate function for each model
Object.values(models).forEach(model => {
  if (model.associate) {
    model.associate(models);
  }
});

module.exports = {
  sequelize,
  ...models
}; 