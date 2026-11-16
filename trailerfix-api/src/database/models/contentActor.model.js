import { DataTypes, Model } from 'sequelize';

export default function initContentActor(sequelize) {
  class ContentActor extends Model {}

  ContentActor.init(
    {
      contentId: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        allowNull: false,
      },
      actorId: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        allowNull: false,
      },
      characterName: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },
      creditOrder: {
        type: DataTypes.SMALLINT.UNSIGNED,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'ContentActor',
      tableName: 'content_actors',
      underscored: true,
      timestamps: false,
    },
  );

  return ContentActor;
}
