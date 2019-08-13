import { isBefore } from 'date-fns';
import Sequelize, { Model } from 'sequelize';

class Meetupp extends Model {
  static init(sequelize) {
    super.init(
      {
        title: Sequelize.STRING,
        description: Sequelize.STRING,
        location: Sequelize.STRING,
        date: Sequelize.DATE,
        past: {
          type: Sequelize.VIRTUAL,
          get() {
            return isBefore(this.date, new Date());
          },
        },
      },
      {
        sequelize,
      }
    );
    return this;
  }

  /**
   * faz a referência a chaves de outras tabelas
   */
  static associate(models) {
    this.hasMany(models.Subscription, { foreignKey: 'meetup_id' });
    this.belongsTo(models.Banners, { foreignKey: 'banner_id' });
    this.belongsTo(models.User, { foreignKey: 'user_id' });
  }
}

export default Meetupp;
