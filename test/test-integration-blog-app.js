"use strict"

const chai = require("chai");
const chaihttp = require("chai-http");
const faker = require("faker")l
const mongoose = require("mongoose");

const expect = chai.expect;

const { BlogPost } = require("../models");
const { app, runServer, closeServer } = require("../server");
const { TEST_DATABASE_URL } = require("../config.js");

chai.use(chaihttp);

function seedBlogPosts() {
	console.info('Seeding blog post data');
	const seedData = [];

	for (let i = 0; i <=10; i++) {
		seedData.push(generateBlogData());
	}
	return BlogPost.insertMany(seedData);
};

function generateBlogData() {
	return {
		author: {
    		firstName: faker.name.firstName(),
    		lastName: faker.name.lastName()
  		},
  		title: faker.lorem.sentence(),
  		content: faker.lorem.text()
	};
};

function tearDownDb() {
	console.warn("Deleted database");
	return mongoose.connection.dropDatabase();
};

describe("BlogPosts API resource", function() {
	before(function() {
		return runServer(TEST_DATABASE_URL);
	});

	beforeEach(function() {
		return seedBlogPosts();
	});

	afterEach(function() {
		return tearDowbDb();
	});

	after(function() {
		return closeServer();
	});


	describe("GET endpoint", function() {

		it("should return all existing blogposts", function() {
			let res;
			return chai
				.request(app)
				.get("/posts")
				.then(function(_res) {
					res = _res;
					expect(res).to.have.status(200);
					expect(res.body.posts).to have.lengthOf.at.least(1);
					return BlogPost.count();
				}}
				.then(function(count) {
					expect(res.body.posts).to.have.lengthOf(count);
				});
		});

		it("should return posts with the right fields", function() {
			let resPosts;
			return chai
				.request(app)
				.get("./posts")
				.then(function(res) {
					epxpect(res).to.have.status(200);
					expect(res).to.be.json;
					expect(res.body.posts).to.ba.a('array');
					expect(res.body.posts).to.have.lengthOf.at.least(1);

					res.body.posts.forEach(function(post) {
						expect(post).to.be.a("object");
						expect(post).to.include.keys(
							"id", "title", "content", "author", "created");
					});

					resPosts = res.body.posts[0];
					return BlogPost.findById(resPosts.id);
				})
				.then(function(post) {
					expect(resPosts.id).to.equal(post.id)
					expect(resPosts.title).to.equal(post.title);
					expect(resPosts.content).to.equal(post.content);
					expect(resPosts.author).to.contain(post.authorName);
				});
		});
});

describe("POST endpoitn", function() {
	it("should add a new blog", function() {

		const newblog = generateBlogData();

		return chai
		.request(app)
		.post("/posts")
		.send(newblog)
		.then(function(res) {
			expect(res).to.have.status(201);
			expect(res).to.be.json;
			expect(res.body).to.be.a("object");
			expect(res.body).to.include.keys("id", "title", "content", "author", "created");
			expect(res.body.id).to.not.be.null;
			expect(res.body.title).to.equal(newBlog.title);
			expect(res.body.content).to.equal(newBlog.content);
			expect(res.body.author).to.equal(newBlog.authorName)
			return BlogPost.findById(res.body.id);
		})
		.then(function(post) {
			expect(post.title).to.equal(newBlog.title);
			expect(post.content).to.equal(newBlog.content);
			expect(post.author.firstName).to.equal(newBlog.author.firstName);
			expect(post.author.lastName).to.equal(newBlog.author.lastName);
		});
	});
});

describe("PUT endpoint", function() {
	it("should update fields sent over", function() {
		const updateData = {
			title: "my new title",
			content: "my super amazing content"
		};

		return BlogPost
			.findOne()
			.then(function(post) {
				updateData.id = post.id;

				return chai
					.request(app)
					.put(`/posts/${post.id}`)
					.send(updateData);
			})
			.then(function(res) {
				expect(res).to.have.status(204);
				expect(res.body).to.be.a("object");
				return BlogPost.findById(updateData.id);
			})
			.then(function(post) {
				expect(post.title).to.equal(updateData.title);
				expect(post.content).to.equal(updateData.content);
				expect(post.author.firstName).to.equal(updateData.author.firstName);
          		expect(post.author.lastName).to.equal(updateData.author.lastName);
			});
	});
});

describe("DELETE endpoints", function() {
	it("should delete a post by id", function() {
		let blog;
		return BlogPost
			.findOne()
			.then(function(_blog) {
				blog = _blog;
				return chai
				.request(app)
				.delete(`/posts/${blog.id}`);
			})
			.then(function(res) {
				expect(res).to.have.status(204);
				return BlogPost.findById(blog.id);
			})
			.then(function(_blog) {
				expect(_blog).to.be.null;
			});
	});
});
});