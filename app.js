var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const config = require('./config.json');
var session = require('express-session');
var lessMiddleware = require('less-middleware');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var apiRouter = require('./routes/api');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(lessMiddleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
const pgSession = require('connect-pg-simple')(session);
const pgStoreConfig = {conObject: config.pgConnection}

app.use(session({
  secret: (config.sha256Secret),
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 1 * 24 * 60 * 60 * 1000 }, // 1 days
  store:new pgSession(pgStoreConfig),
}));
var knex = require('knex')({
  client: 'pg',
  version: '7.2',
  connection:config.pgConnection
});
app.use("/", (req,res, next)=>{req.knex=knex;next();});

app.use('/', indexRouter);
app.use('/page', indexRouter);
app.use('/users', usersRouter);
app.use('/rest/api/v1/', apiRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
