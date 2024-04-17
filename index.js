import express from 'express';
import ejs from 'ejs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();
import db from './utils/db.js';
const database = db("iqac")

const __dirname = path.resolve();
const app = express();

import initialise from './utils/passport-config.js';
import passport from 'passport';
import session from 'express-session';
import flash from 'express-flash';

initialise(
  passport,
  async (username, payload) => {
    if (payload.role === "2") { // HOD
      const sql = "select * from users where username=? and role_id=? and dept_id=?";
      const result = await database.promise().query(sql, [
        username, payload.role, payload.department
      ]);
      return result[0][0];
    } else if (payload.role === "3") { // IQAC
      const sql = "select * from users where username=? and role_id=?";
      const result = await database.promise().query(sql, [
        username, payload.role, payload.password
      ]);
      return result[0][0];
    }
  },
  async id => {
    const sql = `select * from users where id='${id}'`;
    const result = await database.promise().query(sql);
    return result[0][0];
  }
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(flash());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.engine('html', ejs.renderFile);
app.set('view engine', 'html');

app.get("/login", allowNonUsersOnly, (_, res) => {
  res.render("pages/login.html", { message: "" });
});

app.get("/", allowUsersOnly, async (req, res) => {
  /** @type {{id:number, username:string, password:string, dept_id:number, role_id:number}} */
  const user = await req.user;
  if (user.role_id === 2) {
    const sql = "select id, year, dept_id from checklist where dept_id=?"
    const result = await database.promise().query(sql, [user.dept_id]);
    res.render("pages/dashboard.html", { user, records: result[0] });
  } else if (user.role_id === 3) {
    const sql = "select * from departments";
    const [records] = await database.promise().query(sql);
    res.render("pages/dashboard.html", { user, records });
  }
});

app.post("/api/get-checklist", allowUsersOnly, async (req, res) => {
  const { id, dept } = req.body;
  const user = await req.user
  const sql = `select * from check_item where checklist_id=?`;
  const result = await database.promise().query(sql, [id, dept]);
  res.render("slots/table-content.html", { user, checklist: result[0] });
})

app.post("/api/create-checklist", allowUsersOnly, async (req, res) => {
  try {
    const { year, dept } = req.body;
    let sql = "insert into checklist (year, dept_id) values (?, ?)";
    const [{ insertId }] = await database.promise().query(sql, [year, dept]);
    sql = "select * from items";
    const [items] = await database.promise().query(sql);
    sql = "insert into check_item (checklist_id, text) values ?";
    const values = items.map(item => [insertId, item.text]);
    await database.promise().query(sql, [values]);
    sql = "select * from departments";
    const [records] = await database.promise().query(sql);
    const user = await req.user;
    res.render("pages/dashboard.html", { user, records });
  } catch (err) { 
    console.log(err)
    res.send("Record for this Year and Department Already Exists! Reload the page to Continue.")
  }
})

app.get("/api/get-year", allowUsersOnly, async (req, res) => {
  const id = req.query.id;
  const sql = "select * from checklist where dept_id=?";
  const [records] = await database.promise().query(sql, [id]);
  res.render("slots/year-form.html", { dept: id, records });
})

app.post("/api/edit-table", allowUsersOnly, async (req, res) => {
  res.render("slots/edit-row.html", { item: req.body });
});

app.post("/api/save", allowUsersOnly, async (req, res) => {
  let { id, status, comment, pos } = req.body
  const sql = "update check_item set status=?, comment=? where id=?";
  status = (status === "true") ? 1 : 0;
  await database.promise().query(sql, [ status, comment, id]);
  const [[ item ]] = await database.promise().query("select * from check_item where id=?", [id]);
  const user = await req.user
  res.render("slots/row.html", { user, item, pos });
});

app.post("/login", allowNonUsersOnly, (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) { return next(err) }
    if (!user) { return res.send(info.message) }
    req.logIn(user, (err) => {
      if (err) { return next(err) }
      res.header("HX-Redirect", "/")
      return res.send("Login successful");
    })
  })(req, res, next)
});

app.delete("/logout", allowUsersOnly, (req, res) => {
  req.logout((err) => {
    if (err) return next(err);
    res.render("pages/login.html", { message: "Logged out successfully" });
  });
})

app.get("/api/get-form/:role", (req, res) => {
  const role = req.params.role;
  if (role === "hod") {
    database.query("select * from departments", (err, result) => {
      if (err) throw err;
      res.render("slots/login-form.html", {
        role: { name: "hod", id: 2 },
        departments: result
      });
    });
  }
  else if (role === "iqac") res.render("slots/login-form.html", {
    role: { name: "iqac", id: 3 }
  });
});

function allowUsersOnly(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}

function allowNonUsersOnly(req, res, next) {
  if (req.isAuthenticated()) return res.redirect("/");
  return next();
}

// Choosing a PORT from env or default to 3000
const port = process.env.PORT || 3000;
// Start the server at the specified PORT
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}/`);
});

