/**
 * @fileOverview 简单测试
 * @name simple.test.js
 * @author kiba.x.zhao <kiba.rain@qq.com>
 * @license MIT
 */
'use strict';

const path = require('path');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const faker = require('faker');
const { Engine, inject } = require('brick-engine');
const { KOA } = require('brick-koa-adapter');

const APP_PATH = path.join(__dirname, 'fixtures', 'apps', 'simple');
const CONFIG = require('./fixtures/apps/simple/config/default');

describe('simple.test.js', () => {
  let app,
    engine;

  function setup(done) {
    return koa => {
      koa.once('start', () => {
        app = koa.server;
        done();
      });
    };
  }

  beforeAll(done => {
    engine = new Engine({ chdir: APP_PATH });
    engine.init();

    const fn = setup(done);
    inject(fn, { deps: [ KOA ] });
    engine.use(fn);
  });

  afterAll(done => {
    const server = app;
    engine = undefined;
    app = undefined;
    server.close(done);
  });

  describe('simple', () => {

    it('POST /simple', done => {

      const body = { [faker.random.word()]: faker.random.word() };
      const config = CONFIG.jwt;

      request(app)
        .post('/simple')
        .send(body)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(res => {
          const decode = jwt.verify(res.body.token, config.default.secret, config.default.verifyOpts);
          if (!decode) {
            throw new Error('verify error');
          }
          delete res.body.token;
        })
        .expect(201, body, done);

    });

    it('get /simple', done => {

      const body = { [faker.random.word()]: faker.random.word() };
      const config = CONFIG.jwt;
      const token = jwt.sign(body, config.default.secret, config.default.signOpts);

      request(app)
        .get('/simple')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .expect('Content-Type', /json/)
        .expect(res => {
          for (const key in body) {
            expect(res.body[key]).toEqual(body[key]);
          }
        })
        .expect(200, done);
    });

    it('get /simple: 401', done => {

      request(app)
        .get('/simple')
        .set('Accept', 'application/json')
        .expect('WWW-Authenticate', /Bearer/)
        .expect(401, done);
    });

    it('get /simple: 401 with basic', done => {

      const body = { yahaha: faker.random.word() };
      const config = CONFIG.jwt;
      const token = jwt.sign(body, config.default.secret, config.default.signOpts);

      request(app)
        .get('/simple')
        .set('Accept', 'application/json')
        .set('Authorization', `Basic ${token}`)
        .expect('WWW-Authenticate', /Bearer/)
        .expect(401, done);
    });


    it('put /simple: 401', done => {

      const body = { yahaha: faker.random.word() };
      const config = CONFIG.jwt;
      const token = jwt.sign(body, config.simple.secret, config.simple.signOpts);

      request(app)
        .put('/simple')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .expect('WWW-Authenticate', /Bearer/)
        .expect(401, done);
    });

    it('put /simple', done => {

      const body = { userId: faker.random.word() };
      const config = CONFIG.jwt;
      const token = jwt.sign(body, config.simple.secret, config.simple.signOpts);

      request(app)
        .put('/simple')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .expect('Content-Type', /json/)
        .expect(res => {
          for (const key in body) {
            expect(res.body[key]).toEqual(body[key]);
          }
        })
        .expect(200, done);
    });


    it('patch /simple', done => {

      const body = { userId: faker.random.word(), iat: 1615353633 };
      const config = CONFIG.jwt;
      const token = jwt.sign(body, config.simple.secret, config.simple.signOpts);

      request(app)
        .patch('/simple')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .expect('Content-Type', /json/)
        .expect(res => {
          for (const key in body) {
            expect(res.body[key]).toEqual(body[key]);
          }
        })
        .expect(200, done);
    });


  });

});
