import Sequelize from 'sequelize';

import User from '../app/models/User';
import File from '../app/models/File';
import Banners from '../app/models/Banners';
import Meetupp from '../app/models/Meetupp';
import Subscription from '../app/models/Subscription';
import databaseConfig from '../config/database';

const models = [User, File, Banners, Meetupp, Subscription];

class Database {
  constructor() {
    this.init();
  }

  init() {
    this.connection = new Sequelize(databaseConfig);

    models.map(model => model.init(this.connection));
    models.map(
      model => model.associate && model.associate(this.connection.models)
    );
  }
}

export default new Database();
