'use strict';

const Koa = require('koa');
// const KoaRouter = require('koa-router');

const app = new Koa();

app.use(function handleErr(ctx, next) {

  return next().catch((err) => {
    ctx.status = 200;
    ctx.body = err.message;
    console.error(err);
  });
});

app.use(function responseTime(ctx, next) {
  const start = new Date().getTime();
  return next().then(() => {
    ctx.body = ctx.state;
    ctx.set('X-Raiponce-Time',new Date().getTime() - start+' ms');
  });
});


// app.use((ctx, next) => next().then(() => ctx.state = ctx.state.toUpperCase()));


app.use(function (ctx, next) {
  if(ctx.path === '/error')
    ctx.throw('BOoOoOoO', 401);
  else
    ctx.state = 'hello koa';
  return next();
});


app.listen(process.argv[2]);
