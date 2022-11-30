import {user} from '../fixtures/user.js';
import {post} from '../fixtures/post.js';

describe('API Tests', () => {
  let token;
  let userId;

  it('Registration', () => {
    cy.request({
      method: 'POST',
      url: '/register',
      body: {
        "email": user.email,
        "password": user.password,
        "firstname": user.firstname,
        "lastname": user.lastname,
        "age": user.age
      }
    }).then(response => {
      token = 'Bearer ' + response.body.accessToken;
      userId = response.body.user.id;
    })
  })

  it('Get all posts', () => {
    cy.request('GET', '/posts').then(response => {
      expect(response.status).to.be.eq(200);
      expect(response.headers).to.have.property('content-type', 'application/json; charset=utf-8');
    })
  })

  it('Get only first 10 posts', () => {
    cy.request('GET', '/posts?_limit=10').then(response => {
      expect(response.status).to.be.eq(200);
      expect(response.body.length).to.be.eq(10);
    })
  })

  it('Get posts with id = 55 and id = 60', () => {
    cy.request('GET', '/posts?id=55&id=60').then(response => {
      expect(response.status).to.be.eq(200);
      expect(response.body[0].id).to.be.eq(55);
      expect(response.body[1].id).to.be.eq(60);
    })
  })

  it('Creating a post with no auth', () => {
    cy.request({
      method: 'POST',
      url: '/664/posts',
      body: {
        "title": post.title,
        "body": post.body,
      },
      failOnStatusCode: false
    }).then(response => {
      expect(response.status).to.be.eq(401)
    })
  })

  it('Create a post with authorization', () => {
    let postId

    cy.log('Creating a post')
    cy.request({
      headers: {
        'Authorization': token
      },
      method: 'POST',
      url: '/664/posts',
      body: {
        "userId": userId,
        "title": post.title,
        "body": post.body
      }
    }).then(response => {
      expect(response.status).to.be.eq(201);
      expect(response.body.title).to.be.eq(post.title);
      expect(response.body.body).to.be.eq(post.body);
      expect(response.body.userId).to.be.eq(userId);
      postId = response.body.id;
    }).then(() => {
      cy.log('Verify post is existing');
      cy.request({
        method: 'GET',
        url: `/posts/${postId}`
      }).then(response => {
        expect(response.status).to.be.eq(200);
        expect(response.body.title).to.be.eq(post.title);
        expect(response.body.body).to.be.eq(post.body);
        expect(response.body.userId).to.be.eq(userId);
      })
    })
  })

  it('Creating a post with JSON', () => {
    let postId

    cy.log('Creating a post with json content-type');
    cy.request({
      method: 'POST',
      url: '/posts',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        "title": post.title,
        "body": post.body
      }
    }).then(response => {
      expect(response.status).to.be.eq(201);
      postId = response.body.id;
    }).then(() => {
      cy.log('Verify post is existing');
      cy.request({
        method: 'GET',
        url: `/posts/${postId}`,
        headers:
        {
          'Content-Type': 'application/json'
        },
      }).then(response => {
        expect(response.status).to.be.eq(200);
        expect(response.body.title).to.be.eq(post.title);
        expect(response.body.body).to.be.eq(post.body);
      })
    })
  })

  it('Modifying non-existing post', () => {
    cy.request({
      method: 'PUT',
      url: '/posts',
      body: {
        title: post.title,
        body: post.body
      },
      failOnStatusCode: false
    }).then(response => {
      expect(response.status).to.be.eq(404);
    })
  })

  it('Create and update post', () => {
    const updatedTitle = 'Updated';
    const updatedBody = 'Updated';
    let postId;

    cy.log('Create a new post');
    cy.request({
      method: 'POST',
      url: '/posts',
      body: {
        "title": post.title,
        "body": post.body
      }
    }).then(response => {
      expect(response.status).to.be.eq(201);
      postId = response.body.id;
    }).then(() => {
      cy.log('Update created post');
      cy.request({
        method: 'PUT',
        url: `/posts/${postId}`,
        body: {
          title: 'Updated',
          body: 'Updated'
        }
      }).then(response => {
        expect(response.status).to.be.eq(200);
        expect(response.body.title).to.be.eq(updatedTitle);
        expect(response.body.body).to.be.eq(updatedBody);
      })
    })
  })

  it('Delete non-existing post', () => {
    cy.request({
      method: 'DELETE',
      url: '/posts/0',
      failOnStatusCode: false
    }).then(response => {
      expect(response.status).to.be.eq(404);
    })
  })

  it('Create, update and delete post', () => {
    const updatedTitle = 'Updated';
    const updatedBody = 'Updated';
    let postId;

    cy.log('Create a new post');
    cy.request({
      method: 'POST',
      url: '/posts',
      body: {
        "title": post.title,
        "body": post.body
      }
    }).then(response => {
      expect(response.status).to.be.eq(201);
      postId = response.body.id;
    }).then(()=> {
      cy.log('Update created post');
      cy.request({
        method: 'PUT',
        url: `/posts/${postId}`,
        body: {
          title: 'Updated',
          body: 'Updated'
        }
      }).then(response => {
        expect(response.status).to.be.eq(200);
        expect(response.body.title).to.be.eq(updatedTitle);
        expect(response.body.body).to.be.eq(updatedBody);
      })
    }).then(() => {
      cy.log('Deleting the post');
      cy.request({
        method: 'DELETE',
        url: `/posts/${postId}`,
      }).then(response => {
        expect(response.status).to.be.eq(200);
        expect(response.body).to.be.empty;
      })
    })
  })
})
