/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const supertest = require('supertest');
const assert = require('assert');
const app = require('../../server');

const request = supertest(app);

const adminUserCorrect = {
  email: 'admin@gmail.com',
  password: '123456',
};
const noAdminUser = {
  email: 'noadmin@gmail.com',
  password: '123456',
};

const productCorrect = {
  name: 'hamburguesa simple',
  price: '10',
  image: 'hamburguesa.png',
  type: 'desayuno',
};

const productWithoutPrice = {
  name: 'hamburguesa simple',
  price: '',
  image: 'hamburguesa.png',
  type: 'desayuno',
};

const productWithoutValues = {
  name: '',
  price: '',
  image: '',
  type: '',
};

const productWithoutType = {
  name: 'hamburguesa simple',
  price: '10',
  image: 'hamburguesa.png',
  type: '',
};

const productWithPriceNotNumber = {
  name: 'hamburguesa simple',
  price: 'hola',
  image: 'hamburguesa.png',
  type: 'almuerzo',
};

let idProductNew;
describe('GET /products', () => {
  it('responds with error 401 when user is not authenticated', (done) => {
    request
      .get('/products')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(401);
    done();
  });
  it('should return a statusCode 200 and array when get all products', (done) => {
    request.post('/auth').send(adminUserCorrect).then((resp) => {
      const token = resp.body.accessToken;
      request.get('/products').set('access-token', `${token}`)
        .expect('Content-Type', /json/)
        .expect(200)
        .then((response) => {
          expect(Array.isArray(response.body)).toBeTruthy();
          done();
        });
    });
  });
  it('should return a statusCode 200 and one product when get product by id', (done) => {
    request.post('/auth').send(adminUserCorrect).then((resp) => {
      const token = resp.body.accessToken;
      request.get('/products/1').set('access-token', `${token}`)
        .expect('Content-Type', /json/)
        .expect(200)
        .then((response) => {
          expect(Array.isArray(response.body)).toBeFalsy();
          done();
        });
    });
  });
  it('should return a error 404 when product not found', (done) => {
    request.post('/auth').send(adminUserCorrect).then((resp) => {
      const token = resp.body.accessToken;
      request.get('/products/0').set('access-token', `${token}`).then((response) => {
        expect(response.statusCode).toEqual(404);
        expect(response.body.message).toBe('Product not found.');
        done();
      });
    })
      .catch((error) => { resp.status(500).json({ error: error.message }); });
  });
});

describe('POST/products', () => {
  it('responds with error 401 when user is not authenticated', (done) => {
    request
      .post('/products')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(401);
    done();
  });
  it('should return a statusCode 200 when create new products', (done) => {
    request.post('/auth').send(adminUserCorrect).then((resp) => {
      const token = resp.body.accessToken;
      request.post('/products').set('access-token', `${token}`)
        .send(productCorrect)
        .expect('Content-Type', /json/)
        .expect(200)
        .then((response) => {
          idProductNew = response.body.id;
          expect(response.body.name).toBeTruthy();
          expect(response.body.price).toBeTruthy();
          expect(response.body.id).toBeTruthy();
          done();
        });
    });
  });

  it('should return a error 400 when Name and price must not be empty', (done) => {
    request.post('/auth').send(adminUserCorrect).then((resp) => {
      const token = resp.body.accessToken;
      request.post('/products').set('access-token', `${token}`)
        .send(productWithoutPrice)
        .then((response) => {
          expect(response.statusCode).toEqual(400);
          expect(response.body.message).toBe('Name and price must not be empty.');
          done();
        });
    });
  });

  it('should return a error 400 when Name and price must not be empty', (done) => {
    request.post('/auth').send(adminUserCorrect).then((resp) => {
      const token = resp.body.accessToken;
      request.post('/products').set('access-token', token)
        .send(productWithPriceNotNumber)
        .then((response) => {
          expect(response.statusCode).toEqual(500);
          expect(response.body.message).toBeTruthy();
          done();
        });
    });
  });

  it('should return a error 400 when type must not be empty', (done) => {
    request.post('/auth').send(adminUserCorrect).then((resp) => {
      const token = resp.body.accessToken;
      request.post('/products').set('access-token', `${token}`)
        .send(productWithoutType)
        .then((response) => {
          expect(response.statusCode).toEqual(400);
          expect(response.body.error).toBe('Type provided is not supported');
          done();
        });
    });
  });
  it('should return 400 when name or price is missing', (done) => {
    request.post('/auth').send(adminUserCorrect).then((resp) => {
      const token = resp.body.accessToken;
      request.post('/products').set('access-token', `${token}`)
        .send({ name: 'algo' })
        .expect('Content-Type', /json/)
        .expect(400)
        .then((response) => {
          expect(response.body).toEqual({ message: 'Name and price must not be empty.' });
          done();
        });
    })
      .catch((error) => { resp.status(500).json({ message: error.message }); });
  });
});

