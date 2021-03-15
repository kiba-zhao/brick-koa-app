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

  describe('jwt simple', () => {

    it('post /simple', done => {

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

  describe('ajv simple', () => {

    it('get /validator', done => {
      const query = { code: faker.random.word(), [faker.random.word()]: faker.random.word() };

      request(app)
        .get('/validator')
        .query(query)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, { query, method: 'get' }, done);
    });

    it('get /validator : 422', done => {
      const query = { code: ' ', [faker.random.word()]: faker.random.word() };

      request(app)
        .get('/validator')
        .query(query)
        .set('Accept', 'application/json')
        .expect(422, done);
    });

    it('post /validator', done => {
      const body = { code: faker.random.word(), [faker.random.word()]: faker.random.word() };

      request(app)
        .post('/validator')
        .send(body)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(201, { body, method: 'post' }, done);
    });

    it('post /validator : 422', done => {
      const body = { [faker.random.word()]: faker.random.word() };

      request(app)
        .post('/validator')
        .send(body)
        .set('Accept', 'application/json')
        .expect(422, done);
    });

    it('delete /validator', done => {
      const query = { code: faker.random.word(), [faker.random.word()]: faker.random.word() };

      request(app)
        .del('/validator')
        .query(query)
        .set('Accept', 'application/json')
        .expect(204, done);
    });

    it('delete /validator : 422', done => {
      const query = { code: ' ', [faker.random.word()]: faker.random.word() };

      request(app)
        .del('/validator')
        .query(query)
        .set('Accept', 'application/json')
        .expect(422, done);
    });

    it('post /validator', done => {
      const body = { code: faker.random.word(), [faker.random.word()]: faker.random.word() };

      request(app)
        .put('/validator')
        .send(body)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, { body, method: 'put' }, done);
    });

    it('post /validator : 422', done => {
      const body = { [faker.random.word()]: faker.random.word() };

      request(app)
        .put('/validator')
        .send(body)
        .set('Accept', 'application/json')
        .expect(422, done);
    });

  });

  describe('acl simple', () => {

    it('get /acl', done => {
      const query = { acl: faker.random.word(), [faker.random.word()]: faker.random.word() };

      request(app)
        .get('/acl')
        .query(query)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, { query, method: 'get' }, done);
    });

    it('get /acl : 403', done => {
      const query = { [faker.random.word()]: faker.random.word() };

      request(app)
        .get('/acl')
        .query(query)
        .set('Accept', 'application/json')
        .expect(403, done);
    });

    it('post /acl', done => {
      const body = { acl: faker.random.word(), [faker.random.word()]: faker.random.word() };

      request(app)
        .post('/acl')
        .send(body)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(201, { body, method: 'post' }, done);
    });

    it('post /acl : 403', done => {
      const body = { [faker.random.word()]: faker.random.word() };

      request(app)
        .post('/acl')
        .send(body)
        .set('Accept', 'application/json')
        .expect(403, done);
    });

  });

  describe('rate limit simple', () => {

    it('get /rate-limit', done => {
      const query = { limit: faker.random.word(), [faker.random.word()]: faker.random.word() };

      request(app)
        .get('/rate-limit')
        .query(query)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, { query, method: 'get' }, done);

    });

    it('get /rate-limit', done => {
      const query = { [faker.random.word()]: faker.random.word() };

      request(app)
        .get('/rate-limit')
        .query(query)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(429, done);
    });

    it('post /rate-limit', done => {
      const body = { limit: faker.random.word(), [faker.random.word()]: faker.random.word() };

      request(app)
        .post('/rate-limit')
        .send(body)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(201, { body, method: 'post' }, done);
    });

    it('post /rate-limit', done => {
      const body = { [faker.random.word()]: faker.random.word() };

      request(app)
        .post('/rate-limit')
        .send(body)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(429, done);
    });

  });

});
