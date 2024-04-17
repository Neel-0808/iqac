import dotenv from 'dotenv';
dotenv.config();

import sql from '../utils/db.js';

/**
 * @typedef { {name: string, type: string, options: string} } Column
 * @typedef { {name: string, columns: Column[], relations: string[], data: any[] } } Table
 * @typedef {import("mysql2").Connection} Connection
 **/

const dbname = 'IQAC';

/** @type {Table} */
const departmentsTable = {
  name: 'departments',
  columns: [
    // 'id', 'name', 'created_at', 'updated_at',
    { name: 'id', type: 'INT', options: 'NOT NULL' },
    { name: 'name', type: 'VARCHAR(255)', options: 'NOT NULL' },
    { name: 'created_at', type: 'TIMESTAMP', options: 'DEFAULT CURRENT_TIMESTAMP' },
    { name: 'updated_at', type: 'TIMESTAMP', options: 'DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' },
  ],
  relations: [
    "INDEX idx_dept_id (id)"
  ],
  data: [
    [1, 'BSc CS', new Date(), new Date()],
    [2, 'BCA', new Date(), new Date()],
    [3, 'BSc Che', new Date(), new Date()],
    [4, 'Bcom CA', new Date(), new Date()],
  ]
}

/** @type {Table} */
const rolesTable = {
  name: 'roles',
  columns: [
    // 'id', 'role', 'created_at', 'updated_at',
    { name: 'id', type: 'INT', options: 'NOT NULL' },
    { name: 'role', type: 'VARCHAR(255)', options: 'NOT NULL' },
    { name: 'created_at', type: 'TIMESTAMP', options: 'DEFAULT CURRENT_TIMESTAMP' },
    { name: 'updated_at', type: 'TIMESTAMP', options: 'DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' },
  ],
  relations: [
    "INDEX idx_role_id (id)"
  ],
  data: [
    [1, 'admin', new Date(), new Date()],
    [2, 'hod', new Date(), new Date()],
    [3, 'team', new Date(), new Date()],
  ],
}

/** @type {Table} */
const usersTable = {
  name: 'users',
  columns: [
    { name: 'id', type: 'INT', options: 'AUTO_INCREMENT PRIMARY KEY' },
    { name: 'username', type: 'VARCHAR(255)', options: 'NOT NULL' },
    { name: 'password', type: 'VARCHAR(255)', options: 'NOT NULL' },
    { name: 'dept_id', type: 'INT', options: '' },
    { name: 'role_id', type: 'INT', options: 'NOT NULL' },
    { name: 'created_at', type: 'TIMESTAMP', options: 'DEFAULT CURRENT_TIMESTAMP' },
    { name: 'updated_at', type: 'TIMESTAMP', options: 'DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' },
  ],
  relations: [
    "FOREIGN KEY (dept_id) REFERENCES departments(id)",
    "FOREIGN KEY (role_id) REFERENCES roles(id)",
  ],
  data: [
    // Add your name and password here in the empty spots
    [4, 'hod', 'hod', 1, 2, new Date(), new Date()],
    [7, 'team', 'team', 1, 3, new Date(), new Date()]
  ],
}

const checklistsTable = {
  name: 'checklist',
  columns: [
    { name: 'id', type: 'INT', options: 'AUTO_INCREMENT PRIMARY KEY' },
    { name: 'year', type: 'INT', options: 'NOT NULL' },
    { name: 'dept_id', type: 'INT', options: 'NOT NULL' },
    { name: 'created_at', type: 'TIMESTAMP', options: 'DEFAULT CURRENT_TIMESTAMP' },
    { name: 'updated_at', type: 'TIMESTAMP', options: 'DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' },
  ],
  relations: [
    "FOREIGN KEY (dept_id) REFERENCES departments(id)",
    "INDEX idx_checklist_id (id)",
    "UNIQUE (year, dept_id)"
  ],
  data: [],
}

