import { createConnection } from 'mysql2';

function sql( DB_NAME ) {
  return createConnection({
    host     : process.env.DB_HOST,
    user     : process.env.DB_USER,
    database : DB_NAME ?? process.env.DB_NAME,
    password : process.env.DB_PASSWORD
  });
}

export default sql;
