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

		});
	});

});