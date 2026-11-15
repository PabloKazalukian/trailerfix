import sequelize from '../../config/database.js';
import initUser from './user.model.js';

const User = initUser(sequelize);

export { sequelize, User };
export default { sequelize, User };
