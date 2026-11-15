import { DataTypes, Model } from 'sequelize';

export default function initUser(sequelize) {
  class User extends Model {
    toJSON() {
      const values = { ...this.get() };
      delete values.password;
      return values;
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: { msg: 'El username es obligatorio' },
          len: {
            args: [3, 50],
            msg: 'El username debe tener entre 3 y 50 caracteres',
          },
        },
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: { msg: 'El nombre es obligatorio' },
          len: {
            args: [2, 100],
            msg: 'El nombre debe tener entre 2 y 100 caracteres',
          },
        },
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      defaultScope: {
        attributes: { exclude: ['password'] },
      },
      scopes: {
        withPassword: {
          attributes: ['id', 'username', 'name', 'password', 'createdAt', 'updatedAt'],
        },
      },
    },
  );

  return User;
}
