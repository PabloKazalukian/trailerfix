import { DataTypes, Model } from 'sequelize';

export default function initContentGenre(sequelize) {
  class ContentGenre extends Model {}

  ContentGenre.init(
    {
      contentId: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        allowNull: false,
      },
      genreId: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'ContentGenre',
      tableName: 'content_genres',
      underscored: true,
      timestamps: false,
    },
  );

  return ContentGenre;
}