const checkItems = {
  name: 'check_item',
  columns: [
    { name: 'id', type: 'INT', options: 'AUTO_INCREMENT PRIMARY KEY' },
    { name: 'text', type: 'VARCHAR(255)', options: 'NOT NULL' },
    { name: 'status', type: 'INT', options: 'NOT NULL DEFAULT 0' },
    { name: 'comment', type: 'VARCHAR(255)', options: 'DEFAULT NULL' },
    { name: 'checklist_id', type: 'INT', options: 'NOT NULL' },
    { name: 'created_at', type: 'TIMESTAMP', options: 'DEFAULT CURRENT_TIMESTAMP' },
    { name: 'updated_at', type: 'TIMESTAMP', options: 'DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' },
  ],
  relations: [
    "FOREIGN KEY (checklist_id) REFERENCES checklist(id)",
  ],
  data: []
}

/** @type {Table} */
const itemsTable = {
  name: 'items',
  columns: [
    // 'id', 'text', 'status', 'comment', 'checklist_id', 'created_at', 'updated_at',
    { name: 'id', type: 'INT', options: 'AUTO_INCREMENT PRIMARY KEY' },
    { name: 'text', type: 'VARCHAR(255)', options: 'NOT NULL' },
  ],
  relations: [
    "INDEX idx_item_id (id)"
  ],
  data: [
    [1, 'Stock Register'],
    [2, 'Inward Register'],
    [3, 'Outward Register'],
    [4, 'Students and Staff Profile'],
    [5, 'Result Analysis (Semester + Subject)'],
    [6, 'Student Feedback - Overall Feedback'],
    [7, 'Student Feedback - Individual Feedback'],
    [8, 'Parents Meeting / Feedback'],
    [9, 'Leave and On - Duty Request'],
    [10, 'Seminar / Department Activities / Program Report'],
    [11, 'Alumini Details'],
    [12, 'Internal Assessment Mark Register / Progress Report'],
    [13, 'Students Attendance Register'],
    [14, 'Industrial Visit'],
    [15, 'Substitution Register'],
    [16, 'Disciplinary Action'],
    [17, 'Remedial Mark List'],
    [18, 'Work Load File'],
    [19, 'Student\'s +2 Mark List'],
    [20, 'Circular File'],
    [21, 'Event File'],
    [22, 'Moovalur Scheme'],
    [23, 'Syllabus Analysis'],
    [24, 'Individual Time Table'],
    [25, 'Lesson Plan'],
    [26, 'Test Schedule'],
    [27, 'Model Question Paper'],
    [28, 'Add On and Diploma Courses'],
    [29, 'Academic Audit Report'],
    [30, 'Library Book List File'],
  ],
}

/** @type {Table[]} */
const tables = [
  rolesTable,
  departmentsTable,
  usersTable,
  checklistsTable,
  itemsTable,
  checkItems,
]

/** @param { Connection } db - database connection object */
function seed(db) {
  db.query(`CREATE DATABASE IF NOT EXISTS ${dbname}`, (err) => {
    if (err) throw err;
    console.log(`---- Database ${dbname} created`);
    db.query(`USE ${dbname}`, (err) => {
      if (err) throw err;
      console.log(`---- Using database ${dbname}`);
      tables.forEach((table) => {
        let query = `CREATE TABLE IF NOT EXISTS ${table.name}(`;
        query += table.columns.map(col => `${col.name} ${col.type} ${col.options}`).join(', ');
        if (table.relations.length) {
          query += ', ' + table.relations.join(', ') + ')';
        } else {
          query += ')';
        }
        db.query(query, (err) => {
          if (err) throw err;
          console.log(`-------- Table ${table.name} created`);
          if (table.data.length) {
            db.query(`INSERT INTO ${table.name} VALUES ?`, [table.data], (err) => {
            //   if (err) throw err;
              console.log(`------------ Data inserted into ${table.name}`);
            });
          }
        });
      });
    });
  });
}

console.log("Connecting...")
const db = sql("");
console.log("Database connected!!\n")
console.log("Seeding data...")
seed(db)
