import Sequelize, { Model } from 'sequelize';

class Meetupp extends Model {
  static init(sequelize) {
    super.init(
      {
        title: Sequelize.STRING,
        description: Sequelize.STRING,
        location: Sequelize.STRING,
        date: Sequelize.DATE,
      },
      {
        sequelize,
      }
    );
    return this;
  }

  /**
   * faz a associação do model de Meetupp com a tabela banners através do avatar_id
   */
  static associate(models) {
    this.belongsTo(models.Banners, { foreignKey: 'banner_id' });
  }
}

export default Meetupp;
