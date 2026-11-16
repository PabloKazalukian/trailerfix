import { DataTypes, Model } from 'sequelize';

export const USER_CONTENT_STATUSES = ['WATCHED', 'WATCHLIST'];

export default function initUserContent(sequelize) {
  class UserContent extends Model {}

  UserContent.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: 'users', key: 'id' },
      },
      contentId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: 'content', key: 'id' },
      },
      status: {
        type: DataTypes.ENUM(...USER_CONTENT_STATUSES),
        allowNull: false,
        validate: {
          isIn: {
            args: [USER_CONTENT_STATUSES],
            msg: `El estado debe ser uno de: ${USER_CONTENT_STATUSES.join(', ')}`,
          },
        },
      },
      watchedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'UserContent',
      tableName: 'user_content',
      underscored: true,
      timestamps: true,
      indexes: [
        {
          name: 'uq_user_content',
          unique: true,
          fields: ['userId', 'contentId'],
        },
        {
          name: 'idx_user_content_user_status',
          fields: ['userId', 'status'],
        },
        {
          name: 'idx_user_content_content',
          fields: ['contentId'],
        },
      ],
      validate: {
        watchedAtMatchesStatus() {
          if (this.status === 'WATCHED' && !this.watchedAt) {
            throw new Error(
              'watchedAt es obligatorio cuando el estado es WATCHED',
            );
          }

          if (this.status === 'WATCHLIST' && this.watchedAt) {
            throw new Error(
              'watchedAt debe ser nulo cuando el estado es WATCHLIST',
            );
          }
        },
      },
    },
  );

  return UserContent;
}