describe('PUT/products', () => {
  it('should return a error 404 when product not found', (done) => {
    request.post('/auth').send(adminUserCorrect).then((resp) => {
      const token = resp.body.accessToken;
      request.put('/products/0').set('access-token', token).then((response) => {
        expect(response.statusCode).toEqual(404);
        expect(response.body.error).toBe('Product not found.');
        done();
      });
    })
      .catch((error) => { resp.status(500).json({ error: error.message }); });
  });
  it('should return 403 when is not admin', (done) => {
    request.post('/auth').send(noAdminUser).then((response) => {
      const token = response.body.accessToken;
      request.put('/products/0').set('access-token', token).then((response) => {
        expect(response.statusCode).toEqual(403);
        expect(response.body.message).toBe('Forbidden');
        done();
      });
    });
  });
  it('should return 400 when typeof of price is not number', (done) => {
    request.post('/auth').send(adminUserCorrect).then((response) => {
      const token = response.body.accessToken;
      request.put('/products/0').set('access-token', `${token}`).send(productWithoutValues).then((response) => {
        expect(response.statusCode).toEqual(400);
        expect(response.body).toStrictEqual({ error: 'No property to modify is indicated' });
        done();
      });
    });
  });

  it('should return 400 when typeof of price is not number', (done) => {
    request.post('/auth').send(adminUserCorrect).then((response) => {
      const token = response.body.accessToken;
      request.put(`/products/${idProductNew}`).set('access-token', `${token}`)
        .send(productWithPriceNotNumber).then((response) => {
          expect(response.statusCode).toEqual(404);
          expect(response.body.message).toBeTruthy();
          done();
        });
    });
  });
  it('should return 404 when product is not exist', (done) => {
    request.post('/auth').send(adminUserCorrect).then((resp) => {
      const token = resp.body.accessToken;
      request.put('/products/0').set('access-token', token)
        .then((response) => {
          expect(response.status).toEqual(404);
          done();
        });
    });
  });
  it('should return 200 when product update correctly', (done) => {
    request.post('/auth').send(adminUserCorrect).then((response) => {
      const token = response.body.accessToken;
      request.put(`/products/${idProductNew}`).set('access-token', token)
        .send(productCorrect)
        .expect('Content-Type', /json/)
        .expect(200)
        .then((response) => {
          expect(response.status).toEqual(200);
          expect((response.body.id)).toBeTruthy();
          expect((response.body.name)).toBeTruthy();
          expect((response.body.price)).toBeTruthy();
          done();
        });
    });
  });
  it('should return 400 when any property to modify is indicated', (done) => {
    request.post('/auth').send(adminUserCorrect).then((response) => {
      const token = response.body.accessToken;
      request.put(`/products/${idProductNew}`).set('access-token', token)
        .send(productWithoutValues)
        .expect('Content-Type', /json/)
        .expect(400)
        .then((response) => {
          expect(response.body).toEqual({ error: 'No property to modify is indicated' });
          done();
        });
    });
  });
});

describe('DELETE/products', () => {
  it('should delete orders by id', (done) => {
    request.post('/auth').send(adminUserCorrect).then((resp) => {
      const token = resp.body.accessToken;
      request.delete(`/products/${idProductNew}`)
        .set('access-token', token)
        .then((response) => {
          expect(response.statusCode).toEqual(200);
          expect(response.body.message).toBe('Product was deleted');
          done();
        });
    });
  });
  it('should return an error 404 if product not exist', (done) => {
    request.post('/auth').send(adminUserCorrect).then((resp) => {
      const token = resp.body.accessToken;
      request.delete('/products/0')
        .set('access-token', token)
        .then((response) => {
          expect(response.statusCode).toEqual(404);
          expect(response.body.error).toEqual('Product not found.');
          done();
        });
    });
  });
});
